const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const drainageData = [
  { name: "Main Storm Drain A", capacity: 32, status: "critical", length: "4.2 km" },
  { name: "Canal Road Drain", capacity: 45, status: "high", length: "3.1 km" },
  { name: "Krishna Tributary Link", capacity: 58, status: "medium", length: "5.8 km" },
  { name: "Eastern Bypass Drain", capacity: 78, status: "low", length: "2.4 km" },
  { name: "Bandar Road Network", capacity: 41, status: "high", length: "3.7 km" },
  { name: "NH-65 Underpass Drain", capacity: 88, status: "low", length: "1.2 km" },
];

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
    <h3 className="text-sm font-semibold text-foreground tracking-wide mb-4" style={monoFont}>
      DRAINAGE NETWORK CAPACITY
    </h3>
    <div className="space-y-3">
      {drainageData.map((drain) => (
        <div key={drain.name} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground">{drain.name}</span>
            <div className="flex items-center gap-2">
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
