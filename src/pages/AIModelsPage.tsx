import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { Shield, Brain, Zap, Target } from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const models = [
  { name: "Flood Inundation Predictor", accuracy: "87%", status: "active", icon: <Brain size={16} />, desc: "ML model predicting flood spread using rainfall + topography" },
  { name: "Bottleneck Detector", accuracy: "91%", status: "active", icon: <Target size={16} />, desc: "AI detection of drainage choke points from flow data" },
  { name: "Encroachment Spotter", accuracy: "83%", status: "training", icon: <Shield size={16} />, desc: "Satellite image analysis for unauthorized structures" },
  { name: "Rainfall Forecaster", accuracy: "79%", status: "active", icon: <Zap size={16} />, desc: "24h rainfall prediction using meteorological data" },
];

const statusStyle: Record<string, string> = {
  active: "bg-success/20 text-success",
  training: "bg-warning/20 text-warning",
};

const AIModelsPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>AI MODELS</h3>
          <p className="text-xs text-muted-foreground">Machine learning models powering flood prediction and detection.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {models.map((m) => (
            <div key={m.name} className="glass-panel p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">{m.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{m.name}</p>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${statusStyle[m.status]}`} style={monoFont}>{m.status}</span>
                </div>
                <span className="text-lg font-bold text-primary" style={monoFont}>{m.accuracy}</span>
              </div>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  </div>
);

export default AIModelsPage;
