import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="glass relative overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          <Terminal size={14} className="text-[var(--cybercyan)]" />
          PowerShell · Run as Administrator
        </div>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className={`flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium transition ${
            copied
              ? "bg-[var(--success)]/15 text-[var(--success)]"
              : "bg-white/5 hover:bg-white/10"
          }`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-xs leading-relaxed text-foreground/90 font-mono whitespace-pre-wrap break-all">
        {command}
      </pre>
    </div>
  );
}
