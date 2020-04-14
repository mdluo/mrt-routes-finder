export function getLineColor(line: string, code: boolean = false) {
  const colorMap = {
    EW: '#009530',
    CG: '#009530',
    NS: '#dc241f',
    NE: '#9016b2',
    CC: '#ff9a00',
    CE: '#ff9a00',
    DT: '#0354a6',
    TE: '#734538',
  };
  if (colorMap[line as keyof typeof colorMap]) {
    return code ? line : colorMap[line as keyof typeof colorMap];
  } else {
    return code ? 'XX' : '#748477';
  }
}

export function sortString(a: string, b: string) {
  const aL = a.toLowerCase();
  const bL = b.toLowerCase();
  if (aL < bL) {
    return -1;
  }
  if (aL > bL) {
    return 1;
  }
  return 0;
}

export function processPath(path: string[]): PathNode[] {
  const nodes = path.map((p) => {
    const [station, line, index] = p.split(' | ');
    return { station, line, index };
  });
  return nodes.map((node, i) => {
    if (i === 0) {
      return { ...node, type: 'start' };
    }
    if (i === path.length - 1) {
      return { ...node, type: 'end' };
    }
    const next = nodes[i + 1];
    if (next && next.station === node.station) {
      return { ...node, type: 'interchange1', nextLine: next.line };
    }
    const prev = nodes[i - 1];
    if (prev && prev.station === node.station) {
      return { ...node, type: 'interchange2', prevLine: prev.line };
    }
    return { ...node, type: 'normal' };
  });
}
