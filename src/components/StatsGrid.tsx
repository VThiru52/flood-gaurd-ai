import {
  Droplets, AlertTriangle, Activity, MapPin,
  CloudRain, Thermometer, Wind, Eye
} from "lucide-react";
import { useDashboardStats, useIDFRecords, useAIPredictions } from "@/hooks/useFloodData";

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

const StatsGrid = () => {
  const stats = useDashboardStats();
  const { data: idfRecords = [] } = useIDFRecords();
  const { data: predictions = [] } = useAIPredictions();

  const idfPeriodCount = idfRecords.length > 0
    ? [idfRecords[0].intensity_6m, idfRecords[0].intensity_1y, idfRecords[0].intensity_2y, idfRecords[0].intensity_5y].filter(v => v !== null).length
    : 0;

  const statsData: StatCardProps[] = [
    { title: "Active Flood Zones", value: String(stats.activeFloodZones), change: `${stats.criticalZones} critical zones`, icon: <Droplets size={20} />, trend: "up", variant: "critical" },
    { title: "Alerts Active", value: String(stats.alertsToday), change: `${stats.criticalAlerts} critical alerts`, icon: <AlertTriangle size={20} />, trend: "up", variant: "warning" },
    { title: "Avg Drainage Cap.", value: `${stats.avgDrainageCapacity}%`, change: "Below design capacity", icon: <Activity size={20} />, trend: "up", variant: "warning" },
    { title: "Monitored Zones", value: String(stats.monitoredZones), change: "Master Plan 2041", icon: <MapPin size={20} />, trend: "neutral", variant: "default" },
    { title: "Current Rainfall", value: `${stats.currentRainfall.toFixed(1)}`, change: "mm/hr — Live", icon: <CloudRain size={20} />, trend: stats.currentRainfall > 50 ? "up" : "neutral", variant: stats.currentRainfall > 80 ? "critical" : stats.currentRainfall > 40 ? "warning" : "default" },
    { title: "Peak Rainfall", value: `${stats.peakRainfall.toFixed(1)}`, change: "mm/hr — 6hr window", icon: <Thermometer size={20} />, trend: "up", variant: stats.peakRainfall > 100 ? "critical" : "warning" },
    { title: "IDF Curves", value: String(idfPeriodCount), change: idfPeriodCount > 0 ? "6m, 1yr, 2yr, 5yr" : "No data", icon: <Eye size={20} />, trend: "neutral", variant: "success" },
    { title: "AI Predictions", value: predictions.length > 0 ? String(predictions.length) : "0", change: predictions.length > 0 ? "Gemini 3 Flash · Active" : "Run prediction to start", icon: <Wind size={20} />, trend: "neutral", variant: predictions.length > 0 ? "success" : "default" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statsData.map((stat, i) => (
        <div key={stat.title} style={{ animationDelay: `${i * 50}ms` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
