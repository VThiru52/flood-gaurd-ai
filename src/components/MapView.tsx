import { MapPin } from "lucide-react";

const floodZones = [
  { risk: "critical", name: "Ward 23 - Krishna River Basin", level: 95 },
  { risk: "critical", name: "Ward 27 - Canal Road", level: 92 },
  { risk: "high", name: "Ward 15 - Eluru Road Junction", level: 78 },
  { risk: "high", name: "Ward 31 - Auto Nagar", level: 72 },
  { risk: "high", name: "Ward 44 - Ajit Singh Nagar", level: 68 },
  { risk: "medium", name: "Ward 8 - Benz Circle Area", level: 55 },
  { risk: "medium", name: "Ward 36 - Gunadala", level: 52 },
  { risk: "medium", name: "Ward 42 - Krishnalanka", level: 48 },
  { risk: "low", name: "Ward 19 - Moghalrajpuram", level: 25 },
  { risk: "low", name: "Ward 5 - Patamata", level: 18 },
  { risk: "low", name: "Ward 12 - Governorpet", level: 15 },
];

const riskBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive",
  high: "bg-flood-high/20 text-flood-high",
  medium: "bg-warning/20 text-warning",
  low: "bg-success/20 text-success",
};

const riskDot: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-flood-high",
  medium: "bg-warning",
  low: "bg-success",
};

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

function MapView() {
  return (
    <div className="glass-panel relative overflow-hidden h-[500px] animate-fade-in">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30" style={monoFont}>
          FLOOD ZONES
        </span>
        <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/30 flood-pulse" style={monoFont}>
          ● 2 CRITICAL
        </span>
      </div>

      {/* Map placeholder with zone list */}
      <div className="h-full flex flex-col pt-12 px-4 pb-4">
        <div className="flex-1 overflow-y-auto space-y-2">
          {floodZones.map((zone) => (
            <div key={zone.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className={`w-3 h-3 rounded-full ${riskDot[zone.risk]} ${zone.risk === 'critical' ? 'flood-pulse' : ''}`} />
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-xs text-foreground flex-1">{zone.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${riskBadge[zone.risk]}`} style={monoFont}>
                {zone.risk}
              </span>
              <span className="text-xs font-bold text-foreground" style={monoFont}>{zone.level}%</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
          {[
            { label: "Critical", color: "bg-destructive" },
            { label: "High", color: "bg-flood-high" },
            { label: "Medium", color: "bg-warning" },
            { label: "Low", color: "bg-success" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MapView;
