import * as comlink from 'comlink';

import sha1 from 'crypto-js/sha1';
import graphlib, { Edge } from 'graphlib';
import * as ksp from 'k-shortest-path';

import stations from './data/stations.json';

type Indices = number[] | number;
type Station = Record<string, Indices>;
type Stations = Record<string, Station>;

export interface Graph {
  nodes: { v: string }[];
  edges: { v: string; w: string; value: number }[];
}

export interface Route {
  key: string;
  cost: number;
  path: string[];
}

export interface WorkerType {
  build(callback: (graph: Graph) => void): void;
  route(start: string, end: string, callback: (route: Route) => void): void;
}

export const ADJACENT_COST = 2;
export const INTERCHANGE_COST = 13;
export const LOOP_JOINT_COST = 0;
export const SEPARATOR = ' | ';
const K = 4;

export function createGraph(stations: Stations) {
  const graph = new graphlib.Graph();

  const linesMap: Record<string, Record<string | number, string>> = {};
  const interchanges = new Array<[string, Record<string, Indices>]>();

  // Aggregate station by lines, and record interchanges.
  Object.entries(stations).forEach((entry) => {
    const [station, pos] = entry;
    const positions = Object.entries(pos);
    positions.forEach(([line, indices]) => {
      if (!linesMap[line]) {
        linesMap[line] = {};
      }
      new Array<number>().concat(indices).forEach((index) => {
        const code = [station, line, index].join(SEPARATOR);
        linesMap[line][index] = code;
      });
    });
    if (positions.length > 1) {
      interchanges.push(entry);
    }
  });

  // Normalize each line to array of stations ordered by the position.
  const lines: Record<string, string[]> = {};
  Object.keys(linesMap).forEach((line) => {
    lines[line] = Object.entries(linesMap[line]).map(([_, station]) => station);
  });

  // Create edges for each every adjacent stations in the same line.
  Object.entries(lines).forEach(([_, stations]) => {
    stations.forEach((station, i) => {
      const next = stations[i + 1];
      if (next) {
        graph.setEdge(station, next, ADJACENT_COST);
        graph.setEdge(next, station, ADJACENT_COST);
      }
    });
  });

  // Process interchange stations.
  interchanges.forEach(([station, pos]) => {
    const flattened = new Array<[string, number]>();
    // Flatten the position objects.
    Object.entries(pos).forEach(([line, indices]) => {
      if (Array.isArray(indices)) {
        flattened.push([line, indices[0]]);
        flattened.push([line, indices[1]]);
      } else {
        flattened.push([line, indices]);
      }
    });
    for (let i = 0; i < flattened.length; i += 1) {
      for (let j = i + 1; j < flattened.length; j += 1) {
        const [lineA, indexA] = flattened[i];
        const codeA = [station, lineA, indexA].join(SEPARATOR);
        const [lineB, indexB] = flattened[j];
        const codeB = [station, lineB, indexB].join(SEPARATOR);
        if (lineA === lineB) {
          // The station appears twice on the same line. Which is the joint
          // point of the loop lines.
          graph.setEdge(codeA, codeB, LOOP_JOINT_COST);
          graph.setEdge(codeB, codeA, LOOP_JOINT_COST);
        } else {
          // Interchangeable platforms on different lines.
          graph.setEdge(codeA, codeB, INTERCHANGE_COST);
          graph.setEdge(codeB, codeA, INTERCHANGE_COST);
        }
      }
    }
  });

  return graph;
}

export function prunePath(edges: ksp.Edge[], end: string) {
  const path = [];
  let cost = 0;
  let carry;
  for (let i = 0; i < edges.length; i += 1) {
    const { fromNode, toNode, weight } = edges[i];
    if (weight === ADJACENT_COST) {
      if (carry && carry !== fromNode) {
        path.push(carry);
        cost += INTERCHANGE_COST;
      }
      path.push(fromNode);
      carry = toNode;
      cost += weight;
    }
    if (toNode.split(SEPARATOR)[0] === end) {
      path.push(toNode);
      break;
    }
  }
  return { cost, path };
}

export function* shortestPaths(
  graph: graphlib.Graph,
  start: string,
  end: string
): Generator<Route, void, unknown> {
  if (start === end) {
    yield {
      key: '',
      cost: 0,
      path: [],
    };
  }

  // Find all the nodes that match the start and end station.
  const nodes = graph.nodes();
  const startNodes = new Array<string>();
  const endNodes = new Array<string>();
  nodes.forEach((node) => {
    const station = node.split(SEPARATOR)[0];
    if (station === start) {
      startNodes.push(node);
    }
    if (station === end) {
      endNodes.push(node);
    }
  });

  const pathMap: Record<string, boolean> = {};
  let minCost: number = Infinity;

  // For all the combinations of start and end nodes, run the ksp
  for (let i = 0; i < startNodes.length; i += 1) {
    for (let j = 0; j < endNodes.length; j += 1) {
      const startNode = startNodes[i];
      const endNode = endNodes[j];

      // Run the KSP on each pair of start and end nodes.
      const results = ksp.ksp(graph, startNode, endNode, K);

      // Collect path from each result.
      for (let k = 0; k < results.length; k += 1) {
        const result = results[k];
        const { edges } = result;
        const route = prunePath(edges, end);
        const key = sha1(route.path.join(',')).toString().substr(0, 7);

        // Only yield non duplicate routes, and the cost should be acceptable.
        if (
          !pathMap[key] &&
          route.cost < minCost * 1.5 &&
          route.cost < minCost + 20
        ) {
          yield { ...route, key };
          pathMap[key] = true;
          minCost = Math.min(minCost, route.cost);
        }
      }
    }
  }
}

let graph: graphlib.Graph;
export function build(callback: Function) {
  if (graph) {
    return graph;
  }
  graph = createGraph(stations);
  callback(graphlib.json.write(graph));
  return graph;
}

export function route(start: string, end: string, callback: Function) {
  const graph = build(() => undefined);
  const it = shortestPaths(graph, start, end);
  for (const result of it) {
    callback(result);
  }
  callback();
}

class Worker {
  build = build;
  route = route;
}

export default Worker;

comlink.expose({ build, route });
