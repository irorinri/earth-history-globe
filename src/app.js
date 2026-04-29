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
const EARLY_BOUNDARY_OPACITY = 0.28;
const EARLY_BOUNDARY_END_ID = 'classical-empires';
const HUMAN_ERA_START_ID = 'early-hominin-lineage';
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;
const MAJOR_1492_AMERICAN_POLITIES = new Set([
  'Mexihcah (Triple Alliance)',
  'Maya Yucateco',
  'Muisca',
  'Quechua',
  'Taino',
  'Wallmapu (Mapuche)',
]);
const PLACE_NAME_JA = new Map([
  ['Unknown', '不明'],
  ['France', 'フランス'],
  ['United Kingdom', 'イギリス'],
  ['United Kingdom of Great Britain and Ireland', 'グレートブリテン及びアイルランド連合王国'],
  ['England', 'イングランド'],
  ['Scottland', 'スコットランド'],
  ['Scotland', 'スコットランド'],
  ['Ireland', 'アイルランド'],
  ['Portugal', 'ポルトガル'],
  ['Spain', 'スペイン'],
  ['Denmark', 'デンマーク'],
  ['Denmark-Norway', 'デンマーク＝ノルウェー'],
  ['Norway', 'ノルウェー'],
  ['Sweden', 'スウェーデン'],
  ['Finland', 'フィンランド'],
  ['Italy', 'イタリア'],
  ['Venice', 'ヴェネツィア'],
  ['Papal States', '教皇領'],
  ['Holy Roman Empire', '神聖ローマ帝国'],
  ['Byzantine Empire', 'ビザンツ帝国'],
  ['Ottoman Empire', 'オスマン帝国'],
  ['Roman Empire', 'ローマ帝国'],
  ['Sassanid Empire', 'サーサーン朝'],
  ['Umayyad Caliphate', 'ウマイヤ朝'],
  ['Abbasid Caliphate', 'アッバース朝'],
  ['Seljuk Empire', 'セルジューク朝'],
  ['Mongol Empire', 'モンゴル帝国'],
  ['Yuan Empire', '元'],
  ['Ming Empire', '明'],
  ['Qing Empire', '清'],
  ['Manchu Empire', '清'],
  ['Russian Empire', 'ロシア帝国'],
  ['Russia', 'ロシア'],
  ['Prussia', 'プロイセン'],
  ['Poland', 'ポーランド'],
  ['Hungary', 'ハンガリー'],
  ['Austria', 'オーストリア'],
  ['Netherlands', 'オランダ'],
  ['Belgium', 'ベルギー'],
  ['Luxembourg', 'ルクセンブルク'],
  ['Switzerland', 'スイス'],
  ['Serbia', 'セルビア'],
  ['Georgia', 'ジョージア'],
  ['Armenia', 'アルメニア'],
  ['Cyprus', 'キプロス'],
  ['Greece', 'ギリシャ'],
  ['Egypt', 'エジプト'],
  ['Morocco', 'モロッコ'],
  ['Mali', 'マリ'],
  ['Ghana', 'ガーナ'],
  ['Benin', 'ベニン'],
  ['Congo', 'コンゴ'],
  ['Ethiopia', 'エチオピア'],
  ['Axum', 'アクスム'],
  ['Alwa', 'アルワ'],
  ['Mossi States', 'モシ諸国'],
  ['Expansionist Kingdom of Merina', 'メリナ王国'],
  ['Madagascar', 'マダガスカル'],
  ['Khoiasan', 'コイサン'],
  ['Yemen', 'イエメン'],
  ['Hadramaut', 'ハドラマウト'],
  ['Oman', 'オマーン'],
  ['Muscat', 'マスカット'],
  ['Qatar', 'カタール'],
  ['Afghanistan', 'アフガニスタン'],
  ['Tibet', 'チベット'],
  ['Nepal', 'ネパール'],
  ['Bhutan', 'ブータン'],
  ['India', 'インド'],
  ['Hindu kingdoms', 'ヒンドゥー諸王国'],
  ['minor Hindu and Buddhist states', 'ヒンドゥー・仏教系小国家群'],
  ['China', '中国'],
  ['Han', '漢'],
  ['Tang', '唐'],
  ['Song', '宋'],
  ['Japan', '日本'],
  ['Ainu', 'アイヌ'],
  ['Ainus', 'アイヌ'],
  ['Ryukyu', '琉球'],
  ['Korea', '朝鮮'],
  ['Silla', '新羅'],
  ['Koguryo', '高句麗'],
  ['Paekche', '百済'],
  ['Champa', 'チャンパ'],
  ['Cambodia', 'カンボジア'],
  ['Khmer Empire', 'クメール帝国'],
  ['Ayutthaya', 'アユタヤ'],
  ['Malacca', 'マラッカ'],
  ['Aceh', 'アチェ'],
  ['Srivijaya Empire', 'シュリーヴィジャヤ王国'],
  ['Brunei', 'ブルネイ'],
  ['Philippines', 'フィリピン'],
  ['Papua New Guinea', 'パプアニューギニア'],
  ['Maori', 'マオリ'],
  ['Polynesians', 'ポリネシア人'],
  ['Tuʻi Tonga Empire', 'トンガ大首長国'],
  ['United States', 'アメリカ合衆国'],
  ['Canada', 'カナダ'],
  ['Haiti', 'ハイチ'],
  ['Dominican Republic', 'ドミニカ共和国'],
  ['Cuba', 'キューバ'],
  ['Puerto Rico', 'プエルトリコ'],
  ['Trinidad', 'トリニダード'],
  ['Taino', 'タイノ'],
  ['Maya city-states', 'マヤ都市国家群'],
  ['Maya Yucateco', 'ユカテコ・マヤ'],
  ['Mexihcah (Triple Alliance)', 'メシカ三国同盟'],
  ['Muisca', 'ムイスカ'],
  ['Quechua', 'ケチュア'],
  ['Wallmapu (Mapuche)', 'ワジマプ（マプチェ）'],
  ['Inuit', 'イヌイット'],
  ['Thule', 'チューレ'],
  ['Cree', 'クリー'],
  ['Cheyenne', 'シャイアン'],
  ['Blackfoot', 'ブラックフット'],
  ['Cherokee', 'チェロキー'],
  ['Haudenosaunee', 'ハウデノショーニー'],
  ['Guarani', 'グアラニー'],
  ['Mapuche', 'マプチェ'],
  ['Argentina', 'アルゼンチン'],
  ['Chile', 'チリ'],
  ['Paraguay', 'パラグアイ'],
  ['Uruguay', 'ウルグアイ'],
  ['Nicaragua', 'ニカラグア'],
  ['Costa Rica', 'コスタリカ'],
  ['Belize', 'ベリーズ'],
  ['Guatemala', 'グアテマラ'],
  ['Honduras', 'ホンジュラス'],
  ['El Salvador', 'エルサルバドル'],
  ['French Guiana', 'フランス領ギアナ'],
  ['Sierra Leone', 'シエラレオネ'],
  ['Antigua and Barbuda', 'アンティグア・バーブーダ'],
  ['Dominica', 'ドミニカ国'],
  ['Saint Kitts and Nevis', 'セントクリストファー・ネイビス'],
  ['Netherlands Antilles', 'オランダ領アンティル'],
  ['Australian aboriginal hunter-gatherers', 'オーストラリア先住民狩猟採集民'],
  ['Caribbean hunter-gatherers', 'カリブ海狩猟採集民'],
  ['Tasmanian hunter-gatherers', 'タスマニア狩猟採集民'],
  ['Pampas cultures', 'パンパ文化群'],
  ['Patagonian shellfish and marine mammal hunters', 'パタゴニア貝類・海獣狩猟民'],
  ['Finno-Ugric taiga hunter-gatherers', 'フィン・ウゴル系タイガ狩猟採集民'],
  ['Subarctic forest hunter-gatherers', '亜寒帯森林狩猟採集民'],
  ['Andean hunter-gatherers', 'アンデス狩猟採集民'],
  ['Savanna hunter-gatherers', 'サバンナ狩猟採集民'],
  ['Amazon hunter-gatherers', 'アマゾン狩猟採集民'],
  ['Plain bison hunters', '平原バイソン狩猟民'],
  ['Desert hunter-gatherers', '砂漠狩猟採集民'],
  ['Plateau fichers and hunter gatherers', '高原漁労・狩猟採集民'],
  ['North American Pacifi foraging, hunting and fishing peoples', '北米太平洋岸の採集・狩猟・漁労民'],
  ['West African cereal farmers', '西アフリカ穀物農耕民'],
  ['Eastern North Amercian hunter-gatherers', '北米東部狩猟採集民'],
  ['Shellfish gatherers', '貝類採集民'],
  ['Islamic city-states', 'イスラーム都市国家群'],
  ['Maya city-states', 'マヤ都市国家群'],
]);
const PLACE_TERM_JA = new Map([
  ['empire', '帝国'],
  ['kingdom', '王国'],
  ['kingdoms', '諸王国'],
  ['state', '国家'],
  ['states', '諸国'],
  ['republic', '共和国'],
  ['duchy', '公国'],
  ['grand', '大'],
  ['great', '大'],
  ['confederacy', '連合'],
  ['confederation', '連合'],
  ['federation', '連邦'],
  ['union', '連邦'],
  ['caliphate', 'カリフ国'],
  ['emirate', '首長国'],
  ['sultanate', 'スルタン国'],
  ['khanate', 'ハン国'],
  ['dynasty', '王朝'],
  ['colony', '植民地'],
  ['colonies', '植民地群'],
  ['protectorate', '保護領'],
  ['territory', '領'],
  ['territories', '領'],
  ['province', '州'],
  ['provinces', '諸州'],
  ['claim', '領有権主張'],
  ['claims', '領有権主張'],
  ['city', '都市'],
  ['cities', '都市群'],
  ['island', '島'],
  ['islands', '諸島'],
  ['north', '北'],
  ['south', '南'],
  ['east', '東'],
  ['west', '西'],
  ['central', '中央'],
  ['northern', '北部'],
  ['southern', '南部'],
  ['eastern', '東部'],
  ['western', '西部'],
  ['upper', '上'],
  ['lower', '下'],
  ['new', '新'],
  ['old', '旧'],
  ['minor', '小'],
  ['major', '大'],
  ['tribe', '部族'],
  ['tribes', '部族'],
  ['chiefdom', '首長制社会'],
  ['chiefdoms', '首長制社会群'],
  ['hunter', '狩猟民'],
  ['hunters', '狩猟民'],
  ['gatherer', '採集民'],
  ['gatherers', '採集民'],
  ['foraging', '採集'],
  ['fishing', '漁労'],
  ['farmers', '農耕民'],
  ['cultures', '文化群'],
  ['culture', '文化'],
  ['peoples', '諸民族'],
  ['people', '民族'],
  ['french', 'フランス領'],
  ['british', 'イギリス領'],
  ['spanish', 'スペイン領'],
  ['portuguese', 'ポルトガル領'],
  ['dutch', 'オランダ領'],
  ['german', 'ドイツ領'],
  ['russian', 'ロシア領'],
  ['japanese', '日本領'],
  ['arab', 'アラブ'],
  ['arabian', 'アラビア'],
  ['islamic', 'イスラーム'],
  ['hindu', 'ヒンドゥー'],
  ['buddhist', '仏教'],
  ['and', '・'],
  ['of', 'の'],
  ['the', ''],
]);

