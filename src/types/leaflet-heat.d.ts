import "leaflet";
import type { Layer } from "leaflet";

declare module "leaflet.heat" {
  import type { Layer } from "leaflet";

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }

  export function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions,
  ): Layer;
}

declare module "leaflet" {
  export function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: Record<string, unknown>,
  ): Layer;
}
