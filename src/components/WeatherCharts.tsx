import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { rainfallTimeSeriesData, wardRiskData } from "@/data/kadapaFloodData";

const getBarColor = (risk: number) => {
  if (risk >= 85) return "hsl(0, 72%, 51%)";
  if (risk >= 60) return "hsl(15, 80%, 50%)";
  if (risk >= 30) return "hsl(38, 92%, 50%)";
  return "hsl(152, 69%, 41%)";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-panel p-2 text-xs border border-border/50">
      <p className="font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name === "Rainfall" ? " mm/hr" : "%"}
        </p>
      ))}
    </div>
  );
};

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const WeatherCharts = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
        KADAPA IDF-BASED RAINFALL vs DRAINAGE (24H)
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">Source: Kadapa Rainfall Analysis — 16-year storm frequency</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={rainfallTimeSeriesData}>
          <defs>
            <linearGradient id="rainfallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(187, 72%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(187, 72%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
          <XAxis dataKey="time" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
          <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="rainfall" name="Rainfall" stroke="hsl(210, 100%, 56%)" fill="url(#rainfallGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="flow" name="Drain Capacity" stroke="hsl(187, 72%, 50%)" fill="url(#flowGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
        KADAPA ZONE-WISE FLOOD RISK INDEX
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3">Source: Master Plan Zoning + IDF Analysis (G.O.Ms.No.39)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={wardRiskData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
          <XAxis dataKey="ward" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
          <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="risk" name="Risk" radius={[4, 4, 0, 0]}>
            {wardRiskData.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.risk)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default WeatherCharts;
