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
const AUTO_ROTATE_SPEED = 0.28;
const ROTATION_SPEED_MIN = 0.4;
const ROTATION_SPEED_MAX = 2.2;
const TIMELINE_SPEED_MIN = 0.25;
const TIMELINE_SPEED_MAX = 4;
const AUTO_ROTATE_ORBIT_SECONDS_AT_60FPS = 60;
const TIMELINE_PLAYBACK_SLOWDOWN = 10;
const RANDOM_PICK_INTERVAL_MS = 10000;
const RANDOM_PICK_TRIES = 80;
const RANDOM_LAND_PICK_TRIES = 240;
const LAND_ROTATION_TARGET_TRIES = 420;
const LAND_ROTATION_BLEND = 0.42;
const WAVE_ROTATION_LATITUDE = 24;
const WAVE_ROTATION_PHASE_SPEED = 0.52;
const LAND_WAVE_BLEND = 0.68;
const LAND_WAVE_SEARCH_INTERVAL_MS = 360;
const LAND_WAVE_DIRECT_LAND_DISTANCE = 34;
const LAND_WAVE_LON_OFFSETS = [0, -5, 5, -11, 11, -20, 20, -34, 34, -54, 54, -82, 82, -116, 116, -152, 152, 180];
const LAND_WAVE_LAT_OFFSETS = [0, -4, 4, -9, 9, -16, 16, -25, 25, -36, 36, -50, 50, -64, 64];
const LAND_WAVE_DETOUR_LON_OFFSETS = [0, 4, 8, 14, 22, 34, 50, 70, 94, 122];
const LAND_WAVE_DETOUR_LAT_OFFSETS = [0, -4, 4, -9, 9, -16, 16, -25, 25, -38, 38, -54, 54];
const LAND_WAVE_WAVE_WEIGHT = 0.62;
const LAND_WAVE_CONTINUITY_WEIGHT = 0.74;
const LAND_WAVE_MAX_FORWARD_DEGREES = 58;
const LAND_WAVE_FEATURE_SEARCH_RADIUS = 124;
const LAND_WAVE_RING_SAMPLE_LIMIT = 96;
const LAND_WAVE_STALL_START_DEGREES = 16;
const LAND_WAVE_STALL_WEIGHT = 0.8;
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
const appShell = document.querySelector('.app-shell');
const loading = document.querySelector('#loading');
const detailTierEl = document.querySelector('#detail-tier');
const featureCountEl = document.querySelector('#feature-count');
const infoPanel = document.querySelector('.info-panel');
const infoTitle = document.querySelector('#info-title');
const infoBody = document.querySelector('#info-body');
const eraTitle = document.querySelector('#era-title');
const yearReadout = document.querySelector('#year-readout');
const eraRange = document.querySelector('#era-range');
const selectionLink = document.querySelector('#selection-link');
const selectionLinkLine = document.querySelector('#selection-link-line');
const timelinePlayButton = document.querySelector('#timeline-play');
const timelineSettingsButton = document.querySelector('#timeline-settings');
const timelineSettingsPanel = document.querySelector('#timeline-settings-panel');
const timelineReverseButton = document.querySelector('#timeline-reverse');
const timelineSpeedRange = document.querySelector('#timeline-speed');
const timelineSpeedValue = document.querySelector('#timeline-speed-value');
const autoRotateButton = document.querySelector('#auto-rotate');
const rotationSettingsButton = document.querySelector('#rotation-settings');
const rotationSettingsPanel = document.querySelector('#rotation-settings-panel');
const rotationModeButtons = [...document.querySelectorAll('.rotation-mode-button')];
const rotationSpeedRange = document.querySelector('#rotation-speed');
const rotationSpeedValue = document.querySelector('#rotation-speed-value');
const randomPickButton = document.querySelector('#random-pick');
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
controls.autoRotateSpeed = AUTO_ROTATE_SPEED;

