import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import MapView from "@/components/MapView";
import DrainageNetwork from "@/components/DrainageNetwork";
import EarlyWarningPanel from "@/components/EarlyWarningPanel";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const MapPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>
            GIS FLOOD RISK MAP — KADAPA
          </h3>
          <p className="text-xs text-muted-foreground">
            Interactive GIS map with flood risk heatmap, drainage network overlay, bottleneck markers, and population density layers
          </p>
        </div>
        <MapView />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EarlyWarningPanel />
          <DrainageNetwork />
        </div>
      </main>
    </div>
  </div>
);

export default MapPage;
