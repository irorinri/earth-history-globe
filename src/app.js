import * as THREE from '../vendor/three.module.min.js';
import { OrbitControls } from '../vendor/OrbitControls.js';

const RADIUS = 1;
const LAND_RADIUS = 1.002;
const BORDER_RADIUS = 1.006;
const SELECTED_RADIUS = 1.014;
const MARKER_RADIUS = 1.03;
const MAX_BORDER_SEGMENT_DEGREES = 1.25;
const MIN_DISTANCE = 1.35;
const MAX_DISTANCE = 4.25;
const START_DISTANCE = 2.75;
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const stage = document.querySelector('#globe-stage');
const loading = document.querySelector('#loading');
const detailTierEl = document.querySelector('#detail-tier');
const featureCountEl = document.querySelector('#feature-count');
const infoTitle = document.querySelector('#info-title');
const infoBody = document.querySelector('#info-body');
const eraTitle = document.querySelector('#era-title');
const yearReadout = document.querySelector('#year-readout');
const eraRange = document.querySelector('#era-range');
const eraTicks = document.querySelector('#era-ticks');

const state = {
  eras: [],
  eraIndex: 0,
  geojson: null,
  landMesh: null,
  borderLines: null,
  selectedFeature: null,
  selectedEvent: null,
  selectedLonLat: null,
  detailTier: 'far',
  cache: new Map(),
};

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.setSize(stage.clientWidth, stage.clientHeight);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf8f8f6);

const camera = new THREE.PerspectiveCamera(
  36,
  stage.clientWidth / Math.max(1, stage.clientHeight),
  0.01,
  100,
);
camera.position.set(0, 0.18, START_DISTANCE);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.rotateSpeed = 0.62;
controls.zoomSpeed = 0.82;
controls.minDistance = MIN_DISTANCE;
controls.maxDistance = MAX_DISTANCE;
controls.autoRotateSpeed = 0.45;

scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e8e3, 2.85));

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(RADIUS, 96, 48),
  new THREE.MeshLambertMaterial({
    color: 0xf0f8fb,
  }),
);
scene.add(globe);

const graticule = new THREE.LineSegments(
  createGraticuleGeometry(),
  new THREE.LineBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  }),
);
scene.add(graticule);

const eraMarkerGroup = new THREE.Group();
scene.add(eraMarkerGroup);

const selectedGroup = new THREE.Group();
scene.add(selectedGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let pointerDown = null;
let pendingEraLoad = 0;

init().catch((error) => {
  console.error(error);
  infoTitle.textContent = '読み込みに失敗しました';
  infoBody.textContent = error.message;
});

async function init() {
  const manifest = await fetchJson('data/eras.json');
  state.eras = manifest.eras;
  state.eraIndex = Math.max(0, state.eras.length - 1);

  eraRange.min = '0';
  eraRange.max = String(state.eras.length - 1);
  eraRange.value = String(state.eraIndex);
  eraTicks.style.setProperty('--tick-count', String(state.eras.length));
  eraTicks.innerHTML = buildEraTicks(state.eras);

  wireUi();
  await loadEra(state.eraIndex);
  updateDetailTier(true);
  animate();
}

function wireUi() {
  document.querySelector('#zoom-in').addEventListener('click', () => zoomBy(0.82));
  document.querySelector('#zoom-out').addEventListener('click', () => zoomBy(1.18));
  document.querySelector('#reset-view').addEventListener('click', resetView);
  document.querySelector('#auto-rotate').addEventListener('click', (event) => {
    controls.autoRotate = !controls.autoRotate;
    event.currentTarget.dataset.active = String(controls.autoRotate);
  });

  document.querySelector('#era-prev').addEventListener('click', () => stepEra(-1));
  document.querySelector('#era-next').addEventListener('click', () => stepEra(1));

  eraRange.addEventListener('input', () => {
    state.eraIndex = Number(eraRange.value);
    updateYearReadout();
    clearTimeout(pendingEraLoad);
    pendingEraLoad = window.setTimeout(() => loadEra(state.eraIndex), 90);
  });

  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' && !event.isPrimary) return;
    pointerDown = { x: event.clientX, y: event.clientY, time: performance.now() };
  });

  renderer.domElement.addEventListener('pointerup', (event) => {
    if (!pointerDown) return;
    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    const moved = Math.hypot(dx, dy);
    const elapsed = performance.now() - pointerDown.time;
    pointerDown = null;
    if (moved <= 9 && elapsed <= 650) pickGlobe(event);
  });

  window.addEventListener('resize', resize);
}

