import { renderHook, act } from '@testing-library/react-hooks';

import { useGraph, useStations, useRoutes } from './App';
import { Graph } from '../worker';

jest.mock('comlink', () => ({
  wrap: (worker: unknown) => worker,
  proxy: (callback: unknown) => callback,
  expose: () => undefined,
}));

describe('useGraph', () => {
  test('works', () => {
    const { result } = renderHook(() => useGraph());
    const { graph, nodes } = result.current;

    expect(graph).toEqual({
      options: expect.any(Object),
      nodes: expect.any(Array),
      edges: expect.any(Array),
    });
    expect(graph?.nodes).toMatchSnapshot('graph.nodes');
    expect(graph?.edges).toMatchSnapshot('graph.edges');
    expect(nodes).toMatchSnapshot('edges');
  });
});

describe('useStations', () => {
  test('works', () => {
    const { result } = renderHook(({ nodes }) => useStations(nodes), {
      initialProps: { nodes: ['A', 'B'] },
    });
    expect(result.current.stations).toEqual(['', '']);
    expect(result.current.setStations).toBeInstanceOf(Function);
    act(() => {
      result.current.setStations(['A', 'B']);
    });
    expect(result.current.stations).toEqual(['A', 'B']);
  });

  describe('get stations from url params', () => {
    const { location } = window;

    beforeEach(() => {
      delete window.location;
    });

    afterEach(() => {
      window.location = location;
    });

    test('correct stations in url', () => {
      window.location = (new URL(
        'http://localhost/?start=A&end=B'
      ) as unknown) as Location;
      const { result } = renderHook(({ nodes }) => useStations(nodes), {
        initialProps: { nodes: ['A', 'B'] },
      });
      expect(result.current.stations).toEqual(['A', 'B']);
    });

    test('wrong stations in url', () => {
      window.location = (new URL(
        'http://localhost/?start=A&end=C'
      ) as unknown) as Location;
      const { result } = renderHook(({ nodes }) => useStations(nodes), {
        initialProps: { nodes: ['A', 'B'] },
      });
      expect(result.current.stations).toEqual(['', '']);
    });
  });

  describe('set stations to url params when changed', () => {
    let mockReplaceState: jest.SpyInstance;
    beforeEach(() => {
      mockReplaceState = jest.spyOn(window.history, 'replaceState');
    });

    test('works', () => {
      const { result } = renderHook(({ nodes }) => useStations(nodes), {
        initialProps: { nodes: ['A', 'B'] },
      });
      act(() => {
        result.current.setStations(['A', 'B']);
      });
      const url = 'http://localhost/?start=A&end=B';
      expect(mockReplaceState).toHaveBeenCalledWith({ url }, '', url);
    });
  });
});

describe('useRoutes', () => {
  test('no route before graph is ready', () => {
    const { result } = renderHook(
      ({ graph, stations }) => useRoutes(graph, stations as [string, string]),
      {
        initialProps: { graph: undefined, stations: ['', ''] },
      }
    );
    expect(result.current.loading).toEqual(false);
    expect(result.current.routes).toEqual([]);
    expect(result.current.activeRoute).toEqual(-1);
    expect(result.current.setActiveRoute).toBeInstanceOf(Function);
  });

  test('works', () => {
    const { result } = renderHook(
      ({ graph, stations }) => useRoutes(graph, stations as [string, string]),
      {
        initialProps: {
          graph: ({} as unknown) as Graph,
          stations: ['Admiralty', 'Aljunied'],
        },
      }
    );
    expect(result.current.routes).toMatchSnapshot();
    expect(result.current.activeRoute).toBe(0);

    act(() => {
      result.current.setActiveRoute(1);
    });
    expect(result.current.activeRoute).toBe(1);
  });
});
