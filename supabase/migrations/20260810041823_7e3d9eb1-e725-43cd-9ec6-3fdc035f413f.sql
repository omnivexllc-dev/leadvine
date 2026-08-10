CREATE TABLE public.scan_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Bulk scan',
  list_id uuid REFERENCES public.lead_lists(id) ON DELETE SET NULL,
  force_rescan boolean NOT NULL DEFAULT false,
  rescan_days integer NOT NULL DEFAULT 30,
  lead_ids uuid[] NOT NULL DEFAULT '{}',
  total integer NOT NULL DEFAULT 0,
  completed integer NOT NULL DEFAULT 0,
  skipped integer NOT NULL DEFAULT 0,
  failed integer NOT NULL DEFAULT 0,
  cursor integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'running',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_batches TO authenticated;
GRANT ALL ON public.scan_batches TO service_role;

ALTER TABLE public.scan_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own scan_batches" ON public.scan_batches FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_scan_batches_updated_at BEFORE UPDATE ON public.scan_batches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS opportunity_score integer,
  ADD COLUMN IF NOT EXISTS site_score integer,
  ADD COLUMN IF NOT EXISTS seo_score integer,
  ADD COLUMN IF NOT EXISTS last_scanned_at timestamptz;