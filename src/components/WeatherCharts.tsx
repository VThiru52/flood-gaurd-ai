import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const rainfallData = [
  { time: "00:00", rainfall: 12, flow: 45 },
  { time: "03:00", rainfall: 8, flow: 52 },
  { time: "06:00", rainfall: 25, flow: 38 },
  { time: "09:00", rainfall: 45, flow: 28 },
  { time: "12:00", rainfall: 68, flow: 15 },
  { time: "15:00", rainfall: 92, flow: 8 },
  { time: "18:00", rainfall: 78, flow: 12 },
  { time: "21:00", rainfall: 55, flow: 22 },
  { time: "Now", rainfall: 42, flow: 35 },
];

const wardRiskData = [
  { ward: "W23", risk: 95 },
  { ward: "W27", risk: 92 },
  { ward: "W15", risk: 78 },
  { ward: "W31", risk: 72 },
  { ward: "W44", risk: 68 },
  { ward: "W8", risk: 55 },
  { ward: "W36", risk: 52 },
  { ward: "W42", risk: 48 },
];

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
          {entry.name}: {entry.value}{entry.name === "Rainfall" ? "mm" : "%"}
        </p>
      ))}
    </div>
  );
};

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const WeatherCharts = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-4" style={monoFont}>
        RAINFALL vs DRAINAGE FLOW (24H)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={rainfallData}>
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
          <Area type="monotone" dataKey="flow" name="Flow Capacity" stroke="hsl(187, 72%, 50%)" fill="url(#flowGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="glass-panel p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-4" style={monoFont}>
        WARD-WISE FLOOD RISK INDEX
      </h3>
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
