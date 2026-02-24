
-- ============================================================
-- FloodGuard AI — Dynamic Database Schema
-- ============================================================

-- Flood Zones (from PDF: Kadapa Master Plan + IDF Analysis)
CREATE TABLE public.flood_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  risk TEXT NOT NULL CHECK (risk IN ('critical', 'high', 'medium', 'low')),
  level INTEGER NOT NULL DEFAULT 0,
  zone_code TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Zone Categories (from PDF: G.O.Ms.No.39 Master Plan 2041)
CREATE TABLE public.zone_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('DPZ', 'DRZ')),
  description TEXT,
  flood_relevance TEXT NOT NULL CHECK (flood_relevance IN ('critical', 'high', 'medium', 'low')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drainage Segments (from PDF: DPR Analysis)
CREATE TABLE public.drainage_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('critical', 'high', 'medium', 'low')),
  length TEXT,
  catchment_area TEXT,
  design_return_period TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Flood Alerts (dynamic, real-time)
CREATE TABLE public.flood_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('flood', 'bottleneck', 'encroachment', 'overflow')),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  message TEXT NOT NULL,
  location TEXT NOT NULL,
  zone_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- IDF Records (from PDF: Rainfall Analysis)
CREATE TABLE public.idf_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  duration_min INTEGER NOT NULL,
  intensity_6m DOUBLE PRECISION,
  intensity_1y DOUBLE PRECISION,
  intensity_2y DOUBLE PRECISION,
  intensity_5y DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weather Readings (for real-time simulation)
CREATE TABLE public.weather_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  rainfall_mm_hr DOUBLE PRECISION NOT NULL DEFAULT 0,
  temperature_c DOUBLE PRECISION,
  humidity_pct DOUBLE PRECISION,
  wind_speed_kmh DOUBLE PRECISION,
  wind_direction TEXT,
  pressure_hpa DOUBLE PRECISION,
  source TEXT DEFAULT 'simulation'
);

-- AI Predictions (from AI model runs)
CREATE TABLE public.ai_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('flood_risk', 'drainage_failure', 'rainfall_forecast', 'zone_alert')),
  zone_id UUID REFERENCES public.flood_zones(id),
  risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
  prediction_data JSONB,
  summary TEXT,
  model_used TEXT DEFAULT 'gemini-3-flash-preview',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.flood_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drainage_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idf_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_predictions ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (this is a public monitoring dashboard)
CREATE POLICY "Public read flood_zones" ON public.flood_zones FOR SELECT USING (true);
CREATE POLICY "Public read zone_categories" ON public.zone_categories FOR SELECT USING (true);
CREATE POLICY "Public read drainage_segments" ON public.drainage_segments FOR SELECT USING (true);
CREATE POLICY "Public read flood_alerts" ON public.flood_alerts FOR SELECT USING (true);
CREATE POLICY "Public read idf_records" ON public.idf_records FOR SELECT USING (true);
CREATE POLICY "Public read weather_readings" ON public.weather_readings FOR SELECT USING (true);
CREATE POLICY "Public read ai_predictions" ON public.ai_predictions FOR SELECT USING (true);

-- Service role insert/update (edge functions will write data)
CREATE POLICY "Service insert flood_zones" ON public.flood_zones FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update flood_zones" ON public.flood_zones FOR UPDATE USING (true);
CREATE POLICY "Service insert drainage_segments" ON public.drainage_segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update drainage_segments" ON public.drainage_segments FOR UPDATE USING (true);
CREATE POLICY "Service insert flood_alerts" ON public.flood_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update flood_alerts" ON public.flood_alerts FOR UPDATE USING (true);
CREATE POLICY "Service insert weather_readings" ON public.weather_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert ai_predictions" ON public.ai_predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update ai_predictions" ON public.ai_predictions FOR UPDATE USING (true);
CREATE POLICY "Service insert idf_records" ON public.idf_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Service insert zone_categories" ON public.zone_categories FOR INSERT WITH CHECK (true);

-- Enable realtime for alerts and weather
ALTER PUBLICATION supabase_realtime ADD TABLE public.flood_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_predictions;

-- Updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_flood_zones_updated_at BEFORE UPDATE ON public.flood_zones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drainage_segments_updated_at BEFORE UPDATE ON public.drainage_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- SEED DATA from parsed PDFs
-- ============================================================

