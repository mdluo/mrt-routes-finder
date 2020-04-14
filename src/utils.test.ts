import { getLineColor, sortString, processPath } from './utils';

describe('getLineColor', () => {
  test('get known line color', () => {
    const color = getLineColor('EW');
    expect(color).toBe('#009530');
  });

  test('get known line code', () => {
    const color = getLineColor('EW', true);
    expect(color).toBe('EW');
  });

  test('get known line color', () => {
    const color = getLineColor('TS');
    expect(color).toBe('#748477');
  });

  test('get unknown line code', () => {
    const color = getLineColor('TS', true);
    expect(color).toBe('XX');
  });
});

describe('sortString', () => {
  test('work with sort', () => {
    const res = ['cc', 'b', 'ca', 'c', 'a', 'c'].sort(sortString);
    expect(res).toEqual(['a', 'b', 'c', 'c', 'ca', 'cc']);
  });
});

describe('processPath', () => {
  test('path with 2 nodes', () => {
    const path = ['A | TS | 1', 'B | TS | 2'];
    expect(processPath(path)).toEqual([
      { type: 'start', station: 'A', line: 'TS', index: '1' },
      { type: 'end', station: 'B', line: 'TS', index: '2' },
    ]);
  });

  test('path with normal nodes', () => {
    const path = ['A | TS | 1', 'B | TS | 2', 'C | TS | 3'];
    expect(processPath(path)).toEqual([
      { type: 'start', station: 'A', line: 'TS', index: '1' },
      { type: 'normal', station: 'B', line: 'TS', index: '2' },
      { type: 'end', station: 'C', line: 'TS', index: '3' },
    ]);
  });

  test('path with interchanges', () => {
    const path = ['A | TS | 1', 'B | TS | 2', 'B | TC | 1', 'C | TC | 2'];
    expect(processPath(path)).toEqual([
      { type: 'start', station: 'A', line: 'TS', index: '1' },
      { type: 'interchange1', station: 'B', line: 'TS', index: '2' },
      { type: 'interchange2', station: 'B', line: 'TC', index: '1' },
      { type: 'end', station: 'C', line: 'TC', index: '2' },
    ]);
  });
});
