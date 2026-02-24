import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WeatherCharts from "@/components/WeatherCharts";
import HistoricalRainfall from "@/components/HistoricalRainfall";
import { useWeatherReadings } from "@/hooks/useFloodData";
import { supabase } from "@/integrations/supabase/client";
import { CloudRain, Thermometer, Droplets, Wind, Gauge, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const WeatherPage = () => {
  const { data: weather = [], refetch } = useWeatherReadings();
  const latest = weather.length > 0 ? weather[weather.length - 1] : null;
  const [fetching, setFetching] = useState(false);

  const fetchLive = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-weather");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Live weather updated: ${data.current?.rainfall_mm_hr?.toFixed(1)} mm/hr`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch weather");
    } finally {
      setFetching(false);
    }
  };

  const cards = latest ? [
    { label: "Rainfall", value: `${latest.rainfall_mm_hr.toFixed(1)} mm/hr`, icon: <CloudRain size={18} />, color: latest.rainfall_mm_hr > 80 ? "text-destructive" : "text-primary" },
    { label: "Temperature", value: `${latest.temperature_c?.toFixed(1) ?? "--"}°C`, icon: <Thermometer size={18} />, color: "text-warning" },
    { label: "Humidity", value: `${latest.humidity_pct?.toFixed(0) ?? "--"}%`, icon: <Droplets size={18} />, color: "text-primary" },
    { label: "Wind", value: `${latest.wind_speed_kmh?.toFixed(0) ?? "--"} km/h ${latest.wind_direction ?? ""}`, icon: <Wind size={18} />, color: "text-muted-foreground" },
    { label: "Pressure", value: `${latest.pressure_hpa?.toFixed(0) ?? "--"} hPa`, icon: <Gauge size={18} />, color: "text-accent" },
  ] : [];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>
                WEATHER MONITORING
              </h3>
              <p className="text-xs text-muted-foreground">
                Live weather from Open-Meteo API · {weather.length} readings · Kadapa (14.47°N, 78.82°E)
                <span className="text-primary ml-1">● LIVE</span>
              </p>
            </div>
            <button
              onClick={fetchLive}
              disabled={fetching}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-all disabled:opacity-50 text-xs font-semibold"
              style={monoFont}
            >
              {fetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              FETCH LIVE DATA
            </button>
          </div>

          {cards.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {cards.map(c => (
                <div key={c.label} className="glass-panel p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={c.color}>{c.icon}</div>
                    <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>{c.label}</p>
                  </div>
                  <p className={`text-xl font-bold ${c.color}`} style={monoFont}>{c.value}</p>
                </div>
              ))}
            </div>
          )}

          <WeatherCharts />
          <HistoricalRainfall />
        </main>
      </div>
    </div>
  );
};

export default WeatherPage;
