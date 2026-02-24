import { useEffect, useMemo, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useFloodZones, useDrainageSegments, useSubdivisionPopulation } from "@/hooks/useFloodData";
import { useTheme } from "@/hooks/useTheme";
import { Loader2, Layers, Droplets, Users, AlertTriangle } from "lucide-react";

const monoFont = { fontFamily: "'JetBrains Mono', monospace" };

const riskColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const riskRadius: Record<string, number> = {
  critical: 18,
  high: 14,
  medium: 10,
  low: 7,
};

// Kadapa drainage network paths (approximate real coordinates along nalas/drains)
const drainageLines: { name: string; coords: [number, number][]; status: string }[] = [
  { name: "Pennar River Main", coords: [[14.485, 78.795], [14.475, 78.810], [14.467, 78.824], [14.458, 78.840], [14.450, 78.855]], status: "critical" },
  { name: "Buggavanka Nala", coords: [[14.470, 78.790], [14.465, 78.800], [14.458, 78.810], [14.455, 78.820]], status: "critical" },
  { name: "Gandikota Road Drain", coords: [[14.478, 78.830], [14.474, 78.835], [14.472, 78.840]], status: "high" },
  { name: "Rajiv Nagar Box Drain", coords: [[14.462, 78.815], [14.460, 78.820], [14.458, 78.825]], status: "medium" },
  { name: "APIIC Industrial Drain", coords: [[14.450, 78.835], [14.448, 78.840], [14.445, 78.845]], status: "medium" },
  { name: "Bypass Road Culvert", coords: [[14.485, 78.840], [14.482, 78.845], [14.480, 78.850]], status: "low" },
  { name: "Pulivendula Road Drain", coords: [[14.488, 78.845], [14.490, 78.850], [14.492, 78.855]], status: "medium" },
  { name: "Sunnapubatti Heritage", coords: [[14.472, 78.825], [14.470, 78.828], [14.468, 78.830]], status: "high" },
];

const statusLineColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

