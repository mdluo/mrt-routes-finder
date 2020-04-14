const fs = require('fs');
const got = require('got');

// http://wiki.openstreetmap.org/wiki/Mass_Rapid_Transit_%28Singapore%29
const lines = [
  { code: 'NS', id: 2312797 },
  { code: 'EW', id: 2312796 },
  { code: 'JS', id: 8312417 },
  { code: 'SE', id: 9663107 },
  { code: 'BP', id: 1159434 },
  { code: 'CC', id: 7981669 },
  { code: 'CE', id: 2076291 },
  { code: 'DT', id: 2313458 },
  { code: 'TE', id: 2383439 },
  { code: 'NE', id: 2293545 },
  { code: 'JE', id: 8312416 },
  { code: 'CG', id: 7981690 },
  { code: 'SW', id: 9663108 },
  { code: 'PE', id: 1146942 },
  { code: 'PE', id: 8312414 },
  { code: 'PW', id: 2312984 },
];

const custom = {
  Dakota: [1.308438, 103.88832],
  'Holland Village': [1.312117, 103.795744],
  'Pasir Panjang': [1.276177, 103.791614],
  'Peng Kang Hill': [1.3428682, 103.6785915],
  'Punggol Coast': [1.4153437, 103.9106768],
};

const gotCache = new Map();
const gotClient = got.extend({
  prefixUrl: 'https://api.openstreetmap.org/api/0.6',
  responseType: 'json',
  cache: gotCache,
});

async function request(...args) {
  const res = await gotClient(...args);
  return res.body.elements[0];
}

async function download(code) {
  const stations = { ...custom };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (code !== undefined && line.code !== code) {
      continue;
    }
    const { members } = await request(`/relation/${line.id}.json`);
    const nodes = members.filter((m) => m.type === 'node');

    const res = await Promise.all(
      nodes.map(({ ref }) => request(`/node/${ref}.json`))
    );
    res
      .filter(({ tags }) => tags && tags.name)
      .forEach(({ lat, lon, tags }) => {
        const name = tags.name.split('(')[0].trim();
        stations[name] = [lat, lon];
      });
    console.log(line.code);
  }
  return Object.keys(stations)
    .sort((a, b) => {
      const aL = a.toLowerCase();
      const bL = b.toLowerCase();
      if (aL < bL) {
        return -1;
      }
      if (aL > bL) {
        return 1;
      }
      return 0;
    })
    .reduce((obj, station) => {
      obj[station] = stations[station];
      return obj;
    }, {});
}

function check(coords) {
  const stations = JSON.parse(
    fs.readFileSync('src/data/stations.json').toString()
  );
  const missingList = [];
  Object.keys(stations).forEach((station) => {
    if (!coords[station]) {
      missingList.push(station);
    }
  });
  if (missingList.length) {
    throw new Error(`Missing stations: ${missingList.join(', ')}`);
  }
}

async function run(code) {
  const coords = await download(code);
  check(coords);
  const coordsStr = JSON.stringify(coords, null, 2);
  const replaced = coordsStr.replace(
    // https://regex101.com/r/F9gByQ/1
    /(?<=\[)\s+([\d.]+,)\s+([\d.]+)\s+(?=\])/gm,
    (_, p1, p2) => `${p1} ${p2}`
  );
  fs.writeFileSync(`src/data/coords.json`, replaced);
}

run();
