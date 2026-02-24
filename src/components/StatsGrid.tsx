import { 
  Droplets, AlertTriangle, Activity, MapPin, 
  CloudRain, Thermometer, Wind, Eye 
} from "lucide-react";
import { kadapaStats } from "@/data/kadapaFloodData";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "warning" | "critical" | "success";
}

const variantStyles = {
  default: "glass-panel glow-primary",
  warning: "glass-panel glow-warning border-warning/20",
  critical: "glass-panel glow-critical border-destructive/20",
  success: "glass-panel border-success/20",
};

const StatCard = ({ title, value, change, icon, trend, variant = "default" }: StatCardProps) => (
  <div className={`${variantStyles[variant]} p-4 relative overflow-hidden animate-fade-in`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold mt-1 text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
        {change && (
          <p className={`text-xs mt-1 ${
            trend === "up" ? "text-destructive" : trend === "down" ? "text-success" : "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
  </div>
);

const statsData: StatCardProps[] = [
  { title: "Active Flood Zones", value: String(kadapaStats.activeFloodZones), change: `${kadapaStats.criticalZones} critical zones`, icon: <Droplets size={20} />, trend: "up", variant: "critical" },
  { title: "Alerts Today", value: String(kadapaStats.alertsToday), change: `${kadapaStats.criticalAlerts} critical alerts`, icon: <AlertTriangle size={20} />, trend: "up", variant: "warning" },
  { title: "Avg Drainage Cap.", value: `${kadapaStats.avgDrainageCapacity}%`, change: "Below design capacity", icon: <Activity size={20} />, trend: "up", variant: "warning" },
  { title: "Zoning Categories", value: String(kadapaStats.monitoredZones), change: "10 DPZ + 2 DRZ + 1 sub", icon: <MapPin size={20} />, trend: "neutral", variant: "default" },
  { title: "Peak 5yr (30min)", value: `${kadapaStats.maxIntensity5yr30min}`, change: "mm/hr — IDF 5-year", icon: <CloudRain size={20} />, trend: "up", variant: "critical" },
  { title: "Peak 5yr (60min)", value: `${kadapaStats.maxIntensity5yr60min}`, change: "mm/hr — IDF 5-year", icon: <Thermometer size={20} />, trend: "up", variant: "warning" },
  { title: "Design Rainfall", value: `${kadapaStats.designRainfall24h}`, change: "mm/hr — 5yr 20min", icon: <Wind size={20} />, trend: "up", variant: "default" },
  { title: "IDF Curves", value: "4", change: "6m, 1yr, 2yr, 5yr", icon: <Eye size={20} />, trend: "neutral", variant: "success" },
];

const StatsGrid = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {statsData.map((stat, i) => (
      <div key={stat.title} style={{ animationDelay: `${i * 50}ms` }}>
        <StatCard {...stat} />
      </div>
    ))}
  </div>
);

export default StatsGrid;
