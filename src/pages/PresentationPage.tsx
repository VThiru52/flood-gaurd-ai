import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronRight, ChevronLeft, Maximize2, Minimize2, Droplets,
  LayoutDashboard, Map, AlertTriangle, CloudRain, BarChart3,
  Brain, Database, FileText, Zap, Shield, Users, Target,
  Globe, Code, CheckCircle2, Layers, Activity, Clock,
  TrendingUp, ArrowRight
} from "lucide-react";

const mono = { fontFamily: "'JetBrains Mono', monospace" };

/* ─── Slide Components ─── */
const SlideLayout = ({ children, bg = "from-[#0a0e1a] to-[#101828]" }: { children: React.ReactNode; bg?: string }) => (
  <div className={`w-[1920px] h-[1080px] bg-gradient-to-br ${bg} text-white overflow-hidden relative`}>
    {children}
    <div className="absolute bottom-6 left-10 flex items-center gap-2 opacity-40">
      <Droplets size={14} />
      <span className="text-[11px] tracking-widest" style={mono}>AI FLOOD GUARD · HARYAK TECHNOLOGIES</span>
    </div>
  </div>
);

const SectionTitle = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="flex items-center gap-5 mb-8">
    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
      {icon}
    </div>
    <div>
      <h2 className="text-4xl font-bold tracking-tight" style={mono}>{title}</h2>
      <p className="text-lg text-white/50 mt-1">{subtitle}</p>
    </div>
  </div>
);

const StatBox = ({ label, value, color = "cyan" }: { label: string; value: string; color?: string }) => {
  const colors: Record<string, string> = {
    cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    green: "border-green-500/30 bg-green-500/10 text-green-400",
    purple: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-[11px] uppercase tracking-widest opacity-60" style={mono}>{label}</p>
      <p className="text-3xl font-bold mt-2" style={mono}>{value}</p>
    </div>
  );
};

const FormulaCard = ({ label, formula, desc }: { label: string; formula: string; desc: string }) => (
  <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-2">
    <p className="text-[11px] text-white/40 uppercase tracking-widest" style={mono}>{label}</p>
    <p className="text-lg font-bold text-cyan-400" style={mono}>{formula}</p>
    <p className="text-sm text-white/50">{desc}</p>
  </div>
);

/* ─── SLIDES ─── */
interface SlideData {
  title: string;
  tab: string;
  content: React.ReactNode;
}

