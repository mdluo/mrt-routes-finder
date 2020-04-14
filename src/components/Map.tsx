import React, { useRef, useContext } from 'react';
import GoogleMap from 'google-map-react';

import { RoutesContext, ActiveRouteContext } from './App';
import { getLineColor } from '../utils';
import coordsJson from '../data/coords.json';

import './Map.scss';

const coords = (coordsJson as Record<string, unknown>) as Coords;

const Map = () => {
  const routes = useContext(RoutesContext);
  const { activeRoute } = useContext(ActiveRouteContext);

  const mapRef = useRef<google.maps.Map>();
  const mapsRef = useRef<typeof google.maps>();
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const nodesRef = useRef<google.maps.OverlayView[]>([]);

  const route = routes[activeRoute];
  if (route && mapsRef.current && mapRef.current) {
    const maps = mapsRef.current;
    const map = mapRef.current;

    type Type = 'start' | 'end' | 'interchange2';
    class NodeOverlay extends maps.OverlayView {
      station: string;
      type: Type;
      coord: Coord;
      div: HTMLDivElement | null;

      constructor(station: string, type: Type, coord: Coord) {
        super();
        this.station = station;
        this.type = type;
        this.coord = coord;
        this.div = null;
      }

      onAdd() {
        const div = document.createElement('div');
        div.className = ['overlay-text', this.type].join(' ');
        div.style.position = 'absolute';
        const text = document.createElement('span');
        text.innerHTML = this.station;
        div.appendChild(text);
        this.div = div;
        const panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
      }

      draw() {
        if (this.div) {
          const [lat, lng] = this.coord;
          let position = new maps.LatLng(lat, lng);
          var pos = this.getProjection().fromLatLngToDivPixel(position);
          this.div.style.left = pos.x + 'px';
          this.div.style.top = pos.y + 'px';
        }
      }

      onRemove() {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }
    }

    // Clear existing nodes and polylines
    if (nodesRef.current.length) {
      nodesRef.current.forEach((node) => node.setMap(null));
      nodesRef.current = [];
    }
    if (polylinesRef.current.length) {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      polylinesRef.current = [];
    }

    const lineMap: Record<string, Coord[]> = {};
    route.path.forEach(({ station, line, type }) => {
      const coord = coords[station];
      lineMap[line] = (lineMap[line] || []).concat([coord]);
      if (type === 'start' || type === 'interchange2' || type === 'end') {
        const nodeOverlay = new NodeOverlay(station, type, coord);
        nodeOverlay.setMap(map);
        nodesRef.current.push(nodeOverlay);
      }
    });

    Object.entries(lineMap).forEach(([line, nodes]) => {
      const polyline = new maps.Polyline({
        path: nodes.map((coord) => ({ lat: coord[0], lng: coord[1] })),
        geodesic: true,
        strokeColor: getLineColor(line),
        strokeOpacity: 1.0,
        strokeWeight: 6,
      });
      polyline.setMap(map);
      polylinesRef.current.push(polyline);
    });
  }

  return (
    <GoogleMap
      bootstrapURLKeys={{
        key: process.env.REACT_APP_GOOGLE_MAP_API_KEY || '',
      }}
      defaultCenter={{
        lat: 1.3389204,
        lng: 103.7720943,
      }}
      defaultZoom={12}
      yesIWantToUseGoogleMapApiInternals
      onGoogleApiLoaded={({ map, maps }) => {
        mapRef.current = map as google.maps.Map;
        mapsRef.current = maps as typeof google.maps;
      }}
    />
  );
};

export default Map;
