import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import AIPredictionPanel from "@/components/AIPredictionPanel";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const AIModelsPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>AI FLOOD GUARD</h3>
          <p className="text-xs text-muted-foreground">
            Real-time AI-powered flood risk prediction · HARYAK AI · Analyzes IDF, drainage, weather & zone data
          </p>
        </div>
        <AIPredictionPanel />
      </main>
    </div>
  </div>
);

export default AIModelsPage;
