const $ = (id) => document.getElementById(id);
const rand = (min, max, d = 0) => Number((Math.random() * (max - min) + min).toFixed(d));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const drift = (value, min, max, step = 1, d = 0) => {
  const next = clamp(value + rand(-step, step, d + 1), min, max);
  return Number(next.toFixed(d));
};

const state = {
  view: 'V1',
  air: Array.from({ length: 48 }, () => rand(22, 29, 1)),
  net: Array.from({ length: 48 }, () => rand(320, 520, 0)),
  env: Array.from({ length: 32 }, () => rand(520, 680, 0)),
  v1Values: [650, 48.5, 1280, 335.0, 62, 71.2],
  v2: {
    people: 3059, wifi: 1426, noise: 45.8, clean: 86, room: 73, park: 42,
    airLoad: 66, light: 84, fix: 77, lms: 612, submit: 78, views: 4200,
    api: 64, db: 180, cpu: 46, co2: 626, pm: 11.4, temp: 25.3, hum: 64,
    index: 84, space: 82, service: 57, energy: 76, pulse: 86
  }
};

function switchView(view) {
  state.view = view;
  $('viewV1').classList.toggle('active', view === 'V1');
  $('viewV2').classList.toggle('active', view === 'V2');
  $('btnV1').classList.toggle('active', view === 'V1');
  $('btnV2').classList.toggle('active', view === 'V2');
}
$('btnV1').addEventListener('click', () => switchView('V1'));
$('btnV2').addEventListener('click', () => switchView('V2'));

function updateClock() {
  const now = new Date();
  $('clockTime').textContent = now.toLocaleTimeString('zh-TW', { hour12: false });
  $('clockDate').textContent = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
}
setInterval(updateClock, 1000); updateClock();

// Matrix rain background
const canvas = $('matrixRain');
const ctx = canvas.getContext('2d');
let columns = [];
const chars = '慈濟大學經營管理智慧商情研究室010101AI-DATA-FLOW校園營運監測';
function resizeMatrix() {
  canvas.width = innerWidth; canvas.height = innerHeight;
  const colCount = Math.floor(canvas.width / 16);
  columns = Array.from({ length: colCount }, () => rand(0, canvas.height / 16));
}
addEventListener('resize', resizeMatrix); resizeMatrix();
function drawMatrix() {
  ctx.fillStyle = 'rgba(2, 8, 10, .08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '16px Consolas, monospace';
  for (let i = 0; i < columns.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillStyle = Math.random() > .965 ? '#3ef6ff' : '#44ff99';
    ctx.fillText(text, i * 16, columns[i] * 16);
    if (columns[i] * 16 > canvas.height && Math.random() > .985) columns[i] = 0;
    columns[i] += .55;
  }
  requestAnimationFrame(drawMatrix);
}
drawMatrix();

const v1MetricDefs = [
  ['CO₂', 'ppm', 510, 880, 0], ['Noise', 'dB', 38, 72, 1], ['Wi‑Fi Devices', '', 900, 1680, 0],
  ['Power Load', 'kW', 210, 460, 1], ['API Requests', '/s', 28, 118, 0], ['Campus Flow', 'idx', 42, 91, 1],
];
function renderMetricCards() {
  $('v1Metrics').innerHTML = v1MetricDefs.map((m, i) => `
    <article class="panel metric-card">
      <div class="metric-label">${m[0]}</div>
      <div class="metric-value" id="m${i}">--<span class="metric-unit">${m[1]}</span></div>
      <div class="metric-trend" id="t${i}">△ scanning...</div>
    </article>`).join('');
}
renderMetricCards();

function updateV1() {
  const v1Steps = [4, .7, 9, 2.8, 5, 1.2];
  v1MetricDefs.forEach((m, i) => {
    state.v1Values[i] = drift(state.v1Values[i], m[2], m[3], v1Steps[i], m[4]);
    const value = state.v1Values[i];
    $(`m${i}`).innerHTML = `${Number(value).toLocaleString()}<span class="metric-unit">${m[1]}</span>`;
    const trend = rand(-1.8, 2.2, 1);
    $(`t${i}`).textContent = `${trend >= 0 ? '△' : '▽'} ${Math.abs(trend)}% / live window`;
    $(`t${i}`).style.color = trend >= 0 ? 'var(--green)' : 'var(--red)';
  });
  $('cleanStatus').textContent = pick(['SYNC', 'NORMAL', 'ROUTE-A', 'CHECKING', 'OPTIMAL']);
  $('flowStatus').textContent = pick(['LOW', 'MEDIUM', 'HIGH', 'SHIFTING', 'PEAK']);
}

const terminalPhrases = [
  ['SENSOR', 'CO₂ node MGT-3F calibrated; variance within expected band.'],
  ['MAP', 'Campus flow vector recomputed: library → cafeteria path increasing.'],
  ['AI', 'Business signal classifier scanned campus announcement stream.'],
  ['SYS', 'Database query cache warmed; synthetic dashboard mode active.'],
  ['FACILITY', 'Air-conditioning load adjusted by simulated occupancy index.'],
  ['CLEAN', 'Cleaning route ETA refreshed for east corridor and lobby sector.'],
  ['LEARN', 'LMS activity pulse synchronized with course schedule matrix.'],
  ['SEC', 'Anomaly probe completed: no critical event found.'],
];
function pushLog() {
  const [tag, msg] = pick(terminalPhrases);
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-time">${new Date().toLocaleTimeString('zh-TW', { hour12: false })}</span><span class="log-tag">[${tag}]</span><span>${msg}</span>`;
  $('terminalLog').prepend(line);
  while ($('terminalLog').children.length > 13) $('terminalLog').lastChild.remove();
}

