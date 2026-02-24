import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WeatherCharts from "@/components/WeatherCharts";
import { useWeatherReadings } from "@/hooks/useFloodData";
import { CloudRain, Thermometer, Droplets, Wind, Gauge } from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const WeatherPage = () => {
  const { data: weather = [] } = useWeatherReadings();
  const latest = weather.length > 0 ? weather[weather.length - 1] : null;

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
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>
              WEATHER MONITORING
            </h3>
            <p className="text-xs text-muted-foreground">
              Live weather data · {weather.length} readings · Real-time subscriptions
              <span className="text-primary ml-1">● LIVE</span>
            </p>
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
        </main>
      </div>
    </div>
  );
};

export default WeatherPage;
