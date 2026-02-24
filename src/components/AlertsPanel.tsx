import { AlertTriangle, Droplets, Construction, MapPin } from "lucide-react";
import { kadapaAlerts } from "@/data/kadapaFloodData";

const typeIcons = {
  flood: <Droplets size={14} />,
  bottleneck: <Construction size={14} />,
  encroachment: <MapPin size={14} />,
  overflow: <AlertTriangle size={14} />,
};

const severityStyles = {
  critical: "border-l-destructive bg-destructive/5",
  high: "border-l-flood-high bg-flood-high/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-success bg-success/5",
};

const severityBadge = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-flood-high/20 text-flood-high",
  medium: "bg-warning/20 text-warning",
  low: "bg-success/20 text-success",
};

const AlertsPanel = () => (
  <div className="glass-panel p-4 h-full animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-foreground tracking-wide" style={{ fontFamily: "'JetBrains Mono', monospace" }}>KADAPA LIVE ALERTS</h3>
      <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold flood-pulse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {kadapaAlerts.filter(a => a.severity === "critical").length} CRITICAL
      </span>
    </div>

    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
      {kadapaAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-2 rounded-r-lg p-3 ${severityStyles[alert.severity]}`}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5 text-muted-foreground">{typeIcons[alert.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${severityBadge[alert.severity]}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {alert.severity}
                </span>
                <span className="text-[10px] text-muted-foreground">{alert.location}</span>
                <span className="text-[10px] text-primary/70">[{alert.zone}]</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{alert.time}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AlertsPanel;
