import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import AlertsPanel from "@/components/AlertsPanel";
import EarlyWarningPanel from "@/components/EarlyWarningPanel";
import { useFloodAlerts } from "@/hooks/useFloodData";
import { AlertTriangle, Droplets, Construction, MapPin, FileText, Shield } from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  flood: { icon: <Droplets size={14} />, color: "text-destructive" },
  overflow: { icon: <AlertTriangle size={14} />, color: "text-warning" },
  bottleneck: { icon: <Construction size={14} />, color: "text-flood-high" },
  encroachment: { icon: <MapPin size={14} />, color: "text-primary" },
};

const AlertsPage = () => {
  const { data: alerts = [] } = useFloodAlerts();
  const byType = {
    flood: alerts.filter(a => a.alert_type === "flood").length,
    overflow: alerts.filter(a => a.alert_type === "overflow").length,
    bottleneck: alerts.filter(a => a.alert_type === "bottleneck").length,
    encroachment: alerts.filter(a => a.alert_type === "encroachment").length,
  };

  const encroachmentAlerts = alerts.filter(a => a.alert_type === "encroachment");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>
              FLOOD ALERTS & EARLY WARNING
            </h3>
            <p className="text-xs text-muted-foreground">
              Automated alerts from bottleneck detection, IDF threshold analysis, and encroachment monitoring · {alerts.length} active
            </p>
          </div>

          {/* Alert type summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(byType).map(([type, count]) => {
              const cfg = typeConfig[type];
              return (
                <div key={type} className="glass-panel p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cfg?.color || "text-muted-foreground"}>{cfg?.icon}</span>
                    <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>{type}</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground" style={monoFont}>{count}</p>
                </div>
              );
            })}
          </div>

          {/* Encroachment Detection Section */}
          {encroachmentAlerts.length > 0 && (
            <div className="glass-panel p-4 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold text-foreground tracking-wide" style={monoFont}>
                    ENCROACHMENT DETECTION — PROTECTED ZONES
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold" style={monoFont}>
                  {encroachmentAlerts.length} DETECTED
                </span>
              </div>

              {/* Document Reference */}
              <div className="rounded-lg bg-secondary/30 border border-border/20 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText size={12} className="text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider" style={monoFont}>REGULATORY SOURCE DOCUMENTS</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 p-2 rounded bg-secondary/20">
                    <span className="text-[10px] text-primary font-bold shrink-0" style={monoFont}>1.</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Kadapa Master Plan Approved G.O. (G.O.Ms.No.39, dt. 21.03.2023)</p>
                      <p className="text-[10px] text-muted-foreground">Government Order approving the Master Plan for Kadapa Urban Development Authority. Defines Protected Reserve (PR) zones along rivers, nalas, reservoirs, and kuntas where no construction or encroachment is permitted.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 rounded bg-secondary/20">
                    <span className="text-[10px] text-primary font-bold shrink-0" style={monoFont}>2.</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Kadapa Master Plan Zoning Regulations</p>
                      <p className="text-[10px] text-muted-foreground">Defines 13 zone categories (11 DPZ + 2 DRZ). The <strong className="text-primary">PR (Protected Zone)</strong> under DRZ covers water bodies — rivers, nalas, reservoirs, forest areas. Any structure within PR zones is an encroachment per regulation.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection Logic */}
              <div className="rounded-lg bg-secondary/30 border border-border/20 p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider" style={monoFont}>DETECTION FORMULA</p>
                <p className="text-sm font-bold text-primary" style={monoFont}>
                  IF zone_code = 'PR' AND flood_index &gt; 80% → ENCROACHMENT ALERT
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Cross-references <code className="text-primary">flood_zones</code> table (zone_code, level) with <code className="text-primary">zone_categories</code> table (PR = Protected Zone under DRZ). 
                  High flood index in PR zones indicates water body setback violations or drain embankment encroachments.
                </p>
              </div>

              {/* Active Encroachment Alerts */}
              <div className="space-y-2">
                {encroachmentAlerts.map((alert) => (
                  <div key={alert.id} className="border-l-2 border-l-primary rounded-r-lg p-3 bg-primary/5">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-primary/20 text-primary" style={monoFont}>
                            ENCROACHMENT
                          </span>
                          <span className="text-[10px] text-muted-foreground">{alert.location}</span>
                          {alert.zone_code && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive" style={monoFont}>
                              {alert.zone_code} — PROTECTED ZONE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <EarlyWarningPanel />
          <AlertsPanel />
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;