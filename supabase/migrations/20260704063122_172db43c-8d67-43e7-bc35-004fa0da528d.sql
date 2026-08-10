
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- lead_lists
CREATE TABLE public.lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_lists TO authenticated;
GRANT ALL ON public.lead_lists TO service_role;
ALTER TABLE public.lead_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lead_lists" ON public.lead_lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.lead_lists(user_id, created_at DESC);

-- leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID REFERENCES public.lead_lists(id) ON DELETE SET NULL,
  place_id TEXT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  maps_url TEXT,
  rating NUMERIC,
  user_ratings_total INT,
  types TEXT[],
  latitude NUMERIC,
  longitude NUMERIC,
  has_website BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own leads" ON public.leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.leads(user_id, list_id);

-- site_audits
CREATE TABLE public.site_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INT,
  needs_redesign BOOLEAN,
  signals JSONB,
  screenshot_url TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_audits TO authenticated;
GRANT ALL ON public.site_audits TO service_role;
ALTER TABLE public.site_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own site_audits" ON public.site_audits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.site_audits(user_id, created_at DESC);

-- seo_reports
CREATE TABLE public.seo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INT,
  title TEXT,
  description TEXT,
  data JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_reports TO authenticated;
GRANT ALL ON public.seo_reports TO service_role;
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own seo_reports" ON public.seo_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ON public.seo_reports(user_id, created_at DESC);
