import { useState, useEffect, useCallback } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { 
  ChevronRight, ChevronLeft, Target, Database, Brain, Map, AlertTriangle, 
  CloudRain, BarChart3, FileText, Zap, Shield, Users, Droplets, Layers,
  CheckCircle2, ArrowRight, Lightbulb, Code, Globe, Cpu, Mic, 
  Monitor, Play, Pause, Maximize2
} from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

/* ─── Reusable sub-components ──────────────────────────────── */
const TalkingPoint = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
    <Mic size={14} className="text-primary shrink-0 mt-0.5" />
    <p className="text-sm text-foreground/90 leading-relaxed italic">{children}</p>
  </div>
);

const ShowAction = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
    <Monitor size={14} className="text-warning shrink-0" />
    <span className="text-xs font-semibold text-warning uppercase" style={monoFont}>SHOW ON SCREEN:</span>
    <span className="text-xs text-foreground/80">{children}</span>
  </div>
);

const FormulaBlock = ({ label, formula, explanation }: { label: string; formula: string; explanation: string }) => (
  <div className="rounded-lg bg-secondary/40 border border-border/30 p-3 space-y-1">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider" style={monoFont}>{label}</p>
    <p className="text-sm font-bold text-primary" style={monoFont}>{formula}</p>
    <p className="text-[10px] text-muted-foreground">{explanation}</p>
  </div>
);

const DataFlow = ({ items }: { items: string[] }) => (
  <div className="flex items-center gap-1 flex-wrap text-[10px]" style={monoFont}>
    {items.map((item, i) => (
      <span key={i} className={item === "→" ? "text-primary font-bold" : "px-2 py-1 rounded bg-secondary/40 text-foreground"}>
        {item}
      </span>
    ))}
  </div>
);

const KeyPoint = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-bold text-primary" style={monoFont}>{value}</span>
  </div>
);

/* ─── SLIDES ───────────────────────────────────────────────── */
interface Slide {
  id: number;
  title: string;
  duration: string;
  tab: string;
  content: React.ReactNode;
}