async function loadEra(index) {
  const era = state.eras[index];
  if (!era) return;

  loading.hidden = false;
  updateYearReadout();

  try {
    let geojson = { type: 'FeatureCollection', features: [] };
    if (era.file) {
      geojson = state.cache.get(era.file);
      if (!geojson) {
        geojson = await fetchJson(era.file);
        state.cache.set(era.file, geojson);
      }
    }

    state.geojson = geojson;
    document.documentElement.dataset.era = era.id ?? String(index);
    document.documentElement.dataset.year = String(era.year ?? era.id ?? index);
    state.selectedFeature = null;
    state.selectedEvent = null;
    state.selectedLonLat = null;
    selectedGroup.clear();

    if (state.landMesh) {
      state.landMesh.geometry.dispose();
      state.landMesh.material.map?.dispose();
      state.landMesh.material.dispose();
      scene.remove(state.landMesh);
      state.landMesh = null;
    }

    if (state.borderLines) {
      state.borderLines.geometry.dispose();
      state.borderLines.material.dispose();
      scene.remove(state.borderLines);
      state.borderLines = null;
    }

    if (geojson.features.length > 0) {
      state.landMesh = new THREE.Mesh(
        new THREE.SphereGeometry(LAND_RADIUS, 96, 48),
        new THREE.MeshBasicMaterial({
          map: buildLandTexture(geojson),
          transparent: true,
          depthWrite: false,
        }),
      );
      state.landMesh.renderOrder = 1;
      scene.add(state.landMesh);

      state.borderLines = new THREE.LineSegments(
        buildBorderGeometry(geojson, BORDER_RADIUS),
        new THREE.LineBasicMaterial({
          color: 0x111111,
          transparent: true,
          opacity: 0.58,
          depthWrite: false,
        }),
      );
      state.borderLines.renderOrder = 2;
      scene.add(state.borderLines);
    }

    buildEraMarkers(era);
    updateFeatureCount(era);
    renderInfo();
  } finally {
    loading.hidden = true;
  }
}

