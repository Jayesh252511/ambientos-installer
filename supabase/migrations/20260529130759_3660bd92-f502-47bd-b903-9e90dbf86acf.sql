
CREATE TABLE public.installation_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  step_1_completed BOOLEAN NOT NULL DEFAULT false,
  step_2_completed BOOLEAN NOT NULL DEFAULT false,
  step_1_screenshot_url TEXT,
  step_2_screenshot_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.installation_states TO anon, authenticated;
GRANT ALL ON public.installation_states TO service_role;

ALTER TABLE public.installation_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read installation states"
  ON public.installation_states FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert installation states"
  ON public.installation_states FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update installation states"
  ON public.installation_states FOR UPDATE
  TO anon, authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-screenshots', 'verification-screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read screenshots"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'verification-screenshots');

CREATE POLICY "Anyone can upload screenshots"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'verification-screenshots');
