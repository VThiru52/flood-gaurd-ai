import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import { 
  ChevronRight, ChevronLeft, Play, Target, Database, Brain, Map, AlertTriangle, 
  CloudRain, BarChart3, FileText, Zap, Shield, Users, Droplets, Layers,
  CheckCircle2, ArrowRight, Lightbulb, Code, Globe, Cpu
} from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

interface DemoStep {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category: "problem" | "architecture" | "feature" | "ai" | "impact";
  content: React.ReactNode;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  problem: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  architecture: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
  feature: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  ai: { bg: "bg-accent/10", text: "text-accent-foreground", border: "border-accent/30" },
  impact: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
};

const categoryLabels: Record<string, string> = {
  problem: "PROBLEM STATEMENT",
  architecture: "SYSTEM ARCHITECTURE",
  feature: "CORE FEATURE",
  ai: "AI / ML ENGINE",
  impact: "IMPACT & OUTCOMES",
};

/* ─── Reusable sub-components ──────────────────────────────── */
const InfoCard = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="glass-panel p-4 space-y-2">
    <div className="flex items-center gap-2">
      {icon}
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider" style={monoFont}>{title}</h4>
    </div>
    <div className="text-xs text-foreground/80 leading-relaxed space-y-1.5">{children}</div>
  </div>
);

const FormulaBlock = ({ label, formula, explanation }: { label: string; formula: string; explanation: string }) => (
  <div className="rounded-lg bg-secondary/40 border border-border/30 p-3 space-y-1">
    <p className="text-[10px] text-muted-foreground uppercase tracking-wider" style={monoFont}>{label}</p>
    <p className="text-sm font-bold text-primary" style={monoFont}>{formula}</p>
    <p className="text-[10px] text-muted-foreground">{explanation}</p>
  </div>
);

const DataSource = ({ label, source, records }: { label: string; source: string; records?: string }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
    <Database size={10} className="text-primary shrink-0" />
    <span className="text-xs text-foreground flex-1">{label}</span>
    <span className="text-[10px] text-primary" style={monoFont}>{source}</span>
    {records && <span className="text-[10px] text-muted-foreground" style={monoFont}>{records}</span>}
  </div>
);

const Checkpoint = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2">
    <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
    <span className="text-xs text-foreground/80">{text}</span>
  </div>
);