const stage = document.querySelector('#globe-stage');
const loading = document.querySelector('#loading');
const detailTierEl = document.querySelector('#detail-tier');
const featureCountEl = document.querySelector('#feature-count');
const infoTitle = document.querySelector('#info-title');
const infoBody = document.querySelector('#info-body');
const eraTitle = document.querySelector('#era-title');
const yearReadout = document.querySelector('#year-readout');
const eraRange = document.querySelector('#era-range');
const nameLanguageButton = document.querySelector('#name-language');

const state = {
  eras: [],
  eraIndex: 0,
  geojson: null,
  pickGeojson: null,
  borderFeatureCount: null,
  landMesh: null,
  borderLines: null,
  selectedFeature: null,
  selectedEvent: null,
  selectedLonLat: null,
  detailTier: 'far',
  japaneseNames: false,
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
controls.enablePan = true;
controls.panSpeed = 0.72;
controls.screenSpacePanning = true;
controls.maxTargetRadius = 1.1;
controls.mouseButtons = {
  LEFT: THREE.MOUSE.ROTATE,
  MIDDLE: THREE.MOUSE.PAN,
  RIGHT: THREE.MOUSE.PAN,
};
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
};
controls.rotateSpeed = 0.62;
controls.zoomSpeed = 0.82;
controls.minDistance = MIN_DISTANCE;
controls.maxDistance = MAX_DISTANCE;
controls.autoRotateSpeed = 0.45;

scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e8e3, 2.85));

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(RADIUS, 96, 48),
  new THREE.MeshLambertMaterial({
    color: 0xeeeeee,
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
const activeTouchPointers = new Set();
let hadMultiTouchGesture = false;
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
  updateTimelineEraBands();

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
  nameLanguageButton.addEventListener('click', () => {
    state.japaneseNames = !state.japaneseNames;
    updateNameLanguageButton();
    renderInfo();
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
    if (event.pointerType === 'touch') {
      activeTouchPointers.add(event.pointerId);
      hadMultiTouchGesture = activeTouchPointers.size > 1;
      if (!event.isPrimary) return;
    } else if (event.button !== 0) {
      pointerDown = null;
      return;
    }

    pointerDown = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    };
  });

  renderer.domElement.addEventListener('pointerup', (event) => {
    const wasMultiTouchGesture = hadMultiTouchGesture;
    if (event.pointerType === 'touch') {
      activeTouchPointers.delete(event.pointerId);
      if (activeTouchPointers.size === 0) hadMultiTouchGesture = false;
    }

    if (!pointerDown) return;
    if (event.pointerId !== pointerDown.pointerId || wasMultiTouchGesture) {
      pointerDown = null;
      return;
    }

    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    const moved = Math.hypot(dx, dy);
    const elapsed = performance.now() - pointerDown.time;
    pointerDown = null;
    if (moved <= 9 && elapsed <= 650) pickGlobe(event);
  });

  renderer.domElement.addEventListener('pointercancel', (event) => {
    if (event.pointerType === 'touch') {
      activeTouchPointers.delete(event.pointerId);
      if (activeTouchPointers.size === 0) hadMultiTouchGesture = false;
    }
    if (event.pointerId === pointerDown?.pointerId) pointerDown = null;
  });

  renderer.domElement.addEventListener('auxclick', (event) => {
    if (event.button === 1) event.preventDefault();
  });

  renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

  window.addEventListener('resize', resize);
  updateNameLanguageButton();
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
    state.pickGeojson = geojson;
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
      const borderGeojson = displayBorderGeojson(era, geojson);
      state.pickGeojson = borderGeojson;
      state.borderFeatureCount = borderGeojson.features.length;

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
        buildBorderGeometry(borderGeojson, BORDER_RADIUS),
        new THREE.LineBasicMaterial({
          color: 0x111111,
          transparent: true,
          opacity: borderOpacityForTier(state.detailTier, era),
          depthWrite: false,
        }),
      );
      state.borderLines.renderOrder = 2;
      scene.add(state.borderLines);
    } else {
      state.pickGeojson = geojson;
      state.borderFeatureCount = null;
    }

    buildEraMarkers(era);
    updateFeatureCount(era);
    updateDetailTier(true);
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
  const offset = camera.position.clone().sub(controls.target);
  const distance = THREE.MathUtils.clamp(offset.length() * factor, MIN_DISTANCE, MAX_DISTANCE);
  camera.position.copy(controls.target.clone().add(offset.normalize().multiplyScalar(distance)));
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