const slides: Slide[] = [
  /* ── SLIDE 1: INTRO ── */
  {
    id: 1,
    title: "Introduction",
    duration: "~1 min",
    tab: "Start",
    content: (
      <div className="space-y-6">
        <div className="text-center space-y-4 py-6">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <Droplets size={28} className="text-primary" />
            <div className="text-left">
              <h2 className="text-xl font-bold text-foreground" style={monoFont}>AI FLOOD GUARD</h2>
              <p className="text-xs text-muted-foreground">AI-Based Stormwater Network Mapping & Flood Risk Monitoring</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Kadapa Municipal Corporation, Andhra Pradesh</p>
        </div>

        <TalkingPoint>
          "Hi Everyone! This is <strong>Thiru from Haryak Technologies</strong>, and today we are presenting our solution for <strong>AI Flood Guard</strong> — an AI-based geospatial platform for stormwater network mapping and flood risk monitoring. We've built this for <strong>Kadapa Municipal Corporation</strong> in Andhra Pradesh as our pilot region."
        </TalkingPoint>

        <TalkingPoint>
          "The problem is simple but critical — Urban Local Bodies across Andhra Pradesh have <strong>no digital mapping</strong> of stormwater drainage networks. Everything is on paper or CAD. There's <strong>no real-time flood prediction</strong>, no automated bottleneck detection, and no integration between weather data and drainage infrastructure. When flooding happens, the response is reactive — not proactive."
        </TalkingPoint>

        <TalkingPoint>
          "Our solution brings <strong>AI + GIS + Real-time Data</strong> together. We have <strong>7 active flood zones</strong> (critical + high risk) out of 14 total mapped zones, <strong>8 drainage segments</strong> with real capacity data, <strong>16 years of historical rainfall</strong> analyzed with IDF curves, and a <strong>live weather feed</strong> from the Open-Meteo API. Let me walk you through it tab by tab."
        </TalkingPoint>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Active Flood Zones", value: "7 active" },
            { label: "Drainage Segments", value: "8 real" },
            { label: "Historical Data", value: "16 years" },
            { label: "Database Tables", value: "12 tables" },
            { label: "Edge Functions", value: "5 backend" },
            { label: "AI Model", value: "Gemini 3 Flash" },
            { label: "Weather API", value: "Open-Meteo" },
            { label: "IDF Return Periods", value: "6m, 1y, 2y, 5y" },
          ].map(s => (
            <div key={s.label} className="p-2.5 rounded-lg bg-secondary/20 border border-border/20 text-center">
              <p className="text-[10px] text-muted-foreground" style={monoFont}>{s.label}</p>
              <p className="text-sm font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* ── SLIDE 2: DASHBOARD ── */
  {
    id: 2,
    title: "Dashboard — Live Overview",
    duration: "~2 min",
    tab: "Dashboard (/)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Dashboard (Home page /)</ShowAction>

        <TalkingPoint>
          "This is our main dashboard. Let me explain what you see here — every single number is coming from a <strong>real database</strong>, not hardcoded."
        </TalkingPoint>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2" style={monoFont}>
            <CloudRain size={14} className="text-primary" /> TOP BAR — LIVE WEATHER
          </h4>
          <TalkingPoint>
            "At the top, you can see a live weather badge — it currently says <strong>LIGHT RAIN · X mm/hr</strong>. This is real-time data for Kadapa city, coordinates <strong>14.4674°N, 78.8241°E</strong>. It's pulled from the Open-Meteo API (free, no API key required) and stored in our <code>weather_readings</code> database table. The classification is: LIGHT (&lt;10 mm/hr), MODERATE (10-40), HEAVY (40-80), EXTREME (&gt;80)."
          </TalkingPoint>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2" style={monoFont}>
            <BarChart3 size={14} className="text-warning" /> 8 STAT CARDS — ALL FROM DATABASE
          </h4>
          <TalkingPoint>
            "These 8 cards each pull from a different database table. Let me explain each one..."
          </TalkingPoint>
          <div className="space-y-1.5">
            {[
              { card: "Active Flood Zones (7)", source: "flood_zones table", logic: "Count WHERE risk = 'critical' OR 'high'" },
              { card: "Alerts Active", source: "flood_alerts table", logic: "Count WHERE is_active = true" },
              { card: "Avg Drainage Capacity", source: "drainage_segments table", logic: "AVG(capacity) across all 8 segments" },
              { card: "Population", source: "population_data table", logic: "Latest census year row (2011)" },
              { card: "Current Rainfall", source: "weather_readings table", logic: "Latest timestamp reading" },
              { card: "Historical Max", source: "historical_rainfall table", logic: "MAX(daily_rainfall_mm) from 16-year record" },
              { card: "IDF Curves Available", source: "idf_records table", logic: "Count of return periods with data" },
              { card: "AI Predictions", source: "ai_predictions table", logic: "Total stored prediction records" },
            ].map(c => (
              <div key={c.card} className="flex items-start gap-2 p-2 rounded bg-secondary/20">
                <CheckCircle2 size={10} className="text-success shrink-0 mt-1" />
                <div>
                  <span className="text-xs font-semibold text-foreground">{c.card}</span>
                  <span className="text-[10px] text-primary ml-2" style={monoFont}>← {c.source}</span>
                  <p className="text-[10px] text-muted-foreground">{c.logic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2" style={monoFont}>
            <AlertTriangle size={14} className="text-destructive" /> LIVE ALERTS — AUTO-GENERATED
          </h4>
          <TalkingPoint>
            "These alerts are NOT manually created. They're <strong>auto-generated</strong> by our <code>detect-bottlenecks</code> backend function. It compares real-time rainfall against IDF thresholds and drainage capacity. Three types: <strong>Flood alerts</strong> (rainfall exceeds IDF return period), <strong>Bottleneck alerts</strong> (drain capacity below 60% AND rainfall exceeds 70% of design intensity), and <strong>Encroachment alerts</strong> (Protected Reserve zones with flood index &gt;80%)."
          </TalkingPoint>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2" style={monoFont}>
            <Layers size={14} className="text-warning" /> DRAINAGE NETWORK CAPACITY
          </h4>
          <TalkingPoint>
            "This shows all 8 drainage segments from the <code>drainage_segments</code> table — Pennar River Main, Buggavanka Nala, Gandikota Road Drain, and 5 more. Each one shows the real <strong>capacity percentage</strong>, <strong>catchment area</strong>, <strong>design return period</strong>, and <strong>length</strong>. Color coding: Red (&lt;35% critical), Orange (35-50% high), Yellow (50-70% medium), Green (&gt;70% good)."
          </TalkingPoint>
        </div>
      </div>
    ),
  },

  /* ── SLIDE 3: MAP ── */
  {
    id: 3,
    title: "GIS Map — 4 Interactive Layers",
    duration: "~2 min",
    tab: "Map View (/map)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Map View tab</ShowAction>

        <TalkingPoint>
          "This is our GIS map, built with <strong>Leaflet</strong> and <strong>leaflet.heat</strong>. It's centered on Kadapa at <strong>14.4674°N, 78.8241°E</strong>. We have <strong>4 toggleable layers</strong> — let me switch each one on and explain."
        </TalkingPoint>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-panel p-3 space-y-2">
            <h4 className="text-xs font-bold text-destructive flex items-center gap-2" style={monoFont}>
              <Droplets size={12} /> LAYER 1: FLOOD HEATMAP
            </h4>
            <TalkingPoint>
              "Each of the <strong>14 total flood zones</strong> generates a heat point on the map (all risk levels shown). The <strong>7 active zones</strong> (critical + high) match the dashboard count. The intensity is calculated as <strong>zone.level / 100</strong> — so a zone with risk level 85 shows as intensity 0.85. Gradient goes green → yellow → red."
            </TalkingPoint>
            <FormulaBlock label="Heat Intensity" formula="intensity = zone.level / 100" explanation="Risk level 0-100 normalized to 0-1 for heatmap gradient" />
          </div>

          <div className="glass-panel p-3 space-y-2">
            <h4 className="text-xs font-bold text-warning flex items-center gap-2" style={monoFont}>
              <Zap size={12} /> LAYER 2: DRAINAGE NETWORK
            </h4>
            <TalkingPoint>
              "These polylines show the actual drainage network — 8 segments drawn along real Kadapa coordinates. Color depends on the status from the database: critical drains are <strong>red dashed lines</strong>, high-risk are orange, medium yellow, and functioning drains are green."
            </TalkingPoint>
          </div>

          <div className="glass-panel p-3 space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
              <AlertTriangle size={12} className="text-destructive" /> LAYER 3: BOTTLENECK MARKERS
            </h4>
            <TalkingPoint>
              "These circular markers appear at drains with <strong>capacity below 50%</strong>. They show the exact capacity percentage. Data comes from the <code>drainage_segments</code> table, filtered by <code>WHERE capacity &lt; 50</code>."
            </TalkingPoint>
          </div>

          <div className="glass-panel p-3 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-2" style={monoFont}>
              <Users size={12} /> LAYER 4: POPULATION DENSITY
            </h4>
            <TalkingPoint>
              "This heatmap shows population density from the <code>subdivision_population</code> table. We normalize density: <strong>min(1, density / 20,000)</strong>. Blue-to-red gradient — high-density areas appear redder, showing where more people are at risk."
            </TalkingPoint>
            <FormulaBlock label="Normalization" formula="normalized = min(1, density / 20,000)" explanation="Density per sq.km against 20,000 ceiling" />
          </div>
        </div>

        <div className="glass-panel p-3 space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Shield size={12} className="text-success" /> EARLY WARNING SYSTEM
          </h4>
          <TalkingPoint>
            "On this page we also have the Early Warning panel. It has two buttons: <strong>FETCH LIVE WEATHER</strong> pulls real-time data from Open-Meteo API into our database. Then <strong>RUN DETECTION</strong> triggers the bottleneck detection engine that checks rainfall against IDF thresholds and drainage capacity, auto-generating alerts."
          </TalkingPoint>
          <DataFlow items={["Click FETCH WEATHER", "→", "Open-Meteo API", "→", "weather_readings table", "→", "Click RUN DETECTION", "→", "Compare vs IDF + Drainage", "→", "Auto-generate Alerts"]} />
        </div>
      </div>
    ),
  },

  /* ── SLIDE 4: ALERTS ── */
  {
    id: 4,
    title: "Alerts — Automated Detection",
    duration: "~1.5 min",
    tab: "Alerts (/alerts)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Alerts tab</ShowAction>

        <TalkingPoint>
          "This is our alert management system. All alerts are stored in the <code>flood_alerts</code> database table. Three types are auto-generated by our <strong>detect-bottlenecks</strong> backend function."
        </TalkingPoint>

        <div className="space-y-3">
          <div className="glass-panel p-4 space-y-2">
            <h4 className="text-xs font-bold text-destructive flex items-center gap-2" style={monoFont}>
              <Droplets size={12} /> FLOOD ALERTS
            </h4>
            <p className="text-xs text-foreground/80">Generated when current rainfall exceeds IDF return period thresholds at 30-min duration.</p>
            <FormulaBlock label="Trigger Logic" formula="IF rainfall > IDF[returnPeriod][30min] → FLOOD ALERT" explanation="Checks against 4 return periods: 6-month (advisory), 1-year (moderate), 2-year (major), 5-year (catastrophic)" />
          </div>

          <div className="glass-panel p-4 space-y-2">
            <h4 className="text-xs font-bold text-warning flex items-center gap-2" style={monoFont}>
              <Zap size={12} /> BOTTLENECK ALERTS
            </h4>
            <p className="text-xs text-foreground/80">Generated when a drain is overwhelmed.</p>
            <FormulaBlock label="Trigger Logic" formula="IF rainfall > designIntensity × 0.7 AND capacity < 60% → BOTTLENECK" explanation="Design intensity = IDF value at 60-min for the drain's design return period. Also flags drains with capacity <40% regardless of rain." />
          </div>

          <div className="glass-panel p-4 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center gap-2" style={monoFont}>
              <Shield size={12} /> ENCROACHMENT ALERTS
            </h4>
            <p className="text-xs text-foreground/80">Flags Protected Reserve zones at risk.</p>
            <FormulaBlock label="Trigger Logic" formula="IF zone_code = 'PR' AND level > 80% → ENCROACHMENT ALERT" explanation="Protected Reserve zones (from Kadapa Master Plan G.O.Ms.No.39) with flood index >80% — potential encroachment on drain embankments" />
          </div>
        </div>

        <TalkingPoint>
          "So these are not manual alerts — the system <strong>automatically detects</strong> flooding risks, drainage bottlenecks, and encroachments by cross-referencing live weather, IDF curves, drainage capacity, and zoning data. This is the AI-driven automated detection the problem statement asked for."
        </TalkingPoint>
      </div>
    ),
  },

  /* ── SLIDE 5: WEATHER ── */
  {
    id: 5,
    title: "Weather — Live Integration",
    duration: "~1 min",
    tab: "Weather (/weather)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Weather tab → Click FETCH LIVE DATA</ShowAction>

        <TalkingPoint>
          "Here we have our live weather integration. When I click <strong>FETCH LIVE DATA</strong>, it calls our backend function which hits the <strong>Open-Meteo API</strong> — this is a free, no-API-key-required weather service. We fetch current conditions plus 24 hours of hourly data for Kadapa."
        </TalkingPoint>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Globe size={14} className="text-primary" /> API CALL
          </h4>
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-[10px] text-primary break-all" style={monoFont}>
              GET api.open-meteo.com/v1/forecast?latitude=14.4674&longitude=78.8241
              &current=temperature_2m,humidity,precipitation,pressure,wind_speed,wind_direction
              &hourly=precipitation&timezone=Asia/Kolkata
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["rainfall_mm_hr", "temperature_c", "humidity_pct", "pressure_hpa", "wind_speed_kmh", "wind_direction"].map(f => (
              <div key={f} className="p-1.5 rounded bg-secondary/20 text-center">
                <p className="text-[10px] font-bold text-primary" style={monoFont}>{f}</p>
              </div>
            ))}
          </div>
        </div>

        <TalkingPoint>
          "The historical rainfall section shows <strong>16 years of data</strong> from Kadapa's autographic rain gauge station — over 2,000 records. Each record includes daily rainfall and intensity breakdowns at 9 different durations (5, 10, 15, 30, 45, 60, 90, 120, 180 minutes). This is the foundation for our IDF curves."
        </TalkingPoint>
      </div>
    ),
  },

  /* ── SLIDE 6: ANALYTICS ── */
  {
    id: 6,
    title: "Analytics — Flood Simulator & IDF",
    duration: "~2.5 min",
    tab: "Analytics (/analytics)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Analytics tab</ShowAction>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Zap size={14} className="text-warning" /> FLOOD SCENARIO SIMULATOR
          </h4>
          <TalkingPoint>
            "This is our <strong>What-If Analysis Engine</strong>. I can select a storm return period — say <strong>5-year return</strong> — and a duration — say <strong>30 minutes</strong> — and it simulates what would happen to Kadapa's drainage network. <strong>All calculations use real IDF curve data</strong> from our database, not assumptions."
          </TalkingPoint>

          <ShowAction>Select "5 Years" return period and "30 min" duration, click SIMULATE</ShowAction>

          <p className="text-xs font-bold text-foreground mt-3" style={monoFont}>HERE ARE THE EXACT FORMULAS:</p>

          <div className="space-y-2">
            <FormulaBlock label="Step 1: Rainfall Intensity Lookup" formula="intensity = IDF_table[returnPeriod][duration]" explanation="Look up exact mm/hr from idf_records table. E.g., 5-year return, 30-min = the stored intensity value." />
            <FormulaBlock label="Step 2: Drain Overflow Ratio" formula="overflowRatio = simulatedIntensity / designIntensity" explanation="Compare storm intensity vs each drain's design capacity (IDF at 60-min for the drain's design return period)." />
            <FormulaBlock label="Step 3: Capacity Degradation" formula="simCapacity = max(0, min(100, capacity × (1 - (overflowRatio - 1) × 0.3)))" explanation="If overflow ratio > 1 (storm exceeds design), capacity degrades by 30% per unit excess. Clamped 0-100%." />
            <FormulaBlock label="Step 4: Zone Risk Multiplier" formula="simRisk = min(100, baseRisk × multiplier)" explanation="Multiplier: 1.4× if intensity > 80 mm/hr, 1.2× if > 50, 1.1× if > 30." />
            <FormulaBlock label="Step 5: Population Exposure" formula="exposed = Σ population WHERE density > 3000/sq.km" explanation="Sum projected 2025 population for all high-density subdivisions." />
            <FormulaBlock label="Step 6: Overall Risk" formula="risk = criticalZones ≥ 3 ? CRITICAL : ≥ 1 ? HIGH : overflowDrains ≥ 2 ? MEDIUM : LOW" explanation="Based on count of zones exceeding critical threshold and overflowing drains." />
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <BarChart3 size={14} className="text-primary" /> IDF CURVES (INTENSITY-DURATION-FREQUENCY)
          </h4>
          <TalkingPoint>
            "Scroll down to see our IDF analysis. This is the <strong>core hydrological tool</strong>. The chart shows how rainfall intensity varies with storm duration for 4 return periods. We fit a <strong>power law regression</strong> to the data."
          </TalkingPoint>
          <FormulaBlock label="IDF Power Law" formula="i = a × t^n" explanation="i = intensity (mm/hr), t = duration (min), a = coefficient, n = exponent. Each return period has its own a, n, R² values. High R² ≈ excellent fit." />
          <p className="text-xs text-muted-foreground">9 durations × 4 return periods = 36 real data points from Kadapa's meteorological records.</p>
        </div>
      </div>
    ),
  },

  /* ── SLIDE 7: AI PREDICTION ── */
  {
    id: 7,
    title: "AI Prediction Engine",
    duration: "~2.5 min",
    tab: "AI Prediction (/ai-models)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to AI Prediction tab → Click RUN PREDICTION</ShowAction>

        <TalkingPoint>
          "This is the heart of our system. When I click <strong>RUN PREDICTION</strong>, here's exactly what happens behind the scenes..."
        </TalkingPoint>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Brain size={14} className="text-primary" /> AI PIPELINE — STEP BY STEP
          </h4>
          <div className="space-y-2">
            {[
              { step: "1", text: "Backend function flood-predict is invoked" },
              { step: "2", text: "It fetches ALL data from 8 database tables simultaneously (parallel queries)" },
              { step: "3", text: "Builds a comprehensive prompt: current weather, 16-year historical rainfall, population data, drainage capacity, IDF thresholds, active alerts" },
              { step: "4", text: "Sends everything to Google Gemini 3 Flash AI model via Lovable AI Gateway" },
              { step: "5", text: "Uses TOOL CALLING (structured JSON output) — NOT free-text — to get a strict schema response" },
              { step: "6", text: "Stores the prediction in ai_predictions table with 6-hour expiry" },
              { step: "7", text: "Returns structured result to the frontend for display" },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3 p-2 rounded-lg bg-secondary/20">
                <span className="text-xs font-bold text-primary shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center" style={monoFont}>{s.step}</span>
                <span className="text-xs text-foreground/80">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Database size={14} className="text-primary" /> DATA SENT TO AI
          </h4>
          <TalkingPoint>
            "The AI doesn't guess — it receives <strong>real data from 8 tables</strong>: last 10 weather readings, top 20 historical rainfall events, population census from 1971-2011, top 5 densest areas with projections, all 14 flood zones, all 8 drainage segments, active alert count, and IDF thresholds at 30-min and 60-min for all return periods."
          </TalkingPoint>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Code size={14} className="text-primary" /> AI OUTPUT — STRUCTURED JSON (TOOL CALLING)
          </h4>
          <TalkingPoint>
            "The AI returns a strict JSON structure — not free text. Here's the exact schema we enforce via tool calling..."
          </TalkingPoint>
          <div className="rounded-lg bg-secondary/40 border border-border/30 p-3">
            <pre className="text-[10px] text-foreground/80 overflow-x-auto" style={monoFont}>{`{
  "overall_risk_score": 0-100,       // Composite score
  "risk_level": "critical|high|medium|low",
  "summary": "2-3 sentence assessment",
  "confidence": 0.0-1.0,
  "zone_predictions": [
    { "zone_name": "Pennar Riverbed",
      "predicted_risk": 85,
      "trend": "rising|stable|falling",
      "reasoning": "Why this zone is at risk" }
  ],
  "recommendations": ["Action items for ULB"],
  "six_hour_forecast": "Prediction text"
}`}</pre>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Target size={14} className="text-destructive" /> HOW RISK SCORE IS DEFINED
          </h4>
          <TalkingPoint>
            "The 0-100 risk score is NOT a random number. The AI weighs: how close is current rainfall to the historical maximum? How many drains are at capacity? What's the population exposure in critical zones? Are IDF thresholds being exceeded? The result is: <strong>Critical (≥75)</strong>, <strong>High (50-74)</strong>, <strong>Medium (25-49)</strong>, <strong>Low (&lt;25)</strong>."
          </TalkingPoint>
          <FormulaBlock label="Risk Score" formula="Score = f(rainfall, historicalMax, drainageCapacity, populationDensity, IDF_exceedance)" explanation="AI analyzes all factors holistically. Zone predictions show individual reasoning." />
        </div>
      </div>
    ),
  },

  /* ── SLIDE 8: DATA SOURCES ── */
  {
    id: 8,
    title: "Data Sources & Ingestion",
    duration: "~1 min",
    tab: "Data Sources (/data-sources)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Data Sources tab</ShowAction>

        <TalkingPoint>
          "This tab shows all our data sources. We have an <strong>S3-compatible storage bucket</strong> with the raw CSV/Excel files, and an <strong>ingestion pipeline</strong> that parses and loads them into our 12 database tables."
        </TalkingPoint>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <Database size={14} className="text-primary" /> 8 SHEETS INGESTED
          </h4>
          <div className="space-y-1.5">
            {[
              { sheet: "DRF-Analysis (Rainfall)", target: "historical_rainfall", desc: "~2000+ rows, 16-year record from Kadapa autographic station" },
              { sheet: "Once in 6 Months / 1 Year / 2 Years / 5 Years", target: "storm_frequency", desc: "Storm frequency data for 4 return periods" },
              { sheet: "Population Projections", target: "population_data", desc: "Census 1971-2011 with growth rates" },
              { sheet: "Sub Division Wise", target: "subdivision_population", desc: "Area, density, households, 2025/2040/2055 projections" },
              { sheet: "Ward Census Projections", target: "ward_projections", desc: "Ward-level population with growth rates" },
            ].map(s => (
              <div key={s.sheet} className="flex items-start gap-2 p-2 rounded bg-secondary/20">
                <FileText size={10} className="text-primary shrink-0 mt-1" />
                <div>
                  <span className="text-xs font-semibold text-foreground">{s.sheet}</span>
                  <span className="text-[10px] text-primary ml-2" style={monoFont}>→ {s.target}</span>
                  <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DataFlow items={["Raw Excel/CSV", "→", "S3 Bucket", "→", "ingest-xlsx function", "→", "Parse & Validate", "→", "PostgreSQL Tables", "→", "Live Dashboard"]} />
      </div>
    ),
  },

  /* ── SLIDE 9: REPORTS ── */
  {
    id: 9,
    title: "Reports & Documentation",
    duration: "~30 sec",
    tab: "Reports (/reports)",
    content: (
      <div className="space-y-4">
        <ShowAction>Navigate to Reports tab</ShowAction>

        <TalkingPoint>
          "The Reports tab provides access to all source documents — the Kadapa Master Plan G.O., zoning regulations, and all the PDF data sheets we used. These include the <strong>rainfall analysis PDFs</strong>, <strong>storm frequency tables</strong>, and the <strong>Kadapa Master Plan Government Order (G.O.Ms.No.39)</strong>. Everything is traceable back to official documents."
        </TalkingPoint>
      </div>
    ),
  },

  /* ── SLIDE 10: ARCHITECTURE SUMMARY ── */
  {
    id: 10,
    title: "Technical Architecture",
    duration: "~1 min",
    tab: "Summary",
    content: (
      <div className="space-y-4">
        <TalkingPoint>
          "Let me quickly summarize the technical architecture..."
        </TalkingPoint>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Frontend", tech: "React + TypeScript + Tailwind", icon: <Code size={14} /> },
            { label: "Backend", tech: "Lovable Cloud (Edge Functions)", icon: <Globe size={14} /> },
            { label: "Database", tech: "PostgreSQL (12 tables)", icon: <Database size={14} /> },
            { label: "Maps/GIS", tech: "Leaflet + leaflet.heat", icon: <Map size={14} /> },
            { label: "AI Model", tech: "Google Gemini 3 Flash", icon: <Brain size={14} /> },
            { label: "Charts", tech: "Recharts", icon: <BarChart3 size={14} /> },
            { label: "Weather", tech: "Open-Meteo API (free)", icon: <CloudRain size={14} /> },
            { label: "Real-time", tech: "PostgreSQL Subscriptions", icon: <Zap size={14} /> },
          ].map(t => (
            <div key={t.label} className="glass-panel p-3 text-center space-y-1">
              <div className="text-primary mx-auto">{t.icon}</div>
              <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>{t.label}</p>
              <p className="text-xs font-semibold text-foreground">{t.tech}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground" style={monoFont}>5 BACKEND FUNCTIONS</h4>
          <div className="space-y-1.5">
            {[
              { name: "fetch-weather", desc: "Open-Meteo → weather_readings (Kadapa coordinates)" },
              { name: "detect-bottlenecks", desc: "4-pass detection: bottlenecks, IDF floods, population vulnerability, encroachments" },
              { name: "flood-predict", desc: "8-table data → Gemini 3 Flash AI → structured risk prediction" },
              { name: "ingest-xlsx", desc: "CSV/Excel parsing → 8 target tables, no row limits" },
              { name: "s3-bridge", desc: "List & retrieve files from S3-compatible storage" },
            ].map(fn => (
              <div key={fn.name} className="flex items-start gap-2 p-2 rounded bg-secondary/20">
                <Code size={10} className="text-primary shrink-0 mt-1" />
                <div>
                  <span className="text-xs font-bold text-primary" style={monoFont}>{fn.name}</span>
                  <p className="text-[10px] text-muted-foreground">{fn.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  /* ── SLIDE 11: CLOSING ── */
  {
    id: 11,
    title: "Impact & Thank You",
    duration: "~1 min",
    tab: "Closing",
    content: (
      <div className="space-y-4">
        <div className="glass-panel p-4 space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-2" style={monoFont}>
            <CheckCircle2 size={14} className="text-success" /> HACKATHON REQUIREMENTS — CHECKLIST
          </h4>
          <div className="space-y-1.5">
            {[
              { req: "AI-Based Spatial Change Detection", status: "✅", note: "Encroachment detection via IDF + zoning data cross-reference" },
              { req: "Bottleneck Detection & Flood Prediction", status: "✅", note: "4-pass automated detection engine + AI prediction with Gemini" },
              { req: "Dashboard Visualization (GIS)", status: "✅", note: "4-layer interactive map, 8 stat cards, drainage network, heatmaps" },
              { req: "System Integration (Meteorological APIs)", status: "✅", note: "Open-Meteo live weather API, auto-stored in database" },
              { req: "Scalability & Automation", status: "✅", note: "Database-driven, zero hardcoded values, reusable for all 30 ULBs" },
              { req: "Real-time Flood Prediction & Early Warning", status: "✅", note: "Live alerts, 6-hour AI forecasting, automated detection" },
              { req: "Digital Mapping of Stormwater Networks", status: "✅", note: "8 drainage segments on GIS map with capacity analytics" },
              { req: "Historical Rainfall & IDF Analysis", status: "✅", note: "16-year record, 2000+ data points, IDF regression curves" },
            ].map(r => (
              <div key={r.req} className="flex items-start gap-2 p-2 rounded bg-success/5 border border-success/10">
                <span className="text-sm">{r.status}</span>
                <div>
                  <span className="text-xs font-semibold text-foreground">{r.req}</span>
                  <p className="text-[10px] text-muted-foreground">{r.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="glass-panel p-4 text-center border-primary/20">
            <Users size={20} className="text-primary mx-auto mb-2" />
            <p className="text-xs font-bold text-foreground">Urban Local Bodies</p>
            <p className="text-[10px] text-muted-foreground mt-1">Faster detection of flooding risks. Data-driven decision making.</p>
          </div>
          <div className="glass-panel p-4 text-center border-success/20">
            <Shield size={20} className="text-success mx-auto mb-2" />
            <p className="text-xs font-bold text-foreground">Government</p>
            <p className="text-[10px] text-muted-foreground mt-1">Climate resilience. Proactive infrastructure management.</p>
          </div>
          <div className="glass-panel p-4 text-center border-warning/20">
            <AlertTriangle size={20} className="text-warning mx-auto mb-2" />
            <p className="text-xs font-bold text-foreground">Citizens</p>
            <p className="text-[10px] text-muted-foreground mt-1">Reduced flooding risks. Early alerts & timely interventions.</p>
          </div>
        </div>

        <TalkingPoint>
          "To summarize — we've built a <strong>complete AI-powered flood management platform</strong> with real data, real-time weather, automated detection, and AI predictions. It's scalable to all 30 ULBs with minimal configuration. <strong>Thank you! Happy to take any questions.</strong>"
        </TalkingPoint>

        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
            <Droplets size={24} className="text-primary" />
            <div className="text-left">
              <h3 className="text-lg font-bold text-foreground" style={monoFont}>THANK YOU!</h3>
              <p className="text-xs text-muted-foreground">Thiru · Haryak Technologies · AI Flood Guard</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

/* ─── MAIN COMPONENT ───────────────────────────────────────── */
const DemoPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  const goNext = useCallback(() => setCurrentSlide(s => Math.min(slides.length - 1, s + 1)), []);
  const goPrev = useCallback(() => setCurrentSlide(s => Math.max(0, s - 1)), []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-3 overflow-y-auto">
          {/* Header */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wide" style={monoFont}>
                  🎤 DEMO PRESENTATION — AI FLOOD GUARD
                </h3>
                <p className="text-xs text-muted-foreground">
                  Use <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px] mx-0.5">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px] mx-0.5">→</kbd> arrow keys or <kbd className="px-1.5 py-0.5 rounded bg-secondary text-foreground text-[10px] mx-0.5">Space</kbd> to navigate
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold" style={monoFont}>
                  {slide.duration}
                </span>
                <span className="text-xs text-muted-foreground" style={monoFont}>
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="flex gap-1 mt-3">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i === currentSlide ? "bg-primary" : i < currentSlide ? "bg-primary/40" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(i)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                  i === currentSlide
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary/20 text-muted-foreground border-border/20 hover:bg-secondary/40"
                }`}
                style={monoFont}
              >
                <span>{i + 1}.</span>
                <span className="hidden lg:inline">{s.tab}</span>
              </button>
            ))}
          </div>

          {/* Slide Content */}
          <div className="glass-panel p-5 border border-primary/10 animate-fade-in" key={slide.id}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Mic size={20} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider" style={monoFont}>
                  SLIDE {slide.id} · {slide.tab} · {slide.duration}
                </span>
                <h2 className="text-lg font-bold text-foreground" style={monoFont}>{slide.title}</h2>
              </div>
            </div>

            {slide.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pb-4">
            <button
              onClick={goPrev}
              disabled={currentSlide === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/30 transition-all disabled:opacity-30 text-xs font-semibold"
              style={monoFont}
            >
              <ChevronLeft size={14} />
              PREV
            </button>

            <div className="flex items-center gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentSlide ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 transition-all disabled:opacity-30 text-xs font-semibold"
              style={monoFont}
            >
              NEXT
              <ChevronRight size={14} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DemoPage;
