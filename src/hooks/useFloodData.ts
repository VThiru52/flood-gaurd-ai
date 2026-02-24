import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// ─── Flood Zones ─────────────────────────────────────────────
export function useFloodZones() {
  return useQuery({
    queryKey: ["flood_zones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_zones")
        .select("*")
        .order("level", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Zone Categories ─────────────────────────────────────────
export function useZoneCategories() {
  return useQuery({
    queryKey: ["zone_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_categories")
        .select("*")
        .order("code");
      if (error) throw error;
      return data;
    },
  });
}

// ─── Drainage Segments ───────────────────────────────────────
export function useDrainageSegments() {
  return useQuery({
    queryKey: ["drainage_segments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drainage_segments")
        .select("*")
        .order("capacity", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Flood Alerts (with realtime) ────────────────────────────
export function useFloodAlerts() {
  const query = useQuery({
    queryKey: ["flood_alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flood_alerts")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("flood_alerts_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "flood_alerts" }, () => {
        query.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [query]);

  return query;
}

// ─── IDF Records ─────────────────────────────────────────────
export function useIDFRecords() {
  return useQuery({
    queryKey: ["idf_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("idf_records")
        .select("*")
        .order("duration_min", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Weather Readings (with realtime) ────────────────────────
export function useWeatherReadings() {
  const query = useQuery({
    queryKey: ["weather_readings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weather_readings")
        .select("*")
        .order("timestamp", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("weather_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "weather_readings" }, () => {
        query.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [query]);

  return query;
}

// ─── AI Predictions (with realtime) ──────────────────────────
export function useAIPredictions() {
  const query = useQuery({
    queryKey: ["ai_predictions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("predictions_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ai_predictions" }, () => {
        query.refetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [query]);

  return query;
}

// ─── Dashboard Stats (computed from DB data) ─────────────────
export function useDashboardStats() {
  const { data: zones } = useFloodZones();
  const { data: alerts } = useFloodAlerts();
  const { data: drains } = useDrainageSegments();
  const { data: categories } = useZoneCategories();
  const { data: weather } = useWeatherReadings();

  const stats = {
    activeFloodZones: zones?.filter(z => z.risk === "critical" || z.risk === "high").length ?? 0,
    criticalZones: zones?.filter(z => z.risk === "critical").length ?? 0,
    alertsToday: alerts?.length ?? 0,
    criticalAlerts: alerts?.filter(a => a.severity === "critical").length ?? 0,
    avgDrainageCapacity: drains?.length
      ? Math.round(drains.reduce((s, d) => s + d.capacity, 0) / drains.length)
      : 0,
    monitoredZones: categories?.length ?? 0,
    currentRainfall: weather?.length ? weather[weather.length - 1].rainfall_mm_hr : 0,
    peakRainfall: weather?.length ? Math.max(...weather.map(w => w.rainfall_mm_hr)) : 0,
  };

  return stats;
}
