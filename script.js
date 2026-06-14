const $ = (id) => document.getElementById(id);
const rand = (min, max, d = 0) => Number((Math.random() * (max - min) + min).toFixed(d));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const drift = (value, min, max, step = 1, d = 0) => {
  const next = clamp(value + rand(-step, step, d + 1), min, max);
  return Number(next.toFixed(d));
};
const motion = {};
const smoothDrift = (key, value, min, max, step = 1, d = 0, target = (min + max) / 2) => {
  const previousVelocity = motion[key] || 0;
  const pull = (target - value) * .015;
  const velocity = clamp(previousVelocity * .72 + rand(-step, step, d + 2) * .28 + pull, -step, step);
  const next = clamp(value + velocity, min, max);
  motion[key] = next === min || next === max ? velocity * -.35 : velocity;
  return Number(next.toFixed(d));
};
const makeSeries = (length, start, min, max, step, d) => {
  const values = [start];
  while (values.length < length) {
    values.push(drift(values.at(-1), min, max, step, d));
  }
  return values;
};

const state = {
  view: 'V1',
  air: makeSeries(48, 25.4, 22, 29, .25, 1),
  net: makeSeries(48, 420, 320, 520, 12, 0),
  env: makeSeries(32, 610, 520, 680, 6, 0),
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
    const previous = state.v1Values[i];
    state.v1Values[i] = smoothDrift(`v1-${i}`, previous, m[2], m[3], v1Steps[i], m[4]);
    const value = state.v1Values[i];
    $(`m${i}`).innerHTML = `${Number(value).toLocaleString()}<span class="metric-unit">${m[1]}</span>`;
    const trend = Number(((value - previous) / previous * 100).toFixed(1));
    $(`t${i}`).textContent = `${trend >= 0 ? '△' : '▽'} ${Math.abs(trend).toFixed(1)}% / live window`;
    $(`t${i}`).style.color = trend >= 0 ? 'var(--green)' : 'var(--red)';
  });
  $('cleanStatus').textContent = pick(['SYNC', 'NORMAL', 'ROUTE-A', 'CHECKING', 'OPTIMAL']);
  const flow = state.v1Values[5];
  $('flowStatus').textContent = flow < 55 ? 'LOW' : flow < 72 ? 'MEDIUM' : flow < 84 ? 'HIGH' : 'PEAK';
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
  state.air.push(smoothDrift('chart-air', state.air.at(-1), 20, 32, .3, 1)); state.air.shift();
  state.net.push(smoothDrift('chart-net', state.net.at(-1), 160, 780, 18, 0)); state.net.shift();
  state.env.push(smoothDrift('chart-env', state.env.at(-1), 430, 820, 8, 0)); state.env.shift();
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
  v.people = smoothDrift('v2-people', v.people, 1780, 3250, 5, 0);
  v.wifi = smoothDrift('v2-wifi', v.wifi, 960, 1880, 7, 0, v.people * .47);
  v.noise = smoothDrift('v2-noise', v.noise, 38, 66, .5, 1);
  v.clean = smoothDrift('v2-clean', v.clean, 72, 98, .7, 0);
  v.room = smoothDrift('v2-room', v.room, 48, 91, .7, 0);
  if (Math.random() < .22) v.park = clamp(v.park + pick([-1, 1]), 8, 73);
  v.airLoad = smoothDrift('v2-air-load', v.airLoad, 48, 88, .7, 0);
  v.light = smoothDrift('v2-light', v.light, 62, 96, .7, 0);
  v.fix = smoothDrift('v2-fix', v.fix, 58, 99, .7, 0);
  v.lms = smoothDrift('v2-lms', v.lms, 240, 980, 6, 0);
  v.submit = smoothDrift('v2-submit', v.submit, 54, 96, .7, 0);
  v.views = smoothDrift('v2-views', v.views, 1100, 7800, 24, 0);
  v.api = smoothDrift('v2-api', v.api, 20, 130, 4, 0);
  v.db = smoothDrift('v2-db', v.db, 45, 360, 8, 0);
  v.cpu = smoothDrift('v2-cpu', v.cpu, 18, 84, 2, 0);
  v.co2 = smoothDrift('v2-co2', v.co2, 480, 880, 4, 0, 540 + (v.people - 1780) * .12);
  v.pm = smoothDrift('v2-pm', v.pm, 4, 25, .35, 1);
  v.temp = smoothDrift('v2-temp', v.temp, 22, 29, .1, 1);
  v.hum = smoothDrift('v2-hum', v.hum, 52, 76, .6, 0);
  v.index = smoothDrift('v2-index', v.index, 72, 96, .7, 0);
  v.space = smoothDrift('v2-space', v.space, 68, 94, .7, 0);
  v.service = smoothDrift('v2-service', v.service, 38, 77, .7, 0);
  v.energy = smoothDrift('v2-energy', v.energy, 63, 91, .7, 0);
  v.pulse = smoothDrift('v2-pulse', v.pulse, 70, 98, .7, 0);

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
