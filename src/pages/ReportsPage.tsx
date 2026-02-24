import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { FileText, Download } from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const reports = [
  { name: "Weekly Flood Risk Summary", date: "Feb 24, 2026", type: "PDF" },
  { name: "Drainage Capacity Analysis - Vijayawada", date: "Feb 22, 2026", type: "PDF" },
  { name: "Ward 23 Incident Report", date: "Feb 20, 2026", type: "PDF" },
  { name: "Monthly Rainfall Correlation Report", date: "Feb 15, 2026", type: "XLSX" },
  { name: "Encroachment Detection Summary", date: "Feb 10, 2026", type: "PDF" },
];

const ReportsPage = () => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
      <TopBar />
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="glass-panel p-4">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-2" style={monoFont}>REPORTS</h3>
          <p className="text-xs text-muted-foreground">Generated flood risk and drainage analysis reports.</p>
        </div>
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.name} className="glass-panel p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary"><FileText size={16} /></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{r.name}</p>
                <p className="text-[10px] text-muted-foreground">{r.date} · {r.type}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  </div>
);

export default ReportsPage;