function MapView() {
  const { data: zones = [], isLoading } = useFloodZones();
  const { data: drains = [] } = useDrainageSegments();
  const { data: subDivs = [] } = useSubdivisionPopulation();
  const { theme } = useTheme();
  const criticalCount = zones.filter((z) => z.risk === "critical").length;

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showDensity, setShowDensity] = useState(false);
  const [showBottlenecks, setShowBottlenecks] = useState(true);

  const center = useMemo(() => {
    if (!zones.length) return [14.4674, 78.8241] as [number, number];
    const avgLat = zones.reduce((s, z) => s + z.lat, 0) / zones.length;
    const avgLng = zones.reduce((s, z) => s + z.lng, 0) / zones.length;
    return [avgLat, avgLng] as [number, number];
  }, [zones]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const zoneLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const drainLayerRef = useRef<L.LayerGroup | null>(null);
  const densityLayerRef = useRef<L.Layer | null>(null);
  const bottleneckLayerRef = useRef<L.LayerGroup | null>(null);

  const isLightTheme = theme !== "dark";

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView(center, 13);

    const tileUrl = isLightTheme
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    const tile = L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);

    tileLayerRef.current = tile;
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      zoneLayerRef.current = null;
      heatLayerRef.current = null;
      drainLayerRef.current = null;
      densityLayerRef.current = null;
      bottleneckLayerRef.current = null;
    };
  }, [center, isLightTheme]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, mapRef.current.getZoom(), { animate: false });
  }, [center]);

  // Zone markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (zoneLayerRef.current) { map.removeLayer(zoneLayerRef.current); zoneLayerRef.current = null; }

    if (!zones.length) return;
    const zoneLayer = L.layerGroup();

    zones.forEach((zone) => {
      const color = riskColors[zone.risk] || riskColors.medium;
      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: riskRadius[zone.risk] || 10,
        color, fillColor: color, fillOpacity: 0.6, weight: 2,
      });

      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 200px; line-height: 1.5;">
          <p style="font-weight: 700; font-size: 14px; margin: 0 0 4px;">${zone.name}</p>
          <p style="margin: 2px 0;">Zone: <span style="color: hsl(187, 72%, 50%);">${zone.zone_code}</span></p>
          <p style="margin: 2px 0;">Risk: <span style="font-weight: 700; text-transform: uppercase; color: ${color};">${zone.risk}</span></p>
          <p style="margin: 2px 0;">Flood Index: <span style="font-weight: 700;">${zone.level}%</span></p>
          <p style="margin: 2px 0; color: #888;">${Number(zone.lat).toFixed(4)}°N, ${Number(zone.lng).toFixed(4)}°E</p>
          ${zone.description ? `<p style="margin: 2px 0; color: #888; font-style: italic;">${zone.description}</p>` : ""}
        </div>
      `);

      zoneLayer.addLayer(marker);
    });

    zoneLayer.addTo(map);
    zoneLayerRef.current = zoneLayer;
  }, [zones]);

  // Heatmap layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatLayerRef.current) { map.removeLayer(heatLayerRef.current); heatLayerRef.current = null; }

    if (!showHeatmap || !zones.length) return;

    const heatData = zones.map((z) => [z.lat, z.lng, z.level / 100] as [number, number, number]);
    const heatLayerFactory = (L as any).heatLayer;

    if (heatLayerFactory) {
      const heatLayer = heatLayerFactory(heatData, {
        radius: 25, blur: 15, maxZoom: 17, max: 1.0, minOpacity: 0.4,
        gradient: { 0.0: "#22c55e", 0.25: "#84cc16", 0.5: "#eab308", 0.7: "#f97316", 0.85: "#ef4444", 1.0: "#dc2626" },
      });
      heatLayer.addTo(map);
      heatLayerRef.current = heatLayer;
    }
  }, [zones, showHeatmap]);

  // Drainage network overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drainLayerRef.current) { map.removeLayer(drainLayerRef.current); drainLayerRef.current = null; }

    if (!showDrainage) return;

    const layer = L.layerGroup();

    drainageLines.forEach((line) => {
      const matchingDrain = drains.find((d) => line.name.includes(d.name.split(" ")[0]) || d.name.includes(line.name.split(" ")[0]));
      const capacity = matchingDrain?.capacity ?? 50;
      const color = statusLineColors[line.status];

      const polyline = L.polyline(line.coords, {
        color, weight: 4, opacity: 0.8, dashArray: line.status === "critical" ? "10, 5" : undefined,
      });

      polyline.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 180px;">
          <p style="font-weight: 700; font-size: 13px; margin: 0 0 4px;">🔧 ${line.name}</p>
          <p style="margin: 2px 0;">Capacity: <span style="font-weight: 700; color: ${color};">${capacity}%</span></p>
          <p style="margin: 2px 0;">Status: <span style="text-transform: uppercase; color: ${color};">${line.status}</span></p>
          ${matchingDrain ? `<p style="margin: 2px 0; color: #888;">Design: ${matchingDrain.design_return_period}</p>` : ""}
        </div>
      `);

      layer.addLayer(polyline);
    });

    layer.addTo(map);
    drainLayerRef.current = layer;
  }, [showDrainage, drains]);

  // Population density heatmap
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (densityLayerRef.current) { map.removeLayer(densityLayerRef.current); densityLayerRef.current = null; }

    if (!showDensity || !subDivs.length) return;

    // Create density points spread around Kadapa subdivisions
    const densityPoints: [number, number, number][] = [];
    const baseLat = 14.4674;
    const baseLng = 78.8241;
    
    subDivs.forEach((s: any, i: number) => {
      const density = s.density_per_sqkm || 0;
      const normalizedDensity = Math.min(1, density / 20000);
      // Spread points around Kadapa
      const angle = (i / subDivs.length) * Math.PI * 2;
      const radius = 0.01 + (i % 5) * 0.005;
      const lat = baseLat + Math.cos(angle) * radius;
      const lng = baseLng + Math.sin(angle) * radius;
      densityPoints.push([lat, lng, normalizedDensity]);
    });

    const heatLayerFactory = (L as any).heatLayer;
    if (heatLayerFactory) {
      const layer = heatLayerFactory(densityPoints, {
        radius: 30, blur: 20, maxZoom: 17, max: 1.0, minOpacity: 0.3,
        gradient: { 0.0: "#3b82f6", 0.3: "#8b5cf6", 0.6: "#ec4899", 0.8: "#f43f5e", 1.0: "#dc2626" },
      });
      layer.addTo(map);
      densityLayerRef.current = layer;
    }
  }, [showDensity, subDivs]);

  // Bottleneck markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (bottleneckLayerRef.current) { map.removeLayer(bottleneckLayerRef.current); bottleneckLayerRef.current = null; }

    if (!showBottlenecks) return;

    const layer = L.layerGroup();
    const bottleneckDrains = drains.filter((d) => d.capacity < 50);

    bottleneckDrains.forEach((drain) => {
      const matchingLine = drainageLines.find((l) => l.name.includes(drain.name.split(" ")[0]) || drain.name.includes(l.name.split(" ")[0]));
      if (!matchingLine) return;

      const midIdx = Math.floor(matchingLine.coords.length / 2);
      const [lat, lng] = matchingLine.coords[midIdx];

      const icon = L.divIcon({
        className: "bottleneck-marker",
        html: `<div style="
          background: ${drain.capacity < 35 ? '#ef4444' : '#f97316'};
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        ">${drain.capacity}%</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([lat, lng], { icon });
      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 200px;">
          <p style="font-weight: 700; font-size: 13px; margin: 0 0 4px; color: ${drain.capacity < 35 ? '#ef4444' : '#f97316'};">⚠ BOTTLENECK</p>
          <p style="font-weight: 700; margin: 2px 0;">${drain.name}</p>
          <p style="margin: 2px 0;">Capacity: <span style="font-weight: 700; color: ${drain.capacity < 35 ? '#ef4444' : '#f97316'};">${drain.capacity}%</span></p>
          <p style="margin: 2px 0;">Catchment: ${drain.catchment_area}</p>
          <p style="margin: 2px 0;">Design: ${drain.design_return_period}</p>
          <p style="margin: 4px 0; color: #ef4444; font-size: 11px;">Action: Immediate clearance required</p>
        </div>
      `);

      layer.addLayer(marker);
    });

    layer.addTo(map);
    bottleneckLayerRef.current = layer;
  }, [showBottlenecks, drains]);

  if (isLoading) {
    return (
      <div className="glass-panel h-[500px] flex items-center justify-center animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading flood map...</span>
      </div>
    );
  }

  const bottleneckCount = drains.filter((d) => d.capacity < 50).length;

  return (
    <div className="glass-panel relative overflow-hidden h-[500px] animate-fade-in">
      {/* Top badges */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30 backdrop-blur-md" style={monoFont}>
          KADAPA FLOOD MAP · {zones.filter(z => z.risk === "critical" || z.risk === "high").length} ACTIVE ZONES
        </span>
        {criticalCount > 0 && (
          <span className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/30 flood-pulse backdrop-blur-md" style={monoFont}>
            ● {criticalCount} CRITICAL
          </span>
        )}
        {bottleneckCount > 0 && (
          <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold border border-warning/30 backdrop-blur-md" style={monoFont}>
            ⚠ {bottleneckCount} BOTTLENECKS
          </span>
        )}
      </div>

      {/* Layer Controls */}
      <div className="absolute top-3 right-3 z-[1000] glass-panel p-2 space-y-1.5 backdrop-blur-xl">
        <div className="flex items-center gap-1.5 px-1">
          <Layers size={12} className="text-primary" />
          <span className="text-[9px] font-bold text-foreground uppercase" style={monoFont}>LAYERS</span>
        </div>
        {[
          { label: "Flood Heatmap", active: showHeatmap, toggle: () => setShowHeatmap(!showHeatmap), icon: <Droplets size={10} />, color: "text-destructive" },
          { label: "Drainage Network", active: showDrainage, toggle: () => setShowDrainage(!showDrainage), icon: <AlertTriangle size={10} />, color: "text-warning" },
          { label: "Bottlenecks", active: showBottlenecks, toggle: () => setShowBottlenecks(!showBottlenecks), icon: <AlertTriangle size={10} />, color: "text-flood-high" },
          { label: "Population Density", active: showDensity, toggle: () => setShowDensity(!showDensity), icon: <Users size={10} />, color: "text-primary" },
        ].map((layer) => (
          <button
            key={layer.label}
            onClick={layer.toggle}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] w-full transition-all ${
              layer.active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={monoFont}
          >
            <div className={`w-2 h-2 rounded-full ${layer.active ? "bg-primary" : "bg-muted"}`} />
            <span className={layer.color}>{layer.icon}</span>
            {layer.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-3 px-3 py-2 rounded-lg bg-card/80 backdrop-blur-md border border-border/30">
        {[
          { label: "Critical", color: "#ef4444" },
          { label: "High", color: "#f97316" },
          { label: "Medium", color: "#eab308" },
          { label: "Low", color: "#22c55e" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
        {showDrainage && (
          <>
            <div className="w-px h-3 bg-border/50" />
            <span className="text-[10px] text-muted-foreground">— Drainage</span>
          </>
        )}
      </div>

      <div ref={mapContainerRef} className="h-full w-full" style={{ background: isLightTheme ? "hsl(200, 20%, 95%)" : "hsl(222, 47%, 7%)" }} />
    </div>
  );
}

export default MapView;
