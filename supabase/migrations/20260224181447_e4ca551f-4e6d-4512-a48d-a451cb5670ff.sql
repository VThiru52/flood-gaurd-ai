
-- Store storm frequency data from IDF return period sheets
CREATE TABLE public.storm_frequency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  return_period TEXT NOT NULL,
  intensity_threshold NUMERIC NOT NULL,
  duration_5min INTEGER,
  duration_10min INTEGER,
  duration_15min INTEGER,
  duration_20min INTEGER,
  duration_25min INTEGER,
  duration_30min INTEGER,
  duration_40min INTEGER,
  duration_50min INTEGER,
  duration_60min INTEGER,
  duration_75min INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ward-level population projections
CREATE TABLE public.ward_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  growth_rate NUMERIC NOT NULL DEFAULT 0,
  base_population NUMERIC,
  projected_2025 NUMERIC,
  projected_2040 NUMERIC,
  projected_2055 NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.storm_frequency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ward_projections ENABLE ROW LEVEL SECURITY;

-- Public read access (flood data is public)
CREATE POLICY "Public read storm_frequency" ON public.storm_frequency FOR SELECT USING (true);
CREATE POLICY "Public read ward_projections" ON public.ward_projections FOR SELECT USING (true);

-- Service role insert
CREATE POLICY "Service insert storm_frequency" ON public.storm_frequency FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert ward_projections" ON public.ward_projections FOR INSERT WITH CHECK (true);
CREATE POLICY "Service delete storm_frequency" ON public.storm_frequency FOR DELETE USING (true);
CREATE POLICY "Service delete ward_projections" ON public.ward_projections FOR DELETE USING (true);

-- Also add delete policies on existing tables for re-ingestion
CREATE POLICY "Service delete historical_rainfall" ON public.historical_rainfall FOR DELETE USING (true);
CREATE POLICY "Service delete population_data" ON public.population_data FOR DELETE USING (true);
CREATE POLICY "Service delete subdivision_population" ON public.subdivision_population FOR DELETE USING (true);
CREATE POLICY "Service delete data_ingestion_log" ON public.data_ingestion_log FOR DELETE USING (true);
CREATE POLICY "Service delete idf_records" ON public.idf_records FOR DELETE USING (true);

-- Add unique constraint on data_ingestion_log for upsert
ALTER TABLE public.data_ingestion_log ADD CONSTRAINT uq_ingestion_file_sheet UNIQUE (file_key, sheet_name);
