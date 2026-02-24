import { AlertTriangle, Droplets, Construction, MapPin, Loader2 } from "lucide-react";
import { useFloodAlerts } from "@/hooks/useFloodData";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, React.ReactNode> = {
  flood: <Droplets size={14} />,
  bottleneck: <Construction size={14} />,
  encroachment: <MapPin size={14} />,
  overflow: <AlertTriangle size={14} />,
};

const severityStyles: Record<string, string> = {
  critical: "border-l-destructive bg-destructive/5",
  high: "border-l-flood-high bg-flood-high/5",
  medium: "border-l-warning bg-warning/5",
  low: "border-l-success bg-success/5",
};

const severityBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-flood-high/20 text-flood-high",
  medium: "bg-warning/20 text-warning",
  low: "bg-success/20 text-success",
};

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const AlertsPanel = () => {
  const { data: alerts = [], isLoading } = useFloodAlerts();
  const criticalCount = alerts.filter(a => a.severity === "critical").length;

  if (isLoading) {
    return (
      <div className="glass-panel p-4 h-full flex items-center justify-center animate-fade-in">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 h-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-wide" style={monoFont}>LIVE ALERTS</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success flood-pulse" />
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-[10px] font-bold flood-pulse" style={monoFont}>
              {criticalCount} CRITICAL
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-8">No active alerts</p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-2 rounded-r-lg p-3 ${severityStyles[alert.severity] || ""}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 text-muted-foreground">{typeIcons[alert.alert_type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${severityBadge[alert.severity] || ""}`} style={monoFont}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{alert.location}</span>
                    {alert.zone_code && <span className="text-[10px] text-primary/70">[{alert.zone_code}]</span>}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;
