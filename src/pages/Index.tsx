import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import StatsGrid from "@/components/StatsGrid";
import AlertsPanel from "@/components/AlertsPanel";
import WeatherCharts from "@/components/WeatherCharts";
import DrainageNetwork from "@/components/DrainageNetwork";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          <StatsGrid />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <AlertsPanel />
            </div>
            <div>
              <DrainageNetwork />
            </div>
          </div>
          <WeatherCharts />
          <DrainageNetwork />
        </main>
      </div>
    </div>
  );
};

export default Index;