-- Seed Flood Zones
INSERT INTO public.flood_zones (name, risk, level, zone_code, lat, lng, description) VALUES
  ('Pennar River Basin - PR Zone', 'critical', 96, 'PR', 14.4674, 78.8241, 'Primary flood zone along Pennar River main channel'),
  ('Buggavanka Nala Stretch', 'critical', 93, 'PR', 14.4550, 78.8100, 'Critical nala overflow area in central Kadapa'),
  ('Gandikota Road Low-lying Area', 'critical', 90, 'R', 14.4720, 78.8350, 'Low-lying residential area prone to waterlogging'),
  ('Rajiv Nagar - Residential Zone', 'high', 82, 'R', 14.4600, 78.8200, 'Dense residential zone with inadequate drainage'),
  ('Nagarajupeta - Mixed Use Zone', 'high', 76, 'M', 14.4680, 78.8150, 'Mixed use area near nala stretch'),
  ('Industrial Area (APIIC) - Hazardous', 'high', 74, 'I-b', 14.4450, 78.8400, 'Industrial zone with hazardous materials risk'),
  ('Sunnapubatti - Old Town', 'high', 70, 'M', 14.4700, 78.8280, 'Historic old town with aging drainage'),
  ('Ngo Colony - PS Zone', 'medium', 58, 'PS', 14.4530, 78.8300, 'Public/semi-public zone with moderate risk'),
  ('Bypass Road Junction - Transport', 'medium', 55, 'T', 14.4800, 78.8450, 'Transport junction with culvert network'),
  ('Pulivendula Road Corridor', 'medium', 52, 'GC', 14.4900, 78.8500, 'Growth corridor with developing infrastructure'),
  ('Yerramukkapalli - Commercial', 'medium', 48, 'C', 14.4650, 78.8050, 'Commercial zone affected by waterlogging'),
  ('Brahmam Gari Matham - Heritage', 'low', 28, 'SA', 14.4710, 78.8200, 'Heritage site with special area zoning'),
  ('Devuni Kadapa Hills - Open Space', 'low', 22, 'RE', 14.4580, 78.7950, 'Elevated recreational open space'),
  ('Idupulapaya - Agriculture Zone', 'low', 15, 'A', 14.5000, 78.8600, 'Agricultural zone on outskirts');

-- Seed Zone Categories
INSERT INTO public.zone_categories (code, name, zone_type, description, flood_relevance) VALUES
  ('R', 'Residential Use Zone', 'DPZ', 'Housing, apartments, group development schemes', 'high'),
  ('C', 'Commercial Use Zone', 'DPZ', 'Shops, markets, commercial establishments', 'medium'),
  ('M', 'Mixed Use Zone', 'DPZ', 'Combined residential and commercial activities', 'high'),
  ('I-a', 'Work Centre Zone', 'DPZ', 'Green and White category industries', 'medium'),
  ('I-b', 'Hazardous Industrial Zone', 'DPZ', 'Red and Orange category industries', 'critical'),
  ('PS', 'Public & Semi-Public Zone', 'DPZ', 'Government, educational, healthcare institutions', 'high'),
  ('PU', 'Public Utilities Zone', 'DPZ', 'Infrastructure and utility services', 'medium'),
  ('RE', 'Recreational Open Space', 'DPZ', 'Parks, playgrounds, gardens', 'low'),
  ('T', 'Transportation Zone', 'DPZ', 'Roads, railway, bus stations', 'medium'),
  ('A', 'Agriculture Use Zone', 'DPZ', 'Agricultural land within municipal limits', 'low'),
  ('GC', 'Growth Corridor Zone', 'DPZ', 'Strategic growth corridors for urban expansion', 'medium'),
  ('SA', 'Special Area Zone', 'DRZ', 'Heritage buildings, defense/military lands', 'low'),
  ('PR', 'Protected Zone', 'DRZ', 'Water bodies (rivers, nalas, reservoirs, kuntas), forest areas', 'critical');

