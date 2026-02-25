-- ============================================================
-- AI Flood Guard — Kadapa: Full Migration Script
-- Export this to recreate the entire database on a new Lovable Cloud
-- Generated: 2026-02-25
-- ============================================================

-- 1. TABLES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.flood_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_code TEXT NOT NULL,
  name TEXT NOT NULL,
  risk TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 0,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.zone_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL,
  flood_relevance TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.drainage_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  catchment_area TEXT,
  length TEXT,
  design_return_period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.flood_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  location TEXT NOT NULL,
  message TEXT NOT NULL,
  zone_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weather_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rainfall_mm_hr DOUBLE PRECISION NOT NULL DEFAULT 0,
  temperature_c DOUBLE PRECISION,
  humidity_pct DOUBLE PRECISION,
  pressure_hpa DOUBLE PRECISION,
  wind_speed_kmh DOUBLE PRECISION,
  wind_direction TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_type TEXT NOT NULL,
  risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
  summary TEXT,
  model_used TEXT,
  prediction_data JSONB,
  zone_id UUID REFERENCES public.flood_zones(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.historical_rainfall (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  daily_rainfall_mm DOUBLE PRECISION NOT NULL DEFAULT 0,
  intensity_5min DOUBLE PRECISION,
  intensity_10min DOUBLE PRECISION,
  intensity_15min DOUBLE PRECISION,
  intensity_30min DOUBLE PRECISION,
  intensity_45min DOUBLE PRECISION,
  intensity_60min DOUBLE PRECISION,
  intensity_90min DOUBLE PRECISION,
  intensity_120min DOUBLE PRECISION,
  intensity_180min DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.idf_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duration_min INTEGER NOT NULL,
  intensity_6m DOUBLE PRECISION,
  intensity_1y DOUBLE PRECISION,
  intensity_2y DOUBLE PRECISION,
  intensity_5y DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.storm_frequency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_period TEXT NOT NULL,
  intensity_threshold DOUBLE PRECISION NOT NULL,
  duration_5min DOUBLE PRECISION,
  duration_10min DOUBLE PRECISION,
  duration_15min DOUBLE PRECISION,
  duration_20min DOUBLE PRECISION,
  duration_25min DOUBLE PRECISION,
  duration_30min DOUBLE PRECISION,
  duration_40min DOUBLE PRECISION,
  duration_50min DOUBLE PRECISION,
  duration_60min DOUBLE PRECISION,
  duration_75min DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.population_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  population INTEGER NOT NULL,
  increase INTEGER,
  percent_increase DOUBLE PRECISION,
  method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subdivision_population (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division TEXT NOT NULL,
  sub_division TEXT NOT NULL,
  population INTEGER,
  households INTEGER,
  area_sqkm DOUBLE PRECISION,
  density_per_sqkm DOUBLE PRECISION,
  location TEXT,
  pop_2025 INTEGER,
  pop_2040 INTEGER,
  pop_2055 INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ward_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_population INTEGER,
  growth_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  projected_2025 INTEGER,
  projected_2040 INTEGER,
  projected_2055 INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  parsed_content JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.data_ingestion_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_key TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  target_table TEXT NOT NULL,
  rows_ingested INTEGER,
  status TEXT DEFAULT 'success',
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ENABLE RLS (all tables)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.flood_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drainage_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_rainfall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idf_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storm_frequency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.population_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdivision_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ward_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_log ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES (public read, service-role write)
-- ─────────────────────────────────────────────────────────────

-- Repeat this pattern for each table:
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'flood_zones','zone_categories','drainage_segments','flood_alerts',
    'weather_readings','ai_predictions','historical_rainfall','idf_records',
    'storm_frequency','population_data','subdivision_population','ward_projections',
    'documents','data_ingestion_log'
  ]
  LOOP
    EXECUTE format('CREATE POLICY "Allow public read on %s" ON public.%I FOR SELECT USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow service insert on %s" ON public.%I FOR INSERT WITH CHECK (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow service update on %s" ON public.%I FOR UPDATE USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow service delete on %s" ON public.%I FOR DELETE USING (true)', tbl, tbl);
  END LOOP;
END $$;

-- 4. ENABLE REALTIME
-- ─────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.flood_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_predictions;

-- ============================================================
-- DONE! After running this:
-- 1. Deploy edge functions (fetch-weather, detect-bottlenecks, flood-predict, etc.)
-- 2. Run the data ingestion to populate tables
-- 3. Update .env with new project URL and anon key
-- ============================================================
