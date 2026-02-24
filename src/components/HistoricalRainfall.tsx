import { useXlsxSheet, parseRainfallDRF } from "@/hooks/useXlsxData";
import { Loader2, CloudRain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { useMemo } from "react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const HistoricalRainfall = () => {
  const { data: sheetData, isLoading, error } = useXlsxSheet("KadapaRainfall5.csv", "DRF-Ana", 500);

  const { yearlyData, monthlyAvg } = useMemo(() => {
    if (!sheetData?.data) return { yearlyData: [], monthlyAvg: [] };
    const records = parseRainfallDRF(sheetData.data);

    // Yearly max rainfall
    const byYear: Record<string, number> = {};
    records.forEach((r) => {
      const key = r.year;
      byYear[key] = Math.max(byYear[key] || 0, r.dailyRainfall);
    });
    const yearlyData = Object.entries(byYear)
      .map(([year, maxRainfall]) => ({ year, maxRainfall: Math.round(maxRainfall * 10) / 10 }))
      .sort((a, b) => a.year.localeCompare(b.year));

    // Monthly average intensity
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const byMonth: Record<string, { sum: number; count: number }> = {};
    records.forEach((r) => {
      const mi = parseInt(r.month) - 1;
      if (mi >= 0 && mi < 12) {
        const key = months[mi];
        if (!byMonth[key]) byMonth[key] = { sum: 0, count: 0 };
        byMonth[key].sum += r.dailyRainfall;
        byMonth[key].count++;
      }
    });
    const monthlyAvg = months.map((m) => ({
      month: m,
      avgRainfall: byMonth[m] ? Math.round((byMonth[m].sum / byMonth[m].count) * 10) / 10 : 0,
    }));

    return { yearlyData, monthlyAvg };
  }, [sheetData]);

  if (isLoading)
    return (
      <div className="glass-panel p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Loading historical rainfall data...</span>
      </div>
    );

  if (error)
    return (
      <div className="glass-panel p-4 text-xs text-destructive">
        Failed to load rainfall data: {(error as Error).message}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-1">
          <CloudRain size={16} className="text-primary" />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider" style={monoFont}>
            Historical Rainfall — DRF Analysis
          </h4>
        </div>
        <p className="text-[10px] text-muted-foreground" style={monoFont}>
          Source: KadapaRainfall5.csv · DRF-Ana sheet · {sheetData?.totalRows ?? 0} records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Yearly Max Rainfall */}
        <div className="glass-panel p-4">
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-3" style={monoFont}>
            Yearly Max Daily Rainfall (mm)
          </h5>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={2} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="maxRainfall" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Average */}
        <div className="glass-panel p-4">
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-3" style={monoFont}>
            Monthly Avg Rainfall (mm)
          </h5>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="avgRainfall" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalRainfall;
