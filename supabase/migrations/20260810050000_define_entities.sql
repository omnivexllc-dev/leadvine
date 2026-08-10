-- ============================================================================
-- Supabase Migration: Define 'leads', 'scan_results', and 'campaigns' tables
-- ============================================================================
-- This migration establishes the core relational schema for Lead Connector Suite:
-- 1. 'public.leads' - Central entity for prospect and business records.
-- 2. 'public.scan_results' - Technical, SEO, and AI audit scan outputs linked to leads.
-- 3. 'public.campaigns' & 'public.campaign_prospects' - Outreach campaigns linked to leads.
--
-- Features:
-- - UUID primary keys generated via gen_random_uuid()
-- - TIMESTAMPTZ for created_at, updated_at, and audit timestamps
-- - Foreign key relationships linking scan_results and campaigns to leads with ON DELETE CASCADE
-- - High-performance B-tree indexes on frequently queried columns (created_at, status, domain, lead_id)
-- - Row Level Security (RLS) policies for multi-tenant data isolation
-- ============================================================================

-- Utility function for automatically updating updated_at timestamp columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 1. LEADS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id uuid REFERENCES public.lead_lists(id) ON DELETE SET NULL,
  place_id text,
  name text NOT NULL,
  domain text,
  address text,
  phone text,
  email text,
  website text,
  maps_url text,
  rating numeric,
  user_ratings_total integer,
  types text[],
  latitude numeric,
  longitude numeric,
  has_website boolean NOT NULL DEFAULT false,
  notes text,
  status text NOT NULL DEFAULT 'new',
  city text,
  category text,
  star_rating integer DEFAULT 0,
  estimated_contract_value numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure domain and updated_at exist if table was previously created
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS domain text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS star_rating integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_contract_value numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Permissions & RLS for LEADS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'own leads'
  ) THEN
    CREATE POLICY "own leads" ON public.leads FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- B-Tree Indexes for LEADS
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx ON public.leads(status);
CREATE INDEX IF NOT EXISTS leads_domain_idx ON public.leads(domain);
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS leads_user_list_idx ON public.leads(user_id, list_id);

-- Updated_at trigger for LEADS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_updated_at'
  ) THEN
    CREATE TRIGGER update_leads_updated_at
      BEFORE UPDATE ON public.leads
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. SCAN_RESULTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scan_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES public.scan_batches(id) ON DELETE SET NULL,
  url text NOT NULL,
  domain text,
  scan_type text NOT NULL DEFAULT 'full_audit',
  status text NOT NULL DEFAULT 'completed',
  overall_score integer,
  seo_score integer,
  design_score integer,
  performance_score integer,
  accessibility_score integer,
  domain_intel jsonb DEFAULT '{}'::jsonb,
  tech_stack jsonb DEFAULT '{}'::jsonb,
  audit_details jsonb DEFAULT '{}'::jsonb,
  opportunity_analysis jsonb DEFAULT '{}'::jsonb,
  screenshot_url text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure domain exists if table was previously created
ALTER TABLE public.scan_results
  ADD COLUMN IF NOT EXISTS domain text;

-- Foreign key constraint explicitly enforcing ON DELETE CASCADE on lead_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'scan_results_lead_id_fkey' AND table_name = 'scan_results'
  ) THEN
    ALTER TABLE public.scan_results
      ADD CONSTRAINT scan_results_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Permissions & RLS for SCAN_RESULTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scan_results TO authenticated;
GRANT ALL ON public.scan_results TO service_role;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'scan_results' AND policyname = 'own scan_results'
  ) THEN
    CREATE POLICY "own scan_results" ON public.scan_results FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- B-Tree Indexes for SCAN_RESULTS
CREATE INDEX IF NOT EXISTS scan_results_created_at_idx ON public.scan_results(created_at DESC);
CREATE INDEX IF NOT EXISTS scan_results_status_idx ON public.scan_results(status);
CREATE INDEX IF NOT EXISTS scan_results_domain_idx ON public.scan_results(domain);
CREATE INDEX IF NOT EXISTS scan_results_lead_id_idx ON public.scan_results(lead_id);
CREATE INDEX IF NOT EXISTS scan_results_user_id_idx ON public.scan_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS scan_results_batch_id_idx ON public.scan_results(batch_id);

-- Updated_at trigger for SCAN_RESULTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_scan_results_updated_at'
  ) THEN
    CREATE TRIGGER update_scan_results_updated_at
      BEFORE UPDATE ON public.scan_results
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. CAMPAIGNS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  name text NOT NULL,
  domain text,
  status text NOT NULL DEFAULT 'draft',
  subject_template text,
  body_template text,
  target_query text,
  total_prospects integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  opened_count integer NOT NULL DEFAULT 0,
  clicked_count integer NOT NULL DEFAULT 0,
  replied_count integer NOT NULL DEFAULT 0,
  meetings_booked integer NOT NULL DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS domain text;

-- Foreign key constraint explicitly enforcing ON DELETE CASCADE on lead_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'campaigns_lead_id_fkey' AND table_name = 'campaigns'
  ) THEN
    ALTER TABLE public.campaigns
      ADD CONSTRAINT campaigns_lead_id_fkey
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Permissions & RLS for CAMPAIGNS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'own campaigns'
  ) THEN
    CREATE POLICY "own campaigns" ON public.campaigns FOR ALL TO authenticated
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- B-Tree Indexes for CAMPAIGNS
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_domain_idx ON public.campaigns(domain);
CREATE INDEX IF NOT EXISTS campaigns_lead_id_idx ON public.campaigns(lead_id);
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON public.campaigns(user_id, created_at DESC);

-- Updated_at trigger for CAMPAIGNS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_campaigns_updated_at'
  ) THEN
    CREATE TRIGGER update_campaigns_updated_at
      BEFORE UPDATE ON public.campaigns
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. CAMPAIGN_PROSPECTS JUNCTION TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campaign_prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  current_step integer NOT NULL DEFAULT 1,
  last_contacted_at timestamptz,
  next_scheduled_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Permissions & RLS for CAMPAIGN_PROSPECTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_prospects TO authenticated;
GRANT ALL ON public.campaign_prospects TO service_role;
ALTER TABLE public.campaign_prospects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'campaign_prospects' AND policyname = 'own campaign_prospects'
  ) THEN
    CREATE POLICY "own campaign_prospects" ON public.campaign_prospects FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.campaigns c
          WHERE c.id = campaign_prospects.campaign_id AND c.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.campaigns c
          WHERE c.id = campaign_prospects.campaign_id AND c.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- B-Tree Indexes for CAMPAIGN_PROSPECTS
CREATE INDEX IF NOT EXISTS campaign_prospects_created_at_idx ON public.campaign_prospects(created_at DESC);
CREATE INDEX IF NOT EXISTS campaign_prospects_status_idx ON public.campaign_prospects(status);
CREATE INDEX IF NOT EXISTS campaign_prospects_lead_id_idx ON public.campaign_prospects(lead_id);
CREATE INDEX IF NOT EXISTS campaign_prospects_campaign_id_idx ON public.campaign_prospects(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_prospects_campaign_lead_idx ON public.campaign_prospects(campaign_id, lead_id);