function drawLineChart(canvasId, data, min, max, accent = 'rgba(68,255,153,.95)') {
  const c = $(canvasId); if (!c) return;
  const g = c.getContext('2d');
  const w = c.width, h = c.height;
  g.clearRect(0, 0, w, h);
  g.strokeStyle = 'rgba(84,255,214,.18)'; g.lineWidth = 1;
  for (let i = 0; i < 5; i++) { const y = (h / 5) * i + 8; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.beginPath();
  data.forEach((v, i) => {
    const x = i / (data.length - 1) * w;
    const y = h - ((v - min) / (max - min)) * (h - 18) - 9;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  });
  g.strokeStyle = accent; g.lineWidth = 2; g.shadowColor = accent; g.shadowBlur = 12; g.stroke(); g.shadowBlur = 0;
}
function updateCharts() {
  state.air.push(drift(state.air.at(-1), 20, 32, .4, 1)); state.air.shift();
  state.net.push(drift(state.net.at(-1), 160, 780, 28, 0)); state.net.shift();
  state.env.push(drift(state.env.at(-1), 430, 820, 12, 0)); state.env.shift();
  drawLineChart('airChart', state.air, 5, 42, 'rgba(68,255,153,.95)');
  drawLineChart('netChart', state.net, 80, 820, 'rgba(62,246,255,.95)');
  drawLineChart('envChart', state.env, 360, 840, 'rgba(255,211,106,.95)');
}

const signalTexts = [
  '校園活動熱度上升：innovation, service, sustainability',
  '餐廳排隊壓力預測：12:05–12:35 高峰',
  '圖書館座位需求上升，建議開放討論室緩衝',
  '產業關鍵字偵測：AI literacy / retail analytics',
  '空間效率模型：MGT building usage stable',
  '教學資料流：course engagement index refreshed',
  'ESG 訊號：energy saving opportunity detected',
  '服務流程：maintenance ticket aging risk low',
];
function updateBar(idBar, idVal, value) {
  $(idVal).textContent = `${value}%`;
  $(idBar).style.width = `${value}%`;
}
function initSignalTicker() {
  const items = signalTexts.map(text => `<div class="ticker-item">${text}</div>`).join('');
  $('d3Signals').innerHTML = `<div class="ticker-track">${items}${items}</div>`;
}

function updateV2() {
  const v = state.v2;
  v.people = drift(v.people, 1780, 3250, 7, 0);
  v.wifi = drift(v.wifi, 960, 1880, 10, 0);
  v.noise = drift(v.noise, 38, 66, .8, 1);
  v.clean = drift(v.clean, 72, 98, 1, 0);
  v.room = drift(v.room, 48, 91, 1, 0);
  v.park = drift(v.park, 8, 73, 2, 0);
  v.airLoad = drift(v.airLoad, 48, 88, 1, 0);
  v.light = drift(v.light, 62, 96, 1, 0);
  v.fix = drift(v.fix, 58, 99, 1, 0);
  v.lms = drift(v.lms, 240, 980, 8, 0);
  v.submit = drift(v.submit, 54, 96, 1, 0);
  v.views = drift(v.views, 1100, 7800, 38, 0);
  v.api = drift(v.api, 20, 130, 6, 0);
  v.db = drift(v.db, 45, 360, 12, 0);
  v.cpu = drift(v.cpu, 18, 84, 3, 0);
  v.co2 = drift(v.co2, 480, 880, 7, 0);
  v.pm = drift(v.pm, 4, 25, .6, 1);
  v.temp = drift(v.temp, 22, 29, .2, 1);
  v.hum = drift(v.hum, 52, 76, 1, 0);
  v.index = drift(v.index, 72, 96, 1, 0);
  v.space = drift(v.space, 68, 94, 1, 0);
  v.service = drift(v.service, 38, 77, 1, 0);
  v.energy = drift(v.energy, 63, 91, 1, 0);
  v.pulse = drift(v.pulse, 70, 98, 1, 0);

  $('d1People').textContent = v.people.toLocaleString();
  $('d1Wifi').textContent = v.wifi.toLocaleString();
  $('d1Noise').textContent = `${v.noise} dB`;
  $('d2Clean').textContent = `${v.clean}%`;
  $('d2Room').textContent = `${v.room}%`;
  $('d2Park').textContent = `${v.park} 格`;
  updateBar('d4AirBar', 'd4AirVal', v.airLoad);
  updateBar('d4LightBar', 'd4LightVal', v.light);
  updateBar('d4FixBar', 'd4FixVal', v.fix);
  $('d5Lms').textContent = v.lms.toLocaleString();
  $('d5Submit').textContent = `${v.submit}%`;
  $('d5Views').textContent = v.views.toLocaleString();
  $('d6Api').textContent = v.api;
  $('d6Db').textContent = v.db;
  $('d6Cpu').textContent = `${v.cpu}%`;
  $('d7Co2').textContent = `${v.co2} ppm`;
  $('d7Pm').textContent = `${v.pm} µg/m³`;
  $('d7Temp').textContent = `${v.temp}°C / ${v.hum}%`;
  $('d8Index').textContent = v.index;
  $('d8Space').textContent = `${v.space}%`;
  $('d8Service').textContent = `${v.service}%`;
  $('d8Energy').textContent = `${v.energy}%`;
  $('v2Pulse').textContent = `${v.pulse}%`;
  $('v2Decision').textContent = v.index;
  $('v2Signal').textContent = pick(['NORMAL', 'ACTIVE', 'SCANNING', 'ELEVATED']);
}

setInterval(updateV1, 1000); updateV1();
setInterval(pushLog, 850); for (let i = 0; i < 10; i++) pushLog();
setInterval(updateCharts, 1000); updateCharts();
initSignalTicker();
setInterval(updateV2, 1400); updateV2();
