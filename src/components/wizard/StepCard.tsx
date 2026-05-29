import { Check, Lock } from "lucide-react";
import type { ReactNode } from "react";

export type StepState = "locked" | "active" | "verified";

export function StepCard({
  index,
  title,
  subtitle,
  state,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  state: StepState;
  children: ReactNode;
}) {
  return (
    <div
      className={`glass-strong animate-fade-up relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-500 ${
        state === "locked" ? "opacity-50 grayscale" : ""
      } ${state === "active" ? "ring-brand" : ""}`}
    >
      {state === "verified" && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--success)]/10 to-transparent" />
      )}
      <div className="relative mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition ${
              state === "verified"
                ? "bg-[var(--success)] text-background glow-cyan"
                : state === "active"
                  ? "bg-gradient-to-br from-[var(--cyberpink)] to-[var(--cybercyan)] text-background animate-pulse-glow"
                  : "bg-white/5 text-muted-foreground"
            }`}
          >
            {state === "verified" ? <Check size={20} /> : state === "locked" ? <Lock size={16} /> : index}
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <StatusPill state={state} />
      </div>
      <div className={`relative ${state === "locked" ? "pointer-events-none select-none" : ""}`}>
        {children}
      </div>
    </div>
  );
}

function StatusPill({ state }: { state: StepState }) {
  const map = {
    locked: { label: "Locked", cls: "bg-white/5 text-muted-foreground" },
    active: { label: "In Progress", cls: "bg-[var(--cyberpink)]/15 text-[var(--cyberpink)]" },
    verified: { label: "Verified", cls: "bg-[var(--success)]/15 text-[var(--success)]" },
  }[state];
  return (
    <span className={`hidden sm:inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium ${map.cls}`}>
      {map.label}
    </span>
  );
}
