import { useEffect, useMemo, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useFloodZones } from "@/hooks/useFloodData";
import { useTheme } from "@/hooks/useTheme";
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

function MapView() {
  const { data: zones = [], isLoading } = useFloodZones();
  const { theme } = useTheme();
  const criticalCount = zones.filter((z) => z.risk === "critical").length;

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
    };
  }, [center, isLightTheme]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, mapRef.current.getZoom(), { animate: false });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (zoneLayerRef.current) {
      map.removeLayer(zoneLayerRef.current);
      zoneLayerRef.current = null;
    }

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!zones.length) return;

    const zoneLayer = L.layerGroup();

    zones.forEach((zone) => {
      const color = riskColors[zone.risk] || riskColors.medium;

      const marker = L.circleMarker([zone.lat, zone.lng], {
        radius: riskRadius[zone.risk] || 10,
        color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 2,
      });

      marker.bindPopup(`
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 180px; line-height: 1.4;">
          <p style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0;">${zone.name}</p>
          <p style="margin: 2px 0;">Zone: <span style="color: hsl(187, 72%, 50%);">${zone.zone_code}</span></p>
          <p style="margin: 2px 0;">Risk Level: <span style="font-weight: 700; text-transform: uppercase; color: ${color};">${zone.risk}</span></p>
          <p style="margin: 2px 0;">Flood Index: <span style="font-weight: 700;">${zone.level}%</span></p>
          <p style="margin: 2px 0; color: hsl(215, 20%, 55%);">${Number(zone.lat).toFixed(4)}°N, ${Number(zone.lng).toFixed(4)}°E</p>
          ${zone.description ? `<p style="margin: 2px 0; color: hsl(215, 20%, 55%); font-style: italic;">${zone.description}</p>` : ""}
        </div>
      `);

      zoneLayer.addLayer(marker);
    });

    zoneLayer.addTo(map);
    zoneLayerRef.current = zoneLayer;

    const heatData = zones.map((z) => [z.lat, z.lng, z.level / 100] as [number, number, number]);
    const heatLayerFactory = (L as unknown as { heatLayer?: (data: [number, number, number][], options: Record<string, unknown>) => L.Layer }).heatLayer;

    if (heatLayerFactory) {
      const heatLayer = heatLayerFactory(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        minOpacity: 0.4,
        gradient: {
          0.0: "#22c55e",
          0.25: "#84cc16",
          0.5: "#eab308",
          0.7: "#f97316",
          0.85: "#ef4444",
          1.0: "#dc2626",
        },
      });

      heatLayer.addTo(map);
      heatLayerRef.current = heatLayer;
    }
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

      <div ref={mapContainerRef} className="h-full w-full" style={{ background: isLightTheme ? "hsl(200, 20%, 95%)" : "hsl(222, 47%, 7%)" }} />
    </div>
  );
}

export default MapView;
