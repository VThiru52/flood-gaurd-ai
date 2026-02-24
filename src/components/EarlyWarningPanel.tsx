import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, Zap, CloudRain, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

interface DetectionResult {
  alerts_generated: number;
  current_rainfall: number;
  bottlenecks_found: number;
  flood_warnings: number;
  encroachment_flags: number;
  alerts: any[];
}

const EarlyWarningPanel = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const fetchLiveWeather = async () => {
    setFetchingWeather(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-weather");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Weather updated: ${data.current?.rainfall_mm_hr?.toFixed(1)} mm/hr · ${data.hourly_inserted} hourly readings added`);
    } catch (err: any) {
      toast.error(err.message || "Weather fetch failed");
    } finally {
      setFetchingWeather(false);
    }
  };

  const runDetection = async () => {
    setLoading(true);
    try {
      // First fetch latest weather
      await supabase.functions.invoke("fetch-weather");
      // Then run bottleneck detection
      const { data, error } = await supabase.functions.invoke("detect-bottlenecks");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success(`Detection complete: ${data.alerts_generated} alerts generated`);
    } catch (err: any) {
      toast.error(err.message || "Detection failed");
    } finally {
      setLoading(false);
    }
  };

  const severityStyles: Record<string, string> = {
    critical: "border-l-destructive bg-destructive/5",
    high: "border-l-flood-high bg-flood-high/5",
    medium: "border-l-warning bg-warning/5",
    low: "border-l-success bg-success/5",
  };

  const typeIcons: Record<string, React.ReactNode> = {
    bottleneck: <Zap size={12} className="text-warning" />,
    flood: <CloudRain size={12} className="text-destructive" />,
    encroachment: <Shield size={12} className="text-primary" />,
  };

  return (
    <div className="space-y-4">
      <div className="glass-panel p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-success" />
            <h3 className="text-sm font-semibold text-foreground tracking-wide" style={monoFont}>
              EARLY WARNING SYSTEM
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLiveWeather}
              disabled={fetchingWeather}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/30 transition-all disabled:opacity-50 text-[10px] font-semibold"
              style={monoFont}
            >
              {fetchingWeather ? <Loader2 size={12} className="animate-spin" /> : <CloudRain size={12} />}
              FETCH LIVE WEATHER
            </button>
            <button
              onClick={runDetection}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-all disabled:opacity-50 text-[10px] font-semibold"
              style={monoFont}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
              {loading ? "ANALYZING..." : "RUN DETECTION"}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Fetches live weather from Open-Meteo → Compares against IDF thresholds → Checks drainage capacity → Auto-generates alerts
        </p>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-panel p-3">
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Current Rainfall</p>
              <p className="text-xl font-bold text-foreground" style={monoFont}>{result.current_rainfall.toFixed(1)} mm/hr</p>
            </div>
            <div className="glass-panel p-3">
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Bottlenecks</p>
              <p className={`text-xl font-bold ${result.bottlenecks_found > 0 ? "text-warning" : "text-success"}`} style={monoFont}>
                {result.bottlenecks_found}
              </p>
            </div>
            <div className="glass-panel p-3">
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Flood Warnings</p>
              <p className={`text-xl font-bold ${result.flood_warnings > 0 ? "text-destructive" : "text-success"}`} style={monoFont}>
                {result.flood_warnings}
              </p>
            </div>
            <div className="glass-panel p-3">
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>Encroachment Flags</p>
              <p className={`text-xl font-bold ${result.encroachment_flags > 0 ? "text-primary" : "text-success"}`} style={monoFont}>
                {result.encroachment_flags}
              </p>
            </div>
          </div>

          {result.alerts.length > 0 && (
            <div className="glass-panel p-4 animate-fade-in">
              <h4 className="text-xs font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
                AUTO-GENERATED ALERTS ({result.alerts.length})
              </h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {result.alerts.map((alert, i) => (
                  <div key={i} className={`border-l-2 rounded-r-lg p-3 ${severityStyles[alert.severity] || ""}`}>
                    <div className="flex items-start gap-2">
                      {typeIcons[alert.alert_type]}
                      <div className="flex-1">
                        <p className="text-xs text-foreground leading-relaxed">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            alert.severity === "critical" ? "bg-destructive/20 text-destructive" :
                            alert.severity === "high" ? "bg-flood-high/20 text-flood-high" :
                            "bg-warning/20 text-warning"
                          }`} style={monoFont}>
                            {alert.severity}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{alert.location}</span>
                          <span className="text-[10px] text-primary/70 uppercase" style={monoFont}>{alert.alert_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EarlyWarningPanel;