/* ─── DEMO STEPS ───────────────────────────────────────────── */
const steps: DemoStep[] = [
  /* STEP 1 — Problem Statement */
  {
    id: 1,
    title: "Problem Statement & Challenge",
    subtitle: "Why Urban Flood Management Needs AI",
    icon: <Target size={20} />,
    category: "problem",
    content: (
      <div className="space-y-4">
        <InfoCard title="THE CHALLENGE" icon={<AlertTriangle size={14} className="text-destructive" />}>
          <p>
            Urban Local Bodies (ULBs) across Andhra Pradesh lack comprehensive digital mapping of stormwater drainage networks.
            Without real-time visibility into drainage capacity, flood risks, and population exposure, cities like <strong>Kadapa</strong> face:
          </p>
          <ul className="list-disc pl-4 space-y-1 mt-2">
            <li>No digital mapping of stormwater networks — everything is on paper or CAD</li>
            <li>No real-time flood prediction — alerts come after flooding has started</li>
            <li>No automated detection of bottlenecks, encroachments, or drainage choke points</li>
            <li>No integration between meteorological data and drainage infrastructure</li>
            <li>No inter-departmental coordination platform for flood management</li>
          </ul>
        </InfoCard>

        <InfoCard title="EXPECTED SOLUTION" icon={<Lightbulb size={14} className="text-warning" />}>
          <p>Build an <strong>AI-based geospatial platform</strong> that integrates:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {[
              { label: "Drainage Data + Topography + Hydrology", desc: "Comprehensive network mapping" },
              { label: "AI Spatial Change Detection", desc: "Identify encroachments & obstructions" },
              { label: "Bottleneck & Flood Prediction", desc: "IDF curves + flow capacity analysis" },
              { label: "GIS Dashboard", desc: "Flood risk heatmaps for ULB decision-makers" },
              { label: "System Integration", desc: "Live meteorological & hydrological APIs" },
              { label: "Scalability", desc: "Reusable modules for all 30 ULBs" },
            ].map((item) => (
              <div key={item.label} className="p-2 rounded-lg bg-warning/5 border border-warning/10">
                <p className="text-xs font-semibold text-foreground">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="PILOT REGION" icon={<Map size={14} className="text-primary" />}>
          <p>
            <strong>Kadapa Municipal Corporation</strong>, Andhra Pradesh — Coordinates: <span style={monoFont} className="text-primary">14.4674°N, 78.8241°E</span>
          </p>
          <p>Target: 85% accuracy for flood inundation mapping using real IDF curves, drainage network data, and population census.</p>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 2 — Architecture */
  {
    id: 2,
    title: "System Architecture & Data Flow",
    subtitle: "End-to-End Technical Design",
    icon: <Code size={20} />,
    category: "architecture",
    content: (
      <div className="space-y-4">
        <InfoCard title="TECHNOLOGY STACK" icon={<Cpu size={14} className="text-primary" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "Frontend", tech: "React + TypeScript + Tailwind" },
              { label: "Backend", tech: "Lovable Cloud (Supabase)" },
              { label: "Maps/GIS", tech: "Leaflet + leaflet.heat" },
              { label: "AI Engine", tech: "Google Gemini 3 Flash" },
              { label: "Charts", tech: "Recharts" },
              { label: "Weather API", tech: "Open-Meteo (free, no key)" },
              { label: "Storage", tech: "S3-Compatible Bucket" },
              { label: "Real-time", tech: "PostgreSQL subscriptions" },
            ].map((item) => (
              <div key={item.label} className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
                <p className="text-[10px] text-muted-foreground uppercase" style={monoFont}>{item.label}</p>
                <p className="text-xs font-semibold text-foreground mt-0.5">{item.tech}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="DATA PIPELINE" icon={<Database size={14} className="text-primary" />}>
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Input Sources → Processing → Database → Visualization</p>
            <div className="flex items-center gap-1 flex-wrap text-[10px]" style={monoFont}>
              {["CSV/Excel Files", "→", "Edge Function (ingest-xlsx)", "→", "PostgreSQL Tables", "→", "React Hooks", "→", "Live Dashboard"].map((item, i) => (
                <span key={i} className={item === "→" ? "text-primary" : "px-2 py-1 rounded bg-secondary/40 text-foreground"}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </InfoCard>

        <InfoCard title="DATABASE TABLES (12 TABLES)" icon={<Database size={14} className="text-primary" />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
            {[
              { name: "flood_zones", desc: "14 flood zones with lat/lng, risk level" },
              { name: "drainage_segments", desc: "8 drainage segments with capacity %" },
              { name: "flood_alerts", desc: "Real-time alerts (flood, bottleneck, encroachment)" },
              { name: "weather_readings", desc: "Live from Open-Meteo API" },
              { name: "historical_rainfall", desc: "16-year DRF analysis (2000+ records)" },
              { name: "idf_records", desc: "IDF curves: 6m, 1y, 2y, 5y return periods" },
              { name: "storm_frequency", desc: "Storm return period frequency data" },
              { name: "population_data", desc: "Census 1971–2011" },
              { name: "subdivision_population", desc: "Sub-division wise density & projections" },
              { name: "ward_projections", desc: "Ward-level census with 2025/2040/2055" },
              { name: "zone_categories", desc: "Kadapa Master Plan zoning (G.O.Ms.No.39)" },
              { name: "ai_predictions", desc: "Stored AI prediction history" },
            ].map((t) => (
              <div key={t.name} className="p-1.5 rounded bg-secondary/20 border border-border/20">
                <p className="text-[10px] font-bold text-primary" style={monoFont}>{t.name}</p>
                <p className="text-[9px] text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="EDGE FUNCTIONS (BACKEND)" icon={<Globe size={14} className="text-primary" />}>
          <div className="space-y-1.5">
            {[
              { name: "fetch-weather", desc: "Pulls live weather from Open-Meteo API for Kadapa (14.4674°N, 78.8241°E). Stores current + 24h hourly data." },
              { name: "detect-bottlenecks", desc: "Compares live rainfall against IDF thresholds & drainage capacity. Auto-generates bottleneck, flood, and encroachment alerts." },
              { name: "flood-predict", desc: "Sends all DB data to Gemini 3 Flash AI. Returns structured flood risk prediction with zone-level analysis." },
              { name: "ingest-xlsx", desc: "Parses CSV/Excel sheets and loads ALL records into database tables. Supports 8 different sheets." },
              { name: "s3-bridge", desc: "Lists and retrieves files from S3-compatible storage bucket (floodAI)." },
            ].map((fn) => (
              <div key={fn.name} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20">
                <Code size={10} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-primary" style={monoFont}>{fn.name}</span>
                  <p className="text-[10px] text-muted-foreground">{fn.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 3 — Dashboard */
  {
    id: 3,
    title: "Dashboard — Real-Time Overview",
    subtitle: "Navigate to: / (Home)",
    icon: <BarChart3 size={20} />,
    category: "feature",
    content: (
      <div className="space-y-4">
        <InfoCard title="TOP BAR — LIVE WEATHER FEED" icon={<CloudRain size={14} className="text-primary" />}>
          <p>The header shows <strong>real-time rainfall</strong> for Kadapa city:</p>
          <DataSource label="Weather Data" source="Open-Meteo API" records="14.4674°N, 78.8241°E" />
          <p className="mt-1">
            Classification: <span className="text-success" style={monoFont}>LIGHT RAIN</span> (&lt;10 mm/hr) · 
            <span className="text-warning" style={monoFont}> MODERATE</span> (10-40) · 
            <span className="text-destructive" style={monoFont}> HEAVY</span> (40-80) · 
            <span className="text-destructive font-bold" style={monoFont}> EXTREME</span> (&gt;80)
          </p>
        </InfoCard>

        <InfoCard title="STATS GRID (8 CARDS)" icon={<BarChart3 size={14} className="text-warning" />}>
          <p>Each stat card pulls from a <strong>different database table</strong>:</p>
          <div className="space-y-1 mt-2">
            <DataSource label="Active Flood Zones" source="flood_zones" records="WHERE risk = critical/high" />
            <DataSource label="Alerts Active" source="flood_alerts" records="WHERE is_active = true" />
            <DataSource label="Avg Drainage Capacity" source="drainage_segments" records="AVG(capacity)" />
            <DataSource label="Population (Census)" source="population_data" records="Latest year row" />
            <DataSource label="Current Rainfall" source="weather_readings" records="Latest timestamp" />
            <DataSource label="Historical Max" source="historical_rainfall" records="MAX(daily_rainfall_mm)" />
            <DataSource label="IDF Curves" source="idf_records" records="Count non-null periods" />
            <DataSource label="AI Predictions" source="ai_predictions" records="Total stored predictions" />
          </div>
        </InfoCard>

        <InfoCard title="LIVE ALERTS PANEL" icon={<AlertTriangle size={14} className="text-destructive" />}>
          <p>Shows alerts from <code className="text-primary" style={monoFont}>flood_alerts</code> table where <code className="text-primary" style={monoFont}>is_active = true</code>.</p>
          <p>Three alert types auto-generated by <strong>detect-bottlenecks</strong> edge function:</p>
          <div className="space-y-1 mt-1">
            <div className="flex items-center gap-2"><Droplets size={10} className="text-destructive" /> <span className="text-xs"><strong>flood</strong> — Rainfall exceeds IDF return period thresholds</span></div>
            <div className="flex items-center gap-2"><Zap size={10} className="text-warning" /> <span className="text-xs"><strong>bottleneck</strong> — Drain capacity below 60% + rainfall exceeds 70% of design</span></div>
            <div className="flex items-center gap-2"><Shield size={10} className="text-primary" /> <span className="text-xs"><strong>encroachment</strong> — Protected zone (PR) with flood index &gt;80%</span></div>
          </div>
        </InfoCard>

        <InfoCard title="DRAINAGE NETWORK CAPACITY" icon={<Layers size={14} className="text-warning" />}>
          <p>Reads from <code className="text-primary" style={monoFont}>drainage_segments</code> table — {"{"}8 segments{"}"} with real data:</p>
          <p>Each segment shows: <strong>Name</strong>, <strong>Catchment Area</strong>, <strong>Design Return Period</strong>, <strong>Length</strong>, <strong>Capacity %</strong></p>
          <p className="mt-1 text-[10px]">
            Status coloring: <span className="text-destructive">Critical (&lt;35%)</span> · <span className="text-flood-high">High (35-50%)</span> · <span className="text-warning">Medium (50-70%)</span> · <span className="text-success">Low (&gt;70%)</span>
          </p>
        </InfoCard>

        <InfoCard title="WEATHER CHARTS" icon={<CloudRain size={14} className="text-primary" />}>
          <div className="space-y-1">
            <DataSource label="Rainfall & Humidity (Area Chart)" source="weather_readings" records="All readings, time-series" />
            <DataSource label="Zone-Wise Flood Risk Index (Bar Chart)" source="flood_zones" records="Top 10 by level DESC" />
          </div>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 4 — GIS Map */
  {
    id: 4,
    title: "GIS Flood Risk Map",
    subtitle: "Navigate to: /map",
    icon: <Map size={20} />,
    category: "feature",
    content: (
      <div className="space-y-4">
        <InfoCard title="INTERACTIVE GIS MAP — 4 LAYERS" icon={<Layers size={14} className="text-primary" />}>
          <p>Built with <strong>Leaflet</strong> + <strong>leaflet.heat</strong>. Map centers on Kadapa (14.4674°N, 78.8241°E) with zoom level 13.</p>
          <p>4 toggleable layers, all driven by real database data:</p>
        </InfoCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoCard title="1. FLOOD HEATMAP" icon={<Droplets size={14} className="text-destructive" />}>
            <DataSource label="Heat points" source="flood_zones" records="lat, lng, level/100" />
            <FormulaBlock
              label="Heat Intensity"
              formula="intensity = zone.level / 100"
              explanation="Each flood zone's risk level (0-100) is normalized to 0-1 for the heatmap gradient. Gradient: green(0) → yellow(0.5) → red(1.0)"
            />
          </InfoCard>

          <InfoCard title="2. DRAINAGE NETWORK" icon={<Zap size={14} className="text-warning" />}>
            <p>8 polylines drawn along real Kadapa nala/drain coordinates:</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Pennar River Main, Buggavanka Nala, Gandikota Road Drain, Rajiv Nagar Box Drain, APIIC Industrial Drain, Bypass Road Culvert, Pulivendula Road Drain, Sunnapubatti Heritage
            </p>
            <p className="mt-1">Color: <span className="text-destructive">Red (critical)</span> / <span className="text-flood-high">Orange (high)</span> / <span className="text-warning">Yellow (medium)</span> / <span className="text-success">Green (low)</span></p>
            <p>Critical drains shown with <strong>dashed lines</strong>.</p>
          </InfoCard>

          <InfoCard title="3. BOTTLENECK MARKERS" icon={<AlertTriangle size={14} className="text-flood-high" />}>
            <DataSource label="Bottleneck drains" source="drainage_segments" records="WHERE capacity < 50%" />
            <p className="mt-1">
              Each bottleneck shows a circular marker with capacity % at the midpoint of the drain polyline. 
              Color: <span className="text-destructive">Red (&lt;35%)</span> / <span className="text-flood-high">Orange (35-50%)</span>
            </p>
          </InfoCard>

          <InfoCard title="4. POPULATION DENSITY" icon={<Users size={14} className="text-primary" />}>
            <DataSource label="Density heatmap" source="subdivision_population" records="density_per_sqkm" />
            <FormulaBlock
              label="Density Normalization"
              formula="normalized = min(1, density / 20,000)"
              explanation="Subdivision density (persons/sq.km) normalized against 20,000 ceiling. Blue-to-red gradient shows vulnerable high-density areas."
            />
          </InfoCard>
        </div>

        <InfoCard title="EARLY WARNING SYSTEM" icon={<Shield size={14} className="text-success" />}>
          <p>Two-step automated detection pipeline:</p>
          <div className="space-y-2 mt-2">
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-xs font-bold text-foreground">Step 1: FETCH LIVE WEATHER</p>
              <p className="text-[10px] text-muted-foreground">Calls <code className="text-primary">fetch-weather</code> edge function → Open-Meteo API → Stores in weather_readings</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-xs font-bold text-foreground">Step 2: RUN DETECTION</p>
              <p className="text-[10px] text-muted-foreground">Calls <code className="text-primary">detect-bottlenecks</code> → Compares live rainfall vs IDF thresholds → Checks drainage capacity → Auto-generates alerts</p>
            </div>
          </div>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 5 — Bottleneck Detection */
  {
    id: 5,
    title: "Automated Bottleneck & Flood Detection",
    subtitle: "Edge Function: detect-bottlenecks",
    icon: <Zap size={20} />,
    category: "ai",
    content: (
      <div className="space-y-4">
        <InfoCard title="DETECTION ALGORITHM" icon={<Code size={14} className="text-primary" />}>
          <p className="font-semibold">The detect-bottlenecks engine runs 4 detection passes on real data:</p>
        </InfoCard>

        <InfoCard title="PASS 1: DRAINAGE BOTTLENECK DETECTION" icon={<Zap size={14} className="text-warning" />}>
          <FormulaBlock
            label="Bottleneck Condition"
            formula="IF rainfall > designIntensity × 0.7 AND capacity < 60% → ALERT"
            explanation="Current rainfall compared against 70% of the drain's design return period intensity from IDF records at 60-min duration. If exceeded AND capacity is already below 60%, a bottleneck alert is generated."
          />
          <div className="mt-2 space-y-1">
            <DataSource label="Current Rainfall" source="weather_readings" records="Latest reading" />
            <DataSource label="Design Intensity" source="idf_records" records="@60min for drain's return period" />
            <DataSource label="Drain Capacity" source="drainage_segments" records="capacity %" />
          </div>
          <p className="mt-2">Also flags drains with capacity &lt;40% regardless of rainfall (maintenance warning).</p>
        </InfoCard>

        <InfoCard title="PASS 2: IDF THRESHOLD FLOOD ALERTS" icon={<CloudRain size={14} className="text-destructive" />}>
          <p>Compares current rainfall against IDF 30-minute return period thresholds:</p>
          <div className="space-y-1 mt-2">
            <FormulaBlock label="5-Year Return" formula="IF rainfall > IDF_5y_30min → CRITICAL (Catastrophic)" explanation="Exceeds 5-year return period = catastrophic flooding expected" />
            <FormulaBlock label="2-Year Return" formula="IF rainfall > IDF_2y_30min → CRITICAL (Major)" explanation="Exceeds 2-year return period = major flooding in low-lying areas" />
            <FormulaBlock label="1-Year Return" formula="IF rainfall > IDF_1y_30min → HIGH (Moderate)" explanation="Exceeds 1-year return period = moderate flooding" />
            <FormulaBlock label="6-Month Return" formula="IF rainfall > IDF_6m_30min → MEDIUM (Advisory)" explanation="Exceeds 6-month return period = minor waterlogging" />
          </div>
        </InfoCard>

        <InfoCard title="PASS 3: POPULATION VULNERABILITY" icon={<Users size={14} className="text-primary" />}>
          <FormulaBlock
            label="High-Density Alert"
            formula="IF zone.risk ∈ {critical, high} AND nearby_density > 5000/sq.km AND zone.level > 70% → ALERT"
            explanation="Cross-references flood zone risk with subdivision population density. Areas with >5000 persons/sq.km AND flood index >70% trigger evacuation alerts."
          />
        </InfoCard>

        <InfoCard title="PASS 4: ENCROACHMENT DETECTION" icon={<Shield size={14} className="text-primary" />}>
          <FormulaBlock
            label="Encroachment Flag"
            formula="IF zone.zone_code = 'PR' AND zone.level > 80% → ENCROACHMENT ALERT"
            explanation="Protected Reserve (PR) zones with flood index >80% — any encroachments on drain embankments must be reported. Water body setback violations to be checked."
          />
        </InfoCard>
      </div>
    ),
  },

  /* STEP 6 — AI Prediction */
  {
    id: 6,
    title: "AI Flood Prediction Engine",
    subtitle: "Navigate to: /ai-models → Click RUN PREDICTION",
    icon: <Brain size={20} />,
    category: "ai",
    content: (
      <div className="space-y-4">
        <InfoCard title="HOW AI PREDICTION WORKS" icon={<Brain size={14} className="text-primary" />}>
          <p className="font-semibold">When you click "RUN PREDICTION", here's what happens:</p>
          <div className="space-y-2 mt-2">
            {[
              "1. Edge function flood-predict is invoked",
              "2. It fetches ALL data from 8 database tables simultaneously (parallel queries)",
              "3. Constructs a detailed prompt with current weather, historical rainfall, population, flood zones, drainage capacity, IDF thresholds",
              "4. Sends to Google Gemini 3 Flash via Lovable AI Gateway",
              "5. Uses TOOL CALLING (structured output) to get a strict JSON schema response",
              "6. Stores the prediction in ai_predictions table with expiry (6 hours)",
              "7. Returns structured result to the frontend",
            ].map((step) => (
              <div key={step} className="flex items-start gap-2">
                <ArrowRight size={10} className="text-primary shrink-0 mt-1" />
                <span className="text-xs text-foreground/80">{step}</span>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="DATA SENT TO AI MODEL" icon={<Database size={14} className="text-primary" />}>
          <p>The AI receives a comprehensive prompt with real data from:</p>
          <div className="space-y-1 mt-2">
            <DataSource label="Current Weather (last 10 readings)" source="weather_readings" records="rainfall, temp, humidity, wind, pressure" />
            <DataSource label="Top 20 Historical Rainfall Events" source="historical_rainfall" records="daily_rainfall_mm + 60min intensity" />
            <DataSource label="Population Census (1971-2011)" source="population_data" records="year, population, growth %" />
            <DataSource label="Top 5 Densest Areas" source="subdivision_population" records="density, households, 2025 projection" />
            <DataSource label="All Flood Zones (14)" source="flood_zones" records="name, risk, level, zone_code" />
            <DataSource label="All Drainage Segments (8)" source="drainage_segments" records="capacity, status, design period" />
            <DataSource label="Active Alerts" source="flood_alerts" records="count + critical count" />
            <DataSource label="IDF Thresholds" source="idf_records" records="30min & 60min: 6m, 1y, 2y, 5y" />
          </div>
        </InfoCard>

        <InfoCard title="AI OUTPUT STRUCTURE (TOOL CALLING)" icon={<Code size={14} className="text-primary" />}>
          <p>Gemini 3 Flash returns a <strong>structured JSON</strong> via tool calling, NOT free-text:</p>
          <div className="rounded-lg bg-secondary/40 border border-border/30 p-3 mt-2">
            <pre className="text-[10px] text-foreground/80 overflow-x-auto" style={monoFont}>{`{
  "overall_risk_score": 0-100,      // Composite risk score
  "risk_level": "critical|high|medium|low",
  "summary": "2-3 sentence assessment",
  "confidence": 0.0-1.0,            // Model confidence
  "zone_predictions": [              // Per-zone analysis
    {
      "zone_name": "Pennar Riverbed",
      "predicted_risk": 85,          // % risk
      "trend": "rising|stable|falling",
      "reasoning": "Why this zone is at risk"
    }
  ],
  "recommendations": ["Action items for ULB"],
  "six_hour_forecast": "Prediction text"
}`}</pre>
          </div>
        </InfoCard>

        <InfoCard title="OVERALL RISK SCORE — HOW IT'S DEFINED" icon={<Target size={14} className="text-destructive" />}>
          <p>The AI calculates the 0-100 score by weighing:</p>
          <div className="space-y-1 mt-2">
            <FormulaBlock
              label="Risk Score Components"
              formula="Score = f(currentRainfall, historicalPrecedent, drainageCapacity, populationDensity, IDF_exceedance)"
              explanation="Gemini analyzes: How close is current rainfall to historical max? How many drains are at capacity? What's the population exposure in critical zones? Are IDF thresholds being exceeded?"
            />
          </div>
          <p className="mt-2">
            <strong>Risk Levels:</strong>{" "}
            <span className="text-destructive">Critical (≥75)</span> · 
            <span className="text-flood-high"> High (50-74)</span> · 
            <span className="text-warning"> Medium (25-49)</span> · 
            <span className="text-success"> Low (&lt;25)</span>
          </p>
        </InfoCard>

        <InfoCard title="ZONE-LEVEL PREDICTIONS" icon={<Map size={14} className="text-warning" />}>
          <p>AI provides individual risk assessment for each flood zone, considering:</p>
          <ul className="list-disc pl-4 space-y-0.5 mt-1">
            <li>The zone's current flood level (from flood_zones table)</li>
            <li>Nearby drainage capacity (cross-reference with drainage_segments)</li>
            <li>Population density in that area (from subdivision_population)</li>
            <li>Historical precedent — has this area flooded before?</li>
            <li>Current weather trajectory (rising/falling rainfall pattern)</li>
          </ul>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 7 — Flood Simulator */
  {
    id: 7,
    title: "Flood Scenario Simulator",
    subtitle: "Navigate to: /analytics → Flood Simulator",
    icon: <Zap size={20} />,
    category: "ai",
    content: (
      <div className="space-y-4">
        <InfoCard title="WHAT-IF ANALYSIS ENGINE" icon={<Zap size={14} className="text-warning" />}>
          <p>The Flood Simulator lets you model <strong>"what happens if"</strong> a storm of a specific return period hits Kadapa for a given duration. All calculations use <strong>real IDF curve data</strong> from the database.</p>
        </InfoCard>

        <InfoCard title="USER INPUTS" icon={<Target size={14} className="text-primary" />}>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-xs font-bold text-foreground">Storm Return Period</p>
              <p className="text-[10px] text-muted-foreground">6 Months · 1 Year · 2 Years · 5 Years</p>
            </div>
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-xs font-bold text-foreground">Storm Duration</p>
              <p className="text-[10px] text-muted-foreground">30 min · 1 hr · 2 hr · 3 hr</p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="SIMULATION FORMULAS" icon={<Code size={14} className="text-primary" />}>
          <div className="space-y-2">
            <FormulaBlock
              label="Step 1: Get Rainfall Intensity"
              formula="intensity = IDF_table[selectedPeriod][selectedDuration]"
              explanation="Look up the exact intensity (mm/hr) from the IDF records table for the chosen return period and duration. E.g., 2-year, 60-min = X mm/hr."
            />
            <FormulaBlock
              label="Step 2: Drain Overflow Ratio"
              formula="overflowRatio = selectedIntensity / designIntensity"
              explanation="Compare the simulated rainfall intensity against each drain's design return period intensity at 60-min duration."
            />
            <FormulaBlock
              label="Step 3: Simulated Capacity"
              formula="simulatedCapacity = max(0, min(100, currentCapacity × (1 - (overflowRatio - 1) × 0.3)))"
              explanation="If overflow ratio > 1 (storm exceeds design), capacity degrades by 30% per unit of excess. Clamped to 0-100%."
            />
            <FormulaBlock
              label="Step 4: Zone Risk Multiplier"
              formula="simulatedRisk = min(100, baseRisk × multiplier)"
              explanation="Multiplier: 1.4× if intensity > 80 mm/hr, 1.2× if > 50, 1.1× if > 30, 1.0× otherwise."
            />
            <FormulaBlock
              label="Step 5: Population Exposure"
              formula="exposed = Σ population WHERE density > 3000/sq.km"
              explanation="Sum of projected 2025 population for all subdivisions with density exceeding 3000 persons/sq.km — these are the most vulnerable."
            />
            <FormulaBlock
              label="Step 6: Overall Risk Classification"
              formula="risk = criticalZones ≥ 3 ? 'CRITICAL' : ≥ 1 ? 'HIGH' : overflowDrains ≥ 2 ? 'MEDIUM' : 'LOW'"
              explanation="Based on count of critical zones and overflowing drains."
            />
          </div>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 8 — IDF + Analytics */
  {
    id: 8,
    title: "IDF Analysis & Hydrological Data",
    subtitle: "Navigate to: /analytics → Scroll to IDF Section",
    icon: <BarChart3 size={20} />,
    category: "feature",
    content: (
      <div className="space-y-4">
        <InfoCard title="IDF CURVES — INTENSITY-DURATION-FREQUENCY" icon={<BarChart3 size={14} className="text-primary" />}>
          <p>Core hydrological tool. Shows how rainfall intensity varies with storm duration for different return periods.</p>
          <DataSource label="IDF Data" source="idf_records" records="9 durations × 4 return periods = 36 data points" />
          <p className="mt-1">Durations: 5, 10, 15, 30, 45, 60, 90, 120, 180 minutes</p>
          <p>Return Periods: 6 months, 1 year, 2 years, 5 years</p>
        </InfoCard>

        <InfoCard title="IDF REGRESSION FORMULA" icon={<Code size={14} className="text-primary" />}>
          <FormulaBlock
            label="IDF Power Law Regression"
            formula="i = a × t^n"
            explanation="Where i = rainfall intensity (mm/hr), t = duration (minutes), a = coefficient, n = exponent. Each return period has its own a, n, and R² values."
          />
          <p className="mt-1 text-[10px]">This formula allows interpolation for any duration, not just measured values. High R² (close to 1.0) means excellent fit.</p>
        </InfoCard>

        <InfoCard title="STORM FREQUENCY TABLE" icon={<Database size={14} className="text-primary" />}>
          <DataSource label="Storm Frequency" source="storm_frequency" records="16-year record, 4 return periods" />
          <p className="mt-1">Shows how many storms of a given intensity threshold occurred in the 16-year historical record, broken down by return period and duration.</p>
        </InfoCard>

        <InfoCard title="KADAPA MASTER PLAN ZONING" icon={<Map size={14} className="text-warning" />}>
          <DataSource label="Zone Categories" source="zone_categories" records="G.O.Ms.No.39" />
          <p className="mt-1">Each zone categorized by flood relevance: critical (water bodies, river zones), high (low-lying residential), medium (commercial), low (elevated areas).</p>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 9 — Weather */
  {
    id: 9,
    title: "Live Weather Integration",
    subtitle: "Navigate to: /weather",
    icon: <CloudRain size={20} />,
    category: "feature",
    content: (
      <div className="space-y-4">
        <InfoCard title="REAL-TIME WEATHER PIPELINE" icon={<Globe size={14} className="text-primary" />}>
          <div className="space-y-2">
            <div className="p-2 rounded-lg bg-secondary/20">
              <p className="text-xs font-bold text-foreground">API: Open-Meteo (Free, No Key Required)</p>
              <p className="text-[10px] text-muted-foreground" style={monoFont}>
                GET https://api.open-meteo.com/v1/forecast?latitude=14.4674&longitude=78.8241
                &current=temperature_2m,relative_humidity_2m,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m
                &hourly=precipitation&timezone=Asia/Kolkata&past_days=1&forecast_days=1
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="DATA CAPTURED PER READING" icon={<Database size={14} className="text-primary" />}>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { field: "rainfall_mm_hr", desc: "Current precipitation" },
              { field: "temperature_c", desc: "Temperature at 2m" },
              { field: "humidity_pct", desc: "Relative humidity" },
              { field: "pressure_hpa", desc: "Surface pressure" },
              { field: "wind_speed_kmh", desc: "Wind at 10m" },
              { field: "wind_direction", desc: "16-point compass (N, NNE, NE...)" },
            ].map((f) => (
              <div key={f.field} className="p-1.5 rounded bg-secondary/20">
                <p className="text-[10px] font-bold text-primary" style={monoFont}>{f.field}</p>
                <p className="text-[9px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="HISTORICAL RAINFALL (DRF ANALYSIS)" icon={<CloudRain size={14} className="text-warning" />}>
          <DataSource label="16-Year Rainfall Record" source="historical_rainfall" records="2000+ records from Kadapa autographic station" />
          <p className="mt-1">Two charts generated: <strong>Yearly Max Daily Rainfall</strong> (bar chart by year) and <strong>Monthly Average Rainfall</strong> (seasonal pattern).</p>
          <p>Each record includes: year, month, day, daily rainfall (mm), and intensities at 5/10/15/30/45/60/90/120/180 min durations.</p>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 10 — Data Sources */
  {
    id: 10,
    title: "Data Ingestion & Sources",
    subtitle: "Navigate to: /data-sources",
    icon: <Database size={20} />,
    category: "feature",
    content: (
      <div className="space-y-4">
        <InfoCard title="S3-COMPATIBLE STORAGE" icon={<Globe size={14} className="text-primary" />}>
          <p>All source data files stored in <strong>floodAI</strong> S3 bucket. Files include CSVs and PDFs with Kadapa-specific hydrological data.</p>
        </InfoCard>

        <InfoCard title="8 SHEETS INGESTED (NO ROW LIMITS)" icon={<Database size={14} className="text-primary" />}>
          <div className="space-y-1">
            {[
              { sheet: "DRF-Ana (Rainfall)", target: "historical_rainfall", records: "~2000+ rows" },
              { sheet: "Once in 6 Months", target: "storm_frequency", records: "IDF return period data" },
              { sheet: "Once in a Year", target: "storm_frequency", records: "IDF return period data" },
              { sheet: "Once in 2 Years", target: "storm_frequency", records: "IDF return period data" },
              { sheet: "Once in 5 Years", target: "storm_frequency", records: "IDF return period data" },
              { sheet: "Population Projections", target: "population_data", records: "Census 1971-2011" },
              { sheet: "Sub Division Wise", target: "subdivision_population", records: "All sub-divisions" },
              { sheet: "Ward Census Projections", target: "ward_projections", records: "Ward-level census" },
            ].map((s) => (
              <DataSource key={s.sheet} label={s.sheet} source={s.target} records={s.records} />
            ))}
          </div>
        </InfoCard>
      </div>
    ),
  },

  /* STEP 11 — Impact */
  {
    id: 11,
    title: "Impact & Outcomes",
    subtitle: "How This Solution Transforms Flood Management",
    icon: <Shield size={20} />,
    category: "impact",
    content: (
      <div className="space-y-4">
        <InfoCard title="OUTCOMES ACHIEVED" icon={<CheckCircle2 size={14} className="text-success" />}>
          <div className="space-y-1.5">
            <Checkpoint text="Comprehensive digital mapping and visualization of stormwater networks — 8 drainage segments, 14 flood zones, all on interactive GIS map" />
            <Checkpoint text="Real-time flood prediction using AI (Gemini 3 Flash) with 6-hour forecasting and zone-level risk assessment" />
            <Checkpoint text="Automated detection of bottlenecks (drainage choke points) and encroachments using IDF threshold comparisons" />
            <Checkpoint text="Live meteorological data integration via Open-Meteo API — no API key required, auto-stored in database" />
            <Checkpoint text="Population vulnerability analysis — cross-referencing density data with flood zones for evacuation planning" />
            <Checkpoint text="What-if flood scenario simulator using real IDF curves for 6m, 1y, 2y, 5y return periods" />
            <Checkpoint text="AI-generated flood risk reports with downloadable markdown format" />
            <Checkpoint text="Scalable architecture — all data is database-driven, not hardcoded. New ULBs only need new data ingestion." />
          </div>
        </InfoCard>

        <InfoCard title="IMPACT ON STAKEHOLDERS" icon={<Users size={14} className="text-primary" />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-bold text-foreground">Urban Local Bodies</p>
              <p className="text-[10px] text-muted-foreground mt-1">Increased visibility of stormwater networks. Faster detection of flooding risks. Data-driven decision making.</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
              <p className="text-xs font-bold text-foreground">Government</p>
              <p className="text-[10px] text-muted-foreground mt-1">Strengthened climate resilience. Proactive infrastructure management. Inter-departmental coordination platform.</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
              <p className="text-xs font-bold text-foreground">Citizens</p>
              <p className="text-[10px] text-muted-foreground mt-1">Reduced flooding risks. Early alerts and timely interventions. Improved safety through AI-powered warnings.</p>
            </div>
          </div>
        </InfoCard>

        <InfoCard title="SCALABILITY" icon={<Globe size={14} className="text-success" />}>
          <p>The platform is designed for <strong>adoption across all 30 ULBs</strong> in Andhra Pradesh:</p>
          <ul className="list-disc pl-4 space-y-0.5 mt-1">
            <li>All data is database-driven — zero hardcoded values in UI components</li>
            <li>Edge functions are parameterized — change coordinates and it works for any city</li>
            <li>CSV/Excel ingestion pipeline accepts any format matching the schema</li>
            <li>AI model adapts automatically — prompt includes whatever data is in the database</li>
            <li>GIS map auto-centers on zone data coordinates</li>
          </ul>
        </InfoCard>
      </div>
    ),
  },
];

/* ─── MAIN COMPONENT ───────────────────────────────────────── */
const DemoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const catStyle = categoryColors[step.category];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Header */}
          <div className="glass-panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground tracking-wide mb-1" style={monoFont}>
                  🎯 HACKATHON DEMO WALKTHROUGH
                </h3>
                <p className="text-xs text-muted-foreground">
                  AI-Based Stormwater Network Mapping & Flood Risk Monitoring System — Kadapa, Andhra Pradesh
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground" style={monoFont}>
                  {currentStep + 1} / {steps.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1 mt-3">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/40" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step Nav Thumbnails */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {steps.map((s, i) => {
              const cat = categoryColors[s.category];
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(i)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                    i === currentStep
                      ? `${cat.bg} ${cat.text} ${cat.border}`
                      : "bg-secondary/20 text-muted-foreground border-border/20 hover:bg-secondary/40"
                  }`}
                  style={monoFont}
                >
                  {s.icon}
                  <span className="hidden lg:inline">{s.title.split("—")[0].trim()}</span>
                  <span className="lg:hidden">{i + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Current Step */}
          <div className={`glass-panel p-5 border ${catStyle.border} animate-fade-in`} key={step.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-lg ${catStyle.bg} ${catStyle.text}`}>
                {step.icon}
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${catStyle.text}`} style={monoFont}>
                  {categoryLabels[step.category]} · STEP {step.id}
                </span>
                <h2 className="text-lg font-bold text-foreground" style={monoFont}>{step.title}</h2>
                <p className="text-xs text-muted-foreground">{step.subtitle}</p>
              </div>
            </div>

            {step.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/30 transition-all disabled:opacity-30 text-xs font-semibold"
              style={monoFont}
            >
              <ChevronLeft size={14} />
              PREVIOUS
            </button>

            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
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
