import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all needed data
    const [weatherRes, drainsRes, idfRes, zonesRes, subDivRes] = await Promise.all([
      supabase.from("weather_readings").select("*").order("timestamp", { ascending: false }).limit(5),
      supabase.from("drainage_segments").select("*"),
      supabase.from("idf_records").select("*").order("duration_min"),
      supabase.from("flood_zones").select("*"),
      supabase.from("subdivision_population").select("*").order("density_per_sqkm", { ascending: false }).limit(20),
    ]);

    const weather = weatherRes.data || [];
    const drains = drainsRes.data || [];
    const idf = idfRes.data || [];
    const zones = zonesRes.data || [];
    const subDivs = subDivRes.data || [];

    const currentRainfall = weather[0]?.rainfall_mm_hr ?? 0;
    const alerts: any[] = [];

    // 1. Bottleneck Detection: Compare current rainfall against drainage design capacity
    for (const drain of drains) {
      // Map design return period to IDF threshold
      const period = drain.design_return_period?.toLowerCase() || "";
      let designIntensity60 = 0;
      const idf60 = idf.find((i: any) => i.duration_min === 60);
      if (idf60) {
        if (period.includes("6 month")) designIntensity60 = idf60.intensity_6m || 0;
        else if (period.includes("1 year") || period.includes("1year")) designIntensity60 = idf60.intensity_1y || 0;
        else if (period.includes("2 year")) designIntensity60 = idf60.intensity_2y || 0;
        else if (period.includes("5 year")) designIntensity60 = idf60.intensity_5y || 0;
      }

      // If current rainfall exceeds design capacity
      if (currentRainfall > designIntensity60 * 0.7 && drain.capacity < 60) {
        alerts.push({
          alert_type: "bottleneck",
          severity: drain.capacity < 40 ? "critical" : "high",
          message: `Drainage choke detected: ${drain.name} at ${drain.capacity}% capacity. Current rainfall (${currentRainfall.toFixed(1)} mm/hr) exceeds ${(designIntensity60 * 0.7).toFixed(1)} mm/hr threshold (70% of ${drain.design_return_period} design: ${designIntensity60.toFixed(1)} mm/hr).`,
          location: drain.catchment_area || drain.name,
          zone_code: null,
          is_active: true,
        });
      } else if (drain.capacity < 40) {
        alerts.push({
          alert_type: "bottleneck",
          severity: drain.capacity < 30 ? "critical" : "high",
          message: `Low capacity warning: ${drain.name} operating at only ${drain.capacity}%. Designed for ${drain.design_return_period} return period. Urgent maintenance needed.`,
          location: drain.catchment_area || drain.name,
          zone_code: null,
          is_active: true,
        });
      }
    }

    // 2. Flood Risk Alerts: Compare against IDF thresholds
    const idf30 = idf.find((i: any) => i.duration_min === 30);
    if (idf30) {
      if (currentRainfall > (idf30.intensity_5y || 999)) {
        alerts.push({
          alert_type: "flood",
          severity: "critical",
          message: `EXTREME: Current rainfall ${currentRainfall.toFixed(1)} mm/hr exceeds 5-year return period threshold (${idf30.intensity_5y} mm/hr for 30min). Catastrophic flooding expected.`,
          location: "Kadapa Municipal Area",
          zone_code: "PR",
          is_active: true,
        });
      } else if (currentRainfall > (idf30.intensity_2y || 999)) {
        alerts.push({
          alert_type: "flood",
          severity: "critical",
          message: `SEVERE: Current rainfall ${currentRainfall.toFixed(1)} mm/hr exceeds 2-year return period (${idf30.intensity_2y} mm/hr). Major flooding likely in low-lying areas.`,
          location: "Kadapa Low-lying Areas",
          zone_code: "PR",
          is_active: true,
        });
      } else if (currentRainfall > (idf30.intensity_1y || 999)) {
        alerts.push({
          alert_type: "flood",
          severity: "high",
          message: `WARNING: Current rainfall ${currentRainfall.toFixed(1)} mm/hr exceeds 1-year return period (${idf30.intensity_1y} mm/hr). Moderate flooding expected.`,
          location: "Kadapa Urban Area",
          zone_code: null,
          is_active: true,
        });
      } else if (currentRainfall > (idf30.intensity_6m || 999)) {
        alerts.push({
          alert_type: "flood",
          severity: "medium",
          message: `ADVISORY: Current rainfall ${currentRainfall.toFixed(1)} mm/hr exceeds 6-month return period (${idf30.intensity_6m} mm/hr). Minor waterlogging possible.`,
          location: "Kadapa City",
          zone_code: null,
          is_active: true,
        });
      }
    }

    // 3. High-density population area alerts
    for (const zone of zones.filter((z: any) => z.risk === "critical" || z.risk === "high")) {
      const nearbyDensity = subDivs.find((s: any) => {
        const name = s.sub_division?.toLowerCase() || "";
        const zoneName = zone.name?.toLowerCase() || "";
        return zoneName.includes(name.split(" ")[0]) || name.includes(zoneName.split(" ")[0]);
      });

      if (nearbyDensity && (nearbyDensity.density_per_sqkm || 0) > 5000 && zone.level > 70) {
        alerts.push({
          alert_type: "flood",
          severity: "high",
          message: `High-density area at risk: ${zone.name} (${zone.level}% flood index) with population density ${nearbyDensity.density_per_sqkm}/sq.km. Projected 2025 pop: ${nearbyDensity.pop_2025?.toLocaleString()}. Evacuate vulnerable areas.`,
          location: zone.name,
          zone_code: zone.zone_code,
          is_active: true,
        });
      }
    }

    // 4. Encroachment alerts for critical drainage zones
    for (const zone of zones.filter((z: any) => z.zone_code === "PR" && z.level > 80)) {
      alerts.push({
        alert_type: "encroachment",
        severity: "high",
        message: `Protected zone at risk: ${zone.name} (zone ${zone.zone_code}) shows ${zone.level}% flood index. Any encroachments on drain embankments must be reported. Water body setback violations to be checked.`,
        location: zone.name,
        zone_code: zone.zone_code,
        is_active: true,
      });
    }

    // Deactivate old auto-generated alerts before inserting new ones
    await supabase
      .from("flood_alerts")
      .update({ is_active: false, resolved_at: new Date().toISOString() })
      .like("message", "%Current rainfall%")
      .eq("is_active", true);

    // Insert new alerts
    if (alerts.length > 0) {
      const { error: insertErr } = await supabase.from("flood_alerts").insert(alerts);
      if (insertErr) console.error("Alert insert error:", insertErr);
    }

    // Update flood zone risk levels based on current conditions
    if (currentRainfall > 0) {
      for (const zone of zones) {
        let newLevel = zone.level;
        if (currentRainfall > 50) newLevel = Math.min(100, zone.level + 10);
        else if (currentRainfall > 20) newLevel = Math.min(100, zone.level + 5);
        
        if (newLevel !== zone.level) {
          await supabase.from("flood_zones").update({ level: newLevel }).eq("id", zone.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        alerts_generated: alerts.length,
        current_rainfall: currentRainfall,
        bottlenecks_found: alerts.filter((a) => a.alert_type === "bottleneck").length,
        flood_warnings: alerts.filter((a) => a.alert_type === "flood").length,
        encroachment_flags: alerts.filter((a) => a.alert_type === "encroachment").length,
        alerts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-bottlenecks error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
