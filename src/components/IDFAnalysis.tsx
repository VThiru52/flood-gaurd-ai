import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell } from "recharts";
import { idfData, idfCoefficients, stormFrequencyData, kadapaZones } from "@/data/kadapaFloodData";

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

const IDFAnalysis = () => (
  <div className="space-y-4">
    {/* IDF Curves */}
    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
        KADAPA IDF CURVES — INTENSITY-DURATION-FREQUENCY
      </h3>
      <p className="text-[10px] text-muted-foreground mb-4">
        Source: 16-year storm frequency analysis · Power-law regression i = a × t<sup>n</sup>
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={idfData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
          <XAxis
            dataKey="duration"
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
            label={{ value: "Duration (min)", position: "insideBottom", offset: -5, fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
          />
          <YAxis
            tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
            axisLine={{ stroke: "hsl(222, 30%, 18%)" }}
            label={{ value: "Intensity (mm/hr)", angle: -90, position: "insideLeft", fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line type="monotone" dataKey="i6m" name="6 Months" stroke={periodColors["6 months"]} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="i1y" name="1 Year" stroke={periodColors["1 year"]} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="i2y" name="2 Years" stroke={periodColors["2 years"]} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="i5y" name="5 Years" stroke={periodColors["5 years"]} strokeWidth={2.5} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* IDF Coefficients Table */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
          IDF REGRESSION PARAMETERS
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">Formula: i = a × t<sup>n</sup> (Power-law fit)</p>
        <div className="space-y-2">
          {Object.entries(idfCoefficients).map(([period, coeff]) => (
            <div key={period} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: periodColors[period as keyof typeof periodColors] }}
              />
              <span className="text-xs text-foreground flex-1">{period}</span>
              <span className="text-[10px] text-muted-foreground" style={monoFont}>a={coeff.a}</span>
              <span className="text-[10px] text-muted-foreground" style={monoFont}>n={coeff.n}</span>
              <span className="text-[10px] text-primary" style={monoFont}>R²={coeff.r2}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Storm Frequency Summary */}
      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
          STORM FREQUENCY (16-YEAR RECORD)
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">Cumulative rainfall by duration from Kadapa rain gauge</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stormFrequencyData.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis dataKey="durationMin" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
            <Tooltip
              formatter={(v: number) => [`${v} mm`, "Cumulative"]}
              contentStyle={{ background: "hsl(222, 41%, 10%)", border: "1px solid hsl(222, 30%, 25%)", fontSize: 11 }}
              labelStyle={{ color: "hsl(210, 40%, 92%)" }}
            />
            <Bar dataKey="cumulativeRainfall" name="Cumulative (mm)" radius={[4, 4, 0, 0]}>
              {stormFrequencyData.slice(0, 8).map((_, i) => (
                <Cell key={i} fill={`hsl(210, ${60 + i * 5}%, ${50 - i * 3}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Zoning Category Table */}
    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
        KADAPA MASTER PLAN ZONING — FLOOD RELEVANCE
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">
        Source: G.O.Ms.No.39, dt.21.03.2023 — ANUDA Master Plan 2041 · {kadapaZones.length} zones
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>CODE</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>ZONE NAME</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>TYPE</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>DESCRIPTION</th>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium" style={monoFont}>FLOOD RISK</th>
            </tr>
          </thead>
          <tbody>
            {kadapaZones.map((zone) => {
              const riskColors: Record<string, string> = {
                critical: "bg-destructive/20 text-destructive",
                high: "bg-flood-high/20 text-flood-high",
                medium: "bg-warning/20 text-warning",
                low: "bg-success/20 text-success",
              };
              return (
                <tr key={zone.code} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="py-2 px-2 font-bold text-primary" style={monoFont}>{zone.code}</td>
                  <td className="py-2 px-2 text-foreground">{zone.name}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${zone.type === "DPZ" ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`} style={monoFont}>
                      {zone.type}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground max-w-[250px] truncate">{zone.description}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${riskColors[zone.floodRelevance]}`} style={monoFont}>
                      {zone.floodRelevance}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    {/* Full IDF Data Table */}
    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
        COMPLETE IDF DATA TABLE (mm/hr)
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">All 15 duration points × 4 return periods — extracted from Kadapa rainfall PDFs</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-right py-2 px-3 text-muted-foreground font-medium" style={monoFont}>DURATION (min)</th>
              <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["6 months"] }}>6 MONTHS</th>
              <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["1 year"] }}>1 YEAR</th>
              <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["2 years"] }}>2 YEARS</th>
              <th className="text-right py-2 px-3 font-medium" style={{ ...monoFont, color: periodColors["5 years"] }}>5 YEARS</th>
            </tr>
          </thead>
          <tbody>
            {idfData.map((row) => (
              <tr key={row.duration} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                <td className="text-right py-1.5 px-3 font-bold text-foreground" style={monoFont}>{row.duration}</td>
                <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.i6m.toFixed(2)}</td>
                <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.i1y.toFixed(2)}</td>
                <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.i2y.toFixed(2)}</td>
                <td className="text-right py-1.5 px-3 text-foreground" style={monoFont}>{row.i5y.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default IDFAnalysis;
