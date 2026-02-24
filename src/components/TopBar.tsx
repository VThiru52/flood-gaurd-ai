import { Bell, Search, User, CloudRain } from "lucide-react";
import { useWeatherReadings, useFloodAlerts } from "@/hooks/useFloodData";

const TopBar = () => {
  const { data: weather = [] } = useWeatherReadings();
  const { data: alerts = [] } = useFloodAlerts();
  const latest = weather.length > 0 ? weather[weather.length - 1] : null;
  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;

  const rainfallLevel = latest
    ? latest.rainfall_mm_hr > 80 ? "EXTREME RAIN" : latest.rainfall_mm_hr > 40 ? "HEAVY RAIN" : latest.rainfall_mm_hr > 10 ? "MODERATE RAIN" : "LIGHT RAIN"
    : "NO DATA";

  const rainfallColor = latest
    ? latest.rainfall_mm_hr > 80 ? "text-destructive" : latest.rainfall_mm_hr > 40 ? "text-warning" : "text-primary"
    : "text-muted-foreground";

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/30 backdrop-blur-lg sticky top-0 z-40">
      <div>
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          AI Flood Guard — <span className="text-gradient-primary">Kadapa</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Andhra Pradesh · Real-time AI Monitoring
          <span className="text-primary ml-1">● LIVE</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {latest && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/20`}>
            <CloudRain size={14} className={rainfallColor} />
            <span className={`text-xs font-semibold ${rainfallColor}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {rainfallLevel} · {latest.rainfall_mm_hr.toFixed(0)} mm/hr
            </span>
          </div>
        )}

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search zones, drains..."
            className="pl-9 pr-4 py-2 text-xs rounded-lg bg-secondary border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 w-48"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell size={16} className="text-muted-foreground" />
          {criticalAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-[8px] text-destructive-foreground flex items-center justify-center font-bold">
              {criticalAlerts}
            </span>
          )}
        </button>

        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
