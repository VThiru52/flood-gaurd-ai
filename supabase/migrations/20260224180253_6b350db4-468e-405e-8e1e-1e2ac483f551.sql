
-- Historical rainfall data from DRF-Ana sheet
CREATE TABLE public.historical_rainfall (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  daily_rainfall_mm NUMERIC NOT NULL DEFAULT 0,
  intensity_5min NUMERIC DEFAULT 0,
  intensity_10min NUMERIC DEFAULT 0,
  intensity_15min NUMERIC DEFAULT 0,
  intensity_30min NUMERIC DEFAULT 0,
  intensity_45min NUMERIC DEFAULT 0,
  intensity_60min NUMERIC DEFAULT 0,
  intensity_90min NUMERIC DEFAULT 0,
  intensity_120min NUMERIC DEFAULT 0,
  intensity_180min NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Population projections from census data
CREATE TABLE public.population_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  population INTEGER NOT NULL DEFAULT 0,
  increase INTEGER DEFAULT 0,
  percent_increase NUMERIC DEFAULT 0,
  method TEXT DEFAULT 'census',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sub-division population data
CREATE TABLE public.subdivision_population (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division TEXT NOT NULL,
  sub_division TEXT NOT NULL,
  households INTEGER DEFAULT 0,
  population INTEGER DEFAULT 0,
  location TEXT,
  area_sqkm NUMERIC DEFAULT 0,
  density_per_sqkm NUMERIC DEFAULT 0,
  pop_2025 INTEGER DEFAULT 0,
  pop_2040 INTEGER DEFAULT 0,
  pop_2055 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track which files have been ingested
CREATE TABLE public.data_ingestion_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_key TEXT NOT NULL,
  sheet_name TEXT NOT NULL,
  target_table TEXT NOT NULL,
  rows_ingested INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  ingested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(file_key, sheet_name)
);

-- Enable RLS (public read for dashboard data)
ALTER TABLE public.historical_rainfall ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.population_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subdivision_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_log ENABLE ROW LEVEL SECURITY;

-- Public read policies (this is public dashboard data, not user-specific)
CREATE POLICY "Public read historical_rainfall" ON public.historical_rainfall FOR SELECT USING (true);
CREATE POLICY "Public read population_data" ON public.population_data FOR SELECT USING (true);
CREATE POLICY "Public read subdivision_population" ON public.subdivision_population FOR SELECT USING (true);
CREATE POLICY "Public read data_ingestion_log" ON public.data_ingestion_log FOR SELECT USING (true);

-- Service role insert (edge functions use service role)
CREATE POLICY "Service insert historical_rainfall" ON public.historical_rainfall FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert population_data" ON public.population_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert subdivision_population" ON public.subdivision_population FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert data_ingestion_log" ON public.data_ingestion_log FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_rainfall_year ON public.historical_rainfall(year);
CREATE INDEX idx_rainfall_month ON public.historical_rainfall(month);
CREATE INDEX idx_rainfall_daily ON public.historical_rainfall(daily_rainfall_mm DESC);
CREATE INDEX idx_pop_year ON public.population_data(year);
CREATE INDEX idx_subdiv_division ON public.subdivision_population(division);
