import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings, Zap, ExternalLink, ChevronRight, Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { PaperPlanes } from "@/components/wizard/PaperPlanes";
import { StepCard, type StepState } from "@/components/wizard/StepCard";
import { CopyCommand } from "@/components/wizard/CopyCommand";
import { Dropzone } from "@/components/wizard/Dropzone";
import { Dashboard } from "@/components/wizard/Dashboard";
import { SettingsModal } from "@/components/wizard/SettingsModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AmbientOS — Install Wizard" },
      {
        name: "description",
        content:
          "Install AmbientOS in 3 verified steps. A futuristic desktop notification overlay for Windows with Gemini-Vision powered onboarding.",
      },
      { property: "og:title", content: "AmbientOS — Install Wizard" },
      {
        property: "og:description",
        content:
          "Pink paper planes that whisper your calendar, mail and YouTube directly onto your desktop.",
      },
    ],
  }),
  component: Index,
});

const PS_COMMAND = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/Jayesh252511/AmbientOS/main/install-gui.ps1'))`;

type WizardState = {
  step1: boolean;
  step2: boolean;
};

function Index() {
  const [state, setState] = useState<WizardState>({ step1: false, step2: false });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    (async () => {
      const { data } = await supabase
        .from("installation_states")
        .select("*")
        .eq("session_id", sid)
        .maybeSingle();
      if (data) {
        setState({ step1: !!data.step_1_completed, step2: !!data.step_2_completed });
      } else {
        await supabase.from("installation_states").insert({ session_id: sid });
      }
    })();
  }, []);

  async function markStep(step: 1 | 2, imageUrl: string) {
    const patch =
      step === 1
        ? { step_1_completed: true, step_1_screenshot_url: imageUrl, updated_at: new Date().toISOString() }
        : { step_2_completed: true, step_2_screenshot_url: imageUrl, updated_at: new Date().toISOString() };
    await supabase.from("installation_states").update(patch).eq("session_id", sessionId);
    setState((s) => ({ ...s, [`step${step}`]: true } as WizardState));
    // smooth scroll to the next step
    setTimeout(() => {
      document.getElementById(`step-${step + 1}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  }

  const step1State: StepState = state.step1 ? "verified" : "active";
  const step2State: StepState = !state.step1 ? "locked" : state.step2 ? "verified" : "active";
  const step3State: StepState = !state.step2 ? "locked" : "verified";

  const completed = (state.step1 ? 1 : 0) + (state.step2 ? 1 : 0) + (state.step2 ? 1 : 0);
  const pct = Math.round((completed / 3) * 100);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <PaperPlanes />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--cyberpink)] to-[var(--cybercyan)] glow-pink">
            <Zap size={18} className="text-background" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold tracking-tight">AmbientOS</span>
          <span className="hidden rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:inline">v1.0 · Preview</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/Jayesh252511/AmbientOS"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10 sm:inline-flex"
          >
            <Github size={14} /> Source
          </a>
          <button
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
          >
            <Settings size={14} /> Settings
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 sm:pt-10">
        <div className="animate-fade-up mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--cyberpink)]" />
            AI-verified onboarding · Powered by Gemini Vision
          </div>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            Install <span className="text-gradient-brand">AmbientOS</span><br className="hidden sm:block" />
            in three guided steps.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            A weightless desktop overlay that whispers your calendar, mail and creator stats through translucent pink paper planes — never another popup.
          </p>

          {/* Progress */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Setup Progress</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--cyberpink)] to-[var(--cybercyan)] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Wizard */}
      <main className="relative z-10 mx-auto max-w-3xl space-y-5 px-5 pb-24 sm:px-8">
        {/* STEP 1 */}
        <div id="step-1">
          <StepCard
            index={1}
            title="Core Setup & Startup"
            subtitle="Run the one-liner — AmbientOS installs silently."
            state={step1State}
          >
            <div className="space-y-5">
              <CopyCommand command={PS_COMMAND} />
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed">
                <p className="mb-1 font-medium">After it runs, take a screenshot of:</p>
                <p className="text-muted-foreground">
                  The AmbientOS launcher window, the terminal mid-install, <em>or</em> the pink paper planes drifting on your desktop. Then drop it below.
                </p>
              </div>
              <Dropzone
                step="step1"
                hint="Looking for: AmbientOS launcher GUI · PowerShell/Electron running · pink paper-plane overlays."
                onVerified={(url) => markStep(1, url)}
                isActive={step1State === "active"}
              />
            </div>
          </StepCard>
        </div>

        {/* Connector chevron */}
        <Connector active={state.step1} />

        {/* STEP 2 */}
        <div id="step-2">
          <StepCard
            index={2}
            title="Connect Google Account"
            subtitle="Calendar · Gmail · YouTube — all routed through localhost OAuth."
            state={step2State}
          >
            <div className="space-y-5">
              <a
                href="http://localhost:6968/auth"
                target="_blank"
                rel="noreferrer"
                className={`group flex items-center justify-between rounded-2xl bg-gradient-to-r from-[var(--cyberpink)] to-[var(--cybercyan)] px-5 py-4 font-semibold text-background transition hover-lift ${step2State === "locked" ? "" : "glow-pink"}`}
              >
                <span className="flex items-center gap-2">
                  🔗 Link Google Calendar, Mail &amp; YouTube
                </span>
                <ExternalLink size={16} className="transition group-hover:translate-x-0.5" />
              </a>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-muted-foreground">
                A popup will open <code className="rounded bg-white/5 px-1.5 py-0.5 text-[var(--cybercyan)]">http://localhost:6968/auth</code>.
                After granting consent, screenshot the success page (green checkmark or "Connected Successfully").
              </div>
              <Dropzone
                step="step2"
                hint="Looking for: 'Connected Successfully' page · green checkmark · Google consent screen for AmbientOS scopes."
                onVerified={(url) => markStep(2, url)}
                isActive={step2State === "active"}
              />
            </div>
          </StepCard>
        </div>

        <Connector active={state.step2} />

        {/* STEP 3 */}
        <div id="step-3">
          <StepCard
            index={3}
            title="Installation Complete"
            subtitle="Customize your overlay and meet your new ambient companion."
            state={step3State}
          >
            {state.step2 ? (
              <Dashboard />
            ) : (
              <p className="text-sm text-muted-foreground">
                Finish Step 2 to unlock your dashboard.
              </p>
            )}
          </StepCard>
        </div>

        <footer className="pt-6 text-center text-xs text-muted-foreground">
          Crafted with translucent pixels. AmbientOS © {new Date().getFullYear()}.
        </footer>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className="flex justify-center py-1">
      <ChevronRight
        size={20}
        className={`rotate-90 transition ${active ? "text-[var(--cyberpink)]" : "text-white/15"}`}
      />
    </div>
  );
}
