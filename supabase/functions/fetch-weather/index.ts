import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Kadapa coordinates
const LAT = 14.4674;
const LON = 78.8241;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current weather from Open-Meteo (free, no API key needed)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=precipitation&timezone=Asia/Kolkata&past_days=1&forecast_days=1`;

    const res = await fetch(weatherUrl);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const weather = await res.json();

    const current = weather.current;
    const windDirDeg = current.wind_direction_10m;
    const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    const windDir = directions[Math.round(windDirDeg / 22.5) % 16];

    // Insert current reading
    const reading = {
      rainfall_mm_hr: current.precipitation ?? 0,
      temperature_c: current.temperature_2m,
      humidity_pct: current.relative_humidity_2m,
      pressure_hpa: current.surface_pressure,
      wind_speed_kmh: current.wind_speed_10m,
      wind_direction: windDir,
      source: "open-meteo",
      timestamp: new Date().toISOString(),
    };

    const { error: insertErr } = await supabase.from("weather_readings").insert(reading);
    if (insertErr) console.error("Insert error:", insertErr);

    // Also insert hourly data from past 24h for charts
    const hourlyTimes = weather.hourly?.time || [];
    const hourlyPrecip = weather.hourly?.precipitation || [];
    
    // Get existing timestamps to avoid duplicates
    const { data: existing } = await supabase
      .from("weather_readings")
      .select("timestamp")
      .eq("source", "open-meteo-hourly")
      .gte("timestamp", new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    const existingSet = new Set((existing || []).map((e: any) => e.timestamp.slice(0, 13)));

    const hourlyReadings = hourlyTimes
      .map((t: string, i: number) => ({
        rainfall_mm_hr: hourlyPrecip[i] ?? 0,
        temperature_c: current.temperature_2m,
        humidity_pct: current.relative_humidity_2m,
        pressure_hpa: current.surface_pressure,
        wind_speed_kmh: current.wind_speed_10m,
        wind_direction: windDir,
        source: "open-meteo-hourly",
        timestamp: new Date(t).toISOString(),
      }))
      .filter((r: any) => !existingSet.has(r.timestamp.slice(0, 13)));

    if (hourlyReadings.length > 0) {
      const { error: batchErr } = await supabase.from("weather_readings").insert(hourlyReadings);
      if (batchErr) console.error("Hourly insert error:", batchErr);
    }

    return new Response(
      JSON.stringify({
        current: reading,
        hourly_inserted: hourlyReadings.length,
        message: "Weather data fetched and stored",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-weather error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
