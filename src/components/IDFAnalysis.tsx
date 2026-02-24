import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";
import { useIDFRecords, useZoneCategories, useStormFrequency } from "@/hooks/useFloodData";
import { Loader2 } from "lucide-react";
import { idfCoefficients } from "@/data/kadapaFloodData";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const periodColors = {
  "6 months": "hsl(152, 69%, 41%)",
  "1 year": "hsl(38, 92%, 50%)",
  "2 years": "hsl(15, 80%, 50%)",
  "5 years": "hsl(0, 72%, 51%)",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-panel p-3 text-xs border border-border/50">
      <p className="font-semibold text-foreground mb-1" style={monoFont}>{label} min</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)} mm/hr
        </p>
      ))}
    </div>
  );
};

const IDFAnalysis = () => {
  const { data: idfRecords = [], isLoading: loadingIDF } = useIDFRecords();
  const { data: zones = [], isLoading: loadingZones } = useZoneCategories();
  const { data: stormData = [] } = useStormFrequency();

  const idfChartData = idfRecords.map(r => ({
    duration: r.duration_min,
    i6m: r.intensity_6m,
    i1y: r.intensity_1y,
    i2y: r.intensity_2y,
    i5y: r.intensity_5y,
  }));

  // Group storm frequency data by return period for chart
  const stormByPeriod = stormData.reduce((acc: Record<string, any[]>, row) => {
    if (!acc[row.return_period]) acc[row.return_period] = [];
    acc[row.return_period].push(row);
    return acc;
  }, {});

  // Create storm frequency chart data - show 5min duration storm counts by return period
  const stormChartData = Object.entries(stormByPeriod).map(([period, rows]) => ({
    period: period === "6months" ? "6M" : period === "1year" ? "1Y" : period === "2years" ? "2Y" : "5Y",
    totalStorms: rows.reduce((s, r) => s + (r.duration_5min || 0), 0),
    avgStorms: Math.round(rows.reduce((s, r) => s + (r.duration_30min || 0), 0) / rows.length),
  }));

  if (loadingIDF) {
    return (
      <div className="glass-panel p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* IDF Curves */}
      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
          IDF CURVES — INTENSITY-DURATION-FREQUENCY
        </h3>
        <p className="text-[10px] text-muted-foreground mb-4">
          {idfChartData.length} duration points × 4 return periods · Live from database
        </p>
        {idfChartData.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-xs text-muted-foreground">No IDF data available</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={idfChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="duration" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
                label={{ value: "Duration (min)", position: "insideBottom", offset: -5, fill: "hsl(215, 20%, 55%)", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
                label={{ value: "Intensity (mm/hr)", angle: -90, position: "insideLeft", fill: "hsl(215, 20%, 55%)", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="i6m" name="6 Months" stroke={periodColors["6 months"]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="i1y" name="1 Year" stroke={periodColors["1 year"]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="i2y" name="2 Years" stroke={periodColors["2 years"]} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="i5y" name="5 Years" stroke={periodColors["5 years"]} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Coefficients + Storm Frequency from DB */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
            IDF REGRESSION PARAMETERS
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">Formula: i = a × t<sup>n</sup></p>
          <div className="space-y-2">
            {Object.entries(idfCoefficients).map(([period, coeff]) => (
              <div key={period} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                <div className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: periodColors[period as keyof typeof periodColors] }} />
                <span className="text-xs text-foreground flex-1">{period}</span>
                <span className="text-[10px] text-muted-foreground" style={monoFont}>a={coeff.a}</span>
                <span className="text-[10px] text-muted-foreground" style={monoFont}>n={coeff.n}</span>
                <span className="text-[10px] text-primary" style={monoFont}>R²={coeff.r2}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
            STORM FREQUENCY (16-YEAR RECORD)
          </h3>
          <p className="text-[10px] text-muted-foreground mb-3">
            {stormData.length > 0 ? `${stormData.length} records from database · 4 return periods` : "From PDF data"}
          </p>
          {stormData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-1.5 px-2 text-muted-foreground" style={monoFont}>INTENSITY</th>
                    <th className="text-right py-1.5 px-2" style={{ ...monoFont, color: periodColors["6 months"] }}>6M</th>
                    <th className="text-right py-1.5 px-2" style={{ ...monoFont, color: periodColors["1 year"] }}>1Y</th>
                    <th className="text-right py-1.5 px-2" style={{ ...monoFont, color: periodColors["2 years"] }}>2Y</th>
                    <th className="text-right py-1.5 px-2" style={{ ...monoFont, color: periodColors["5 years"] }}>5Y</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Show unique intensity thresholds */}
                  {[...new Set(stormData.map(s => s.intensity_threshold))].slice(0, 10).map(threshold => {
                    const byPeriod = stormData.filter(s => s.intensity_threshold === threshold);
                    const get30 = (period: string) => byPeriod.find(s => s.return_period === period)?.duration_30min ?? "-";
                    return (
                      <tr key={threshold} className="border-b border-border/10 hover:bg-secondary/20">
                        <td className="py-1 px-2 text-foreground font-bold" style={monoFont}>{threshold} mm/hr</td>
                        <td className="text-right py-1 px-2 text-foreground" style={monoFont}>{get30("6months")}</td>
                        <td className="text-right py-1 px-2 text-foreground" style={monoFont}>{get30("1year")}</td>
                        <td className="text-right py-1 px-2 text-foreground" style={monoFont}>{get30("2years")}</td>
                        <td className="text-right py-1 px-2 text-foreground" style={monoFont}>{get30("5years")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
              No storm frequency data — run ingestion from Data Sources
            </div>
          )}
        </div>
      </div>

      {/* Zoning Table */}
      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
          KADAPA MASTER PLAN ZONING — FLOOD RELEVANCE
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          G.O.Ms.No.39 · {zones.length} zones · Live from database
        </p>
        {zones.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No zoning data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>CODE</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>ZONE</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>TYPE</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>FLOOD RISK</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => {
                  const riskColors: Record<string, string> = {
                    critical: "bg-destructive/20 text-destructive",
                    high: "bg-flood-high/20 text-flood-high",
                    medium: "bg-warning/20 text-warning",
                    low: "bg-success/20 text-success",
                  };
                  return (
                    <tr key={zone.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                      <td className="py-2 px-2 font-bold text-primary" style={monoFont}>{zone.code}</td>
                      <td className="py-2 px-2 text-foreground">{zone.name}</td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${zone.zone_type === "DPZ" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`} style={monoFont}>
                          {zone.zone_type}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${riskColors[zone.flood_relevance] || ""}`} style={monoFont}>
                          {zone.flood_relevance}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full IDF Data Table */}
      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
          COMPLETE IDF DATA TABLE (mm/hr)
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">{idfRecords.length} records · Live from database</p>
        {idfRecords.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No IDF data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-right py-2 px-3 text-muted-foreground font-medium" style={monoFont}>DURATION</th>
                  <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["6 months"] }}>6M</th>
                  <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["1 year"] }}>1Y</th>
                  <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["2 years"] }}>2Y</th>
                  <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["5 years"] }}>5Y</th>
                </tr>
              </thead>
              <tbody>
                {idfRecords.map((row) => (
                  <tr key={row.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="text-right py-1.5 px-3 font-bold text-foreground" style={monoFont}>{row.duration_min}m</td>
                    <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.intensity_6m?.toFixed(2)}</td>
                    <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.intensity_1y?.toFixed(2)}</td>
                    <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.intensity_2y?.toFixed(2)}</td>
                    <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.intensity_5y?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDFAnalysis;
