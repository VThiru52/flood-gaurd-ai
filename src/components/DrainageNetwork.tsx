import { kadapaDrainageNetwork } from "@/data/kadapaFloodData";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const statusColors: Record<string, string> = {
  critical: "bg-destructive",
  high: "bg-flood-high",
  medium: "bg-warning",
  low: "bg-success",
};

const statusBarBg: Record<string, string> = {
  critical: "bg-destructive/20",
  high: "bg-flood-high/20",
  medium: "bg-warning/20",
  low: "bg-success/20",
};

const DrainageNetwork = () => (
  <div className="glass-panel p-4 animate-fade-in">
    <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
      KADAPA DRAINAGE NETWORK CAPACITY
    </h3>
    <p className="text-[10px] text-muted-foreground mb-4">Source: DPR Analysis · Pennar River Catchment · IDF Design Return Periods</p>
    <div className="space-y-3">
      {kadapaDrainageNetwork.map((drain) => (
        <div key={drain.name} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-foreground block">{drain.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {drain.catchmentArea} · Design: {drain.designReturnPeriod}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground">{drain.length}</span>
              <span className="text-xs font-bold text-foreground" style={monoFont}>{drain.capacity}%</span>
            </div>
          </div>
          <div className={`h-1.5 rounded-full ${statusBarBg[drain.status]}`}>
            <div
              className={`h-full rounded-full ${statusColors[drain.status]} transition-all duration-1000`}
              style={{ width: `${drain.capacity}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default DrainageNetwork;
