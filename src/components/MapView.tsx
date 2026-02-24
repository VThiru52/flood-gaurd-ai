import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useFloodZones } from "@/hooks/useFloodData";
import { Loader2 } from "lucide-react";

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

// Heatmap layer using leaflet.heat
function HeatmapLayer({ zones }: { zones: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (!zones.length) return;

    const heatData = zones.map((z) => [
      z.lat,
      z.lng,
      z.level / 100,
    ]);

    // @ts-ignore - leaflet.heat types
    const heat = (L as any).heatLayer(heatData, {
      radius: 40,
      blur: 30,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: "#22c55e",
        0.3: "#eab308",
        0.6: "#f97316",
        0.85: "#ef4444",
        1.0: "#dc2626",
      },
    });

    heat.addTo(map);
    return () => { map.removeLayer(heat); };
  }, [map, zones]);

  return null;
}

function MapView() {
  const { data: zones = [], isLoading } = useFloodZones();
  const criticalCount = zones.filter((z) => z.risk === "critical").length;

  const center = useMemo(() => {
    if (!zones.length) return [14.4674, 78.8241] as [number, number];
    const avgLat = zones.reduce((s, z) => s + z.lat, 0) / zones.length;
    const avgLng = zones.reduce((s, z) => s + z.lng, 0) / zones.length;
    return [avgLat, avgLng] as [number, number];
  }, [zones]);

  if (isLoading) {
    return (
      <div className="glass-panel h-[500px] flex items-center justify-center animate-fade-in">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">Loading flood map...</span>
      </div>
    );
  }

  return (
    <div className="glass-panel relative overflow-hidden h-[500px] animate-fade-in">
      {/* Overlay badges */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <span
          className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold border border-primary/30 backdrop-blur-md"
          style={monoFont}
        >
          KADAPA FLOOD ZONES · {zones.length}
        </span>
        {criticalCount > 0 && (
          <span
            className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold border border-destructive/30 flood-pulse backdrop-blur-md"
            style={monoFont}
          >
            ● {criticalCount} CRITICAL
          </span>
        )}
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
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        style={{ background: "hsl(222, 47%, 7%)" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <HeatmapLayer zones={zones} />

        {zones.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={riskRadius[zone.risk] || 10}
            pathOptions={{
              color: riskColors[zone.risk],
              fillColor: riskColors[zone.risk],
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[180px]" style={monoFont}>
                <p className="font-bold text-sm">{zone.name}</p>
                <p>Zone: <span className="text-primary">{zone.zone_code}</span></p>
                <p>Risk Level: <span className="font-bold uppercase" style={{ color: riskColors[zone.risk] }}>{zone.risk}</span></p>
                <p>Flood Index: <span className="font-bold">{zone.level}%</span></p>
                <p className="text-muted-foreground">{zone.lat.toFixed(4)}°N, {zone.lng.toFixed(4)}°E</p>
                {zone.description && <p className="text-muted-foreground italic">{zone.description}</p>}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;
