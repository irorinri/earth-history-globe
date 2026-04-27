import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'data', 'borders');

const sourceBase =
  'https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson';

const eras = [
  { year: 1492, label: '1492' },
  { year: 1815, label: '1815' },
  { year: 1880, label: '1880' },
  { year: 1914, label: '1914' },
  { year: 1938, label: '1938' },
  { year: 1945, label: '1945' },
  { year: 1960, label: '1960' },
  { year: 1994, label: '1994' },
  { year: 2010, label: '2010' },
];

const toleranceByYear = new Map([
  [1492, 0.08],
  [1815, 0.07],
]);

function roundCoord(value) {
  return Math.round(value * 1000) / 1000;
}

function samePoint(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function distanceSq(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function pointToSegmentDistanceSq(point, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return distanceSq(point, a);

  const t = Math.max(
    0,
    Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)),
  );
  const projected = [a[0] + t * dx, a[1] + t * dy];
  return distanceSq(point, projected);
}

function simplifyLine(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i += 1) {
    const distance = pointToSegmentDistanceSq(points[i], first, last);
    if (distance > maxDistance) {
      index = i;
      maxDistance = distance;
    }
  }

  if (maxDistance <= tolerance * tolerance) {
    return [first, last];
  }

  const left = simplifyLine(points.slice(0, index + 1), tolerance);
  const right = simplifyLine(points.slice(index), tolerance);
  return left.slice(0, -1).concat(right);
}

function simplifyRing(rawRing, tolerance) {
  const cleaned = [];
  for (const coord of rawRing) {
    const lon = Number(coord[0]);
    const lat = Number(coord[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const point = [roundCoord(lon), roundCoord(lat)];
    if (cleaned.length === 0 || !samePoint(cleaned[cleaned.length - 1], point)) {
      cleaned.push(point);
    }
  }

  if (cleaned.length < 4) return null;
  if (samePoint(cleaned[0], cleaned[cleaned.length - 1])) cleaned.pop();
  if (cleaned.length < 3) return null;

  let opposite = 1;
  let farthest = 0;
  for (let i = 1; i < cleaned.length; i += 1) {
    const distance = distanceSq(cleaned[0], cleaned[i]);
    if (distance > farthest) {
      farthest = distance;
      opposite = i;
    }
  }

  const firstHalf = simplifyLine(cleaned.slice(0, opposite + 1), tolerance);
  const secondHalf = simplifyLine(cleaned.slice(opposite).concat([cleaned[0]]), tolerance);
  const simplified = firstHalf.concat(secondHalf.slice(1));
  const ring = [];

  for (const point of simplified) {
    if (ring.length === 0 || !samePoint(ring[ring.length - 1], point)) {
      ring.push(point);
    }
  }

  if (!samePoint(ring[0], ring[ring.length - 1])) ring.push(ring[0]);
  return ring.length >= 4 ? ring : null;
}

function simplifyPolygon(polygon, tolerance) {
  const outer = simplifyRing(polygon[0] ?? [], tolerance);
  if (!outer) return null;

  const rings = [outer];
  for (const hole of polygon.slice(1)) {
    const simplified = simplifyRing(hole, tolerance);
    if (simplified) rings.push(simplified);
  }
  return rings;
}

function simplifyGeometry(geometry, tolerance) {
  if (!geometry) return null;

  if (geometry.type === 'Polygon') {
    const polygon = simplifyPolygon(geometry.coordinates, tolerance);
    return polygon ? { type: 'Polygon', coordinates: polygon } : null;
  }

  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates
      .map((polygon) => simplifyPolygon(polygon, tolerance))
      .filter(Boolean);
    return polygons.length ? { type: 'MultiPolygon', coordinates: polygons } : null;
  }

  return null;
}

function eachCoord(geometry, callback) {
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const coord of ring) callback(coord);
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const coord of ring) callback(coord);
      }
    }
  }
}

function bboxForGeometry(geometry) {
  const bbox = [Infinity, Infinity, -Infinity, -Infinity];
  eachCoord(geometry, ([lon, lat]) => {
    bbox[0] = Math.min(bbox[0], lon);
    bbox[1] = Math.min(bbox[1], lat);
    bbox[2] = Math.max(bbox[2], lon);
    bbox[3] = Math.max(bbox[3], lat);
  });
  return bbox.every(Number.isFinite) ? bbox : null;
}

function compactProperties(properties = {}) {
  const name = properties.NAME ?? properties.name ?? properties.NAME_EN ?? 'Unknown';
  return {
    NAME: String(name),
    SUBJECTO: properties.SUBJECTO ? String(properties.SUBJECTO) : '',
    PARTOF: properties.PARTOF ? String(properties.PARTOF) : '',
    BORDERPRECISION: properties.BORDERPRECISION ? String(properties.BORDERPRECISION) : '',
  };
}

async function downloadJson(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'light-historical-globe-preparer' },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const existingDeepEras = await readExistingDeepEras();
  const manifest = [];

  for (const era of eras) {
    const filename = `world_${era.year}.geojson`;
    const url = `${sourceBase}/${filename}`;
    const tolerance = toleranceByYear.get(era.year) ?? 0.055;
    console.log(`Fetching ${filename}`);
    const source = await downloadJson(url);

    const features = [];
    for (const feature of source.features ?? []) {
      const geometry = simplifyGeometry(feature.geometry, tolerance);
      if (!geometry) continue;

      const bbox = bboxForGeometry(geometry);
      if (!bbox) continue;

      features.push({
        type: 'Feature',
        properties: compactProperties(feature.properties),
        bbox,
        geometry,
      });
    }

    const output = {
      type: 'FeatureCollection',
      metadata: {
        year: era.year,
        source: 'aourednik/historical-basemaps',
        tolerance,
      },
      features,
    };

    const outputFile = `world_${era.year}.min.geojson`;
    const outputPath = path.join(outDir, outputFile);
    await writeFile(outputPath, JSON.stringify(output), 'utf8');

    manifest.push({
      year: era.year,
      label: era.label,
      file: `data/borders/${outputFile}`,
      featureCount: features.length,
      source: url,
    });
    console.log(`Wrote ${outputFile} (${features.length} features)`);
  }

  await writeFile(
    path.join(root, 'data', 'eras.json'),
    `${JSON.stringify({ eras: [...existingDeepEras, ...manifest] }, null, 2)}\n`,
    'utf8',
  );
}

async function readExistingDeepEras() {
  try {
    const current = JSON.parse(await readFile(path.join(root, 'data', 'eras.json'), 'utf8'));
    return (current.eras ?? []).filter((era) => !era.file);
  } catch {
    return [];
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
