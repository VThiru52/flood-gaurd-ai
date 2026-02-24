import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WeatherCharts from "@/components/WeatherCharts";
import DrainageNetwork from "@/components/DrainageNetwork";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const AnalyticsPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>ANALYTICS OVERVIEW</h3>
          <p className="text-xs text-muted-foreground">Comprehensive flood risk analytics across all monitored wards.</p>
        </div>
        <WeatherCharts />
        <DrainageNetwork />
      </main>
    </div>
  </div>
);

export default AnalyticsPage;
