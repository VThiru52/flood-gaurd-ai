import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { Database, Upload, FileSpreadsheet, Globe } from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const sources = [
  { name: "IMD Rainfall Data", type: "API", status: "connected", icon: <Globe size={16} />, lastSync: "2 min ago" },
  { name: "Drainage CAD Network", type: "File", status: "uploaded", icon: <FileSpreadsheet size={16} />, lastSync: "1 hr ago" },
  { name: "Ward Sensor Grid", type: "IoT", status: "connected", icon: <Database size={16} />, lastSync: "Live" },
  { name: "Topography Survey", type: "GIS", status: "pending", icon: <Upload size={16} />, lastSync: "N/A" },
];

const statusStyle: Record<string, string> = {
  connected: "bg-success/20 text-success",
  uploaded: "bg-primary/20 text-primary",
  pending: "bg-warning/20 text-warning",
};

const DataSourcesPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>DATA SOURCES</h3>
          <p className="text-xs text-muted-foreground">Manage connected data feeds, uploads, and integrations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map((src) => (
            <div key={src.name} className="glass-panel p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">{src.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{src.name}</p>
                <p className="text-[10px] text-muted-foreground">Type: {src.type} · Last sync: {src.lastSync}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyle[src.status]}`} style={monoFont}>
                {src.status}
              </span>
            </div>
          ))}
        </div>
        <button className="glass-panel p-4 w-full flex items-center justify-center gap-2 text-primary border-dashed border-2 border-primary/30 hover:bg-primary/5 transition-colors">
          <Upload size={16} />
          <span className="text-sm font-medium">Upload New Data Source (CSV, GeoJSON, PDF)</span>
        </button>
      </main>
    </div>
  </div>
);

export default DataSourcesPage;
