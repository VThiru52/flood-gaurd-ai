// Fix react-leaflet v5 type compatibility
declare module 'react-leaflet' {
  import { ComponentType, ReactNode, CSSProperties, Ref } from 'react';
  import * as L from 'leaflet';

  export interface MapContainerProps {
    center?: L.LatLngExpression;
    zoom?: number;
    className?: string;
    style?: CSSProperties;
    zoomControl?: boolean;
    children?: ReactNode;
    [key: string]: any;
  }

  export interface TileLayerProps {
    url: string;
    attribution?: string;
    [key: string]: any;
  }

  export interface CircleMarkerProps {
    center: L.LatLngExpression;
    radius?: number;
    pathOptions?: L.PathOptions;
    children?: ReactNode;
    [key: string]: any;
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export const CircleMarker: ComponentType<CircleMarkerProps>;
  export const Popup: ComponentType<{ children?: ReactNode; [key: string]: any }>;
  export function useMap(): L.Map;
}
