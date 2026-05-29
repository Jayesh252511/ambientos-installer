import { useRef, useState } from "react";
import { Upload, Loader2, ShieldAlert, ShieldCheck, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { verifyScreenshot } from "@/lib/verify.functions";
import { getSessionId, getUserApiKey } from "@/lib/session";

type VerifyResult = { verified: boolean; feedback: string } | null;

export function Dropzone({
  step,
  hint,
  onVerified,
}: {
  step: "step1" | "step2";
  hint: string;
  onVerified: (imageUrl: string) => Promise<void> | void;
}) {
  const verifyFn = useServerFn(verifyScreenshot);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"idle" | "uploading" | "analyzing">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult>(null);
  const [drag, setDrag] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setResult({ verified: false, feedback: "Please upload an image file (PNG, JPG, WEBP)." });
      return;
    }
    setBusy(true);
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setStage("uploading");
    const sessionId = getSessionId();
    const ext = file.name.split(".").pop() || "png";
    const path = `${sessionId}/${step}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("verification-screenshots")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setBusy(false);
      setStage("idle");
      setResult({ verified: false, feedback: `Upload failed: ${upErr.message}` });
      return;
    }
    const { data: pub } = supabase.storage.from("verification-screenshots").getPublicUrl(path);
    const imageUrl = pub.publicUrl;
    setStage("analyzing");
    try {
      const res = await verifyFn({
        data: { step, imageUrl, userApiKey: getUserApiKey() || undefined },
      });
      setResult(res);
      if (res.verified) {
        await onVerified(imageUrl);
      }
    } catch (e: any) {
      setResult({ verified: false, feedback: e?.message ?? "Verification failed. Retry." });
    } finally {
      setBusy(false);
      setStage("idle");
    }
  }

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition ${
          drag
            ? "border-[var(--cyberpink)] bg-[var(--cyberpink)]/5"
            : "border-white/15 bg-white/[0.02] hover:border-[var(--cybercyan)]/50 hover:bg-white/[0.04]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {preview ? (
          <div className="mx-auto max-w-xs">
            <img src={preview} alt="upload preview" className="mx-auto max-h-44 rounded-xl border border-white/10 object-contain" />
            <p className="mt-3 text-xs text-muted-foreground">Click or drop to replace</p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--cyberpink)]/20 to-[var(--cybercyan)]/20 transition group-hover:scale-110">
              {busy ? <Loader2 className="animate-spin" /> : <Upload className="text-[var(--cybercyan)]" />}
            </div>
            <p className="text-sm font-medium">
              {busy
                ? stage === "uploading"
                  ? "Uploading screenshot…"
                  : "AI analyzing your screenshot…"
                : "Drop screenshot here or click to browse"}
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">{hint}</p>
          </>
        )}
      </div>

      {result && (
        <div
          className={`animate-fade-up flex items-start gap-3 rounded-2xl border p-4 ${
            result.verified
              ? "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]"
              : "border-destructive/40 bg-destructive/10 text-destructive-foreground"
          }`}
        >
          {result.verified ? <ShieldCheck className="mt-0.5 shrink-0" size={18} /> : <ShieldAlert className="mt-0.5 shrink-0" size={18} />}
          <div className="text-sm leading-relaxed">
            <p className="font-semibold mb-0.5">
              {result.verified ? "Step verified!" : "Not quite — let's try again"}
            </p>
            <p className={result.verified ? "" : "text-foreground/85"}>{result.feedback}</p>
          </div>
        </div>
      )}

      {!preview && !busy && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ImageIcon size={12} /> Screenshots are uploaded securely and analyzed by Gemini Vision.
        </p>
      )}
    </div>
  );
}