function animate() {
  controls.update();
  updateDetailTier(false);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function resize() {
  const width = stage.clientWidth;
  const height = Math.max(1, stage.clientHeight);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
}

function zoomBy(factor) {
  const direction = camera.position.clone().normalize();
  const distance = THREE.MathUtils.clamp(camera.position.length() * factor, MIN_DISTANCE, MAX_DISTANCE);
  camera.position.copy(direction.multiplyScalar(distance));
  controls.update();
  updateDetailTier(true);
}

function resetView() {
  camera.position.set(0, 0.18, START_DISTANCE);
  controls.target.set(0, 0, 0);
  controls.update();
  updateDetailTier(true);
}

function stepEra(delta) {
  const next = THREE.MathUtils.clamp(state.eraIndex + delta, 0, state.eras.length - 1);
  if (next === state.eraIndex) return;
  state.eraIndex = next;
  eraRange.value = String(next);
  loadEra(next);
}

function updateYearReadout() {
  const era = state.eras[state.eraIndex];
  eraTitle.textContent = era ? era.title || era.label : '地球型歴史地図';
  yearReadout.value = era ? era.label : '';
  yearReadout.textContent = era ? era.label : '';
}

function updateDetailTier(force) {
  const distance = camera.position.length();
  const next = distance > 2.85 ? 'far' : distance > 1.85 ? 'mid' : 'near';
  if (!force && next === state.detailTier) return;

  state.detailTier = next;
  detailTierEl.dataset.tier = next;
  detailTierEl.textContent = next === 'far' ? '遠景' : next === 'mid' ? '標準' : '近景';

  if (state.borderLines) {
    state.borderLines.material.opacity = next === 'far' ? 0.38 : next === 'mid' ? 0.56 : 0.76;
  }
  graticule.material.opacity = next === 'near' ? 0.06 : 0.08;

  for (const marker of eraMarkerGroup.children) {
    marker.material.opacity = next === 'far' ? 0.38 : next === 'mid' ? 0.62 : 0.9;
    marker.scale.setScalar(next === 'near' ? 1.2 : 1);
  }
  renderInfo();
}

function pickGlobe(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const markerHit = raycaster.intersectObjects(eraMarkerGroup.children, false)[0];
  if (markerHit?.object?.userData?.event) {
    const eventData = markerHit.object.userData.event;
    const lonLat = { lon: eventData.lon, lat: eventData.lat };
    selectEvent(eventData, lonLat);
    return;
  }

  const hit = raycaster.intersectObject(globe, false)[0];
  if (!hit) return;

  const lonLat = vectorToLonLat(hit.point);
  const nearbyEvent = findNearbyEvent(lonLat);
  const feature = findFeatureAt(lonLat.lon, lonLat.lat);

  state.selectedFeature = feature;
  state.selectedEvent = nearbyEvent;
  state.selectedLonLat = lonLat;
  drawSelection(feature, nearbyEvent, lonLat);
  renderInfo();
}

function selectEvent(eventData, lonLat) {
  state.selectedFeature = null;
  state.selectedEvent = eventData;
  state.selectedLonLat = lonLat;
  drawSelection(null, eventData, lonLat);
  renderInfo();
}

function drawSelection(feature, eventData, lonLat) {
  selectedGroup.clear();

  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(eventData ? 0.026 : 0.014, 18, 12),
    new THREE.MeshBasicMaterial({ color: 0x111111, depthTest: true }),
  );
  marker.position.copy(lonLatToVector3(lonLat.lon, lonLat.lat, SELECTED_RADIUS + 0.012));
  selectedGroup.add(marker);

  if (!feature) return;

  const outline = new THREE.LineSegments(
    buildBorderGeometry({ features: [feature] }, SELECTED_RADIUS),
    new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    }),
  );
  outline.renderOrder = 3;
  selectedGroup.add(outline);
}

function renderInfo() {
  const era = state.eras[state.eraIndex];
  if (!era || !state.geojson) {
    infoTitle.textContent = '地球型歴史地図';
    infoBody.textContent = '';
    return;
  }

  if (state.selectedEvent) {
    document.documentElement.dataset.selection = 'event';
    infoTitle.textContent = state.selectedEvent.title;
    infoBody.innerHTML = makeDefinitionList(eventRows(era, state.selectedEvent));
    return;
  }

  if (!state.selectedLonLat) {
    document.documentElement.dataset.selection = 'none';
    infoTitle.textContent = era.title || `${era.label} の地球`;
    infoBody.innerHTML = makeDefinitionList(eraRows(era));
    return;
  }

  if (!state.selectedFeature) {
    document.documentElement.dataset.selection = 'water';
    infoTitle.textContent = era.category === 'history' ? '海域または未定義地域' : '地球史情報';
    infoBody.innerHTML = makeDefinitionList([
      ...eraRows(era),
      ['経度', formatLon(state.selectedLonLat.lon)],
      ['緯度', formatLat(state.selectedLonLat.lat)],
    ]);
    return;
  }

  const props = state.selectedFeature.properties;
  document.documentElement.dataset.selection = 'feature';
  const rows = [
    ['時代', era.label],
    ['名称', props.NAME || 'Unknown'],
  ];

  if (state.detailTier !== 'far') {
    rows.push(
      ['宗主国・主体', props.SUBJECTO || props.NAME || '不明'],
      ['所属', props.PARTOF || 'なし'],
      ['国境精度', precisionLabel(props.BORDERPRECISION)],
    );
  }

  if (state.detailTier === 'near') {
    rows.push(
      ['経度', formatLon(state.selectedLonLat.lon)],
      ['緯度', formatLat(state.selectedLonLat.lat)],
      ['形状', state.selectedFeature.geometry.type],
      ['出典', 'historical-basemaps'],
    );
  }

  infoTitle.textContent = props.NAME || 'Unknown';
  infoBody.innerHTML = makeDefinitionList(rows);
}

