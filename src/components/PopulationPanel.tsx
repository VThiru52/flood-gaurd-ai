import { useXlsxSheet, parsePopulationProjections, parseSubDivisions } from "@/hooks/useXlsxData";
import { Loader2, Users, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const PopulationPanel = ({ compact = false }: { compact?: boolean }) => {
  const { data: popSheet, isLoading: loadingPop } = useXlsxSheet(
    "KadapaTownPopulationProjections.csv",
    "population projections",
    100
  );
  const { data: subSheet, isLoading: loadingSub } = useXlsxSheet(
    "KadapaTownPopulationProjections.csv",
    "Sub Division wise",
    200
  );

  const popData = useMemo(() => {
    if (!popSheet?.data) return [];
    return parsePopulationProjections(popSheet.data);
  }, [popSheet]);

  const subDivData = useMemo(() => {
    if (!subSheet?.data) return [];
    return parseSubDivisions(subSheet.data);
  }, [subSheet]);

  const isLoading = loadingPop || loadingSub;

  if (isLoading)
    return (
      <div className="glass-panel p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">Loading population data...</span>
      </div>
    );

  const latestPop = popData.length > 0 ? popData[popData.length - 1] : null;

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-1">
          <Users size={16} className="text-primary" />
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider" style={monoFont}>
            Population Data — Kadapa Municipal Corporation
          </h4>
        </div>
        <p className="text-[10px] text-muted-foreground" style={monoFont}>
          Source: KadapaTownPopulationProjections.csv · Census + Projections
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {latestPop && (
          <>
            <div className="glass-panel p-3">
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Census {latestPop.year}</p>
              <p className="text-xl font-bold text-foreground" style={monoFont}>
                {latestPop.population.toLocaleString()}
              </p>
            </div>
            <div className="glass-panel p-3">
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Growth Rate</p>
              <p className="text-xl font-bold text-primary" style={monoFont}>
                {(latestPop.percentIncrease * 100).toFixed(1)}%
              </p>
            </div>
          </>
        )}
        <div className="glass-panel p-3">
          <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Sub-Divisions</p>
          <p className="text-xl font-bold text-foreground" style={monoFont}>{subDivData.length}</p>
        </div>
        <div className="glass-panel p-3">
          <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Total Households</p>
          <p className="text-xl font-bold text-foreground" style={monoFont}>
            {subDivData.reduce((s, d) => s + d.households, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Population Growth Chart */}
      {popData.length > 0 && (
        <div className="glass-panel p-4">
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-3" style={monoFont}>
            <TrendingUp size={12} className="inline mr-1" /> Population Growth (1971–2011)
          </h5>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={popData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  formatter={(v: number) => [v.toLocaleString(), "Population"]}
                />
                <Area
                  type="monotone"
                  dataKey="population"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sub-Division Table */}
      {!compact && subDivData.length > 0 && (
        <div className="glass-panel p-4">
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase mb-3" style={monoFont}>
            Sub-Division Wise Population Projections
          </h5>
          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]" style={monoFont}>Sub-Division</TableHead>
                  <TableHead className="text-[10px] text-right" style={monoFont}>Households</TableHead>
                  <TableHead className="text-[10px] text-right" style={monoFont}>Population</TableHead>
                  <TableHead className="text-[10px] text-right" style={monoFont}>Area (sq.km)</TableHead>
                  <TableHead className="text-[10px] text-right" style={monoFont}>2025</TableHead>
                  <TableHead className="text-[10px] text-right" style={monoFont}>2040</TableHead>
                  <TableHead className="text-[10px] text-right" style={monoFont}>2055</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subDivData.slice(0, 30).map((d, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-[10px] font-medium" style={monoFont}>{d.subDivision}</TableCell>
                    <TableCell className="text-[10px] text-right" style={monoFont}>{d.households.toLocaleString()}</TableCell>
                    <TableCell className="text-[10px] text-right" style={monoFont}>{d.population.toLocaleString()}</TableCell>
                    <TableCell className="text-[10px] text-right" style={monoFont}>{d.area}</TableCell>
                    <TableCell className="text-[10px] text-right" style={monoFont}>{d.pop2025.toLocaleString()}</TableCell>
                    <TableCell className="text-[10px] text-right" style={monoFont}>{d.pop2040.toLocaleString()}</TableCell>
                    <TableCell className="text-[10px] text-right" style={monoFont}>{d.pop2055.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopulationPanel;
