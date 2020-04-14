import graphlib from 'graphlib';
import {
  Graph,
  ADJACENT_COST,
  INTERCHANGE_COST,
  LOOP_JOINT_COST,
  createGraph,
  shortestPaths,
  prunePath,
} from './worker';

describe('createGraph', () => {
  function formatNodes(nodes: string[]) {
    return nodes.map((n) => ({ v: n }));
  }

  function formatEdges(edges: [string, string, number][]) {
    const formatted = new Array<{ v: string; w: string; value: number }>();
    edges.forEach((edge) => {
      formatted.push({ v: edge[0], w: edge[1], value: edge[2] });
      formatted.push({ v: edge[1], w: edge[0], value: edge[2] });
    });
    return formatted;
  }

  test('empty stations', () => {
    const mockStations = {};
    const graph = createGraph(mockStations);
    const json = graphlib.json.write(graph) as Graph;
    expect(json.nodes).toEqual(formatNodes([]));
    expect(json.edges).toEqual(formatEdges([]));
  });

  test('adjacent stations on a single line', () => {
    const mockStations = {
      A: { NS: 1 },
      B: { NS: 2 },
    };
    const graph = createGraph(mockStations);
    const json = graphlib.json.write(graph) as Graph;
    expect(json.nodes).toEqual(formatNodes(['A | NS | 1', 'B | NS | 2']));
    expect(json.edges).toEqual(
      formatEdges([['A | NS | 1', 'B | NS | 2', ADJACENT_COST]])
    );
  });

  test('interchange', () => {
    const mockStations = {
      A: { NS: 1, EW: 1 },
      B: { NS: 2 },
      C: { EW: 2 },
    };
    const graph = createGraph(mockStations);
    const json = graphlib.json.write(graph) as Graph;
    expect(json.nodes).toEqual(
      formatNodes(['A | NS | 1', 'B | NS | 2', 'A | EW | 1', 'C | EW | 2'])
    );
    expect(json.edges).toEqual(
      formatEdges([
        ['A | NS | 1', 'B | NS | 2', ADJACENT_COST],
        ['A | EW | 1', 'C | EW | 2', ADJACENT_COST],
        ['A | NS | 1', 'A | EW | 1', INTERCHANGE_COST],
      ])
    );
  });

  test('loop line and interchange', () => {
    const mockStations = {
      A: { LP: [0, 2], NS: 1 },
      B: { NS: 2 },
      C: { LP: 1 },
    };
    const graph = createGraph(mockStations);
    const json = graphlib.json.write(graph) as Graph;
    expect(json.nodes).toEqual(
      formatNodes([
        'A | LP | 0',
        'C | LP | 1',
        'A | LP | 2',
        'A | NS | 1',
        'B | NS | 2',
      ])
    );
    expect(json.edges).toEqual(
      formatEdges([
        ['A | LP | 0', 'C | LP | 1', ADJACENT_COST],
        ['C | LP | 1', 'A | LP | 2', ADJACENT_COST],
        ['A | NS | 1', 'B | NS | 2', ADJACENT_COST],
        ['A | LP | 0', 'A | LP | 2', LOOP_JOINT_COST],
        ['A | LP | 0', 'A | NS | 1', INTERCHANGE_COST],
        ['A | LP | 2', 'A | NS | 1', INTERCHANGE_COST],
      ])
    );
  });
});

describe('prunePath', () => {
  test('A -> B -> B', () => {
    const mockEdges = [
      {
        fromNode: 'A | NS | 2',
        toNode: 'B | NS | 1',
        weight: ADJACENT_COST,
      },
      {
        fromNode: 'B | NS | 1',
        toNode: 'B | LP | 3',
        weight: INTERCHANGE_COST,
      },
    ];
    const { cost, path } = prunePath(mockEdges, 'B');
    expect(cost).toBe(ADJACENT_COST);
    expect(path).toEqual(['A | NS | 2', 'B | NS | 1']);
  });

  test('A -> A -> B -> B -> B -> C -> C', () => {
    const mockEdges = [
      {
        fromNode: 'A | EW | 2',
        toNode: 'A | NS | 2',
        weight: INTERCHANGE_COST,
      },
      {
        fromNode: 'A | NS | 2',
        toNode: 'B | NS | 1',
        weight: ADJACENT_COST,
      },
      {
        fromNode: 'B | NS | 1',
        toNode: 'B | CC | 1',
        weight: INTERCHANGE_COST,
      },
      {
        fromNode: 'B | CC | 1',
        toNode: 'B | NE | 1',
        weight: INTERCHANGE_COST,
      },
      {
        fromNode: 'B | NE | 1',
        toNode: 'C | NE | 2',
        weight: ADJACENT_COST,
      },
      {
        fromNode: 'C | NE | 2',
        toNode: 'C | LP | 0',
        weight: INTERCHANGE_COST,
      },
    ];
    const { cost, path } = prunePath(mockEdges, 'C');
    expect(cost).toBe(ADJACENT_COST + INTERCHANGE_COST + ADJACENT_COST);
    expect(path).toEqual([
      'A | NS | 2',
      'B | NS | 1',
      'B | NE | 1',
      'C | NE | 2',
    ]);
  });
});

describe('shortestPaths', () => {
  const mockStations = {
    A: { EW: 1 },
    B: { EW: 2, NS: 2 },
    C: { EW: 3 },
    D: { NS: 1, LP: [0, 3] },
    E: { NS: 3 },
    F: { LP: 1 },
    G: { LP: 2 },
  };
  const graph = createGraph(mockStations);

  test('A -> C', () => {
    const it = shortestPaths(graph, 'A', 'C');
    expect(it.next().value).toEqual({
      key: expect.any(String),
      cost: ADJACENT_COST * 2,
      path: ['A | EW | 1', 'B | EW | 2', 'C | EW | 3'],
    });
    expect(it.next().done).toBe(true);
  });

  test('B -> B', () => {
    const it = shortestPaths(graph, 'B', 'B');
    expect(it.next().value).toEqual({
      key: expect.any(String),
      cost: 0,
      path: [],
    });
  });

  test('B -> D', () => {
    const it = shortestPaths(graph, 'B', 'D');
    expect(it.next().value).toEqual({
      key: expect.any(String),
      cost: ADJACENT_COST,
      path: ['B | NS | 2', 'D | NS | 1'],
    });
    expect(it.next().done).toBe(true);
  });

  test('B -> G', () => {
    const it = shortestPaths(graph, 'B', 'G');
    expect(it.next().value).toEqual({
      key: expect.any(String),
      cost: ADJACENT_COST * 2 + INTERCHANGE_COST,
      path: ['B | NS | 2', 'D | NS | 1', 'D | LP | 3', 'G | LP | 2'],
    });
    expect(it.next().value).toEqual({
      key: expect.any(String),
      cost: ADJACENT_COST * 3 + INTERCHANGE_COST,
      path: [
        'B | NS | 2',
        'D | NS | 1',
        'D | LP | 0',
        'F | LP | 1',
        'G | LP | 2',
      ],
    });
    expect(it.next().done).toBe(true);
  });
});
