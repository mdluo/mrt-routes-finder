declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export default WebpackWorker;
}

declare module 'k-shortest-path' {
  interface Edge {
    fromNode: string;
    toNode: string;
    weight: number;
  }
  interface Result {
    totalCost: number;
    edges: Edge[];
  }
  export function ksp(
    g: graphlib.Graph,
    source: string,
    target: string,
    K: number,
    weightFunc?: (edge: graphlib.Edge) => number,
    edgeFunc?: Function
  ): Result[];
}

declare interface Route {
  key: string;
  cost: number;
  path: PathNode[];
}

declare interface PathNode {
  station: string;
  line: string;
  index: string;
  type: 'start' | 'end' | 'interchange1' | 'interchange2' | 'normal';
  nextLine?: string;
  prevLine?: string;
}

declare type Coord = [number, number];
declare type Coords = Record<string, Coord>;