scene.add(new THREE.HemisphereLight(0xffffff, 0xe8e8e3, 2.85));

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(RADIUS, 96, 48),
  new THREE.MeshLambertMaterial({
    color: 0xf9f9f9,
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
const projectedSelectionPoint = new THREE.Vector3();
let pointerDown = null;
const activeTouchPointers = new Set();
let hadMultiTouchGesture = false;
let pendingEraLoad = 0;
let autoRotatePlaying = false;
let rotationMode = 'standard';
let rotationSpeedMultiplier = 1;
let rotationLastTime = performance.now();
let landRotationTarget = null;
let waveRotationLon = null;
let waveRotationPhase = 0;
let landWaveRotationTarget = null;
let landWaveSearchTime = 0;
let randomPickTimer = 0;
let timelinePlaying = false;
let timelineDirection = 1;
let timelineSpeedMultiplier = 1;
let timelinePlayTimer = 0;
let timelinePlayToken = 0;
const pendingEraFetches = new Map();

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
  autoRotateButton.addEventListener('click', () => {
    autoRotatePlaying = !autoRotatePlaying;
    applyRotationPlayback();
    updateAutoRotateButton();
  });
  rotationSettingsButton.addEventListener('click', () => {
    const expanded = rotationSettingsPanel.hidden;
    rotationSettingsPanel.hidden = !expanded;
    rotationSettingsButton.setAttribute('aria-expanded', String(expanded));
  });
  rotationModeButtons.forEach((button) => {
    button.addEventListener('click', () => setRotationMode(button.dataset.rotationMode));
  });
  rotationSpeedRange.addEventListener('input', () =>
    setRotationSpeedMultiplier(Number(rotationSpeedRange.value)),
  );
  randomPickButton.addEventListener('click', toggleRandomPick);
  timelinePlayButton.addEventListener('click', toggleTimelinePlayback);
  timelineSettingsButton.addEventListener('click', () => {
    const expanded = timelineSettingsPanel.hidden;
    timelineSettingsPanel.hidden = !expanded;
    timelineSettingsButton.setAttribute('aria-expanded', String(expanded));
  });
  timelineReverseButton.addEventListener('click', () => setTimelineDirection(timelineDirection * -1));
  timelineSpeedRange.addEventListener('input', () =>
    setTimelineSpeedMultiplier(Number(timelineSpeedRange.value)),
  );
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
    if (isTimelinePlaying()) preloadEra(nextLoopingEraIndex());
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
    landRotationTarget = null;
    waveRotationLon = null;
    landWaveRotationTarget = null;
    landWaveSearchTime = 0;
    rotationLastTime = performance.now();
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

  document.addEventListener('pointerdown', (event) => {
    if (!rotationSettingsPanel.hidden && !event.target.closest('.rotate-tools')) {
      closeRotationSettings();
    }
    if (!timelineSettingsPanel.hidden && !event.target.closest('.timeline-settings-tools')) {
      closeTimelineSettings();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeRotationSettings();
      closeTimelineSettings();
    }
  });

  window.addEventListener('resize', resize);
  updateAutoRotateButton();
  updateRotationModeButtons();
  updateRotationSpeedControl();
  updateRandomPickButton();
  updateTimelinePlayButton();
  updateTimelineDirectionButton();
  updateTimelineSpeedControl();
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
        const pendingFetch = pendingEraFetches.get(era.file);
        geojson = pendingFetch ? await pendingFetch : await fetchJson(era.file);
        if (!geojson) geojson = await fetchJson(era.file);
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
    updateSelectionLink();

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

function preloadEra(index) {
  const era = state.eras[index];
  if (!era?.file || state.cache.has(era.file)) return Promise.resolve();
  if (pendingEraFetches.has(era.file)) return pendingEraFetches.get(era.file);

  const request = fetchJson(era.file)
    .then((geojson) => {
      state.cache.set(era.file, geojson);
      return geojson;
    })
    .catch((error) => {
      console.warn(`時代データの先読みをスキップしました: ${era.file}`, error);
      return null;
    })
    .finally(() => pendingEraFetches.delete(era.file));

  pendingEraFetches.set(era.file, request);
  return request;
}

function animate() {
  updateRotationMode();
  controls.update();
  updateDetailTier(false);
  updateSelectionLink();
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
  updateSelectionLink();
}

function stepEra(delta) {
  const next = THREE.MathUtils.clamp(state.eraIndex + delta, 0, state.eras.length - 1);
  setEraIndex(next);
}

function setEraIndex(next) {
  next = THREE.MathUtils.clamp(next, 0, state.eras.length - 1);
  if (next === state.eraIndex) return Promise.resolve();
  state.eraIndex = next;
  eraRange.value = String(next);
  clearTimeout(pendingEraLoad);
  return loadEra(next);
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

function updateAutoRotateButton() {
  autoRotateButton.dataset.active = String(autoRotatePlaying);
  autoRotateButton.setAttribute('aria-pressed', String(autoRotatePlaying));
  const label = autoRotatePlaying ? '回転を停止' : '回転を再生';
  autoRotateButton.title = label;
  autoRotateButton.setAttribute('aria-label', label);
  autoRotateButton.textContent = autoRotatePlaying ? '⏸' : '▶';
}

function applyRotationPlayback() {
  controls.autoRotate = autoRotatePlaying && rotationMode === 'standard';
  rotationLastTime = performance.now();
  landRotationTarget = null;
  waveRotationLon = null;
  landWaveRotationTarget = null;
  landWaveSearchTime = 0;
}

function setRotationMode(mode) {
  if (!['standard', 'land', 'wave', 'land-wave'].includes(mode)) return;
  rotationMode = mode;
  applyRotationPlayback();
  updateRotationModeButtons();
  closeRotationSettings();
}

function updateRotationModeButtons() {
  for (const button of rotationModeButtons) {
    const active = button.dataset.rotationMode === rotationMode;
    button.dataset.active = String(active);
    button.setAttribute('aria-pressed', String(active));
  }
}

function setRotationSpeedMultiplier(multiplier) {
  if (!Number.isFinite(multiplier)) return;

  rotationSpeedMultiplier = THREE.MathUtils.clamp(
    multiplier,
    ROTATION_SPEED_MIN,
    ROTATION_SPEED_MAX,
  );
  controls.autoRotateSpeed = AUTO_ROTATE_SPEED * rotationSpeedMultiplier;
  rotationLastTime = performance.now();
  updateRotationSpeedControl();

  if (isTimelinePlaying()) scheduleTimelinePlayback(timelinePlayToken);
}

function updateRotationSpeedControl() {
  rotationSpeedRange.value = rotationSpeedMultiplier.toFixed(1);
  rotationSpeedValue.textContent = `${rotationSpeedMultiplier.toFixed(1)}x`;
  rotationSpeedRange.setAttribute('aria-valuetext', `${rotationSpeedMultiplier.toFixed(1)}倍`);

  const progress =
    ((rotationSpeedMultiplier - ROTATION_SPEED_MIN) /
      Math.max(0.001, ROTATION_SPEED_MAX - ROTATION_SPEED_MIN)) *
    100;
  rotationSpeedRange.style.setProperty('--rotation-speed-progress', `${progress.toFixed(1)}%`);
}

function closeRotationSettings() {
  rotationSettingsPanel.hidden = true;
  rotationSettingsButton.setAttribute('aria-expanded', 'false');
}

function updateRotationMode() {
  const now = performance.now();
  const deltaSeconds = Math.min(0.08, Math.max(0, (now - rotationLastTime) / 1000));
  rotationLastTime = now;

  if (!autoRotatePlaying || rotationMode === 'standard') return;
  if (pointerDown) return;

  if (rotationMode === 'land') {
    updateLandRotation(deltaSeconds);
  } else if (rotationMode === 'wave') {
    updateWaveRotation(deltaSeconds);
  } else if (rotationMode === 'land-wave') {
    updateLandWaveRotation(deltaSeconds, now);
  }
}

function updateLandRotation(deltaSeconds) {
  const offset = camera.position.clone().sub(controls.target);
  const distance = offset.length();
  if (distance <= 0) return;

  const currentDirection = offset.normalize();
  let targetDirection = landRotationTarget
    ? lonLatToVector3(landRotationTarget.lon, landRotationTarget.lat, 1).normalize()
    : null;

  if (!targetDirection || currentDirection.dot(targetDirection) > Math.cos(4 * DEG)) {
    landRotationTarget = randomLandRotationTarget();
    targetDirection = landRotationTarget
      ? lonLatToVector3(landRotationTarget.lon, landRotationTarget.lat, 1).normalize()
      : null;
  }

  if (!targetDirection) {
    rotateCameraLongitude(deltaSeconds);
    return;
  }

  const blend = 1 - Math.exp(-LAND_ROTATION_BLEND * deltaSeconds);
  const nextDirection = currentDirection.lerp(targetDirection, blend).normalize();
  camera.position.copy(controls.target.clone().add(nextDirection.multiplyScalar(distance)));
}

function updateWaveRotation(deltaSeconds) {
  const offset = camera.position.clone().sub(controls.target);
  const distance = offset.length();
  if (distance <= 0) return;

  const current = vectorToLonLat(offset);
  if (!Number.isFinite(waveRotationLon)) {
    waveRotationLon = current.lon;
    waveRotationPhase = Math.asin(
      THREE.MathUtils.clamp(current.lat / WAVE_ROTATION_LATITUDE, -1, 1),
    );
  }

  waveRotationLon = normalizeLon(waveRotationLon + rotationDegreesPerSecond() * deltaSeconds);
  waveRotationPhase += WAVE_ROTATION_PHASE_SPEED * deltaSeconds;
  const nextLat = WAVE_ROTATION_LATITUDE * Math.sin(waveRotationPhase);
  camera.position.copy(
    controls.target.clone().add(lonLatToVector3(waveRotationLon, nextLat, distance)),
  );
}

function updateLandWaveRotation(deltaSeconds, now) {
  const offset = camera.position.clone().sub(controls.target);
  const distance = offset.length();
  if (distance <= 0) return;

  const current = vectorToLonLat(offset);
  if (!Number.isFinite(waveRotationLon)) {
    waveRotationLon = current.lon;
    waveRotationPhase = Math.asin(
      THREE.MathUtils.clamp(current.lat / WAVE_ROTATION_LATITUDE, -1, 1),
    );
  }

  waveRotationLon = normalizeLon(waveRotationLon + rotationDegreesPerSecond() * deltaSeconds);
  waveRotationPhase += WAVE_ROTATION_PHASE_SPEED * deltaSeconds;

  const waveTarget = {
    lon: waveRotationLon,
    lat: WAVE_ROTATION_LATITUDE * Math.sin(waveRotationPhase),
  };

  if (
    findLandFeatureAt(waveTarget.lon, waveTarget.lat) &&
    (!landWaveRotationTarget ||
      greatCircleDistance(
        landWaveRotationTarget.lon,
        landWaveRotationTarget.lat,
        waveTarget.lon,
        waveTarget.lat,
      ) <= LAND_WAVE_DIRECT_LAND_DISTANCE)
  ) {
    landWaveRotationTarget = waveTarget;
    landWaveSearchTime = now;
  } else if (!landWaveRotationTarget || now - landWaveSearchTime >= LAND_WAVE_SEARCH_INTERVAL_MS) {
    landWaveRotationTarget = nearestLandWaveTarget(waveTarget, landWaveRotationTarget);
    landWaveSearchTime = now;
  }

  const target = landWaveRotationTarget ?? waveTarget;
  const currentDirection = offset.normalize();
  const targetDirection = lonLatToVector3(target.lon, target.lat, 1).normalize();
  const blend = 1 - Math.exp(-LAND_WAVE_BLEND * deltaSeconds);
  const nextDirection = currentDirection.lerp(targetDirection, blend).normalize();
  camera.position.copy(controls.target.clone().add(nextDirection.multiplyScalar(distance)));
}

function rotateCameraLongitude(deltaSeconds) {
  const offset = camera.position.clone().sub(controls.target);
  const distance = offset.length();
  if (distance <= 0) return;

  const current = vectorToLonLat(offset);
  const nextLon = normalizeLon(current.lon + rotationDegreesPerSecond() * deltaSeconds);
  camera.position.copy(
    controls.target.clone().add(lonLatToVector3(nextLon, current.lat, distance)),
  );
}

function rotationDegreesPerSecond() {
  return 6 * Math.abs(controls.autoRotateSpeed || AUTO_ROTATE_SPEED);
}

function randomLandRotationTarget() {
  for (let attempt = 0; attempt < LAND_ROTATION_TARGET_TRIES; attempt += 1) {
    const feature = randomFeature(state.geojson);
    const lonLat = feature ? randomLonLatInFeature(feature) : null;
    if (lonLat) return lonLat;
  }
  return null;
}

function nearestLandWaveTarget(waveTarget, previousTarget = null) {
  const candidates = landWaveCandidates(waveTarget, previousTarget);
  let best = null;
  let bestScore = Infinity;

  for (const candidate of candidates) {
    const score = landWaveCandidateScore(candidate, waveTarget, previousTarget);
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best ?? previousTarget ?? randomLandRotationTarget();
}

function landWaveCandidates(waveTarget, previousTarget = null) {
  const candidates = new Map();
  const add = (lon, lat, requireLand = true) => {
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) return;
    lon = normalizeLon(lon);
    lat = THREE.MathUtils.clamp(lat, -72, 72);
    if (requireLand && !findLandFeatureAt(lon, lat)) return;

    const key = `${Math.round((lon + 180) * 10)}:${Math.round((lat + 90) * 10)}`;
    if (!candidates.has(key)) candidates.set(key, { lon, lat });
  };

  for (const lonOffset of LAND_WAVE_LON_OFFSETS) {
    for (const latOffset of LAND_WAVE_LAT_OFFSETS) {
      add(waveTarget.lon + lonOffset, waveTarget.lat + latOffset);
    }
  }

  if (previousTarget) {
    for (const lonOffset of LAND_WAVE_DETOUR_LON_OFFSETS) {
      for (const latOffset of LAND_WAVE_DETOUR_LAT_OFFSETS) {
        add(previousTarget.lon + lonOffset, previousTarget.lat + latOffset);
      }
    }
  }

  for (const feature of state.geojson?.features ?? []) {
    if (!isFeatureNearLandWavePath(feature, waveTarget, previousTarget)) continue;

    const waveAnchor = landFeatureAnchorNear(feature, waveTarget);
    if (waveAnchor) add(waveAnchor.lon, waveAnchor.lat, false);

    if (previousTarget) {
      const previousAnchor = landFeatureAnchorNear(feature, previousTarget);
      if (previousAnchor) add(previousAnchor.lon, previousAnchor.lat, false);
    }
  }

  return [...candidates.values()];
}

function landWaveCandidateScore(candidate, waveTarget, previousTarget = null) {
  const waveDistance = greatCircleDistance(waveTarget.lon, waveTarget.lat, candidate.lon, candidate.lat);
  if (!previousTarget) return waveDistance;

  const continuityDistance = greatCircleDistance(
    previousTarget.lon,
    previousTarget.lat,
    candidate.lon,
    candidate.lat,
  );
  const forwardDistance = forwardLonDelta(previousTarget.lon, candidate.lon);
  const waveForwardDistance = forwardLonDelta(previousTarget.lon, waveTarget.lon);
  const stepPenalty = Math.max(0, forwardDistance - LAND_WAVE_MAX_FORWARD_DEGREES) * 1.3;
  const reversePenalty = forwardDistance > 210 ? 95 : 0;
  const stallPenalty =
    forwardDistance < 2
      ? Math.max(0, waveForwardDistance - LAND_WAVE_STALL_START_DEGREES) * LAND_WAVE_STALL_WEIGHT
      : 0;

  return (
    waveDistance * LAND_WAVE_WAVE_WEIGHT +
    continuityDistance * LAND_WAVE_CONTINUITY_WEIGHT +
    stepPenalty +
    reversePenalty +
    stallPenalty
  );
}

function isFeatureNearLandWavePath(feature, waveTarget, previousTarget = null) {
  const waveDistance = bboxDistanceEstimate(feature.bbox, waveTarget);
  if (waveDistance <= LAND_WAVE_FEATURE_SEARCH_RADIUS) return true;

  return previousTarget
    ? bboxDistanceEstimate(feature.bbox, previousTarget) <= LAND_WAVE_FEATURE_SEARCH_RADIUS
    : false;
}

function landFeatureAnchorNear(feature, reference) {
  const bbox = feature?.bbox;
  if (!bbox) return null;

  const center = bboxCenterNear(bbox, reference.lon);
  const near = {
    lon: clampLonToBbox(reference.lon, bbox),
    lat: THREE.MathUtils.clamp(reference.lat, bbox[1], bbox[3]),
  };
  const points = [
    near,
    { lon: near.lon, lat: center.lat },
    { lon: center.lon, lat: near.lat },
    center,
  ];

  for (const point of points) {
    const lon = normalizeLon(point.lon);
    if (geometryContains(feature.geometry, lon, point.lat)) return { lon, lat: point.lat };
  }

  return closestOuterRingPoint(feature.geometry, reference);
}

function closestOuterRingPoint(geometry, reference) {
  let best = null;
  let bestDistance = Infinity;

  forEachOuterRing(geometry, (ring) => {
    const step = Math.max(1, Math.ceil(ring.length / LAND_WAVE_RING_SAMPLE_LIMIT));
    for (let index = 0; index < ring.length; index += step) {
      const lon = normalizeLon(ring[index][0]);
      const lat = THREE.MathUtils.clamp(ring[index][1], -72, 72);
      const distance = greatCircleDistance(reference.lon, reference.lat, lon, lat);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = { lon, lat };
      }
    }
  });

  return best;
}

function toggleRandomPick() {
  const enabled = randomPickTimer === 0;
  if (enabled) {
    selectRandomVisiblePoint();
    randomPickTimer = window.setInterval(selectRandomVisiblePoint, RANDOM_PICK_INTERVAL_MS);
  } else {
    clearInterval(randomPickTimer);
    randomPickTimer = 0;
  }
  updateRandomPickButton();
}

function updateRandomPickButton() {
  const enabled = randomPickTimer !== 0;
  randomPickButton.dataset.active = String(enabled);
  randomPickButton.setAttribute('aria-pressed', String(enabled));
  const label = enabled ? 'ランダム選択を停止' : 'ランダム選択を開始';
  randomPickButton.title = label;
  randomPickButton.setAttribute('aria-label', label);
}

function toggleTimelinePlayback() {
  if (timelinePlaying) {
    stopTimelinePlayback();
  } else {
    startTimelinePlayback();
  }
}

function startTimelinePlayback() {
  if (state.eras.length <= 1) return;

  timelinePlaying = true;
  timelinePlayToken += 1;
  if (timelineDirection > 0 && state.eraIndex >= state.eras.length - 1) {
    setEraIndex(0);
  } else if (timelineDirection < 0 && state.eraIndex <= 0) {
    setEraIndex(state.eras.length - 1);
  }
  scheduleTimelinePlayback(timelinePlayToken);
  preloadEra(nextLoopingEraIndex());
  updateTimelinePlayButton();
}

function stopTimelinePlayback() {
  timelinePlaying = false;
  timelinePlayToken += 1;
  clearTimeout(timelinePlayTimer);
  timelinePlayTimer = 0;
  updateTimelinePlayButton();
}

function scheduleTimelinePlayback(token) {
  clearTimeout(timelinePlayTimer);
  timelinePlayTimer = window.setTimeout(() => advanceTimelinePlayback(token), timelineStepIntervalMs());
}

async function advanceTimelinePlayback(token) {
  timelinePlayTimer = 0;
  if (!timelinePlaying || token !== timelinePlayToken) return;

  await setEraIndex(nextLoopingEraIndex());
  if (!timelinePlaying || token !== timelinePlayToken) return;

  preloadEra(nextLoopingEraIndex());
  scheduleTimelinePlayback(token);
}

function isTimelinePlaying() {
  return timelinePlaying;
}

function nextLoopingEraIndex() {
  if (state.eras.length === 0) return 0;
  return (state.eraIndex + timelineDirection + state.eras.length) % state.eras.length;
}

function timelineStepIntervalMs() {
  const speed = Math.max(0.001, Math.abs(controls.autoRotateSpeed || AUTO_ROTATE_SPEED));
  const playbackSteps = Math.max(1, state.eras.length - 1);
  return (
    (((AUTO_ROTATE_ORBIT_SECONDS_AT_60FPS / speed) * 1000) / playbackSteps) *
    (TIMELINE_PLAYBACK_SLOWDOWN / Math.max(0.001, timelineSpeedMultiplier))
  );
}

function updateTimelinePlayButton() {
  timelinePlayButton.dataset.active = String(timelinePlaying);
  timelinePlayButton.setAttribute('aria-pressed', String(timelinePlaying));
  const label = timelinePlaying
    ? '時代再生を停止'
    : timelineDirection < 0
      ? '時代を逆再生'
      : '時代を再生';
  timelinePlayButton.title = label;
  timelinePlayButton.setAttribute('aria-label', label);
  timelinePlayButton.textContent = timelinePlaying ? '⏸' : timelineDirection < 0 ? '◀' : '▶';
}

function setTimelineDirection(direction) {
  timelineDirection = direction < 0 ? -1 : 1;
  updateTimelineDirectionButton();
  updateTimelinePlayButton();
  if (isTimelinePlaying()) {
    preloadEra(nextLoopingEraIndex());
    scheduleTimelinePlayback(timelinePlayToken);
  }
}

function updateTimelineDirectionButton() {
  const reversed = timelineDirection < 0;
  timelineReverseButton.dataset.active = String(reversed);
  timelineReverseButton.setAttribute('aria-pressed', String(reversed));
}

function setTimelineSpeedMultiplier(multiplier) {
  if (!Number.isFinite(multiplier)) return;

  timelineSpeedMultiplier = THREE.MathUtils.clamp(
    multiplier,
    TIMELINE_SPEED_MIN,
    TIMELINE_SPEED_MAX,
  );
  updateTimelineSpeedControl();
  if (isTimelinePlaying()) scheduleTimelinePlayback(timelinePlayToken);
}

function updateTimelineSpeedControl() {
  timelineSpeedRange.value = String(timelineSpeedMultiplier);
  timelineSpeedValue.textContent = `${timelineSpeedMultiplier.toFixed(2).replace(/\.?0+$/, '')}x`;
  timelineSpeedRange.setAttribute('aria-valuetext', `${timelineSpeedMultiplier.toFixed(2).replace(/\.?0+$/, '')}倍`);

  const progress =
    ((timelineSpeedMultiplier - TIMELINE_SPEED_MIN) /
      Math.max(0.001, TIMELINE_SPEED_MAX - TIMELINE_SPEED_MIN)) *
    100;
  timelineSpeedRange.style.setProperty('--timeline-speed-progress', `${progress.toFixed(1)}%`);
}

function closeTimelineSettings() {
  timelineSettingsPanel.hidden = true;
  timelineSettingsButton.setAttribute('aria-expanded', 'false');
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

  selectLonLat(vectorToLonLat(hit.point));
}

function selectEvent(eventData, lonLat) {
  state.selectedFeature = null;
  state.selectedEvent = eventData;
  state.selectedLonLat = lonLat;
  drawSelection(null, eventData, lonLat);
  renderInfo();
  updateSelectionLink();
}

function selectLonLat(lonLat) {
  const nearbyEvent = findNearbyEvent(lonLat);
  const feature = findFeatureAt(lonLat.lon, lonLat.lat);

  state.selectedFeature = feature;
  state.selectedEvent = nearbyEvent;
  state.selectedLonLat = lonLat;
  drawSelection(feature, nearbyEvent, lonLat);
  renderInfo();
  updateSelectionLink();
}

function selectRandomVisiblePoint() {
  const visibleEvents = visibleEventCandidates();
  if (visibleEvents.length > 2) {
    selectRandomEventCandidate(visibleEvents);
    return;
  }

  const candidates = visibleEvents.map((candidate) => ({ ...candidate, type: 'event' }));
  const landCandidate = randomVisibleLandCandidate();
  if (landCandidate) candidates.push({ ...landCandidate, type: 'land' });

  if (candidates.length === 0) return;
  const candidate = candidates[Math.floor(Math.random() * candidates.length)];
  if (candidate.type === 'event') {
    selectEvent(candidate.eventData, candidate.lonLat);
  } else {
    selectLandLonLat(candidate.lonLat, candidate.feature);
  }
}

function selectRandomEventCandidate(candidates) {
  const candidate = candidates[Math.floor(Math.random() * candidates.length)];
  selectEvent(candidate.eventData, candidate.lonLat);
}

function selectLandLonLat(lonLat, feature = findLandFeatureAt(lonLat.lon, lonLat.lat)) {
  if (!feature) return false;
  state.selectedFeature = feature;
  state.selectedEvent = null;
  state.selectedLonLat = lonLat;
  drawSelection(feature, null, lonLat);
  renderInfo();
  updateSelectionLink();
  return true;
}

function visibleEventCandidates() {
  return eraMarkerGroup.children
    .filter((marker) => marker.userData?.event && isLonLatVisible(marker.userData.event))
    .map((marker) => ({
      eventData: marker.userData.event,
      lonLat: { lon: marker.userData.event.lon, lat: marker.userData.event.lat },
    }));
}

function randomVisibleLandCandidate() {
  for (let attempt = 0; attempt < RANDOM_LAND_PICK_TRIES; attempt += 1) {
    const lonLat = randomVisibleGlobeLonLat();
    if (!lonLat) continue;
    const feature = findLandFeatureAt(lonLat.lon, lonLat.lat);
    if (feature) return { lonLat, feature };
  }

  for (let attempt = 0; attempt < RANDOM_LAND_PICK_TRIES; attempt += 1) {
    const feature = randomFeature(state.geojson);
    const lonLat = feature ? randomLonLatInFeature(feature) : null;
    if (!lonLat || !isLonLatVisible(lonLat)) continue;
    if (findFeatureInGeojson({ features: [feature] }, lonLat.lon, lonLat.lat)) return { lonLat, feature };
  }

  return null;
}

function randomVisibleGlobeLonLat() {
  for (let attempt = 0; attempt < RANDOM_PICK_TRIES; attempt += 1) {
    pointer.set(Math.random() * 2 - 1, Math.random() * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObject(globe, false)[0];
    if (hit) return vectorToLonLat(hit.point);
  }

  return null;
}

function randomFeature(geojson) {
  const features = geojson?.features ?? [];
  if (features.length === 0) return null;
  return features[Math.floor(Math.random() * features.length)];
}

function randomLonLatInFeature(feature) {
  const bbox = feature?.bbox;
  if (!bbox) return null;

  const crossesAntimeridian = bbox[2] - bbox[0] > 300;
  const minLon = crossesAntimeridian ? -180 : bbox[0];
  const maxLon = crossesAntimeridian ? 180 : bbox[2];
  const lon = normalizeLon(minLon + Math.random() * (maxLon - minLon));
  const lat = bbox[1] + Math.random() * (bbox[3] - bbox[1]);
  return geometryContains(feature.geometry, lon, lat) ? { lon, lat } : null;
}

function isLonLatVisible(lonLat) {
  const position = lonLatToVector3(lonLat.lon, lonLat.lat, RADIUS);
  const projected = position.clone().project(camera);
  if (projected.z < -1 || projected.z > 1) return false;
  if (Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1) return false;

  const cameraPosition = camera.getWorldPosition(new THREE.Vector3());
  const cameraDistance = cameraPosition.length();
  if (cameraDistance <= RADIUS) return true;
  return position.normalize().dot(cameraPosition.normalize()) > RADIUS / cameraDistance;
}

function updateSelectionLink() {
  if (!state.selectedLonLat) {
    hideSelectionLink();
    return;
  }

  const target = selectionScreenPosition(state.selectedLonLat);
  if (!target) {
    hideSelectionLink();
    return;
  }

  const shellRect = appShell.getBoundingClientRect();
  const panelRect = infoPanel.getBoundingClientRect();
  const panel = {
    left: panelRect.left - shellRect.left,
    right: panelRect.right - shellRect.left,
    top: panelRect.top - shellRect.top,
    bottom: panelRect.bottom - shellRect.top,
  };

  if (target.x >= panel.left && target.x <= panel.right && target.y >= panel.top && target.y <= panel.bottom) {
    hideSelectionLink();
    return;
  }

  const start = panelEdgePoint(panel, target);
  selectionLink.setAttribute('viewBox', `0 0 ${shellRect.width} ${shellRect.height}`);
  selectionLinkLine.setAttribute('x1', start.x.toFixed(1));
  selectionLinkLine.setAttribute('y1', start.y.toFixed(1));
  selectionLinkLine.setAttribute('x2', target.x.toFixed(1));
  selectionLinkLine.setAttribute('y2', target.y.toFixed(1));
  selectionLink.removeAttribute('hidden');
}

function hideSelectionLink() {
  selectionLink.setAttribute('hidden', '');
}

function selectionScreenPosition(lonLat) {
  const shellRect = appShell.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();
  projectedSelectionPoint
    .copy(lonLatToVector3(lonLat.lon, lonLat.lat, SELECTED_RADIUS + 0.026))
    .project(camera);

  if (projectedSelectionPoint.z < -1 || projectedSelectionPoint.z > 1) return null;

  return {
    x: stageRect.left - shellRect.left + ((projectedSelectionPoint.x + 1) * stageRect.width) / 2,
    y: stageRect.top - shellRect.top + ((1 - projectedSelectionPoint.y) * stageRect.height) / 2,
  };
}

function panelEdgePoint(panel, target) {
  const center = {
    x: (panel.left + panel.right) / 2,
    y: (panel.top + panel.bottom) / 2,
  };
  const dx = target.x - center.x;
  const dy = target.y - center.y;
  const candidates = [];

  if (Math.abs(dx) > Number.EPSILON) {
    for (const x of [panel.left, panel.right]) {
      const t = (x - center.x) / dx;
      const y = center.y + dy * t;
      if (t > 0 && y >= panel.top && y <= panel.bottom) candidates.push({ x, y, t });
    }
  }

  if (Math.abs(dy) > Number.EPSILON) {
    for (const y of [panel.top, panel.bottom]) {
      const t = (y - center.y) / dy;
      const x = center.x + dx * t;
      if (t > 0 && x >= panel.left && x <= panel.right) candidates.push({ x, y, t });
    }
  }

  candidates.sort((a, b) => a.t - b.t);
  return candidates[0] ?? center;
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

function forEachOuterRing(geometry, callback) {
  if (!geometry) return;
  if (geometry.type === 'Polygon') {
    callback(geometry.coordinates[0]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) callback(polygon[0]);
  }
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
  return findFeatureInGeojson(state.pickGeojson ?? state.geojson, lon, lat);
}

function findLandFeatureAt(lon, lat) {
  return findFeatureInGeojson(state.geojson, lon, lat);
}

function findFeatureInGeojson(geojson, lon, lat) {
  const matches = [];
  const pickFeatures = geojson?.features ?? [];
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

function bboxDistanceEstimate(bbox, reference) {
  if (!bbox) return Infinity;

  const latDistance =
    reference.lat < bbox[1] ? bbox[1] - reference.lat : Math.max(0, reference.lat - bbox[3]);
  const lonDistance = lonDistanceToBbox(reference.lon, bbox);
  return Math.hypot(lonDistance * Math.cos(reference.lat * DEG), latDistance);
}

function lonDistanceToBbox(lon, bbox) {
  if (!bbox) return Infinity;
  if (bbox[2] - bbox[0] > 300) return 0;

  const minLon = wrapLonNear(bbox[0], lon);
  const maxLon = wrapLonNear(bbox[2], lon);
  const low = Math.min(minLon, maxLon);
  const high = Math.max(minLon, maxLon);
  if (lon >= low && lon <= high) return 0;
  return Math.min(Math.abs(lon - low), Math.abs(lon - high));
}

function bboxCenterNear(bbox, centerLon) {
  const minLon = wrapLonNear(bbox[0], centerLon);
  const maxLon = wrapLonNear(bbox[2], centerLon);
  return {
    lon: normalizeLon((minLon + maxLon) / 2),
    lat: (bbox[1] + bbox[3]) / 2,
  };
}

function clampLonToBbox(lon, bbox) {
  if (bbox[2] - bbox[0] > 300) return normalizeLon(lon);

  const minLon = wrapLonNear(bbox[0], lon);
  const maxLon = wrapLonNear(bbox[2], lon);
  const low = Math.min(minLon, maxLon);
  const high = Math.max(minLon, maxLon);
  return normalizeLon(THREE.MathUtils.clamp(lon, low, high));
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

function forwardLonDelta(fromLon, toLon) {
  let delta = normalizeLon(toLon - fromLon);
  if (delta < 0) delta += 360;
  return delta;
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
