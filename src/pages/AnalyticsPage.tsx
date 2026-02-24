import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import WeatherCharts from "@/components/WeatherCharts";
import DrainageNetwork from "@/components/DrainageNetwork";
import IDFAnalysis from "@/components/IDFAnalysis";
import AIPredictionPanel from "@/components/AIPredictionPanel";
import HistoricalRainfall from "@/components/HistoricalRainfall";
import PopulationPanel from "@/components/PopulationPanel";
import FloodSimulator from "@/components/FloodSimulator";
import EarlyWarningPanel from "@/components/EarlyWarningPanel";

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
          <p className="text-xs text-muted-foreground mb-3">
            Dynamic data from database · IDF curves · AI predictions · Flood simulation · Early warning · Real-time drainage monitoring
          </p>
          <div className="rounded-lg bg-secondary/30 border border-border/20 p-3 space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider" style={monoFont}>CORE FORMULAS</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-secondary/20">
                <p className="text-[10px] text-muted-foreground" style={monoFont}>AI RISK SCORE</p>
                <p className="text-[10px] font-bold text-primary" style={monoFont}>
                  0.30×R + 0.25×D + 0.20×P + 0.25×IDF
                </p>
                <p className="text-[9px] text-muted-foreground">R=Rain/MaxRain, D=1−Capacity, P=Density/200, IDF=Rain/Threshold</p>
              </div>
              <div className="p-2 rounded bg-secondary/20">
                <p className="text-[10px] text-muted-foreground" style={monoFont}>IDF REGRESSION</p>
                <p className="text-[10px] font-bold text-primary" style={monoFont}>i = a × t^n</p>
                <p className="text-[9px] text-muted-foreground">i=intensity(mm/hr), t=duration(min), a,n=regression coefficients</p>
              </div>
              <div className="p-2 rounded bg-secondary/20">
                <p className="text-[10px] text-muted-foreground" style={monoFont}>BOTTLENECK DETECTION</p>
                <p className="text-[10px] font-bold text-primary" style={monoFont}>rain &gt; design×0.7 ∧ cap &lt; 60%</p>
                <p className="text-[9px] text-muted-foreground">Triggers alert when drain overwhelmed by storm intensity</p>
              </div>
            </div>
          </div>
        </div>
        <FloodSimulator />
        <EarlyWarningPanel />
        <AIPredictionPanel />
        <IDFAnalysis />
        <HistoricalRainfall />
        <PopulationPanel />
        <WeatherCharts />
        <DrainageNetwork />
      </main>
    </div>
  </div>
);

export default AnalyticsPage;
