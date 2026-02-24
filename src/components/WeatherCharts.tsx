import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { useWeatherReadings, useFloodZones } from "@/hooks/useFloodData";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

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
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
          {entry.name === "Rainfall" ? " mm/hr" : entry.name === "Humidity" ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const WeatherCharts = () => {
  const { data: weather = [], isLoading: loadingWeather } = useWeatherReadings();
  const { data: zones = [], isLoading: loadingZones } = useFloodZones();

  const weatherChartData = weather.map(w => ({
    time: format(new Date(w.timestamp), "HH:mm"),
    rainfall: w.rainfall_mm_hr,
    humidity: w.humidity_pct ?? 0,
    temperature: w.temperature_c ?? 0,
  }));

  const wardRiskData = zones
    .sort((a, b) => b.level - a.level)
    .slice(0, 10)
    .map(z => ({
      ward: z.zone_code,
      name: z.name.split(" - ")[0],
      risk: z.level,
    }));

  if (loadingWeather && loadingZones) {
    return (
      <div className="glass-panel p-8 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
          LIVE RAINFALL & HUMIDITY
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Real-time weather readings · {weather.length} data points
          {weather.length > 0 && (
            <span className="text-primary ml-1">● LIVE</span>
          )}
        </p>
        {weatherChartData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
            No weather data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weatherChartData}>
              <defs>
                <linearGradient id="rainfallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humidityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(187, 72%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(187, 72%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
              <XAxis dataKey="time" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 10 }} axisLine={{ stroke: "hsl(222, 30%, 18%)" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rainfall" name="Rainfall" stroke="hsl(210, 100%, 56%)" fill="url(#rainfallGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="humidity" name="Humidity" stroke="hsl(187, 72%, 50%)" fill="url(#humidityGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-panel p-4 animate-fade-in">
        <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
          ZONE-WISE FLOOD RISK INDEX
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">
          Dynamic risk from database · {wardRiskData.length} zones
        </p>
        {wardRiskData.length === 0 ? (
          <div className="h-[220px] flex items-center justify-center text-xs text-muted-foreground">
            No zone data available
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default WeatherCharts;