const slides: SlideData[] = [
  /* 1. TITLE */
  {
    title: "Title",
    tab: "Cover",
    content: (
      <SlideLayout bg="from-[#050a14] via-[#0a1628] to-[#0f1d32]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <Droplets size={48} className="text-cyan-400" />
              <div className="text-left">
                <h1 className="text-6xl font-black tracking-tight" style={mono}>AI FLOOD GUARD</h1>
                <p className="text-xl text-white/50 mt-1">AI-Based Stormwater Network Mapping & Flood Risk Monitoring</p>
              </div>
            </div>
            <p className="text-2xl text-white/40">Kadapa Municipal Corporation · Andhra Pradesh</p>
            <div className="flex items-center justify-center gap-6 mt-8">
              {[
                { v: "14", l: "Flood Zones" }, { v: "8", l: "Drains" },
                { v: "16yr", l: "Rainfall Data" }, { v: "AI", l: "Prediction" },
              ].map(s => (
                <div key={s.l} className="px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-3xl font-bold text-cyan-400" style={mono}>{s.v}</p>
                  <p className="text-xs text-white/40 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <p className="text-lg text-white/30">Presented by <strong className="text-white/60">Thiru · Haryak Technologies</strong></p>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 2. DASHBOARD */
  {
    title: "Dashboard",
    tab: "Dashboard /",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<LayoutDashboard size={28} />} title="DASHBOARD" subtitle="Real-time flood monitoring overview — all data from database" />
          <div className="grid grid-cols-4 gap-4">
            <StatBox label="Active Flood Zones" value="7" color="red" />
            <StatBox label="Drainage Segments" value="8" color="amber" />
            <StatBox label="Live Alerts" value="Auto" color="red" />
            <StatBox label="Weather Feed" value="Live" color="green" />
          </div>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-3">
              <h3 className="text-lg font-bold text-cyan-400" style={mono}>8 STAT CARDS — ALL FROM DATABASE</h3>
              {[
                "Active Flood Zones ← flood_zones (risk=critical|high)",
                "Alerts Active ← flood_alerts (is_active=true)",
                "Avg Drainage Capacity ← drainage_segments AVG(capacity)",
                "Current Rainfall ← weather_readings (latest)",
                "Historical Max ← historical_rainfall MAX(daily_rainfall_mm)",
                "IDF Curves ← idf_records (count return periods)",
                "Population ← population_data (2011 census)",
                "AI Predictions ← ai_predictions (total count)",
              ].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                  <span className="text-sm text-white/70">{t}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
              <h3 className="text-lg font-bold text-amber-400" style={mono}>LIVE COMPONENTS</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm font-bold text-red-400">🔴 Live Alerts Panel</p>
                  <p className="text-xs text-white/50">Auto-generated by detect-bottlenecks function</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-sm font-bold text-cyan-400">🌧 Live Rainfall & Humidity Charts</p>
                  <p className="text-xs text-white/50">Real-time from weather_readings via Open-Meteo API</p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm font-bold text-amber-400">⚡ Drainage Network Status</p>
                  <p className="text-xs text-white/50">8 segments with capacity %, catchment, design period</p>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm font-bold text-green-400">🛡 Early Warning System</p>
                  <p className="text-xs text-white/50">FETCH WEATHER → RUN DETECTION pipeline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 3. MAP VIEW */
  {
    title: "GIS Map View",
    tab: "Map /map",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<Map size={28} />} title="GIS MAP VIEW" subtitle="4 interactive layers — Leaflet + leaflet.heat" />
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: <Droplets size={20} />, title: "FLOOD HEATMAP", color: "red", desc: "14 zones, intensity = level / 100, green→yellow→red gradient" },
              { icon: <Zap size={20} />, title: "DRAINAGE NETWORK", color: "amber", desc: "8 polyline segments, color by status: red(critical) → green(good)" },
              { icon: <AlertTriangle size={20} />, title: "BOTTLENECK MARKERS", color: "red", desc: "Circular markers where capacity < 50%, shows % value" },
              { icon: <Users size={20} />, title: "POPULATION DENSITY", color: "purple", desc: "Heatmap from subdivision_population, normalized: density/20,000" },
            ].map(layer => {
              const colors: Record<string, string> = {
                red: "border-red-500/30 bg-red-500/5", amber: "border-amber-500/30 bg-amber-500/5",
                purple: "border-purple-500/30 bg-purple-500/5",
              };
              const textColors: Record<string, string> = {
                red: "text-red-400", amber: "text-amber-400", purple: "text-purple-400",
              };
              return (
                <div key={layer.title} className={`rounded-xl border p-6 space-y-3 ${colors[layer.color]}`}>
                  <div className="flex items-center gap-3">
                    <span className={textColors[layer.color]}>{layer.icon}</span>
                    <h3 className={`text-lg font-bold ${textColors[layer.color]}`} style={mono}>{layer.title}</h3>
                  </div>
                  <p className="text-sm text-white/60">{layer.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-lg font-bold text-green-400 mb-3" style={mono}>EARLY WARNING PIPELINE</h3>
            <div className="flex items-center gap-3 flex-wrap text-sm" style={mono}>
              {["FETCH WEATHER", "→", "Open-Meteo API", "→", "weather_readings", "→", "RUN DETECTION", "→", "IDF + Drainage check", "→", "Auto Alerts"].map((t, i) => (
                <span key={i} className={t === "→" ? "text-cyan-400 text-lg" : "px-3 py-1.5 rounded-lg bg-white/5 text-white/70"}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 4. ALERTS */
  {
    title: "Alerts System",
    tab: "Alerts /alerts",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<AlertTriangle size={28} />} title="AUTOMATED ALERTS" subtitle="3 detection types — all auto-generated by detect-bottlenecks function" />
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Droplets size={24} className="text-red-400" />
                <h3 className="text-xl font-bold text-red-400" style={mono}>FLOOD</h3>
              </div>
              <FormulaCard label="Trigger" formula="rain > IDF[period][30min]" desc="Checks 4 return periods: 6mo, 1yr, 2yr, 5yr" />
              <p className="text-sm text-white/50">Severity: advisory → moderate → major → catastrophic</p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-amber-400" />
                <h3 className="text-xl font-bold text-amber-400" style={mono}>BOTTLENECK</h3>
              </div>
              <FormulaCard label="Trigger" formula="rain > design×0.7 ∧ cap < 60%" desc="Design intensity from IDF at 60-min for drain's return period" />
              <p className="text-sm text-white/50">Also flags capacity &lt; 40% regardless of rain</p>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-purple-400" />
                <h3 className="text-xl font-bold text-purple-400" style={mono}>ENCROACHMENT</h3>
              </div>
              <FormulaCard label="Trigger" formula="zone='PR' ∧ level > 80%" desc="Protected Reserve zones from Kadapa Master Plan G.O.Ms.No.39" />
              <p className="text-sm text-white/50">Detects violations in water body setbacks</p>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 5. WEATHER */
  {
    title: "Weather Integration",
    tab: "Weather /weather",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<CloudRain size={28} />} title="LIVE WEATHER" subtitle="Open-Meteo API integration — free, no API key required" />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3" style={mono}>API ENDPOINT</h3>
                <div className="rounded-lg bg-black/40 p-4">
                  <code className="text-xs text-cyan-300 break-all" style={mono}>
                    GET api.open-meteo.com/v1/forecast<br />
                    ?latitude=14.4674&longitude=78.8241<br />
                    &current=temperature,humidity,precipitation,<br />
                    pressure,wind_speed,wind_direction<br />
                    &hourly=precipitation&timezone=Asia/Kolkata
                  </code>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3" style={mono}>RAINFALL CLASSIFICATION</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "LIGHT", range: "< 10 mm/hr", color: "text-green-400" },
                    { label: "MODERATE", range: "10-40 mm/hr", color: "text-amber-400" },
                    { label: "HEAVY", range: "40-80 mm/hr", color: "text-red-400" },
                    { label: "EXTREME", range: "> 80 mm/hr", color: "text-red-600" },
                  ].map(r => (
                    <div key={r.label} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className={`text-sm font-bold ${r.color}`} style={mono}>{r.label}</p>
                      <p className="text-xs text-white/50">{r.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3" style={mono}>6 FIELDS STORED</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["rainfall_mm_hr", "temperature_c", "humidity_pct", "pressure_hpa", "wind_speed_kmh", "wind_direction"].map(f => (
                    <div key={f} className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                      <p className="text-xs font-bold text-cyan-400" style={mono}>{f}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-amber-400 mb-3" style={mono}>HISTORICAL RAINFALL</h3>
                <div className="grid grid-cols-3 gap-3">
                  <StatBox label="Years" value="16" color="amber" />
                  <StatBox label="Records" value="2000+" color="amber" />
                  <StatBox label="Durations" value="9" color="amber" />
                </div>
                <p className="text-xs text-white/40 mt-3">5, 10, 15, 30, 45, 60, 90, 120, 180 min intensities</p>
              </div>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 6. ANALYTICS */
  {
    title: "Analytics & Simulation",
    tab: "Analytics /analytics",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<BarChart3 size={28} />} title="FLOOD ANALYTICS" subtitle="Scenario simulator + IDF curves + population analysis" />
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
              <h3 className="text-xl font-bold text-amber-400" style={mono}>⚡ FLOOD SIMULATOR</h3>
              <p className="text-sm text-white/60">What-if analysis: select return period + duration → simulate drainage impact</p>
              <div className="space-y-2">
                <FormulaCard label="Overflow Ratio" formula="ratio = storm / designIntensity" desc="Compare simulated vs drain design capacity" />
                <FormulaCard label="Capacity Degradation" formula="cap × (1 - (ratio-1) × 0.3)" desc="30% degradation per unit excess overflow" />
                <FormulaCard label="Population Exposure" formula="Σ pop WHERE density > 3000" desc="Sum projected population at high-density areas" />
              </div>
            </div>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6 space-y-4">
              <h3 className="text-xl font-bold text-cyan-400" style={mono}>📈 IDF CURVES</h3>
              <p className="text-sm text-white/60">Intensity-Duration-Frequency analysis — core hydrological tool</p>
              <FormulaCard label="Power Law Regression" formula="i = a × t^n" desc="i=intensity, t=duration, a & n = regression coefficients" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <StatBox label="Data Points" value="36" color="cyan" />
                <StatBox label="Return Periods" value="4" color="cyan" />
              </div>
              <p className="text-xs text-white/40">9 durations × 4 return periods (6mo, 1yr, 2yr, 5yr)</p>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 7. AI PREDICTION */
  {
    title: "AI Prediction Engine",
    tab: "AI /ai-models",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-6">
          <SectionTitle icon={<Brain size={28} />} title="AI PREDICTION ENGINE" subtitle="HARYAK AI — 8-table data fusion → structured risk assessment" />
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-1 rounded-xl bg-white/5 border border-white/10 p-5 space-y-3">
              <h3 className="text-sm font-bold text-cyan-400" style={mono}>AI PIPELINE</h3>
              {["1. Invoke flood-predict", "2. Fetch 8 tables parallel", "3. Build comprehensive prompt", "4. Send to Gemini 3 Flash", "5. Tool calling (JSON)", "6. Store with 6hr expiry", "7. Return structured result"].map(s => (
                <div key={s} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <ArrowRight size={10} className="text-cyan-400 shrink-0" />
                  <span className="text-xs text-white/70">{s}</span>
                </div>
              ))}
            </div>
            <div className="col-span-1 space-y-4">
              <FormulaCard label="Risk Score" formula="0.30×R + 0.25×D + 0.20×P + 0.25×IDF" desc="Weighted composite: Rainfall, Drainage, Population, IDF" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { l: "0-24", t: "LOW", c: "text-green-400" },
                  { l: "25-49", t: "MEDIUM", c: "text-amber-400" },
                  { l: "50-74", t: "HIGH", c: "text-red-400" },
                  { l: "75-100", t: "CRITICAL", c: "text-red-600" },
                ].map(r => (
                  <div key={r.t} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                    <p className={`text-sm font-bold ${r.c}`} style={mono}>{r.t}</p>
                    <p className="text-[10px] text-white/40">{r.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-1 space-y-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="text-sm font-bold text-cyan-400 mb-3" style={mono}>PREDICTION HORIZONS</h3>
                {[
                  { h: "6 HOUR", icon: <Clock size={14} />, c: "text-amber-400 border-amber-500/20 bg-amber-500/5" },
                  { h: "24 HOUR", icon: <TrendingUp size={14} />, c: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5" },
                  { h: "72 HOUR", icon: <Activity size={14} />, c: "text-purple-400 border-purple-500/20 bg-purple-500/5" },
                ].map(t => (
                  <div key={t.h} className={`p-3 rounded-lg border mb-2 ${t.c}`}>
                    <div className="flex items-center gap-2">
                      {t.icon}
                      <span className="text-sm font-bold" style={mono}>{t.h}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                <h3 className="text-sm font-bold text-cyan-400 mb-2" style={mono}>OUTPUT JSON</h3>
                <pre className="text-[10px] text-white/50" style={mono}>{`{
  overall_risk_score: 0-100,
  risk_level: "...",
  zone_predictions: [...],
  recommendations: [...],
  six_hour_forecast: "...",
  twenty_four_hour: "...",
  seventy_two_hour: "..."
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 8. DATA SOURCES */
  {
    title: "Data Sources",
    tab: "Data /data-sources",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<Database size={28} />} title="DATA SOURCES" subtitle="S3 storage + ingestion pipeline → 12 PostgreSQL tables" />
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
              <h3 className="text-lg font-bold text-cyan-400" style={mono}>8 SHEETS INGESTED</h3>
              {[
                { s: "DRF-Analysis (Rainfall)", t: "historical_rainfall", d: "2000+ rows, 16 years" },
                { s: "Storm Frequency (4 sheets)", t: "storm_frequency", d: "6mo, 1yr, 2yr, 5yr return periods" },
                { s: "Population Projections", t: "population_data", d: "Census 1971-2011" },
                { s: "Sub Division Wise", t: "subdivision_population", d: "Area, density, projections" },
                { s: "Ward Census", t: "ward_projections", d: "Ward-level growth rates" },
              ].map(item => (
                <div key={item.s} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <FileText size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-white/80">{item.s}</span>
                    <span className="text-xs text-cyan-400 ml-2" style={mono}>→ {item.t}</span>
                    <p className="text-xs text-white/40">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-4" style={mono}>INGESTION PIPELINE</h3>
                <div className="flex items-center gap-2 flex-wrap" style={mono}>
                  {["Raw Excel", "→", "S3 Bucket", "→", "ingest-xlsx", "→", "Parse", "→", "PostgreSQL", "→", "Dashboard"].map((t, i) => (
                    <span key={i} className={t === "→" ? "text-cyan-400 text-lg" : "px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs"}>{t}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Tables" value="12" color="cyan" />
                <StatBox label="Functions" value="5" color="purple" />
                <StatBox label="PDFs" value="8" color="green" />
              </div>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 9. REPORTS */
  {
    title: "Reports & Docs",
    tab: "Reports /reports",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<FileText size={28} />} title="REPORTS & DOCUMENTATION" subtitle="Source documents, G.O. references, and PDF data sheets" />
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-6 space-y-4">
              <h3 className="text-lg font-bold text-cyan-400" style={mono}>REGULATORY</h3>
              {["Kadapa Master Plan G.O.Ms.No.39 (2023)", "Zoning Regulations Map"].map(d => (
                <div key={d} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/70">{d}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
              <h3 className="text-lg font-bold text-amber-400" style={mono}>RAINFALL DATA</h3>
              {["DRF Analysis (A3 format)", "Rainfall Analysis (A4)", "Storm Frequency Tables"].map(d => (
                <div key={d} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-white/70">{d}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-6 space-y-4">
              <h3 className="text-lg font-bold text-green-400" style={mono}>TRACEABILITY</h3>
              <p className="text-sm text-white/60">Every data point traceable to official source documents.</p>
              <p className="text-sm text-white/60">All PDFs viewable in-app with download option.</p>
              <p className="text-sm text-white/60">Migration SQL script for portability.</p>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 10. ARCHITECTURE */
  {
    title: "Tech Architecture",
    tab: "Architecture",
    content: (
      <SlideLayout>
        <div className="p-16 space-y-8">
          <SectionTitle icon={<Code size={28} />} title="TECHNICAL ARCHITECTURE" subtitle="Full-stack platform built with modern technologies" />
          <div className="grid grid-cols-4 gap-4">
            {[
              { l: "Frontend", t: "React + TypeScript + Tailwind", c: "cyan" },
              { l: "Backend", t: "Lovable Cloud Edge Functions", c: "purple" },
              { l: "Database", t: "PostgreSQL (12 tables)", c: "green" },
              { l: "Maps/GIS", t: "Leaflet + leaflet.heat", c: "amber" },
              { l: "AI Model", t: "Google Gemini 3 Flash", c: "cyan" },
              { l: "Charts", t: "Recharts", c: "purple" },
              { l: "Weather API", t: "Open-Meteo (free)", c: "green" },
              { l: "Real-time", t: "PostgreSQL Subscriptions", c: "amber" },
            ].map(t => (
              <StatBox key={t.l} label={t.l} value={t.t} color={t.c} />
            ))}
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4" style={mono}>5 BACKEND FUNCTIONS</h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { n: "fetch-weather", d: "Open-Meteo → DB" },
                { n: "detect-bottlenecks", d: "4-pass detection" },
                { n: "flood-predict", d: "AI risk engine" },
                { n: "ingest-xlsx", d: "Data ingestion" },
                { n: "s3-bridge", d: "File storage" },
              ].map(fn => (
                <div key={fn.n} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
                  <p className="text-xs font-bold text-cyan-400" style={mono}>{fn.n}</p>
                  <p className="text-[10px] text-white/40 mt-1">{fn.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },

  /* 11. THANK YOU */
  {
    title: "Thank You",
    tab: "Closing",
    content: (
      <SlideLayout bg="from-[#050a14] via-[#0a1628] to-[#0f1d32]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-10">
            <div className="space-y-4">
              <h1 className="text-7xl font-black text-white" style={mono}>THANK YOU!</h1>
              <p className="text-2xl text-white/40">Questions & Discussion</p>
            </div>
            <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { i: "✅", t: "AI Flood Prediction" },
                { i: "✅", t: "GIS Mapping" },
                { i: "✅", t: "Automated Alerts" },
                { i: "✅", t: "IDF Analysis" },
                { i: "✅", t: "Live Weather" },
                { i: "✅", t: "Encroachment Detection" },
                { i: "✅", t: "Flood Simulation" },
                { i: "✅", t: "Real Database" },
              ].map(r => (
                <div key={r.t} className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-400">{r.i} {r.t}</p>
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <Droplets size={32} className="text-cyan-400" />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white" style={mono}>AI FLOOD GUARD</h3>
                <p className="text-sm text-white/50">Thiru · Haryak Technologies</p>
              </div>
            </div>
          </div>
        </div>
      </SlideLayout>
    ),
  },
];

/* ─── MAIN PRESENTATION COMPONENT ─── */
const PresentationPage = () => {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const goNext = useCallback(() => setCurrent(s => Math.min(slides.length - 1, s + 1)), []);
  const goPrev = useCallback(() => setCurrent(s => Math.max(0, s - 1)), []);

  // Scale calculation
  useEffect(() => {
    const calc = () => {
      if (!containerRef.current) return;
      const { clientWidth: w, clientHeight: h } = containerRef.current;
      setScale(Math.min(w / 1920, h / 1080));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [isFullscreen]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") setIsFullscreen(false);
      if (e.key === "f" || e.key === "F") setIsFullscreen(f => !f);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  // Fullscreen API
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(f => !f);
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className={`${isFullscreen ? "fixed inset-0 z-[9999]" : "min-h-screen"} bg-[#030712] flex flex-col`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0e1a] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Droplets size={18} className="text-cyan-400" />
          <span className="text-sm font-bold text-white/80" style={mono}>AI FLOOD GUARD — PRESENTATION</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40" style={mono}>
            {current + 1} / {slides.length} · {slides[current].title}
          </span>
          <button onClick={toggleFullscreen} className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition">
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-1 px-4 py-2 bg-[#060b16] border-b border-white/5 overflow-x-auto shrink-0">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`shrink-0 px-3 py-1.5 rounded text-[10px] transition-all border ${
              i === current
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                : "bg-white/5 text-white/30 border-white/5 hover:text-white/60"
            }`}
            style={mono}
          >
            {i + 1}. {s.tab}
          </button>
        ))}
      </div>

      {/* Slide Canvas */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[#030712]">
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: 1920,
            height: 1080,
            marginLeft: -960,
            marginTop: -540,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          {slides[current].content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0a0e1a] border-t border-white/10 shrink-0">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition disabled:opacity-20 text-xs font-bold"
          style={mono}
        >
          <ChevronLeft size={14} /> PREV
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "bg-cyan-400 w-8" : "bg-white/20 w-1.5 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={current === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition disabled:opacity-20 text-xs font-bold"
          style={mono}
        >
          NEXT <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PresentationPage;
