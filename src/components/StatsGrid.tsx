import { 
  Droplets, AlertTriangle, Activity, MapPin, 
  CloudRain, Thermometer, Wind, Eye 
} from "lucide-react";

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
  { title: "Active Flood Zones", value: "12", change: "+3 since yesterday", icon: <Droplets size={20} />, trend: "up", variant: "critical" },
  { title: "Alerts Today", value: "28", change: "+8 from avg", icon: <AlertTriangle size={20} />, trend: "up", variant: "warning" },
  { title: "Drainage Flow", value: "73%", change: "Normal capacity", icon: <Activity size={20} />, trend: "neutral", variant: "default" },
  { title: "Monitored Wards", value: "48", change: "3 wards critical", icon: <MapPin size={20} />, trend: "neutral", variant: "default" },
  { title: "Rainfall (24h)", value: "142mm", change: "Heavy rainfall", icon: <CloudRain size={20} />, trend: "up", variant: "warning" },
  { title: "Temperature", value: "28°C", change: "Stable", icon: <Thermometer size={20} />, trend: "neutral", variant: "success" },
  { title: "Wind Speed", value: "24km/h", change: "Gusty", icon: <Wind size={20} />, trend: "up", variant: "default" },
  { title: "Sensors Online", value: "156", change: "98% uptime", icon: <Eye size={20} />, trend: "neutral", variant: "success" },
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
