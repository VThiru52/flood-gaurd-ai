import { useState } from "react";
import { Brain, Loader2, TrendingUp, TrendingDown, Minus, RefreshCw, AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAIPredictions } from "@/hooks/useFloodData";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

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

const trendIcons: Record<string, React.ReactNode> = {
  rising: <TrendingUp size={12} className="text-destructive" />,
  stable: <Minus size={12} className="text-warning" />,
  falling: <TrendingDown size={12} className="text-success" />,
};

interface Prediction {
  overall_risk_score: number;
  risk_level: string;
  summary: string;
  zone_predictions: Array<{
    zone_name: string;
    predicted_risk: number;
    trend: string;
    reasoning: string;
  }>;
  recommendations: string[];
  six_hour_forecast: string;
  twenty_four_hour_forecast?: string;
  seventy_two_hour_forecast?: string;
  confidence: number;
}

const AIPredictionPanel = () => {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const { data: pastPredictions = [] } = useAIPredictions();

  const runPrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("flood-predict", {
        body: {},
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPrediction(data);
      toast.success("AI prediction complete");
    } catch (err: any) {
      console.error("Prediction error:", err);
      toast.error(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  // Use latest stored prediction if no fresh one
  const latestStored = pastPredictions[0]?.prediction_data as unknown as Prediction | undefined;
  const active = prediction || latestStored;

  return (
    <div className="space-y-4">
      {/* Run Prediction Button */}
      <div className="glass-panel p-4 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground tracking-wide" style={monoFont}>
              AI FLOOD PREDICTION ENGINE
            </h3>
          </div>
          <button
            onClick={runPrediction}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-all disabled:opacity-50 text-xs font-semibold"
            style={monoFont}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {loading ? "ANALYZING..." : "RUN PREDICTION"}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Powered by HARYAK AI · Analyzes IDF curves, drainage capacity, weather data, and flood zones in real-time
        </p>
        <div className="mt-3 rounded-lg bg-secondary/30 border border-border/20 p-3 space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider" style={monoFont}>RISK SCORE FORMULA</p>
          <p className="text-[10px] font-bold text-primary" style={monoFont}>
            Score = 0.30×(Rain/MaxRain) + 0.25×(1−AvgCapacity) + 0.20×(Density/200) + 0.25×(Rain/IDF₁yr)
          </p>
          <p className="text-[10px] text-muted-foreground">
            All factors scaled 0–100 · Critical ≥75 · High 50–74 · Medium 25–49 · Low &lt;25
          </p>
        </div>
      </div>

      {/* Active Prediction */}
      {active && (
        <>
          {/* Overall Risk Score */}
          <div className={`glass-panel p-4 border ${riskBg[active.risk_level] || ""} animate-fade-in`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall Flood Risk</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-4xl font-bold ${riskColors[active.risk_level] || ""}`} style={monoFont}>
                    {active.overall_risk_score}
                  </span>
                  <span className="text-lg text-muted-foreground">/100</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${riskBg[active.risk_level] || ""} ${riskColors[active.risk_level] || ""}`} style={monoFont}>
                    {active.risk_level}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold text-primary" style={monoFont}>
                  {(active.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">{active.summary}</p>
          </div>

          {/* Zone Predictions */}
          {active.zone_predictions?.length > 0 && (
            <div className="glass-panel p-4 animate-fade-in">
              <h4 className="text-xs font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
                ZONE-LEVEL PREDICTIONS ({active.zone_predictions.length})
              </h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {active.zone_predictions.map((zp, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{zp.zone_name}</span>
                      <div className="flex items-center gap-2">
                        {trendIcons[zp.trend]}
                        <span className="text-xs font-bold" style={monoFont}>{zp.predicted_risk}%</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{zp.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations + Multi-Horizon Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {active.recommendations?.length > 0 && (
              <div className="glass-panel p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} className="text-primary" />
                  <h4 className="text-xs font-semibold text-foreground tracking-wide" style={monoFont}>
                    RECOMMENDATIONS
                  </h4>
                </div>
                <div className="space-y-2">
                  {active.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20">
                      <span className="text-primary text-xs font-bold mt-0.5" style={monoFont}>{i + 1}.</span>
                      <p className="text-xs text-foreground/80">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-panel p-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={14} className="text-warning" />
                <h4 className="text-xs font-semibold text-foreground tracking-wide" style={monoFont}>
                  PREDICTION TIME HORIZONS
                </h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-destructive/20 text-destructive uppercase" style={monoFont}>6 HOURS</span>
                    <span className="text-[10px] text-muted-foreground">Immediate threat</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{active.six_hour_forecast}</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-warning/20 text-warning uppercase" style={monoFont}>24 HOURS</span>
                    <span className="text-[10px] text-muted-foreground">Short-term outlook</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{active.twenty_four_hour_forecast || "Run prediction to generate 24-hour forecast."}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary/20 text-primary uppercase" style={monoFont}>72 HOURS (3 DAYS)</span>
                    <span className="text-[10px] text-muted-foreground">Extended forecast</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{active.seventy_two_hour_forecast || "Run prediction to generate 72-hour forecast."}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Past Predictions */}
      {pastPredictions.length > 0 && (
        <div className="glass-panel p-4 animate-fade-in">
          <h4 className="text-xs font-semibold text-foreground tracking-wide mb-3" style={monoFont}>
            PREDICTION HISTORY ({pastPredictions.length})
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {pastPredictions.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => p.prediction_data && setPrediction(p.prediction_data as unknown as Prediction)}>
                <div className="flex items-center gap-2">
                  <Brain size={12} className="text-primary" />
                  <span className="text-xs text-foreground">Risk: <span className="font-bold" style={monoFont}>{p.risk_score?.toFixed(0)}/100</span></span>
                  <span className="text-[10px] text-muted-foreground">({(p.confidence * 100).toFixed(0)}% conf)</span>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionPanel;