function displayEraTime(era) {
  const label = String(era?.label ?? '');
  if (!label) return '';

  if (label.endsWith('年ごろ')) return `${label.slice(0, -2)}頃`;
  if (label.startsWith('約') && label.endsWith('年前')) return label.slice(1);
  if (label.endsWith('年前') || label.endsWith('年頃') || label.endsWith('年代')) return label;
  if (label.endsWith('年')) return `${label.slice(0, -1)}年代`;

  return label;
}

function updateTimelineEraBands() {
  const humanEraIndex = state.eras.findIndex((era) => era.id === HUMAN_ERA_START_ID);
  const maxIndex = Math.max(1, state.eras.length - 1);
  const humanStartPercent = humanEraIndex >= 0 ? (humanEraIndex / maxIndex) * 100 : 100;
  eraRange.style.setProperty('--human-era-start', `${humanStartPercent.toFixed(3)}%`);
}

function displayEraTitle(era) {
  const title = era?.title || displayEraTime(era);
  const time = displayEraTime(era);
  if (!title || !time) return title || '地球型歴史地図';

  const bareTime = time.replace(/年代$/, '年').replace(/年頃$/, '年ごろ');
  for (const prefix of [time, bareTime, era.label]) {
    if (prefix && title.startsWith(`${prefix}の`)) {
      return title.slice(prefix.length + 1);
    }
  }

  return title;
}

