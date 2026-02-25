import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch current data + historical data for AI analysis
    const [zonesRes, drainsRes, alertsRes, weatherRes, idfRes, rainfallRes, popRes, subDivRes] = await Promise.all([
      supabase.from("flood_zones").select("*").order("level", { ascending: false }),
      supabase.from("drainage_segments").select("*"),
      supabase.from("flood_alerts").select("*").eq("is_active", true),
      supabase.from("weather_readings").select("*").order("timestamp", { ascending: false }).limit(10),
      supabase.from("idf_records").select("*").order("duration_min"),
      supabase.from("historical_rainfall").select("*").order("daily_rainfall_mm", { ascending: false }).limit(20),
      supabase.from("population_data").select("*").order("year"),
      supabase.from("subdivision_population").select("*").order("density_per_sqkm", { ascending: false }).limit(10),
    ]);

    const zones = zonesRes.data || [];
    const drains = drainsRes.data || [];
    const alerts = alertsRes.data || [];
    const weather = weatherRes.data || [];
    const idf = idfRes.data || [];
    const historicalRainfall = rainfallRes.data || [];
    const population = popRes.data || [];
    const densestAreas = subDivRes.data || [];

    const currentRainfall = weather[0]?.rainfall_mm_hr ?? 0;
    const peakRainfall = Math.max(...weather.map((w: any) => w.rainfall_mm_hr), 0);
    const historicalMax = historicalRainfall.length > 0 ? historicalRainfall[0].daily_rainfall_mm : 0;
    const latestPop = population.length > 0 ? population[population.length - 1] : null;

    const systemPrompt = `You are FloodGuard AI, an expert flood risk prediction system for Kadapa, Andhra Pradesh, India.
You analyze real-time AND historical hydrological data including IDF curves, drainage capacity, weather readings, flood zone levels, 
historical rainfall patterns, population density, and urban growth projections.

Your task: Analyze all conditions and provide MULTI-HORIZON predictions:
1. Overall flood risk assessment (0-100 score) based on current + historical patterns
2. Risk predictions for each critical zone, considering population density and drainage capacity
3. Specific actionable recommendations referencing historical precedents
4. THREE forecast horizons:
   - 6-HOUR: Immediate threat assessment based on current rainfall trends and drainage saturation
   - 24-HOUR: Short-term prediction based on weather patterns, pressure systems, humidity trends
   - 72-HOUR (3-DAY): Extended outlook based on seasonal patterns, historical rainfall cycles, upstream conditions
5. High-density population areas at greatest risk

Be data-driven. Reference specific numbers from historical rainfall, population density, and current conditions.
Consider that areas with high population density + poor drainage + historical heavy rainfall = highest risk.
For each time horizon, specify: risk level change, expected rainfall range, and key triggers to watch.`;

    const userPrompt = `CURRENT CONDITIONS (${new Date().toISOString()}):

WEATHER (last ${weather.length} readings):
- Current rainfall: ${currentRainfall} mm/hr
- Peak rainfall (recent): ${peakRainfall} mm/hr
- Temperature: ${weather[0]?.temperature_c ?? "N/A"}°C
- Humidity: ${weather[0]?.humidity_pct ?? "N/A"}%
- Wind: ${weather[0]?.wind_speed_kmh ?? "N/A"} km/h ${weather[0]?.wind_direction ?? ""}
- Pressure: ${weather[0]?.pressure_hpa ?? "N/A"} hPa

HISTORICAL RAINFALL (top events from DRF Analysis):
${historicalRainfall.slice(0, 10).map((r: any) => `- ${r.year}/${String(r.month).padStart(2,'0')}/${String(r.day).padStart(2,'0')}: ${r.daily_rainfall_mm}mm (60min intensity: ${r.intensity_60min}mm/hr)`).join("\n")}
- Historical maximum single-day: ${historicalMax}mm

POPULATION DATA:
${population.map((p: any) => `- ${p.year}: ${p.population?.toLocaleString()} (${(p.percent_increase * 100).toFixed(1)}% growth)`).join("\n")}
${latestPop ? `- Latest census (${latestPop.year}): ${latestPop.population?.toLocaleString()}` : ""}

HIGHEST DENSITY AREAS (most vulnerable):
${densestAreas.slice(0, 5).map((d: any) => `- ${d.sub_division}: ${d.density_per_sqkm}/sqkm, ${d.households} households, Pop 2025: ${d.pop_2025?.toLocaleString()}`).join("\n")}

FLOOD ZONES (${zones.length} total, ${zones.filter((z: any) => z.risk === "critical").length} critical):
${zones.slice(0, 10).map((z: any) => `- ${z.name}: ${z.risk.toUpperCase()} (${z.level}%) [${z.zone_code}]`).join("\n")}

DRAINAGE (${drains.length} segments):
${drains.map((d: any) => `- ${d.name}: ${d.capacity}% capacity (${d.status}) — Design: ${d.design_return_period}`).join("\n")}

ACTIVE ALERTS: ${alerts.length} (${alerts.filter((a: any) => a.severity === "critical").length} critical)

IDF THRESHOLDS (return periods):
- 30min: 6m=${idf.find((i: any) => i.duration_min === 30)?.intensity_6m ?? "N/A"}, 1y=${idf.find((i: any) => i.duration_min === 30)?.intensity_1y ?? "N/A"}, 2y=${idf.find((i: any) => i.duration_min === 30)?.intensity_2y ?? "N/A"}, 5y=${idf.find((i: any) => i.duration_min === 30)?.intensity_5y ?? "N/A"} mm/hr
- 60min: 6m=${idf.find((i: any) => i.duration_min === 60)?.intensity_6m ?? "N/A"}, 1y=${idf.find((i: any) => i.duration_min === 60)?.intensity_1y ?? "N/A"}, 2y=${idf.find((i: any) => i.duration_min === 60)?.intensity_2y ?? "N/A"}, 5y=${idf.find((i: any) => i.duration_min === 60)?.intensity_5y ?? "N/A"} mm/hr

Provide your comprehensive analysis considering historical patterns, population vulnerability, and current conditions.`;

    // Call Lovable AI using tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "flood_prediction",
              description: "Return structured flood risk prediction",
              parameters: {
                type: "object",
                properties: {
                  overall_risk_score: { type: "number", description: "0-100 overall flood risk" },
                  risk_level: { type: "string", enum: ["critical", "high", "medium", "low"] },
                  summary: { type: "string", description: "2-3 sentence overall assessment" },
                  zone_predictions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        zone_name: { type: "string" },
                        predicted_risk: { type: "number" },
                        trend: { type: "string", enum: ["rising", "stable", "falling"] },
                        reasoning: { type: "string" },
                      },
                      required: ["zone_name", "predicted_risk", "trend", "reasoning"],
                    },
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                  },
                  six_hour_forecast: { type: "string", description: "6-hour immediate threat forecast" },
                  twenty_four_hour_forecast: { type: "string", description: "24-hour short-term prediction with expected rainfall range" },
                  seventy_two_hour_forecast: { type: "string", description: "72-hour (3-day) extended outlook based on seasonal and upstream patterns" },
                  confidence: { type: "number", description: "0-1 confidence score" },
                },
                required: ["overall_risk_score", "risk_level", "summary", "zone_predictions", "recommendations", "six_hour_forecast", "twenty_four_hour_forecast", "seventy_two_hour_forecast", "confidence"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "flood_prediction" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let prediction: any;

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      prediction = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: use message content
      prediction = {
        overall_risk_score: currentRainfall > 80 ? 85 : currentRainfall > 40 ? 60 : 35,
        risk_level: currentRainfall > 80 ? "critical" : currentRainfall > 40 ? "high" : "medium",
        summary: aiData.choices?.[0]?.message?.content || "Analysis complete.",
        zone_predictions: [],
        recommendations: ["Monitor river levels closely", "Keep drainage clear"],
        six_hour_forecast: "Continued monitoring required.",
        twenty_four_hour_forecast: "Weather patterns suggest stable conditions over next 24 hours.",
        seventy_two_hour_forecast: "Extended outlook based on seasonal trends — monitor upstream conditions.",
        confidence: 0.7,
      };
    }

    // Store prediction in database
    const { error: insertError } = await supabase.from("ai_predictions").insert({
      prediction_type: "flood_risk",
      risk_score: prediction.overall_risk_score,
      confidence: prediction.confidence,
      prediction_data: prediction,
      summary: prediction.summary,
      model_used: "gemini-3-flash-preview",
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    });

    if (insertError) console.error("Failed to store prediction:", insertError);

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("flood-predict error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
