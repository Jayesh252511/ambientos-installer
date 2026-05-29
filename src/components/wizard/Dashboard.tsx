import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Activity, Palette, Sparkles, ShieldCheck, Power } from "lucide-react";

const THEMES = [
  { id: "cyberpink", name: "Cyberpink", swatch: "linear-gradient(135deg,#FF2E93,#FF7AC6)" },
  { id: "neonmint", name: "Neon Mint", swatch: "linear-gradient(135deg,#00F5A0,#73FFB8)" },
  { id: "lasercyan", name: "Laser Cyan", swatch: "linear-gradient(135deg,#00F0FF,#7CE5FF)" },
];

export function Dashboard() {
  const fired = useRef(false);
  const [theme, setTheme] = useState("cyberpink");

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const end = Date.now() + 1400;
    const colors = ["#FF2E93", "#00F0FF", "#73FFB8", "#FFFFFF"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors });
  }, []);

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-4">
        <ShieldCheck className="text-[var(--success)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--success)]">AmbientOS is live on your machine</p>
          <p className="text-xs text-muted-foreground">Running silently from your Windows registry on logon.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Activity size={16} />} label="Status" value="Active" tone="success" />
        <Stat icon={<Power size={16} />} label="Autostart" value="Enabled" tone="cyan" />
        <Stat icon={<Sparkles size={16} />} label="Connections" value="3 / 3" tone="pink" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Palette size={16} className="text-[var(--cyberpink)]" />
          <h4 className="text-sm font-semibold">Notification Theme</h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`group rounded-xl border p-3 text-left transition hover-lift ${
                theme === t.id ? "border-[var(--cyberpink)] ring-brand" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="mb-2 h-10 rounded-lg" style={{ background: t.swatch }} />
              <p className="text-xs font-medium">{t.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground leading-relaxed">
        <p className="mb-2 font-medium text-foreground">What's next?</p>
        <ul className="space-y-1.5">
          <li>• AmbientOS lives at <code className="rounded bg-white/5 px-1.5 py-0.5 text-[var(--cybercyan)]">HKCU\Software\Microsoft\Windows\CurrentVersion\Run</code></li>
          <li>• Pink paper planes will gently surface upcoming events, unread mail, and YouTube uploads.</li>
          <li>• Press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-foreground">Win + .</kbd> to summon the dashboard.</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({
  icon, label, value, tone,
}: { icon: React.ReactNode; label: string; value: string; tone: "success" | "cyan" | "pink" }) {
  const cls =
    tone === "success" ? "text-[var(--success)]" :
    tone === "cyan" ? "text-[var(--cybercyan)]" :
    "text-[var(--cyberpink)]";
  return (
    <div className="glass rounded-2xl p-4">
      <div className={`mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider ${cls}`}>
        {icon} {label}
      </div>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
