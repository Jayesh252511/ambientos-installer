import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const STEP_PROMPTS: Record<string, string> = {
  step1:
    "You are verifying step 1 of the AmbientOS installer. The user should have run a PowerShell one-liner that downloads and launches AmbientOS. A correct screenshot shows ANY of: (a) the AmbientOS GUI installer / launcher window, (b) a PowerShell or terminal window running the install command, downloading files, or showing 'AmbientOS' / 'install-gui.ps1' output, (c) a Node.js or Electron process running, or (d) translucent pink paper-plane notification overlays floating on a Windows desktop. Be generous — if it plausibly shows the installer running, accept it.",
  step2:
    "You are verifying step 2 of the AmbientOS installer. The user just linked their Google account (Calendar, Mail, YouTube) via http://localhost:6968/auth. A correct screenshot shows ANY of: (a) a 'Connected Successfully' / 'Authentication successful' / green checkmark webpage, (b) a Google account chooser or consent screen for Calendar / Gmail / YouTube scopes, or (c) a localhost:6968 page indicating the OAuth flow completed. Be generous — if it plausibly shows a completed or in-progress Google OAuth flow for AmbientOS, accept it.",
};

export const verifyScreenshot = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      step: z.enum(["step1", "step2"]),
      imageUrl: z.string().url(),
      userApiKey: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const systemPrompt = STEP_PROMPTS[data.step];
    const instruction = `${systemPrompt}\n\nRespond ONLY with a JSON object in this exact shape (no markdown, no prose):\n{ "verified": boolean, "feedback": "a short friendly message — if verified, congratulate; if not, explain exactly what is missing and how to fix it" }`;

    // Use Lovable AI Gateway by default; fall back to user's own Gemini key if provided.
    const useUserKey = Boolean(data.userApiKey && data.userApiKey.trim());

    try {
      let rawText = "";

      if (useUserKey) {
        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
            data.userApiKey!.trim(),
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: instruction },
                    { file_data: { mime_type: "image/png", file_uri: data.imageUrl } },
                  ],
                },
              ],
              generationConfig: { responseMimeType: "application/json" },
            }),
          },
        );
        if (!resp.ok) {
          const errTxt = await resp.text();
          return {
            verified: false,
            feedback: `Gemini API error (${resp.status}): ${errTxt.slice(0, 200)}. Double-check your API key.`,
          };
        }
        const json = (await resp.json()) as any;
        rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      } else {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return {
            verified: false,
            feedback:
              "AI verification is not configured. Please paste your own free Gemini API key in Settings to continue.",
          };
        }
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: instruction },
                  { type: "image_url", image_url: { url: data.imageUrl } },
                ],
              },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (resp.status === 429) {
          return {
            verified: false,
            feedback: "Rate limit reached on the shared verifier. Please retry in a moment, or paste your own Gemini key in Settings.",
          };
        }
        if (resp.status === 402) {
          return {
            verified: false,
            feedback: "Shared AI credits exhausted. Paste your own free Gemini API key in Settings to continue.",
          };
        }
        if (!resp.ok) {
          const errTxt = await resp.text();
          return {
            verified: false,
            feedback: `Verifier error (${resp.status}): ${errTxt.slice(0, 200)}`,
          };
        }
        const json = (await resp.json()) as any;
        rawText = json?.choices?.[0]?.message?.content ?? "";
      }

      // Parse JSON out of model response (strip ```json fences if any)
      const cleaned = rawText.replace(/```json\s*|\s*```/g, "").trim();
      let parsed: { verified?: boolean; feedback?: string } = {};
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch {
            /* ignore */
          }
        }
      }
      return {
        verified: Boolean(parsed.verified),
        feedback:
          parsed.feedback ??
          (parsed.verified
            ? "Looks great — step verified!"
            : "We couldn't verify that screenshot. Try uploading a clearer one."),
      };
    } catch (err) {
      console.error("verifyScreenshot error:", err);
      return {
        verified: false,
        feedback: "Something went wrong contacting the AI verifier. Please retry.",
      };
    }
  });