function updateYearReadout() {
  const era = state.eras[state.eraIndex];
  eraTitle.textContent = era ? displayEraTitle(era) : '地球型歴史地図';
  yearReadout.value = era ? displayEraTime(era) : '';
  yearReadout.textContent = era ? displayEraTime(era) : '';
}

function updateNameLanguageButton() {
  nameLanguageButton.dataset.active = String(state.japaneseNames);
  nameLanguageButton.setAttribute('aria-pressed', String(state.japaneseNames));
  const label = state.japaneseNames ? '地名を元の表記に戻す' : '地名を日本語表示に切り替え';
  nameLanguageButton.title = label;
  nameLanguageButton.setAttribute('aria-label', label);
}

function displayEventTitle(eventData) {
  if (!state.japaneseNames) return eventData.title;
  return displayPlaceName(eventData.title, eventData.title);
}

function displayPlaceName(value, fallback = '不明') {
  const text = String(value ?? '').trim();
  if (!text) return fallback;
  return state.japaneseNames ? japanesePlaceName(text) : text;
}

function japanesePlaceName(value) {
  const text = String(value ?? '').trim();
  if (!text) return '不明';
  if (PLACE_NAME_JA.has(text)) return PLACE_NAME_JA.get(text);
  if (hasJapanese(text)) return text;

  const parenthesized = text.match(/^(.+?)\s*\((.+)\)$/);
  if (parenthesized) {
    return `${japanesePlaceName(parenthesized[1])}（${japanesePlaceName(parenthesized[2])}）`;
  }

  const slashParts = text.split(/\s*[/／]\s*/);
  if (slashParts.length > 1) return slashParts.map((part) => japanesePlaceName(part)).join('・');

  const commaParts = text.split(/\s*,\s*/);
  if (commaParts.length > 1) return commaParts.map((part) => japanesePlaceName(part)).join('・');

  return text
    .split(/(\s+|[-‐‑–—])/)
    .map((part) => {
      if (!part.trim()) return '';
      if (/[-‐‑–—]/.test(part)) return '・';
      const clean = part.replace(/[.,;:]/g, '');
      const lower = normalizeLatin(clean).toLowerCase();
      if (PLACE_TERM_JA.has(lower)) return PLACE_TERM_JA.get(lower);
      return latinWordToKana(clean);
    })
    .join('')
    .replace(/・+/g, '・')
    .replace(/^・|・$/g, '');
}

function hasJapanese(value) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(value);
}