function eraRows(era) {
  const rows = [
    ['時代', era.label],
    ['区分', era.categoryLabel || '地球史'],
  ];

  const eventCount = (era.events ?? []).length;
  if (state.geojson.features.length > 0) rows.push(['地域数', String(state.geojson.features.length)]);
  if (eventCount > 0) rows.push(['地点', `${eventCount}件`]);

  rows.push(['表示', detailText(era)]);

  if (state.detailTier !== 'far') {
    rows.push(
      ['環境', era.environment || '未設定'],
      ['生物', era.biology || '未設定'],
    );
  }

  if (state.detailTier === 'near') {
    rows.push(
      ['地図データ', mapDataLabel(era)],
      ['注記', era.note || '代表的な時代を段階的に並べています。'],
    );
  }

  return rows;
}

function eventRows(era, eventData) {
  const rows = [
    ['時代', era.label],
    ['地点', eventData.place || '未設定'],
    ['概要', eventData.summary || '未設定'],
  ];

  if (state.detailTier !== 'far') {
    rows.push(
      ['生物', eventData.biology || era.biology || '未設定'],
      ['環境', eventData.environment || era.environment || '未設定'],
    );
  }

  if (state.detailTier === 'near') {
    rows.push(
      ['経度', formatLon(eventData.lon)],
      ['緯度', formatLat(eventData.lat)],
      ['注記', eventData.note || era.note || '位置は代表地点です。'],
    );
  }

  return rows;
}

function detailText(era) {
  if (era.category === 'history') {
    if (state.detailTier === 'far') return '国境線のみ';
    if (state.detailTier === 'mid') return '基本情報';
    return '詳細情報';
  }

  if (state.detailTier === 'far') return era.file ? '最新世界地図 + 時代概要' : '時代概要';
  if (state.detailTier === 'mid') return era.file ? '最新世界地図 + 生物史情報' : '生物史情報';
  return era.file ? '最新世界地図 + 地点・環境情報' : '地点・環境情報';
}

function mapDataLabel(era) {
  if (era.category === 'history') return '時代別国境ベクター';
  if (era.file) return '2010年世界地図ベクター';
  return '生物史マーカー';
}

function updateFeatureCount(era) {
  const regionCount = state.geojson?.features?.length ?? 0;
  const eventCount = (era.events ?? []).length;
  if (regionCount > 0 && eventCount > 0) {
    featureCountEl.textContent = `${regionCount} regions / ${eventCount} sites`;
  } else if (regionCount > 0) {
    featureCountEl.textContent = `${regionCount} regions`;
  } else if (eventCount > 0) {
    featureCountEl.textContent = `${eventCount} sites`;
  } else {
    featureCountEl.textContent = 'global era';
  }
}

function buildEraMarkers(era) {
  eraMarkerGroup.clear();
  const events = (era.events ?? []).filter((eventData) =>
    Number.isFinite(eventData.lon) && Number.isFinite(eventData.lat),
  );

  for (const eventData of events) {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 16, 10),
      new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: state.detailTier === 'far' ? 0.38 : 0.72,
        depthTest: true,
      }),
    );
    marker.position.copy(lonLatToVector3(eventData.lon, eventData.lat, MARKER_RADIUS));
    marker.userData.event = eventData;
    eraMarkerGroup.add(marker);
  }
}

