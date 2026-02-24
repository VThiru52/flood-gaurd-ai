import { useState, useMemo } from "react";
import { useIDFRecords, useDrainageSegments, useFloodZones, useSubdivisionPopulation } from "@/hooks/useFloodData";
import { Loader2, Zap, AlertTriangle, Users, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const returnPeriods = [
  { key: "6m", label: "6 Months", field: "intensity_6m", color: "hsl(152, 69%, 41%)" },
  { key: "1y", label: "1 Year", field: "intensity_1y", color: "hsl(38, 92%, 50%)" },
  { key: "2y", label: "2 Years", field: "intensity_2y", color: "hsl(15, 80%, 50%)" },
  { key: "5y", label: "5 Years", field: "intensity_5y", color: "hsl(0, 72%, 51%)" },
];

const durations = [
  { min: 30, label: "30 min" },
  { min: 60, label: "1 hr" },
  { min: 120, label: "2 hr" },
  { min: 180, label: "3 hr" },
];

const FloodSimulator = () => {
  const { data: idfRecords = [], isLoading: loadingIDF } = useIDFRecords();
  const { data: drains = [] } = useDrainageSegments();
  const { data: zones = [] } = useFloodZones();
  const { data: subDivs = [] } = useSubdivisionPopulation();

  const [selectedPeriod, setSelectedPeriod] = useState("2y");
  const [selectedDuration, setSelectedDuration] = useState(60);

  const simulation = useMemo(() => {
    if (!idfRecords.length || !drains.length) return null;

    const period = returnPeriods.find((p) => p.key === selectedPeriod)!;
    const idfRow = idfRecords.find((r: any) => r.duration_min === selectedDuration);
    if (!idfRow) return null;

    const intensity = (idfRow as any)[period.field] as number || 0;

    // Simulate impact on each drainage segment
    const drainImpact = drains.map((drain: any) => {
      const designPeriod = drain.design_return_period?.toLowerCase() || "";
      let designCapacityFactor = 1;
      if (designPeriod.includes("6 month")) designCapacityFactor = 0.4;
      else if (designPeriod.includes("1 year")) designCapacityFactor = 0.6;
      else if (designPeriod.includes("2 year")) designCapacityFactor = 0.8;
      else if (designPeriod.includes("5 year")) designCapacityFactor = 1.0;

      // Calculate overflow risk based on intensity vs design
      const idf60 = idfRecords.find((r: any) => r.duration_min === 60);
      const designIntensity = idf60 ? (idf60 as any)[`intensity_${designPeriod.includes("6") ? "6m" : designPeriod.includes("1") ? "1y" : designPeriod.includes("2") ? "2y" : "5y"}`] || 30 : 30;
      
      const overflowRatio = intensity / designIntensity;
      const simulatedCapacity = Math.max(0, Math.min(100, drain.capacity * (1 - (overflowRatio - 1) * 0.3)));
      const willOverflow = overflowRatio > 1;

      return {
        name: drain.name,
        currentCapacity: drain.capacity,
        simulatedCapacity: Math.round(simulatedCapacity),
        overflowRatio: Math.round(overflowRatio * 100),
        willOverflow,
        designFor: drain.design_return_period,
      };
    });

    // Zone impact
    const zoneImpact = zones.map((zone: any) => {
      const baseRisk = zone.level;
      // Higher intensity = higher risk multiplier
      const riskMultiplier = intensity > 80 ? 1.4 : intensity > 50 ? 1.2 : intensity > 30 ? 1.1 : 1.0;
      const simulatedRisk = Math.min(100, Math.round(baseRisk * riskMultiplier));
      return {
        name: zone.name,
        zone_code: zone.zone_code,
        currentRisk: baseRisk,
        simulatedRisk,
        risk: simulatedRisk >= 85 ? "critical" : simulatedRisk >= 60 ? "high" : simulatedRisk >= 30 ? "medium" : "low",
      };
    }).sort((a, b) => b.simulatedRisk - a.simulatedRisk);

    // Population exposure
    const totalExposed = subDivs
      .filter((s: any) => (s.density_per_sqkm || 0) > 3000)
      .reduce((sum: number, s: any) => sum + (s.pop_2025 || s.population || 0), 0);

    const overflowingDrains = drainImpact.filter((d) => d.willOverflow).length;
    const criticalZones = zoneImpact.filter((z) => z.risk === "critical").length;

    return {
      intensity,
      drainImpact,
      zoneImpact,
      totalExposed,
      overflowingDrains,
      criticalZones,
      overallRisk: criticalZones >= 3 ? "critical" : criticalZones >= 1 ? "high" : overflowingDrains >= 2 ? "medium" : "low",
    };
  }, [idfRecords, drains, zones, subDivs, selectedPeriod, selectedDuration]);

  if (loadingIDF) {
    return (
      <div className="glass-panel p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const riskColors: Record<string, string> = {
    critical: "text-destructive",
    high: "text-flood-high",
    medium: "text-warning",
    low: "text-success",
  };

  const riskBg: Record<string, string> = {
    critical: "bg-destructive/20 border-destructive/30",
    high: "bg-flood-high/20 border-flood-high/30",
    medium: "bg-warning/20 border-warning/30",
    low: "bg-success/20 border-success/30",
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-warning" />
          <h3 className="text-sm font-semibold text-foreground tracking-wide" style={monoFont}>
            FLOOD SCENARIO SIMULATOR
          </h3>
        </div>
        <p className="text-[10px] text-muted-foreground mb-4">
          What-if analysis using real IDF curves · Select storm return period and duration to simulate impact
        </p>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-2" style={monoFont}>Storm Return Period</p>
            <div className="flex gap-2 flex-wrap">
              {returnPeriods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPeriod(p.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedPeriod === p.key
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/50"
                  }`}
                  style={monoFont}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase mb-2" style={monoFont}>Storm Duration</p>
            <div className="flex gap-2 flex-wrap">
              {durations.map((d) => (
                <button
                  key={d.min}
                  onClick={() => setSelectedDuration(d.min)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    selectedDuration === d.min
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-secondary/30 text-muted-foreground border-border/30 hover:bg-secondary/50"
                  }`}
                  style={monoFont}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {simulation && (
        <>
          {/* Impact Summary */}
          <div className={`glass-panel p-4 border ${riskBg[simulation.overallRisk]} animate-fade-in`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Rainfall Intensity</p>
                <p className="text-2xl font-bold text-foreground" style={monoFont}>
                  {simulation.intensity.toFixed(1)} <span className="text-sm text-muted-foreground">mm/hr</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Overall Risk</p>
                <p className={`text-2xl font-bold uppercase ${riskColors[simulation.overallRisk]}`} style={monoFont}>
                  {simulation.overallRisk}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1" style={monoFont}>
                  <AlertTriangle size={10} /> Overflowing Drains
                </p>
                <p className="text-2xl font-bold text-destructive" style={monoFont}>
                  {simulation.overflowingDrains}/{simulation.drainImpact.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase flex items-center gap-1" style={monoFont}>
                  <Users size={10} /> Population Exposed
                </p>
                <p className="text-2xl font-bold text-warning" style={monoFont}>
                  {(simulation.totalExposed / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>

          {/* Drainage Impact Chart */}
          <div className="glass-panel p-4 animate-fade-in">
            <h4 className="text-xs font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
              DRAINAGE CAPACITY UNDER SIMULATED STORM
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={simulation.drainImpact} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
                <XAxis type="number" domain={[0, 120]} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={180} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 9 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(v: number, name: string) => [`${v}%`, name === "overflowRatio" ? "Overflow Ratio" : "Capacity"]}
                />
                <Bar dataKey="simulatedCapacity" name="Simulated Capacity" radius={[0, 4, 4, 0]}>
                  {simulation.drainImpact.map((d, i) => (
                    <Cell key={i} fill={d.willOverflow ? "hsl(0, 72%, 51%)" : d.simulatedCapacity < 50 ? "hsl(38, 92%, 50%)" : "hsl(152, 69%, 41%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Zone Risk Impact */}
          <div className="glass-panel p-4 animate-fade-in">
            <h4 className="text-xs font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
              ZONE RISK UNDER SIMULATED STORM ({simulation.criticalZones} CRITICAL)
            </h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {simulation.zoneImpact.slice(0, 10).map((zone, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                  <div className={`w-2 h-2 rounded-full ${
                    zone.risk === "critical" ? "bg-destructive" : zone.risk === "high" ? "bg-flood-high" : zone.risk === "medium" ? "bg-warning" : "bg-success"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-foreground">{zone.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">[{zone.zone_code}]</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={monoFont}>
                    <span className="text-muted-foreground">{zone.currentRisk}%</span>
                    <span className="text-muted-foreground">→</span>
                    <span className={`font-bold ${riskColors[zone.risk]}`}>{zone.simulatedRisk}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FloodSimulator;
