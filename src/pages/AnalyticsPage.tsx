import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WeatherCharts from "@/components/WeatherCharts";
import DrainageNetwork from "@/components/DrainageNetwork";
import IDFAnalysis from "@/components/IDFAnalysis";
import AIPredictionPanel from "@/components/AIPredictionPanel";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const AnalyticsPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>
            FLOOD RISK ANALYTICS
          </h3>
          <p className="text-xs text-muted-foreground">
            Dynamic data from database · IDF curves · AI predictions · Real-time drainage monitoring
          </p>
        </div>
        <AIPredictionPanel />
        <IDFAnalysis />
        <WeatherCharts />
        <DrainageNetwork />
      </main>
    </div>
  </div>
);

export default AnalyticsPage;
