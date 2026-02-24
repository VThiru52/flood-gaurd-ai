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

    // Fetch current data for AI analysis
    const [zonesRes, drainsRes, alertsRes, weatherRes, idfRes] = await Promise.all([
      supabase.from("flood_zones").select("*").order("level", { ascending: false }),
      supabase.from("drainage_segments").select("*"),
      supabase.from("flood_alerts").select("*").eq("is_active", true),
      supabase.from("weather_readings").select("*").order("timestamp", { ascending: false }).limit(10),
      supabase.from("idf_records").select("*").order("duration_min"),
    ]);

    const zones = zonesRes.data || [];
    const drains = drainsRes.data || [];
    const alerts = alertsRes.data || [];
    const weather = weatherRes.data || [];
    const idf = idfRes.data || [];

    const currentRainfall = weather[0]?.rainfall_mm_hr ?? 0;
    const peakRainfall = Math.max(...weather.map((w: any) => w.rainfall_mm_hr), 0);

    const systemPrompt = `You are FloodGuard AI, an expert flood risk prediction system for Kadapa, Andhra Pradesh, India.
You analyze real-time hydrological data including IDF curves, drainage capacity, weather readings, and flood zone levels.

Your task: Analyze the current conditions and provide:
1. Overall flood risk assessment (0-100 score)
2. Risk predictions for each critical zone
3. Specific actionable recommendations
4. 6-hour forecast

Be data-driven. Reference specific numbers from the data.`;

    const userPrompt = `CURRENT CONDITIONS (${new Date().toISOString()}):

WEATHER (last ${weather.length} readings):
- Current rainfall: ${currentRainfall} mm/hr
- Peak rainfall (6hr): ${peakRainfall} mm/hr
- Temperature: ${weather[0]?.temperature_c ?? "N/A"}°C
- Humidity: ${weather[0]?.humidity_pct ?? "N/A"}%
- Wind: ${weather[0]?.wind_speed_kmh ?? "N/A"} km/h ${weather[0]?.wind_direction ?? ""}
- Pressure: ${weather[0]?.pressure_hpa ?? "N/A"} hPa

FLOOD ZONES (${zones.length} total, ${zones.filter((z: any) => z.risk === "critical").length} critical):
${zones.slice(0, 8).map((z: any) => `- ${z.name}: ${z.risk.toUpperCase()} (${z.level}%) [${z.zone_code}]`).join("\n")}

DRAINAGE (${drains.length} segments):
${drains.map((d: any) => `- ${d.name}: ${d.capacity}% capacity (${d.status}) — Design: ${d.design_return_period}`).join("\n")}

ACTIVE ALERTS: ${alerts.length} (${alerts.filter((a: any) => a.severity === "critical").length} critical)

IDF THRESHOLDS (5-year return):
- 30min: ${idf.find((i: any) => i.duration_min === 30)?.intensity_5y ?? "N/A"} mm/hr
- 60min: ${idf.find((i: any) => i.duration_min === 60)?.intensity_5y ?? "N/A"} mm/hr

Provide your analysis.`;

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
                  six_hour_forecast: { type: "string" },
                  confidence: { type: "number", description: "0-1 confidence score" },
                },
                required: ["overall_risk_score", "risk_level", "summary", "zone_predictions", "recommendations", "six_hour_forecast", "confidence"],
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