function normalizeLatin(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[ʻʼ’']/g, '');
}

function latinWordToKana(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';
  if (PLACE_NAME_JA.has(raw)) return PLACE_NAME_JA.get(raw);
  if (!/[A-Za-z]/.test(raw)) return hasJapanese(raw) || /\d/.test(raw) ? raw : '';

  const word = normalizeLatin(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!word) return raw;
  if (PLACE_TERM_JA.has(word)) return PLACE_TERM_JA.get(word);

  let output = '';
  let index = 0;
  const syllables = [
    ['shi', 'シ'],
    ['chi', 'チ'],
    ['tsu', 'ツ'],
    ['cha', 'チャ'],
    ['che', 'チェ'],
    ['chi', 'チ'],
    ['cho', 'チョ'],
    ['shu', 'シュ'],
    ['sha', 'シャ'],
    ['sho', 'ショ'],
    ['ju', 'ジュ'],
    ['ja', 'ジャ'],
    ['jo', 'ジョ'],
    ['kya', 'キャ'],
    ['kyu', 'キュ'],
    ['kyo', 'キョ'],
    ['gya', 'ギャ'],
    ['gyu', 'ギュ'],
    ['gyo', 'ギョ'],
    ['nya', 'ニャ'],
    ['nyu', 'ニュ'],
    ['nyo', 'ニョ'],
    ['rya', 'リャ'],
    ['ryu', 'リュ'],
    ['ryo', 'リョ'],
    ['bya', 'ビャ'],
    ['byu', 'ビュ'],
    ['byo', 'ビョ'],
    ['pya', 'ピャ'],
    ['pyu', 'ピュ'],
    ['pyo', 'ピョ'],
    ['fa', 'ファ'],
    ['fi', 'フィ'],
    ['fe', 'フェ'],
    ['fo', 'フォ'],
    ['va', 'ヴァ'],
    ['vi', 'ヴィ'],
    ['ve', 'ヴェ'],
    ['vo', 'ヴォ'],
    ['th', 'ス'],
    ['ph', 'フ'],
    ['qu', 'ク'],
    ['ck', 'ック'],
    ['ng', 'ング'],
    ['sh', 'シ'],
    ['ch', 'チ'],
  ];
  const kana = {
    a: 'ア',
    i: 'イ',
    u: 'ウ',
    e: 'エ',
    o: 'オ',
    ba: 'バ',
    bi: 'ビ',
    bu: 'ブ',
    be: 'ベ',
    bo: 'ボ',
    ca: 'カ',
    ci: 'シ',
    cu: 'ク',
    ce: 'セ',
    co: 'コ',
    da: 'ダ',
    di: 'ディ',
    du: 'ドゥ',
    de: 'デ',
    do: 'ド',
    fa: 'ファ',
    fi: 'フィ',
    fu: 'フ',
    fe: 'フェ',
    fo: 'フォ',
    ga: 'ガ',
    gi: 'ギ',
    gu: 'グ',
    ge: 'ゲ',
    go: 'ゴ',
    ha: 'ハ',
    hi: 'ヒ',
    hu: 'フ',
    he: 'ヘ',
    ho: 'ホ',
    ja: 'ジャ',
    ji: 'ジ',
    ju: 'ジュ',
    je: 'ジェ',
    jo: 'ジョ',
    ka: 'カ',
    ki: 'キ',
    ku: 'ク',
    ke: 'ケ',
    ko: 'コ',
    la: 'ラ',
    li: 'リ',
    lu: 'ル',
    le: 'レ',
    lo: 'ロ',
    ma: 'マ',
    mi: 'ミ',
    mu: 'ム',
    me: 'メ',
    mo: 'モ',
    na: 'ナ',
    ni: 'ニ',
    nu: 'ヌ',
    ne: 'ネ',
    no: 'ノ',
    pa: 'パ',
    pi: 'ピ',
    pu: 'プ',
    pe: 'ペ',
    po: 'ポ',
    ra: 'ラ',
    ri: 'リ',
    ru: 'ル',
    re: 'レ',
    ro: 'ロ',
    sa: 'サ',
    si: 'シ',
    su: 'ス',
    se: 'セ',
    so: 'ソ',
    ta: 'タ',
    ti: 'ティ',
    tu: 'トゥ',
    te: 'テ',
    to: 'ト',
    va: 'ヴァ',
    vi: 'ヴィ',
    vu: 'ヴ',
    ve: 'ヴェ',
    vo: 'ヴォ',
    wa: 'ワ',
    wi: 'ウィ',
    wu: 'ウ',
    we: 'ウェ',
    wo: 'ウォ',
    ya: 'ヤ',
    yi: 'イ',
    yu: 'ユ',
    ye: 'イェ',
    yo: 'ヨ',
    za: 'ザ',
    zi: 'ジ',
    zu: 'ズ',
    ze: 'ゼ',
    zo: 'ゾ',
  };
  const consonants = {
    b: 'ブ',
    c: 'ク',
    d: 'ド',
    f: 'フ',
    g: 'グ',
    h: 'フ',
    j: 'ジ',
    k: 'ク',
    l: 'ル',
    m: 'ム',
    n: 'ン',
    p: 'プ',
    q: 'ク',
    r: 'ル',
    s: 'ス',
    t: 'ト',
    v: 'ヴ',
    w: 'ウ',
    x: 'クス',
    y: 'イ',
    z: 'ズ',
  };

  while (index < word.length) {
    if (/\d/.test(word[index])) {
      output += word[index];
      index += 1;
      continue;
    }

    if (
      index > 0 &&
      word[index] === word[index - 1] &&
      !'aeioun'.includes(word[index])
    ) {
      output += 'ッ';
      index += 1;
      continue;
    }

    const special = syllables.find(([latin]) => word.startsWith(latin, index));
    if (special) {
      output += special[1];
      index += special[0].length;
      continue;
    }

    const pair = word.slice(index, index + 2);
    if (kana[pair]) {
      output += kana[pair];
      index += 2;
      continue;
    }

    const single = word[index];
    if (kana[single]) output += kana[single];
    else output += consonants[single] ?? single;
    index += 1;
  }

  return output.replace(/ウア/g, 'ワ').replace(/ウイ/g, 'ウィ').replace(/ウエ/g, 'ウェ').replace(/ウオ/g, 'ウォ');
}

function updateDetailTier(force) {
  const distance = controls.getDistance();
  const next = distance > 2.85 ? 'far' : distance > 1.85 ? 'mid' : 'near';
  if (!force && next === state.detailTier) return;

  state.detailTier = next;
  detailTierEl.dataset.tier = next;
  detailTierEl.textContent = next === 'far' ? '遠景' : next === 'mid' ? '標準' : '近景';

  if (state.borderLines) {
    state.borderLines.material.opacity = borderOpacityForTier(next, state.eras[state.eraIndex]);
  }
  graticule.material.opacity = next === 'near' ? 0.06 : 0.08;

  for (const marker of eraMarkerGroup.children) {
    marker.material.opacity = next === 'far' ? 0.38 : next === 'mid' ? 0.62 : 0.9;
    marker.scale.setScalar(next === 'near' ? 1.2 : 1);
  }
  renderInfo();
}

function borderOpacityForTier(tier, era) {
  const baseOpacity = tier === 'far' ? 0.38 : tier === 'mid' ? 0.56 : 0.76;
  return usesEarlyBoundaryOpacity(era) ? baseOpacity * EARLY_BOUNDARY_OPACITY : baseOpacity;
}

function usesEarlyBoundaryOpacity(era) {
  const earlyBoundaryEndIndex = state.eras.findIndex((item) => item.id === EARLY_BOUNDARY_END_ID);
  if (earlyBoundaryEndIndex < 0 || !era) return false;
  const eraIndex = state.eras.indexOf(era);
  return eraIndex >= 0 && eraIndex <= earlyBoundaryEndIndex;
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
    infoTitle.textContent = displayEventTitle(state.selectedEvent);
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
    ['時代', displayEraTime(era)],
    ['名称', displayPlaceName(props.NAME, '不明')],
  ];

  if (state.detailTier !== 'far') {
    rows.push(
      ['宗主国・主体', displayPlaceName(props.SUBJECTO || props.NAME, '不明')],
      ['所属', props.PARTOF ? displayPlaceName(props.PARTOF, 'なし') : 'なし'],
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

  infoTitle.textContent = displayPlaceName(props.NAME, '不明');
  infoBody.innerHTML = makeDefinitionList(rows);
}

function eraRows(era) {
  const rows = [
    ['時代', displayEraTime(era)],
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
    ['時代', displayEraTime(era)],
    ['地点', displayPlaceName(eventData.place, '未設定')],
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
  const borderCount = state.borderFeatureCount;
  const eventCount = (era.events ?? []).length;
  if (Number.isFinite(borderCount) && borderCount < regionCount) {
    featureCountEl.textContent = `${borderCount} borders / ${regionCount} regions`;
    return;
  }

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

function displayBorderGeojson(era, geojson) {
  if (Number(era.year) !== 1492) return geojson;

  return {
    ...geojson,
    features: (geojson.features ?? []).filter(shouldShow1492Border),
  };
}

function shouldShow1492Border(feature) {
  const bbox = feature.bbox;
  if (!bbox) return true;

  const centerLon = (bbox[0] + bbox[2]) / 2;
  if (centerLon >= -30) return true;

  const name = feature.properties?.NAME ?? '';
  return MAJOR_1492_AMERICAN_POLITIES.has(name) || bboxArea(bbox) >= 300;
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
  const pickFeatures = state.pickGeojson?.features ?? state.geojson?.features ?? [];
  for (const feature of pickFeatures) {
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