function findNearbyEvent(lonLat) {
  const era = state.eras[state.eraIndex];
  const events = (era.events ?? []).filter((eventData) =>
    Number.isFinite(eventData.lon) && Number.isFinite(eventData.lat),
  );
  if (events.length === 0) return null;

  const maxDistance = state.detailTier === 'near' ? 7 : state.detailTier === 'mid' ? 10 : 14;
  let best = null;
  let bestDistance = Infinity;

  for (const eventData of events) {
    const distance = greatCircleDistance(lonLat.lon, lonLat.lat, eventData.lon, eventData.lat);
    if (distance < bestDistance) {
      best = eventData;
      bestDistance = distance;
    }
  }

  return bestDistance <= maxDistance ? best : null;
}

function buildBorderGeometry(geojson, radius) {
  const positions = [];
  for (const feature of geojson.features ?? []) {
    forEachRing(feature.geometry, (ring) => {
      for (let i = 0; i < ring.length - 1; i += 1) {
        addBorderSegment(positions, ring[i], ring[i + 1], radius);
      }
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function addBorderSegment(positions, startCoord, endCoord, radius) {
  const lonStart = Number(startCoord?.[0]);
  const latStart = Number(startCoord?.[1]);
  const lonEndRaw = Number(endCoord?.[0]);
  const latEnd = Number(endCoord?.[1]);
  if (![lonStart, latStart, lonEndRaw, latEnd].every(Number.isFinite)) return;

  const lonEnd = wrapLonNear(lonEndRaw, lonStart);
  const distance = greatCircleDistance(lonStart, latStart, lonEnd, latEnd);
  if (distance === 0) return;

  const steps = Math.max(1, Math.ceil(distance / MAX_BORDER_SEGMENT_DEGREES));
  let previous = lonLatToVector3(lonStart, latStart, radius);

  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    const lon = normalizeLon(lonStart + (lonEnd - lonStart) * t);
    const lat = latStart + (latEnd - latStart) * t;
    const next = lonLatToVector3(lon, lat, radius);
    positions.push(previous.x, previous.y, previous.z, next.x, next.y, next.z);
    previous = next;
  }
}

function buildLandTexture(geojson) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(255, 255, 250, 0.96)';

  for (const feature of geojson.features ?? []) {
    forEachPolygon(feature.geometry, (polygon) => {
      const outerRing = polygon[0];
      if (!outerRing || outerRing.length < 4) return;
      for (const offset of [-360, 0, 360]) {
        drawTextureRing(context, outerRing, canvas.width, canvas.height, offset);
      }
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}

function drawTextureRing(context, ring, width, height, lonOffset) {
  let started = false;
  context.beginPath();

  for (const coord of ring) {
    const lon = coord[0] + lonOffset;
    const lat = coord[1];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

    const x = ((lon + 90) / 360) * width;
    const y = ((90 - lat) / 180) * height;

    if (!started) {
      context.moveTo(x, y);
      started = true;
    } else {
      context.lineTo(x, y);
    }
  }

  if (started) {
    context.closePath();
    context.fill();
  }
}

function createGraticuleGeometry() {
  const positions = [];
  const addSegment = (a, b) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };

  for (let lon = -150; lon <= 180; lon += 30) {
    let prev = null;
    for (let lat = -80; lat <= 80; lat += 4) {
      const next = lonLatToVector3(lon, lat, RADIUS + 0.003);
      if (prev) addSegment(prev, next);
      prev = next;
    }
  }

  for (let lat = -60; lat <= 60; lat += 30) {
    let prev = null;
    for (let lon = -180; lon <= 180; lon += 4) {
      const next = lonLatToVector3(lon, lat, RADIUS + 0.003);
      if (prev) addSegment(prev, next);
      prev = next;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function forEachRing(geometry, callback) {
  if (!geometry) return;
  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) callback(ring);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) callback(ring);
    }
  }
}

function forEachPolygon(geometry, callback) {
  if (!geometry) return;
  if (geometry.type === 'Polygon') {
    callback(geometry.coordinates);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) callback(polygon);
  }
}

function findFeatureAt(lon, lat) {
  const matches = [];
  for (const feature of state.geojson?.features ?? []) {
    if (!bboxContains(feature.bbox, lon, lat)) continue;
    if (geometryContains(feature.geometry, lon, lat)) matches.push(feature);
  }

  if (matches.length === 0) return null;
  matches.sort((a, b) => bboxArea(a.bbox) - bboxArea(b.bbox));
  return matches[0];
}

function bboxContains(bbox, lon, lat) {
  if (!bbox || lat < bbox[1] || lat > bbox[3]) return false;
  const width = bbox[2] - bbox[0];
  if (width > 300) return true;
  return lon >= bbox[0] && lon <= bbox[2];
}

function bboxArea(bbox) {
  if (!bbox) return Infinity;
  return Math.abs((bbox[2] - bbox[0]) * (bbox[3] - bbox[1]));
}

function geometryContains(geometry, lon, lat) {
  if (geometry.type === 'Polygon') return polygonContains(geometry.coordinates, lon, lat);
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContains(polygon, lon, lat));
  }
  return false;
}

