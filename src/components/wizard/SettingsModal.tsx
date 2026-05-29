import { useEffect, useState } from "react";
import { X, KeyRound, Sparkles } from "lucide-react";
import { getUserApiKey, setUserApiKey } from "@/lib/session";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState("");
  useEffect(() => {
    if (open) setKey(getUserApiKey());
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-up" style={{ background: "oklch(0 0 0 / 0.6)", backdropFilter: "blur(8px)" }}>
      <div className="glass-strong relative w-full max-w-md rounded-3xl p-7">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground">
          <X size={18} />
        </button>
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-[var(--cyberpink)] to-[var(--cybercyan)] p-2.5 glow-pink">
            <KeyRound size={18} className="text-background" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Verifier Settings</h2>
            <p className="text-xs text-muted-foreground">Optional — bring your own Gemini key</p>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          By default, we use our shared AI gateway. If you'd rather run vision checks against your own free Google Gemini account, paste an API key below.
        </p>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Gemini API Key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="AIza..."
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm outline-none transition focus:border-[var(--cyberpink)] focus:ring-2 focus:ring-[var(--cyberpink)]/40"
        />
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--cybercyan)] hover:underline"
        >
          <Sparkles size={12} /> Get a free key at aistudio.google.com
        </a>
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              setUserApiKey("");
              setKey("");
            }}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm transition hover:bg-white/10"
          >
            Use Shared
          </button>
          <button
            onClick={() => {
              setUserApiKey(key.trim());
              onClose();
            }}
            className="flex-1 rounded-xl bg-gradient-to-r from-[var(--cyberpink)] to-[var(--cybercyan)] px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
