import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import AlertsPanel from "@/components/AlertsPanel";
import { useFloodAlerts } from "@/hooks/useFloodData";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const AlertsPage = () => {
  const { data: alerts = [] } = useFloodAlerts();
  const byType = {
    flood: alerts.filter(a => a.alert_type === "flood").length,
    overflow: alerts.filter(a => a.alert_type === "overflow").length,
    bottleneck: alerts.filter(a => a.alert_type === "bottleneck").length,
    encroachment: alerts.filter(a => a.alert_type === "encroachment").length,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>
              FLOOD ALERTS COMMAND CENTER
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time alerts with database subscriptions · {alerts.length} active
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(byType).map(([type, count]) => (
              <div key={type} className="glass-panel p-3">
                <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>{type}</p>
                <p className="text-2xl font-bold text-foreground" style={monoFont}>{count}</p>
              </div>
            ))}
          </div>
          <AlertsPanel />
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;
