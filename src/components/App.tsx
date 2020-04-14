import React, { createContext, useState, useEffect } from 'react';
import { FocusStyleManager } from '@blueprintjs/core';
import * as comlink from 'comlink';

/* eslint-disable-next-line import/no-webpack-loader-syntax */
import Worker from 'worker-loader!../worker';
import { WorkerType, Graph, Route as RawRoute } from '../worker';

import Drawer from './Drawer';
import Map from './Map';
import { sortString, processPath } from '../utils';
import styles from './App.module.scss';

type Nodes = string[];
type Station = [string, string];

const worker = comlink.wrap<WorkerType>(new Worker());

export const NodesContext = createContext<Nodes>([]);
export const StationsContext = createContext<{
  stations: Station;
  setStations: React.Dispatch<React.SetStateAction<Station>>;
}>({ stations: ['', ''], setStations: () => undefined });
export const LoadingContext = createContext<boolean>(false);
export const RoutesContext = createContext<Route[]>([]);
export const ActiveRouteContext = createContext<{
  activeRoute: number;
  setActiveRoute: React.Dispatch<React.SetStateAction<number>>;
}>({ activeRoute: -1, setActiveRoute: () => undefined });

export function useGraph() {
  const [graph, setGraph] = useState<Graph>();
  const [nodes, setNodes] = useState<Nodes>([]);
  useEffect(() => {
    worker.build(
      comlink.proxy((graph) => {
        setGraph(graph);
        setNodes(
          graph.nodes
            .map((n) => n.v.split(' | ')[0])
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort(sortString)
        );
      })
    );
  }, []);
  return { graph, nodes };
}

export function useStations(nodes: Nodes) {
  const [stations, setStations] = useState<Station>(['', '']);

  // Load start and end stations from the URL.
  useEffect(() => {
    if (nodes.length) {
      const params = new URL(window.location.href).searchParams;
      const start = params.get('start');
      const end = params.get('end');
      if (start && end) {
        if (~nodes.indexOf(start) && ~nodes.indexOf(end)) {
          setStations((currentStations) => {
            if (start !== currentStations[0] || end !== currentStations[1]) {
              return [start, end];
            }
            return currentStations;
          });
        }
      }
    }
  }, [nodes]);

  // Set start and end stations back to the URL when changed.
  useEffect(() => {
    if (stations[0] && stations[1]) {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      params.set('start', stations[0]);
      params.set('end', stations[1]);
      url.search = params.toString();
      window.history.replaceState({ url: url.toString() }, '', url.toString());
    }
  }, [stations]);

  return { stations, setStations };
}

export function useRoutes(graph: Graph | undefined, stations: Station) {
  const [loading, setLoading] = useState<boolean>(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeRoute, setActiveRoute] = useState(-1);

  useEffect(() => {
    if (graph && stations[0] && stations[1]) {
      setLoading(true);
      setRoutes([]);
      worker.route(
        stations[0],
        stations[1],
        comlink.proxy((rawRoute: RawRoute | undefined) => {
          if (rawRoute === undefined) {
            setLoading(false);
            setActiveRoute(0);
          } else {
            const newRoute = {
              ...rawRoute,
              path: processPath(rawRoute.path),
            };
            setRoutes((routes) => {
              return [...routes, newRoute].sort((a, b) => a.cost - b.cost);
            });
          }
        })
      );
    }
  }, [graph, stations]);

  return {
    loading,
    routes,
    activeRoute,
    setActiveRoute,
  };
}

const App: React.FC = () => {
  useEffect(() => {
    FocusStyleManager.onlyShowFocusOnTabs();
  }, []);

  const { graph, nodes } = useGraph();
  const { stations, setStations } = useStations(nodes);
  const { loading, routes, activeRoute, setActiveRoute } = useRoutes(
    graph,
    stations
  );

  return (
    <div className={styles.app}>
      <NodesContext.Provider value={nodes}>
        <StationsContext.Provider value={{ stations, setStations }}>
          <LoadingContext.Provider value={loading}>
            <RoutesContext.Provider value={routes}>
              <ActiveRouteContext.Provider
                value={{ activeRoute, setActiveRoute }}
              >
                <Map />
                <Drawer />
              </ActiveRouteContext.Provider>
            </RoutesContext.Provider>
          </LoadingContext.Provider>
        </StationsContext.Provider>
      </NodesContext.Provider>
    </div>
  );
};

export default App;