function polygonContains(polygon, lon, lat) {
  if (!ringContains(polygon[0], lon, lat)) return false;
  for (const hole of polygon.slice(1)) {
    if (ringContains(hole, lon, lat)) return false;
  }
  return true;
}

function ringContains(ring, lon, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const xi = wrapLonNear(ring[i][0], lon);
    const yi = ring[i][1];
    const xj = wrapLonNear(ring[j][0], lon);
    const yj = ring[j][1];
    const crosses = yi > lat !== yj > lat;
    if (crosses) {
      const x = ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (lon < x) inside = !inside;
    }
  }
  return inside;
}

function lonLatToVector3(lon, lat, radius) {
  const phi = lat * DEG;
  const theta = lon * DEG;
  const cosPhi = Math.cos(phi);
  return new THREE.Vector3(
    radius * cosPhi * Math.sin(theta),
    radius * Math.sin(phi),
    radius * cosPhi * Math.cos(theta),
  );
}

function vectorToLonLat(vector) {
  const normal = vector.clone().normalize();
  return {
    lon: normalizeLon(Math.atan2(normal.x, normal.z) * RAD),
    lat: Math.asin(THREE.MathUtils.clamp(normal.y, -1, 1)) * RAD,
  };
}

function greatCircleDistance(lonA, latA, lonB, latB) {
  const phiA = latA * DEG;
  const phiB = latB * DEG;
  const deltaPhi = (latB - latA) * DEG;
  const deltaLambda = (lonB - lonA) * DEG;
  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phiA) * Math.cos(phiB) * Math.sin(deltaLambda / 2) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * RAD;
}

function normalizeLon(lon) {
  let value = lon;
  while (value < -180) value += 360;
  while (value > 180) value -= 360;
  return value;
}

function wrapLonNear(lon, center) {
  let value = lon;
  while (value - center > 180) value -= 360;
  while (value - center < -180) value += 360;
  return value;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

function buildEraTicks(eras) {
  return eras
    .map((era, index) => {
      const label = era.tickLabel ?? '';
      const major = label ? ' data-major="true"' : '';
      return `<span${major}>${escapeHtml(label)}</span>`;
    })
    .join('');
}

function makeDefinitionList(rows) {
  return `<dl>${rows
    .map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join('')}</dl>`;
}

function precisionLabel(value) {
  const labels = {
    1: '概略',
    2: '中程度',
    3: '確定的',
  };
  return labels[value] ? `${value} (${labels[value]})` : value || '不明';
}

function formatLon(value) {
  return `${Math.abs(value).toFixed(3)}°${value >= 0 ? 'E' : 'W'}`;
}

function formatLat(value) {
  return `${Math.abs(value).toFixed(3)}°${value >= 0 ? 'N' : 'S'}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