-- Seed Drainage Segments
INSERT INTO public.drainage_segments (name, capacity, status, length, catchment_area, design_return_period) VALUES
  ('Pennar River Main Channel', 28, 'critical', '12.5 km', 'Kadapa Municipal', '5 years'),
  ('Buggavanka Nala Drain', 35, 'critical', '8.2 km', 'Central Kadapa', '2 years'),
  ('Gandikota Road Storm Drain', 42, 'high', '3.8 km', 'East Kadapa', '1 year'),
  ('Rajiv Nagar Box Drain', 55, 'medium', '2.1 km', 'South Kadapa', '6 months'),
  ('APIIC Industrial Drain', 62, 'medium', '4.5 km', 'Industrial Area', '2 years'),
  ('Bypass Road Culvert Network', 75, 'low', '6.3 km', 'Outer Ring', '1 year'),
  ('Pulivendula Road Side Drain', 68, 'medium', '3.2 km', 'Growth Corridor', '6 months'),
  ('Sunnapubatti Heritage Drain', 38, 'high', '1.5 km', 'Old Town', '6 months');

-- Seed IDF Records
INSERT INTO public.idf_records (duration_min, intensity_6m, intensity_1y, intensity_2y, intensity_5y) VALUES
  (5, 112.72, 246.55, 409.51, 778.02),
  (10, 72.84, 142.59, 224.06, 390.36),
  (20, 47.06, 82.47, 122.60, 195.86),
  (30, 36.45, 59.86, 86.15, 130.84),
  (40, 30.41, 47.69, 67.08, 98.27),
  (45, 28.24, 43.46, 60.54, 87.40),
  (60, 23.56, 34.62, 47.14, 65.65),
  (90, 18.25, 25.13, 33.13, 43.85),
  (120, 15.22, 20.02, 25.79, 32.94),
  (150, 13.23, 16.79, 21.24, 26.38),
  (180, 11.79, 14.54, 18.13, 22.00),
  (210, 10.70, 12.87, 15.85, 18.87),
  (240, 9.84, 11.58, 14.11, 16.53),
  (270, 9.13, 10.55, 12.74, 14.70),
  (300, 8.55, 9.71, 11.62, 13.24);

-- Seed initial flood alerts
INSERT INTO public.flood_alerts (alert_type, severity, message, location, zone_code) VALUES
  ('flood', 'critical', 'Pennar River water level at 96% — exceeds danger mark (IDF 5-yr return)', 'Pennar River Basin', 'PR'),
  ('overflow', 'critical', 'Buggavanka Nala overflow imminent — 93% capacity, design exceeded', 'Buggavanka Nala', 'PR'),
  ('flood', 'critical', 'Waterlogging at Gandikota Road — 90% risk, 130.84 mm/hr 5-yr intensity', 'Gandikota Road', 'R'),
  ('bottleneck', 'high', 'Drainage choke detected — Rajiv Nagar box drain at 55% capacity only', 'Rajiv Nagar', 'R'),
  ('encroachment', 'high', 'Unauthorized structure near Buggavanka drain — violates PR zone regulation', 'Nagarajupeta', 'M'),
  ('bottleneck', 'high', 'Sediment buildup reducing flow — APIIC industrial drain at 62%', 'APIIC Area', 'I-b'),
  ('overflow', 'high', 'Sunnapubatti heritage drain overwhelmed — 38% capacity, needs urgent clearance', 'Sunnapubatti', 'M'),
  ('bottleneck', 'medium', 'Bypass Road culvert partially blocked — 75% flow maintained', 'Bypass Road', 'T'),
  ('encroachment', 'medium', 'Encroachment detected along Pulivendula Road drain embankment', 'Pulivendula Road', 'GC'),
  ('flood', 'medium', 'Yerramukkapalli junction waterlogging — commercial zone affected', 'Yerramukkapalli', 'C');

-- Seed initial weather readings (simulated real-time data)
INSERT INTO public.weather_readings (timestamp, rainfall_mm_hr, temperature_c, humidity_pct, wind_speed_kmh, wind_direction, pressure_hpa, source) VALUES
  (now() - interval '6 hours', 8.55, 28.2, 82, 12, 'NE', 1008, 'idf_simulation'),
  (now() - interval '5 hours', 15.22, 27.8, 85, 14, 'NE', 1006, 'idf_simulation'),
  (now() - interval '4 hours', 23.56, 27.1, 88, 18, 'E', 1004, 'idf_simulation'),
  (now() - interval '3 hours', 47.06, 26.5, 92, 22, 'E', 1002, 'idf_simulation'),
  (now() - interval '2 hours', 86.15, 25.8, 95, 28, 'SE', 999, 'idf_simulation'),
  (now() - interval '1 hour', 130.84, 25.2, 97, 35, 'SE', 996, 'idf_simulation'),
  (now(), 65.65, 25.5, 94, 30, 'E', 998, 'idf_simulation');
