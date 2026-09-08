// 虎王星图团队开发轻量版系统
// 应用逻辑（由 index.html 内联脚本抽取，纯前端零依赖，无后台/会员功能）

/* ==================================================================
 * 虎王星图轻量版
 * 单文件、零依赖。PART1: 设备目录 / 图标 / 基础工具
 * ================================================================== */
(function () {
'use strict';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const SVGNS = 'http://www.w3.org/2000/svg';
const NODE_W = 80, NODE_H = 84, GRID = 10, PORT_GAP = 22;

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = p => (p || 'id') + Math.random().toString(36).slice(2, 9);
const short = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
let saveTimer = null;
const debounce = (fn, ms) => { clearTimeout(saveTimer); saveTimer = setTimeout(fn, ms); };

/* ---------------- 端口排（图标内小格子） ---------------- */
function portRow(n, x0, y, w, h, step, fill) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<rect x="${x0 + i * step}" y="${y}" width="${w}" height="${h}" rx=".6" fill="${fill}" opacity=".7"/>`;
  return s;
}

/* ---------------- 设备图标（48×48 扁平写实风格） ---------------- */
const INK = '#334155';
const ICONS = {
  cloud: `<path d="M13 33a7.5 7.5 0 0 1 .8-14.9 11 11 0 0 1 20.6 2.3A7 7 0 0 1 34.5 33z" fill="#dbeafe" stroke="#1e40af" stroke-width="2" stroke-linejoin="round"/>
    <path d="M17 38h14" stroke="#1e40af" stroke-width="2" stroke-linecap="round" opacity=".45"/>`,

  onu: `<path d="M36 18l7-7" stroke="${INK}" stroke-width="2" stroke-linecap="round"/><circle cx="43.4" cy="10.6" r="1.6" fill="${INK}"/>
    <rect x="7" y="18" width="34" height="19" rx="3" fill="#eef2f7" stroke="${INK}" stroke-width="2"/>
    <rect x="11" y="22" width="26" height="5" rx="1" fill="#cbd5e1"/>
    <circle cx="12" cy="32.5" r="1.8" fill="#22c55e"/><circle cx="18" cy="32.5" r="1.8" fill="#22c55e"/>
    <circle cx="24" cy="32.5" r="1.8" fill="#eab308"/><circle cx="30" cy="32.5" r="1.8" fill="#94a3b8"/>`,

  router: `<line x1="15" y1="22" x2="10" y2="9" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <line x1="33" y1="22" x2="38" y2="9" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="10" cy="9" r="1.8" fill="${INK}"/><circle cx="38" cy="9" r="1.8" fill="${INK}"/>
    <rect x="6" y="22" width="36" height="17" rx="3" fill="#eef2f7" stroke="${INK}" stroke-width="2"/>
    <rect x="10" y="26" width="13" height="5" rx="1" fill="#cbd5e1"/>
    <circle cx="29" cy="28.5" r="1.7" fill="#22c55e"/><circle cx="34" cy="28.5" r="1.7" fill="#22c55e"/>
    <rect x="10" y="34.5" width="28" height="2" rx="1" fill="#94a3b8" opacity=".55"/>`,

  firewall: `<rect x="7" y="15" width="34" height="24" rx="2" fill="#fee2e2" stroke="#991b1b" stroke-width="2"/>
    <path d="M7 23h34M7 31h34M17 15v8M31 23v8M17 31v8" stroke="#fca5a5" stroke-width="1.1"/>
    <path d="M24 18l8 3.5v6c0 4.2-3.4 6.8-8 8.5-4.6-1.7-8-4.3-8-8.5v-6z" fill="#dc2626"/>
    <path d="M24 21v11" stroke="#fee2e2" stroke-width="1.2" opacity=".7"/>`,

  core: `<rect x="3" y="15" width="42" height="21" rx="2" fill="#e0e7ff" stroke="#1e3a8a" stroke-width="2"/>
    <rect x="3" y="15" width="42" height="4.5" fill="#1e3a8a" opacity=".28"/>
    <circle cx="6.6" cy="17.2" r="1" fill="#22c55e"/><circle cx="10.4" cy="17.2" r="1" fill="#22c55e"/>
    ${portRow(12, 5.6, 22.6, 2.2, 4.4, 3.3, '#1e293b')}
    ${portRow(12, 5.6, 29, 2.2, 4.4, 3.3, '#1e293b')}`,

  sw: `<rect x="5" y="19" width="38" height="15" rx="2" fill="#e0e7ff" stroke="#1e40af" stroke-width="2"/>
    <circle cx="8.6" cy="23" r="1.1" fill="#22c55e"/><circle cx="12" cy="23" r="1.1" fill="#22c55e"/>
    ${portRow(8, 8, 27, 2.8, 5, 4.1, '#1e293b')}`,

  ap: `<rect x="10" y="13" width="28" height="10" rx="4" fill="#eef2f7" stroke="${INK}" stroke-width="2"/>
    <circle cx="24" cy="18" r="1.6" fill="#22c55e"/>
    <path d="M16 27a11 11 0 0 0 16 0" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
    <path d="M19.5 32a6.5 6.5 0 0 0 9 0" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
    <circle cx="24" cy="37" r="1.5" fill="#2563eb"/>`,

  server: `<rect x="7" y="9" width="34" height="13" rx="2" fill="#e2e8f0" stroke="${INK}" stroke-width="2"/>
    <rect x="7" y="26" width="34" height="13" rx="2" fill="#e2e8f0" stroke="${INK}" stroke-width="2"/>
    <rect x="11" y="12" width="9" height="7" rx="1" fill="#cbd5e1"/><rect x="22" y="12" width="9" height="7" rx="1" fill="#cbd5e1"/>
    <circle cx="35" cy="15.5" r="1.5" fill="#22c55e"/>
    <rect x="11" y="29" width="9" height="7" rx="1" fill="#cbd5e1"/><rect x="22" y="29" width="9" height="7" rx="1" fill="#cbd5e1"/>
    <circle cx="35" cy="32.5" r="1.5" fill="#22c55e"/>`,

  nas: `<rect x="14" y="7" width="20" height="34" rx="3" fill="#e2e8f0" stroke="${INK}" stroke-width="2"/>
    <rect x="17" y="12" width="14" height="6" rx="1" fill="#cbd5e1"/><rect x="17" y="21" width="14" height="6" rx="1" fill="#cbd5e1"/>
    <rect x="17" y="30" width="14" height="6" rx="1" fill="#cbd5e1"/>
    <circle cx="24" cy="41.5" r="1.4" fill="#22c55e"/>`,

  ups: `<rect x="12" y="9" width="24" height="30" rx="3" fill="#fef3c7" stroke="#b45309" stroke-width="2"/>
    <path d="M26.5 14l-8.5 11.5h6l-2.5 9.5 9.5-12.5h-6z" fill="#f59e0b"/>`,

  pc: `<rect x="6" y="7" width="30" height="21" rx="2" fill="#dbeafe" stroke="${INK}" stroke-width="2"/>
    <rect x="18" y="28" width="6" height="3" fill="#94a3b8"/><rect x="10" y="31" width="22" height="3" rx="1.5" fill="#94a3b8"/>
    <rect x="30" y="27" width="13" height="14" rx="2" fill="#eef2f7" stroke="${INK}" stroke-width="2"/>
    <circle cx="36.5" cy="32" r="1.5" fill="#22c55e"/>
    <rect x="32" y="36" width="9" height="2" rx="1" fill="#cbd5e1"/>`,

  imac: `<rect x="8" y="7" width="32" height="24" rx="2" fill="#e0f2fe" stroke="${INK}" stroke-width="2"/>
    <rect x="11" y="10" width="26" height="18" rx="1" fill="#bae6fd" opacity=".7"/>
    <path d="M21 31h6l2.5 6h-11z" fill="#cbd5e1" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="15" y="37" width="18" height="3" rx="1.5" fill="#94a3b8"/>`,

  laptop: `<rect x="11" y="11" width="26" height="18" rx="2" fill="#e0f2fe" stroke="${INK}" stroke-width="2"/>
    <rect x="13.5" y="13.5" width="21" height="13" rx="1" fill="#bae6fd" opacity=".7"/>
    <path d="M6 33h36l-4 5H10z" fill="#cbd5e1" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="21" y="34.5" width="6" height="2" rx="1" fill="#94a3b8"/>`,

  phone: `<rect x="16" y="5" width="16" height="34" rx="4" fill="#e0f2fe" stroke="${INK}" stroke-width="2"/>
    <rect x="18.5" y="9" width="11" height="24" rx="1.5" fill="#93c5fd"/>
    <rect x="21" y="35.5" width="6" height="1.6" rx=".8" fill="${INK}" opacity=".45"/>`,

  tablet: `<rect x="12" y="8" width="24" height="32" rx="3" fill="#e0f2fe" stroke="${INK}" stroke-width="2"/>
    <rect x="15" y="12" width="18" height="24" rx="1" fill="#93c5fd"/>`,

  printer: `<rect x="13" y="9" width="22" height="13" rx="1" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>
    <rect x="12" y="12" width="24" height="9" rx="2" fill="#eef2f7" stroke="${INK}" stroke-width="2"/>
    <rect x="8" y="21" width="32" height="14" rx="2" fill="#e0e7ff" stroke="${INK}" stroke-width="2"/>
    <rect x="12" y="27" width="24" height="4" rx="1" fill="#94a3b8" opacity=".45"/>
    <circle cx="37" cy="25" r="1.3" fill="#22c55e"/>`,

  camera: `<rect x="6" y="15" width="22" height="11" rx="2" fill="#eef2f7" stroke="${INK}" stroke-width="2"/>
    <path d="M28 17.5l7-2.5v10l-7-2.5z" fill="${INK}" opacity=".75"/>
    <circle cx="12" cy="20.5" r="1.4" fill="#ef4444"/>
    <path d="M17 26v5H9v5h16v-5" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,

  ipphone: `<path d="M13 13h22v13l-7 6h-8l-7-6z" fill="#eef2f7" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="18" cy="18.5" r="1.3" fill="#94a3b8"/><circle cx="24" cy="18.5" r="1.3" fill="#94a3b8"/><circle cx="30" cy="18.5" r="1.3" fill="#94a3b8"/>
    <circle cx="18" cy="23" r="1.3" fill="#94a3b8"/><circle cx="24" cy="23" r="1.3" fill="#94a3b8"/><circle cx="30" cy="23" r="1.3" fill="#94a3b8"/>
    <path d="M20 32h8" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,

  monitor: `<rect x="5" y="10" width="38" height="24" rx="2" fill="#e0f2fe" stroke="${INK}" stroke-width="2"/>
    <rect x="8" y="13" width="32" height="18" rx="1" fill="#bae6fd" opacity=".65"/>
    <path d="M20 34h8l1.5 5h-11z" fill="#cbd5e1" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
};

/* ---------------- 自定义设备类型 ----------------
 * 结构：{ key, name, cat, model, ports, color,
 *         iconKind:'builtin'|'svg'|'emoji', icon:(内置key|emoji字符), svg:(SVG片段) }
 * ------------------------------------------------ */
let CUSTOM = [];
const CSKEY = 'nettopo.custom.v1';
function loadCustom() {
  try {
    const s = localStorage.getItem(CSKEY);
    const a = s ? JSON.parse(s) : [];
    if (Array.isArray(a)) CUSTOM = a.filter(d => d && d.key && d.name);
  } catch (e) { CUSTOM = []; }
  rebuildTypes();
}
function saveCustom() { try { localStorage.setItem(CSKEY, JSON.stringify(CUSTOM)); } catch (e) { } }
function rebuildTypes() {
  TYPE = {};
  CATALOG.forEach(d => { TYPE[d.key] = d; });
  CUSTOM.forEach(d => { TYPE[d.key] = d; });
}
function isCustom(key) { return String(key || '').indexOf('cu_') === 0; }
/* 自定义图标的 SVG 内容（统一画在 48×48 画布内） */
function customIconSVG(d) {
  if (d.iconKind === 'emoji' || (d.iconKind !== 'svg' && d.emoji)) {
    const c = d.color || '#2563eb';
    return `<rect x="4" y="6" width="40" height="36" rx="8" fill="${c}" opacity=".12" stroke="${c}" stroke-width="1.6"/>
      <text x="24" y="34" font-size="24" text-anchor="middle" style="font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif">${esc(d.emoji || d.icon || '❓')}</text>`;
  }
  if (d.iconKind === 'svg' && d.svg) return d.svg;
  return ICONS[d.icon] || ICONS.pc;
}
/* 设备库分类清单（内置分类 + 自定义分类，去重） */
function allCats() {
  const set = [], seen = {};
  CATALOG.concat(CUSTOM).forEach(d => { if (d.cat && !seen[d.cat]) { seen[d.cat] = 1; set.push(d.cat); } });
  return set;
}

/* ---------------- 设备目录 ---------------- */
const CATALOG = [
  { key: 'cloud', name: '互联网/外网', cat: '网络与安全', ports: 1, model: '运营商专线' },
  { key: 'onu', name: '光猫 / ONU', cat: '网络与安全', ports: 4, model: 'HG8145V5' },
  { key: 'router', name: '路由器', cat: '网络与安全', ports: 4, model: 'ER605' },
  { key: 'firewall', name: '防火墙', cat: '网络与安全', ports: 8, model: 'USG-200' },
  { key: 'core', name: '核心交换机', cat: '网络与安全', ports: 48, model: 'S5735-S48T' },
  { key: 'sw', name: '接入交换机', cat: '网络与安全', ports: 24, model: 'S1730S-S24T' },
  { key: 'ap', name: '无线 AP', cat: '网络与安全', ports: 2, model: 'AP-AC-Pro' },
  { key: 'server', name: '服务器', cat: '服务器与存储', ports: 4, model: 'R740xd' },
  { key: 'nas', name: 'NAS 存储', cat: '服务器与存储', ports: 2, model: 'DS1821+' },
  { key: 'ups', name: 'UPS 电源', cat: '服务器与存储', ports: 1, model: 'C3KS' },
  { key: 'pc', name: '台式电脑', cat: '终端设备', ports: 1, model: 'OptiPlex 7010' },
  { key: 'imac', name: '一体机', cat: '终端设备', ports: 1, model: 'iMac 24"' },
  { key: 'laptop', name: '笔记本电脑', cat: '终端设备', ports: 1, model: 'ThinkPad T14' },
  { key: 'phone', name: '手机', cat: '终端设备', ports: 1, model: '—' },
  { key: 'tablet', name: '平板', cat: '终端设备', ports: 1, model: '—' },
  { key: 'printer', name: '打印机', cat: '终端设备', ports: 1, model: 'M7605DW' },
  { key: 'camera', name: '网络摄像头', cat: '终端设备', ports: 1, model: 'IPC-4MP' },
  { key: 'ipphone', name: 'IP 电话', cat: '终端设备', ports: 2, model: 'T46S' },
  { key: 'monitor', name: '大屏 / 显示器', cat: '终端设备', ports: 1, model: '65" 4K' }
];
let TYPE = {};
CATALOG.forEach(d => { TYPE[d.key] = d; });
const STATUS = { online: '在线', warn: '告警', offline: '离线', unknown: '未知' };

/* ---------------- 全局状态 ---------------- */
const S = {
  nodes: [], links: [],
  sel: new Set(), selLink: null,
  scale: 1, panX: 0, panY: 0,
  grid: true, snap: true, linkStyle: 'elbow',
  showFlow: true, showLabels: false, monitor: false, linkMode: false,
  title: '虎王星图轻量版网络拓扑图'
};

const stage = $('#stage'), svg = $('#canvas'), vp = $('#viewport');
const LAYER_L = $('#layerLinks'), LAYER_N = $('#layerNodes'), LAYER_T = $('#layerTemp'), LAYER_O = $('#layerOverlay');

let IDX = {};
function buildIndex() { IDX = {}; S.nodes.forEach(n => { IDX[n.id] = n; }); }
const N = id => IDX[id];

function toWorld(cx, cy) {
  const r = svg.getBoundingClientRect();
  return { x: (cx - r.left - S.panX) / S.scale, y: (cy - r.top - S.panY) / S.scale };
}
function snap(v) { return S.snap ? Math.round(v / GRID) * GRID : Math.round(v); }

/* ---------------- defs：网格 + 图标 symbol ---------------- */
function buildDefs() {
  let s = `<pattern id="gridPattern" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="var(--canvas-bg,#ffffff)"/>
      <path d="M0 .5H100M.5 0V100" stroke="var(--grid2,#d8e1ed)" stroke-width="1" fill="none"/>
      <path d="M20 0V100M40 0V100M60 0V100M80 0V100M0 20H100M0 40H100M0 60H100M0 80H100" stroke="var(--grid,#e6ecf4)" stroke-width="1" fill="none"/>
    </pattern>`;
  for (const k in ICONS) s += `<symbol id="ic-${k}" viewBox="0 0 48 48">${ICONS[k]}</symbol>`;
  CUSTOM.forEach(d => {
    const vb = (d.iconKind === 'svg' && d.vb) ? d.vb : '0 0 48 48';
    s += `<symbol id="ic-${d.key}" viewBox="${vb}">${customIconSVG(d)}</symbol>`;
  });
  $('#svgDefs').innerHTML = s;
  const bg = $('#bgRect'); if (bg) bg.remove();
}

/* ---------------- 连线几何 ---------------- */
const DIRV = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };
function anchor(n, p) {
  const v = DIRV[p] || DIRV.right;
  return { x: n.x + v[0] * nw(n) / 2, y: n.y + v[1] * nh(n) / 2, dx: v[0], dy: v[1] };
}
function autoPort(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
}
function endpoints(l) {
  const a = N(l.from), b = N(l.to);
  return {
    a: anchor(a, l.fp === 'auto' || !l.fp ? autoPort(a, b) : l.fp),
    b: anchor(b, l.tp === 'auto' || !l.tp ? autoPort(b, a) : l.tp)
  };
}
function geom(l) {
  const { a: p1, b: p2 } = endpoints(l);
  let d, mx, my;
  if (S.linkStyle === 'line') {
    d = `M${p1.x},${p1.y} L${p2.x},${p2.y}`; mx = (p1.x + p2.x) / 2; my = (p1.y + p2.y) / 2;
  } else if (S.linkStyle === 'curve') {
    const g = Math.max(45, Math.hypot(p2.x - p1.x, p2.y - p1.y) * .38);
    const c1 = { x: p1.x + p1.dx * g, y: p1.y + p1.dy * g }, c2 = { x: p2.x + p2.dx * g, y: p2.y + p2.dy * g };
    d = `M${p1.x},${p1.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
    mx = (p1.x + 3 * c1.x + 3 * c2.x + p2.x) / 8; my = (p1.y + 3 * c1.y + 3 * c2.y + p2.y) / 8;
  } else {
    const g = 22, A = { x: p1.x + p1.dx * g, y: p1.y + p1.dy * g }, B = { x: p2.x + p2.dx * g, y: p2.y + p2.dy * g };
    const v1 = p1.dx !== 0, v2 = p2.dx !== 0;
    if (v1 && v2) { const mx2 = (A.x + B.x) / 2; d = `M${p1.x},${p1.y} L${A.x},${A.y} L${mx2},${A.y} L${mx2},${B.y} L${B.x},${B.y} L${p2.x},${p2.y}`; mx = mx2; my = (A.y + B.y) / 2; }
    else if (!v1 && !v2) { const my2 = (A.y + B.y) / 2; d = `M${p1.x},${p1.y} L${A.x},${A.y} L${A.x},${my2} L${B.x},${my2} L${B.x},${B.y} L${p2.x},${p2.y}`; mx = (A.x + B.x) / 2; my = my2; }
    else if (v1 && !v2) { d = `M${p1.x},${p1.y} L${A.x},${A.y} L${B.x},${A.y} L${B.x},${B.y} L${p2.x},${p2.y}`; mx = B.x; my = A.y; }
    else { d = `M${p1.x},${p1.y} L${A.x},${A.y} L${A.x},${B.y} L${B.x},${B.y} L${p2.x},${p2.y}`; mx = A.x; my = B.y; }
  }
  return { d: d, mx: mx, my: my };
}
function linkStatus(l) {
  const a = N(l.from), b = N(l.to);
  if (!a || !b) return 'unknown';
  const s = [a.status, b.status];
  if (s.indexOf('offline') >= 0) return 'offline';
  if (s.indexOf('warn') >= 0) return 'warn';
  if (s.indexOf('unknown') >= 0) return 'unknown';
  return 'online';
}

/* ---------------- 节点 / 连线 SVG ---------------- */
/* 节点实际显示尺寸（支持单台设备自定义大/中/小） */
const SIZE_K = { s: 0.78, m: 1, l: 1.28 };
function nscale(n) { return SIZE_K[n.size] || 1; }
function nw(n) { return NODE_W * nscale(n); }
function nh(n) { return NODE_H * nscale(n); }
function iconKey(n) {
  if (n.icon && TYPE[n.icon]) return n.icon;
  if (n.icon) return n.icon;
  return (TYPE[n.type] || TYPE.pc).key;
}
function nodeHTML(n) {
  const meta = TYPE[n.type] || TYPE.pc;
  const st = n.status || 'online';
  const sc = nscale(n), W = nw(n), H = nh(n), col = n.color || '';
  const tip = [n.name, n.ip || '未配置 IP', '状态：' + STATUS[st] + (n.latency != null ? '（' + n.latency + 'ms）' : ''),
    '型号：' + (n.model || meta.model || '—'), '接口数：' + (n.ports || meta.ports || 1), n.note || ''].filter(Boolean).join('\n');
  const P = [['top', 0, -NODE_H / 2], ['right', NODE_W / 2, 0], ['bottom', 0, NODE_H / 2], ['left', -NODE_W / 2, 0]]
    .map(p => `<circle class="port" data-port="${p[0]}" cx="${p[1]}" cy="${p[2]}" r="4.5"/>`).join('');
  const nm = `<text class="node-name" y="24"${col ? ' style="fill:' + col + '"' : ''}>${esc(short(n.name, 9))}</text>`;
  const ip = n.hideIP ? '' : `<text class="node-ip" y="38">${esc(n.ip || '')}</text>`;
  const accent = col ? `<rect x="${-W / 2 + 8}" y="${H / 2 - 7}" width="${W - 16}" height="3" rx="1.5" fill="${col}" opacity=".85"/>` : '';
  return `<g class="node ${st} ${S.sel.has(n.id) ? 'is-selected' : ''}" data-id="${n.id}" transform="translate(${n.x},${n.y}) scale(${sc})">
    <title>${esc(tip)}</title>
    <rect class="node-hit" x="${-NODE_W / 2}" y="${-NODE_H / 2}" width="${NODE_W}" height="${NODE_H}" rx="12"/>
    <g class="node-icon" transform="translate(-24,-40)"><use href="#ic-${iconKey(n)}" width="48" height="48"/></g>
    <circle class="status-bg" cx="27" cy="-32" r="6"/><circle class="status-dot ${st}" cx="27" cy="-32" r="3.6"/>
    ${nm}${ip}${accent}
    ${P}
    <rect class="sel-box" x="${-NODE_W / 2 - 5}" y="${-NODE_H / 2 - 5}" width="${NODE_W + 10}" height="${NODE_H + 10}"/>
  </g>`;
}
function linkHTML(l) {
  if (!N(l.from) || !N(l.to)) return '';
  const g = geom(l), st = linkStatus(l), sel = S.selLink === l.id;
  return `<g class="link ${st} ${sel ? 'is-selected' : ''}" data-id="${l.id}">
    <path class="link-hit" d="${g.d}"/>
    <path class="link-line" d="${g.d}"/>
    ${S.showFlow ? `<path class="link-flow" d="${g.d}"/>` : ''}
    ${S.showLabels && l.label ? `<text class="link-label" x="${g.mx}" y="${g.my - 5}">${esc(l.label)}</text>` : ''}
  </g>`;
}
function render() {
  buildIndex();
  vp.setAttribute('transform', `translate(${S.panX},${S.panY}) scale(${S.scale})`);
  $('#gridRect').style.display = S.grid ? '' : 'none';
  LAYER_L.innerHTML = S.links.map(linkHTML).join('');
  LAYER_N.innerHTML = S.nodes.map(nodeHTML).join('');
  $('#zoomVal').textContent = Math.round(S.scale * 100) + '%';
  renderStats();
  if (typeof updateInspector === 'function') updateInspector();
  scheduleSave();
}

/* ---------------- 统计 / 自动保存 ---------------- */
function renderStats() {
  let on = 0, wa = 0, off = 0;
  S.nodes.forEach(n => { if (n.status === 'warn') wa++; else if (n.status === 'offline') off++; else if (n.status === 'online') on++; });
  $('#stNodes').textContent = S.nodes.length;
  $('#stLinks').textContent = S.links.length;
  $('#stOnline').textContent = on; $('#stWarn').textContent = wa; $('#stOffline').textContent = off;
}
const LSKEY = 'nettopo.project.v1';
function scheduleSave() { debounce(() => { try { localStorage.setItem(LSKEY, JSON.stringify(proj())); } catch (e) { } }, 600); }
function proj() { return { v: 2, title: S.title, nodes: S.nodes, links: S.links, linkStyle: S.linkStyle, scale: S.scale, panX: S.panX, panY: S.panY, customTypes: CUSTOM }; }

/* ---------------- 历史记录 ---------------- */
let HIST = [], HI = -1;
function snapshot() { return JSON.stringify({ nodes: S.nodes, links: S.links }); }
function pushHist() {
  const s = snapshot();
  if (HIST[HI] === s) return;
  HIST = HIST.slice(0, HI + 1); HIST.push(s);
  if (HIST.length > 80) HIST.shift();
  HI = HIST.length - 1;
  syncHist();
}
function restore(s) {
  const o = JSON.parse(s);
  S.nodes = o.nodes; S.links = o.links; S.sel.clear(); S.selLink = null;
  render(); scheduleSave();
}
function undo() { if (HI > 0) { HI--; restore(HIST[HI]); syncHist(); } }
function redo() { if (HI < HIST.length - 1) { HI++; restore(HIST[HI]); syncHist(); } }
function syncHist() {
  $('#btnUndo').style.opacity = HI > 0 ? 1 : .4;
  $('#btnRedo').style.opacity = HI < HIST.length - 1 ? 1 : .4;
}

/* ---------------- 设备库 ---------------- */
function renderLibrary() {
  const f = ($('#libSearch').value || '').trim().toLowerCase();
  const cats = {};
  CATALOG.concat(CUSTOM).filter(d => !f || d.name.toLowerCase().indexOf(f) >= 0 || d.key.indexOf(f) >= 0 || (d.cat || '').toLowerCase().indexOf(f) >= 0)
    .forEach(d => { (cats[d.cat] = cats[d.cat] || []).push(d); });
  const card = d => `<div class="dev${isCustom(d.key) ? ' custom' : ''}" draggable="true" data-key="${d.key}"
      title="${esc(d.name)}${d.model ? ' · ' + esc(d.model) : ''}${isCustom(d.key) ? '（自定义设备，点击齿轮可编辑）' : ''}">
      <svg viewBox="0 0 48 48"><use href="#ic-${d.key}"/></svg><span>${esc(d.name)}</span>
      ${isCustom(d.key) ? '<i class="dev-edit" data-edit="' + d.key + '" title="编辑自定义设备">✎</i>' : ''}
    </div>`;
  let h = '';
  for (const c in cats) {
    h += `<div class="lib-cat">${esc(c)}</div><div class="lib-grid">` + cats[c].map(card).join('') + '</div>';
  }
  h += `<button class="lib-add" id="libAdd">＋ 新建自定义设备</button>`;
  $('#libBody').innerHTML = h || '<div class="empty-tip">未匹配到设备</div>';
}

/* ---------------- 节点 / 连线增删 ---------------- */
function nextName(type) {
  const base = (TYPE[type] || TYPE.pc).name;
  let i = 1;
  while (S.nodes.some(n => n.type === type && n.name === base + ' ' + i)) i++;
  return base + ' ' + i;
}
function nextIP() {
  const used = {};
  S.nodes.forEach(n => { if (n.ip) used[n.ip] = 1; });
  for (let i = 2; i < 254; i++) { const ip = '192.168.1.' + i; if (!used[ip]) return ip; }
  return '';
}
function addNode(type, x, y, opt) {
  const meta = TYPE[type] || TYPE.pc;
  const n = Object.assign({
    id: uid('n'), type: type, name: nextName(type),
    ip: type === 'cloud' ? '' : nextIP(),
    model: meta.model || '', ports: meta.ports || 1,
    mac: randMac(), status: 'online', latency: Math.floor(5 + Math.random() * 20),
    note: '', x: snap(x), y: snap(y)
  }, opt || {});
  S.nodes.push(n);
  S.sel.clear(); S.sel.add(n.id); S.selLink = null;
  pushHist(); render();
  return n;
}
function randMac() {
  const h = '0123456789ABCDEF'; let s = '';
  for (let i = 0; i < 6; i++) s += (i ? ':' : '') + h[Math.floor(Math.random() * 16)] + h[Math.floor(Math.random() * 16)];
  return s;
}
function addLink(from, to, fp, tp) {
  if (!from || !to || from === to) return null;
  if (S.links.some(l => (l.from === from && l.to === to) || (l.from === to && l.to === from))) { toast('这两个设备之间已存在链路'); return null; }
  const l = { id: uid('l'), from: from, to: to, fp: fp || 'auto', tp: tp || 'auto', label: '', bandwidth: '' };
  S.links.push(l); pushHist(); render();
  return l;
}
function deleteSelection() {
  if (!S.sel.size && !S.selLink) return;
  if (S.selLink) { S.links = S.links.filter(l => l.id !== S.selLink); S.selLink = null; }
  if (S.sel.size) {
    S.links = S.links.filter(l => !S.sel.has(l.from) && !S.sel.has(l.to));
    S.nodes = S.nodes.filter(n => !S.sel.has(n.id));
    S.sel.clear();
  }
  pushHist(); render();
}
let CLIP = null;
function copySelection() {
  if (!S.sel.size) return;
  const ns = S.nodes.filter(n => S.sel.has(n.id)).map(n => JSON.parse(JSON.stringify(n)));
  const ls = S.links.filter(l => S.sel.has(l.from) && S.sel.has(l.to)).map(l => JSON.parse(JSON.stringify(l)));
  CLIP = { nodes: ns, links: ls };
  toast('已复制 ' + ns.length + ' 台设备');
}
function pasteClip(dx, dy) {
  if (!CLIP || !CLIP.nodes.length) return;
  const map = {};
  const ns = CLIP.nodes.map(n => { const c = JSON.parse(JSON.stringify(n)); map[n.id] = c.id = uid('n'); c.x = snap(n.x + dx); c.y = snap(n.y + dy); c.name = n.name; return c; });
  const ls = CLIP.links.map(l => ({ id: uid('l'), from: map[l.from], to: map[l.to], fp: l.fp, tp: l.tp, label: l.label, bandwidth: l.bandwidth }));
  S.nodes = S.nodes.concat(ns); S.links = S.links.concat(ls);
  S.sel.clear(); ns.forEach(n => S.sel.add(n.id)); S.selLink = null;
  pushHist(); render();
}
function disconnectNode(id) {
  S.links = S.links.filter(l => l.from !== id && l.to !== id);
  pushHist(); render();
}
/* 给选中的设备设置强调色（空字符串表示清除） */
function setColor(c) {
  if (!S.sel.size) { toast('请先选中设备'); return; }
  S.sel.forEach(i => { const n = N(i); if (n) n.color = c || ''; });
  render(); debounceHist();
}

/* ---------------- 视图：缩放 / 适应 / 布局 ---------------- */
function zoomAt(cx, cy, factor) {
  const ns = clamp(S.scale * factor, .15, 3);
  const k = ns / S.scale;
  S.panX = cx - (cx - S.panX) * k;
  S.panY = cy - (cy - S.panY) * k;
  S.scale = ns;
  render();
}
function zoomCenter(f) {
  const r = svg.getBoundingClientRect();
  zoomAt(r.width / 2, r.height / 2, f);
}
function contentBox() {
  if (!S.nodes.length) return null;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  S.nodes.forEach(n => {
    x1 = Math.min(x1, n.x - nw(n) / 2); y1 = Math.min(y1, n.y - nh(n) / 2);
    x2 = Math.max(x2, n.x + nw(n) / 2); y2 = Math.max(y2, n.y + nh(n) / 2);
  });
  return { x: x1, y: y1, w: Math.max(1, x2 - x1), h: Math.max(1, y2 - y1) };
}
function fitView() {
  const b = contentBox(); if (!b) return;
  const r = stage.getBoundingClientRect();
  const s = clamp(Math.min((r.width - 120) / b.w, (r.height - 120) / b.h), .15, 1.6);
  S.scale = s;
  S.panX = (r.width - b.w * s) / 2 - b.x * s;
  S.panY = (r.height - b.h * s) / 2 - b.y * s;
  render();
}
function autoLayout(dir) {
  if (!S.nodes.length) return;
  const adj = {};
  S.links.forEach(l => { (adj[l.from] = adj[l.from] || []).push(l.to); (adj[l.to] = adj[l.to] || []).push(l.from); });
  let root = S.sel.size ? Array.from(S.sel)[0] : null;
  if (!root) {
    let best = null, bd = -1;
    S.nodes.forEach(n => { const d = (adj[n.id] || []).length; if (d > bd) { bd = d; best = n.id; } });
    root = best || S.nodes[0].id;
  }
  const level = {}, order = [root], q = [root];
  level[root] = 0;
  while (q.length) {
    const cur = q.shift();
    (adj[cur] || []).forEach(nb => { if (!(nb in level)) { level[nb] = level[cur] + 1; q.push(nb); order.push(nb); } });
  }
  let maxLv = 0;
  S.nodes.forEach(n => { if (level[n.id] == null) { level[n.id] = -1; } else maxLv = Math.max(maxLv, level[n.id]); });
  const groups = {};
  S.nodes.forEach(n => { const lv = level[n.id] < 0 ? maxLv + 2 : level[n.id]; (groups[lv] = groups[lv] || []).push(n); });
  const GX = 135, GY = 175;
  Object.keys(groups).map(Number).sort((a, b) => a - b).forEach(lv => {
    const arr = groups[lv];
    if (lv === 0) arr.sort((a, b) => a.name.localeCompare(b.name));
    arr.forEach((n, i) => {
      const off = (i - (arr.length - 1) / 2);
      if (dir === 'h') { n.x = snap(lv * GX * 1.15); n.y = snap(off * GY * .78); }
      else { n.x = snap(off * GX); n.y = snap(lv * GY); }
    });
  });
  pushHist(); render(); fitView();
  toast('已按层级重新排列');
}
function alignSel(mode) {
  const ns = S.nodes.filter(n => S.sel.has(n.id));
  if (ns.length < 2) return;
  if (mode === 'l') { const v = Math.min.apply(null, ns.map(n => n.x)); ns.forEach(n => n.x = v); }
  if (mode === 'r') { const v = Math.max.apply(null, ns.map(n => n.x)); ns.forEach(n => n.x = v); }
  if (mode === 't') { const v = Math.min.apply(null, ns.map(n => n.y)); ns.forEach(n => n.y = v); }
  if (mode === 'b') { const v = Math.max.apply(null, ns.map(n => n.y)); ns.forEach(n => n.y = v); }
  if (mode === 'ch' || mode === 'cv') {
    const xs = ns.map(n => n.x).sort((a, b) => a - b), ys = ns.map(n => n.y).sort((a, b) => a - b);
    if (mode === 'cv') ns.forEach(n => n.x = Math.round((xs[0] + xs[xs.length - 1]) / 2));
    else ns.forEach(n => n.y = Math.round((ys[0] + ys[ys.length - 1]) / 2));
  }
  if (mode === 'dh') { ns.sort((a, b) => a.x - b.x); const a = ns[0].x, b = ns[ns.length - 1].x; ns.forEach((n, i) => n.x = Math.round(a + (b - a) * i / (ns.length - 1))); }
  if (mode === 'dv') { ns.sort((a, b) => a.y - b.y); const a = ns[0].y, b = ns[ns.length - 1].y; ns.forEach((n, i) => n.y = Math.round(a + (b - a) * i / (ns.length - 1))); }
  pushHist(); render();
}

/* ---------------- 提示条 ---------------- */
let hintTimer = null;
function toast(msg) {
  const el = $('#hint'); el.textContent = msg; el.classList.add('show');
  clearTimeout(hintTimer); hintTimer = setTimeout(() => el.classList.remove('show'), 1900);
}

/* ---------------- 示例拓扑 ---------------- */
function demo() {
  const mk = (id, type, name, ip, x, y, extra) => Object.assign({
    id: id, type: type, name: name, ip: ip, x: x, y: y, status: 'online',
    model: (TYPE[type] || TYPE.pc).model, ports: (TYPE[type] || TYPE.pc).ports,
    mac: randMac(), latency: Math.floor(5 + Math.random() * 25), note: ''
  }, extra || {});
  S.nodes = [
    mk('n1', 'cloud', '互联网', '', 0, -330),
    mk('n2', 'onu', '光猫/ONU', '192.168.1.254', 0, -215),
    mk('n3', 'router', '主路由器', '192.168.1.1', 0, -105),
    mk('n4', 'core', '核心交换机', '192.168.1.2', 0, 10),
    mk('n5', 'sw', '办公接入交换机', '192.168.1.11', -290, 140),
    mk('n6', 'ap', '无线AP-办公区', '192.168.1.10', 210, 140),
    mk('n7', 'sw', '机房接入交换机', '192.168.1.12', 560, 140),
    mk('n8', 'camera', '前厅摄像头', '192.168.1.91', -530, 290),
    mk('n9', 'pc', '台式机电脑', '192.168.1.61', -400, 290),
    mk('n10', 'server', 'ERP主机', '192.168.1.7', -270, 290),
    mk('n11', 'printer', '打印机', '192.168.1.20', -140, 290),
    mk('n12', 'laptop', '笔记本-财务', '192.168.1.33', -10, 290),
    mk('n13', 'phone', '手机-张', '192.168.1.101', 120, 290),
    mk('n14', 'phone', '手机-李', '192.168.1.102', 240, 290),
    mk('n15', 'phone', '手机-王', '192.168.1.103', 360, 290),
    mk('n16', 'imac', '林苹果一体机', '192.168.1.55', 480, 290),
    mk('n17', 'pc', '王主机', '192.168.1.66', 610, 290),
    mk('n18', 'server', '文件服务器', '192.168.1.8', 740, 290),
    mk('n19', 'nas', 'NAS存储', '192.168.1.9', 870, 290)
  ];
  const L = (f, t) => ({ id: uid('l'), from: f, to: t, fp: 'auto', tp: 'auto', label: '', bandwidth: '' });
  S.links = [L('n1', 'n2'), L('n2', 'n3'), L('n3', 'n4'), L('n4', 'n5'), L('n4', 'n6'), L('n4', 'n7'),
  L('n5', 'n8'), L('n5', 'n9'), L('n5', 'n10'), L('n5', 'n11'), L('n5', 'n12'),
  L('n6', 'n13'), L('n6', 'n14'), L('n6', 'n15'),
  L('n7', 'n16'), L('n7', 'n17'), L('n7', 'n18'), L('n7', 'n19')];
  S.sel.clear(); S.selLink = null;
}

/* =================== 交互 =================== */
let drag = null, spaceDown = false, linkStart = null;

function nodeAt(x, y) {
  for (let i = S.nodes.length - 1; i >= 0; i--) {
    const n = S.nodes[i];
    if (Math.abs(n.x - x) <= nw(n) / 2 && Math.abs(n.y - y) <= nh(n) / 2) return n;
  }
  return null;
}
function drawGuides(n) {
  let g = '';
  S.nodes.forEach(o => {
    if (o === n || S.sel.has(o.id)) return;
    if (Math.abs(o.x - n.x) < 6) { n.x = o.x; g += `<line class="guide" x1="${o.x}" y1="${Math.min(o.y, n.y) - 400}" x2="${o.x}" y2="${Math.max(o.y, n.y) + 400}"/>`; }
    if (Math.abs(o.y - n.y) < 6) { n.y = o.y; g += `<line class="guide" x1="${Math.min(o.x, n.x) - 400}" y1="${o.y}" x2="${Math.max(o.x, n.x) + 400}" y2="${o.y}"/>`; }
  });
  LAYER_O.innerHTML = g;
}
function drawMarquee() {
  const x = Math.min(drag.x0, drag.x1), y = Math.min(drag.y0, drag.y1);
  const w = Math.abs(drag.x1 - drag.x0), h = Math.abs(drag.y1 - drag.y0);
  LAYER_O.innerHTML = `<rect class="marquee" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
}
function selectInBox(d) {
  const x1 = Math.min(d.x0, d.x1), x2 = Math.max(d.x0, d.x1), y1 = Math.min(d.y0, d.y1), y2 = Math.max(d.y0, d.y1);
  if (!d.add) S.sel.clear();
  S.nodes.forEach(n => {
    if (n.x + nw(n) / 2 >= x1 && n.x - nw(n) / 2 <= x2 && n.y + nh(n) / 2 >= y1 && n.y - nh(n) / 2 <= y2) S.sel.add(n.id);
  });
}
function drawTemp(d, w) {
  const a = anchor(N(d.from), d.fp);
  let p;
  if (S.linkStyle === 'curve') p = `M${a.x},${a.y} Q${(a.x + w.x) / 2},${a.y} ${w.x},${w.y}`;
  else if (S.linkStyle === 'line') p = `M${a.x},${a.y} L${w.x},${w.y}`;
  else { const mx = (a.x + w.x) / 2; p = `M${a.x},${a.y} L${mx},${a.y} L${mx},${w.y} L${w.x},${w.y}`; }
  LAYER_T.innerHTML = `<path class="temp-link" d="${p}"/>`;
}

svg.addEventListener('mousedown', function (e) {
  hideMenu();
  const port = e.target.closest ? e.target.closest('.port') : null;
  const nodeEl = e.target.closest ? e.target.closest('.node') : null;
  const linkEl = e.target.closest ? e.target.closest('.link') : null;
  const w = toWorld(e.clientX, e.clientY);

  if (e.button === 1 || (e.button === 0 && spaceDown)) {
    drag = { type: 'pan', sx: e.clientX, sy: e.clientY, px: S.panX, py: S.panY };
    svg.classList.add('panning'); e.preventDefault(); return;
  }
  if (e.button === 2) {
    if (nodeEl) { const id = nodeEl.dataset.id; if (!S.sel.has(id)) { S.sel.clear(); S.sel.add(id); render(); } showNodeMenu(e.clientX, e.clientY, id); }
    else if (linkEl) { S.selLink = linkEl.dataset.id; S.sel.clear(); render(); showLinkMenu(e.clientX, e.clientY, S.selLink); }
    else showCanvasMenu(e.clientX, e.clientY, w);
    return;
  }
  if (e.button !== 0) return;

  if (port && nodeEl) {
    drag = { type: 'link', from: nodeEl.dataset.id, fp: port.dataset.port };
    svg.classList.add('linking'); e.preventDefault(); return;
  }
  if (nodeEl) {
    const id = nodeEl.dataset.id;
    if (S.linkMode) {
      if (!linkStart) { linkStart = id; S.sel.clear(); S.sel.add(id); render(); toast('起点：' + N(id).name + '，请点击目标设备'); }
      else if (linkStart !== id) { addLink(linkStart, id); linkStart = null; }
      else { linkStart = null; render(); }
      return;
    }
    if (e.shiftKey) { S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); }
    else if (!S.sel.has(id)) { S.sel.clear(); S.sel.add(id); }
    S.selLink = null;
    const ids = Array.from(S.sel), orig = {};
    ids.forEach(i => { const n = N(i); orig[i] = { x: n.x, y: n.y }; });
    drag = { type: 'node', ids: ids, ox: w.x, oy: w.y, orig: orig };
    render();
    return;
  }
  if (linkEl) { S.selLink = linkEl.dataset.id; S.sel.clear(); render(); return; }

  if (!e.shiftKey && (S.sel.size || S.selLink)) { S.sel.clear(); S.selLink = null; render(); }
  if (S.linkMode && linkStart) { linkStart = null; }
  drag = { type: 'marquee', x0: w.x, y0: w.y, x1: w.x, y1: w.y, add: e.shiftKey };
});

document.addEventListener('mousemove', function (e) {
  if (!drag) return;
  const w = toWorld(e.clientX, e.clientY);
  if (drag.type === 'pan') { S.panX = drag.px + (e.clientX - drag.sx); S.panY = drag.py + (e.clientY - drag.sy); render(); }
  else if (drag.type === 'node') {
    const dx = w.x - drag.ox, dy = w.y - drag.oy;
    drag.ids.forEach(i => { const n = N(i), o = drag.orig[i]; n.x = snap(o.x + dx); n.y = snap(o.y + dy); });
    drawGuides(N(drag.ids[0]));
    render();
  }
  else if (drag.type === 'marquee') { drag.x1 = w.x; drag.y1 = w.y; drawMarquee(); }
  else if (drag.type === 'link') { drawTemp(drag, w); }
});

document.addEventListener('mouseup', function (e) {
  if (!drag) return;
  if (drag.type === 'node') { LAYER_O.innerHTML = ''; pushHist(); }
  else if (drag.type === 'marquee') {
    LAYER_O.innerHTML = '';
    if (Math.abs(drag.x1 - drag.x0) > 4 || Math.abs(drag.y1 - drag.y0) > 4) selectInBox(drag);
    render();
  } else if (drag.type === 'link') {
    LAYER_T.innerHTML = '';
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const target = el && el.closest ? el.closest('.node') : null;
    if (target && target.dataset.id !== drag.from) addLink(drag.from, target.dataset.id, drag.fp, 'auto');
    else render();
  }
  svg.classList.remove('panning', 'linking');
  drag = null;
});

svg.addEventListener('wheel', function (e) {
  e.preventDefault();
  const r = svg.getBoundingClientRect();
  zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
}, { passive: false });

svg.addEventListener('contextmenu', e => e.preventDefault());
svg.addEventListener('dblclick', function (e) {
  const nodeEl = e.target.closest ? e.target.closest('.node') : null;
  if (nodeEl) { const inp = $('[data-f="name"]'); if (inp) { inp.focus(); inp.select(); } }
});

/* ---------------- 从设备库拖入 ---------------- */
$('#libBody').addEventListener('dragstart', function (e) {
  const d = e.target.closest ? e.target.closest('.dev') : null;
  if (!d) return;
  e.dataTransfer.setData('text/plain', d.dataset.key);
  e.dataTransfer.effectAllowed = 'copy';
});
$('#libBody').addEventListener('dblclick', function (e) {
  const d = e.target.closest ? e.target.closest('.dev') : null;
  if (!d) return;
  const r = svg.getBoundingClientRect(), w = toWorld(r.left + r.width / 2, r.top + r.height / 2);
  addNode(d.dataset.key, w.x, w.y);
  toast('已添加：' + (TYPE[d.dataset.key] || {}).name);
});
$('#libBody').addEventListener('click', function (e) {
  const g = e.target.closest ? e.target.closest('.dev-edit') : null;
  if (g) { e.stopPropagation(); openCustomEditor(g.dataset.edit); return; }
  if (e.target.closest && e.target.closest('#libAdd')) openCustomEditor(null);
});
stage.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
stage.addEventListener('drop', function (e) {
  e.preventDefault();
  const key = e.dataTransfer.getData('text/plain');
  if (!TYPE[key]) return;
  const w = toWorld(e.clientX, e.clientY);
  const n = addNode(key, w.x, w.y);
  toast('已添加：' + n.name + '（' + (TYPE[key].name) + '）');
});

/* ---------------- 右键菜单 ---------------- */
let lastCtx = { x: 0, y: 0 };
function hideMenu() { $('#ctxmenu').classList.remove('show'); }
function showMenu(x, y, items) {
  const m = $('#ctxmenu');
  m.innerHTML = items.map(it => it.sep ? '<hr>' :
    `<button data-act="${it.act}"><span>${it.label}</span>${it.key ? '<span style="color:var(--muted);font-size:11px">' + it.key + '</span>' : ''}</button>`).join('');
  m.classList.add('show');
  const w = m.offsetWidth, h = m.offsetHeight;
  m.style.left = Math.min(x, innerWidth - w - 8) + 'px';
  m.style.top = Math.min(y, innerHeight - h - 8) + 'px';
}
function showNodeMenu(x, y, id) {
  showMenu(x, y, [
    { label: '重命名', act: 'focusName' },
    { label: '复制设备', act: 'copy', key: 'Ctrl+C' },
    { label: '断开所有链路', act: 'disconnect' },
    { label: '以此为中心自动布局', act: 'root' },
    { sep: 1 },
    { label: '设为在线', act: 'st:online' },
    { label: '设为告警', act: 'st:warn' },
    { label: '设为离线', act: 'st:offline' },
    { sep: 1 },
    { label: '删除设备', act: 'delete', key: 'Del' }
  ]);
}
function showLinkMenu(x, y, id) {
  showMenu(x, y, [
    { label: '编辑链路标签', act: 'focusLabel' },
    { sep: 1 },
    { label: '删除链路', act: 'deleteLink' }
  ]);
}
function showCanvasMenu(x, y, w) {
  lastCtx = w;
  const items = [{ label: '粘贴', act: 'paste', key: 'Ctrl+V' }];
  if (CLIP && CLIP.nodes.length) items.push({ label: '粘贴到此处', act: 'pasteHere' });
  items.push({ label: '全选', act: 'selectall', key: 'Ctrl+A' }, { sep: 1 },
    { label: '自动布局（纵向）', act: 'layoutV' },
    { label: '自动布局（横向）', act: 'layoutH' },
    { label: '适应画布', act: 'fit' },
    { sep: 1 },
    { label: '载入示例拓扑', act: 'demo' },
    { label: '清空画布', act: 'clear' });
  showMenu(x, y, items);
}
$('#ctxmenu').addEventListener('click', function (e) {
  const b = e.target.closest ? e.target.closest('button') : null;
  if (!b) return;
  const act = b.dataset.act;
  hideMenu();
  runAction(act);
});
document.addEventListener('mousedown', function (e) {
  if (!$('#ctxmenu').contains(e.target)) hideMenu();
});
function runAction(act) {
  const id = S.sel.size === 1 ? Array.from(S.sel)[0] : null;
  switch (act) {
    case 'focusName': { const i = $('[data-f="name"]'); if (i) { i.focus(); i.select(); } break; }
    case 'focusLabel': { const i = $('[data-f="label"]'); if (i) { i.focus(); i.select(); } break; }
    case 'copy': copySelection(); break;
    case 'paste': pasteClip(30, 30); break;
    case 'pasteHere':
      if (CLIP && CLIP.nodes.length) pasteClip(lastCtx.x - CLIP.nodes[0].x, lastCtx.y - CLIP.nodes[0].y);
      break;
    case 'disconnect': if (id) { disconnectNode(id); toast('已断开该设备的所有链路'); } break;
    case 'root': if (id) autoLayout('v'); break;
    case 'clearColor': setColor(''); break;
    case 'delete': deleteSelection(); break;
    case 'deleteLink': if (S.selLink) { S.links = S.links.filter(l => l.id !== S.selLink); S.selLink = null; pushHist(); render(); } break;
    case 'selectall': S.nodes.forEach(n => S.sel.add(n.id)); render(); break;
    case 'layoutV': autoLayout('v'); break;
    case 'layoutH': autoLayout('h'); break;
    case 'fit': fitView(); break;
    case 'demo': if (confirm('载入示例拓扑将覆盖当前画布，继续？')) { demo(); pushHist(); render(); fitView(); } break;
    case 'clear': if (confirm('确定清空画布？')) { S.nodes = []; S.links = []; S.sel.clear(); S.selLink = null; pushHist(); render(); } break;
    default: break;
  }
  if (act.indexOf('st:') === 0) {
    const st = act.slice(3);
    if (S.sel.size) { S.sel.forEach(i => { const n = N(i); if (n) { n.status = st; n.latency = st === 'offline' ? null : (st === 'warn' ? 120 : 12); } }); pushHist(); render(); }
  }
}

/* ---------------- 键盘 ---------------- */
function toggleLinkMode() {
  S.linkMode = !S.linkMode; linkStart = null;
  $('#btnLink').classList.toggle('active', S.linkMode);
  svg.classList.toggle('linking', S.linkMode);
  toast(S.linkMode ? '连线模式：依次点击两台设备建立链路（Esc 退出）' : '已退出连线模式');
}
function nudge(dx, dy) {
  if (!S.sel.size) return;
  S.sel.forEach(i => { const n = N(i); if (n) { n.x = snap(n.x + dx); n.y = snap(n.y + dy); } });
  pushHist(); render();
}
document.addEventListener('keydown', function (e) {
  const tag = (e.target.tagName || '').toUpperCase();
  const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
  if (e.code === 'Space' && !typing) { spaceDown = true; e.preventDefault(); }
  if (e.key === 'Escape') {
    if (typing) { e.target.blur(); return; }
    hideMenu();
    if (S.linkMode) toggleLinkMode();
    else { S.sel.clear(); S.selLink = null; render(); }
    return;
  }
  if (typing) return;
  const ctrl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (ctrl && k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (ctrl && k === 'y') { e.preventDefault(); redo(); return; }
  if (ctrl && k === 'c') { copySelection(); return; }
  if (ctrl && k === 'v') { pasteClip(30, 30); return; }
  if (ctrl && k === 'x') { copySelection(); deleteSelection(); return; }
  if (ctrl && k === 'd') { e.preventDefault(); copySelection(); pasteClip(30, 30); return; }
  if (ctrl && k === 'a') { e.preventDefault(); S.nodes.forEach(n => S.sel.add(n.id)); render(); return; }
  if (ctrl && k === 's') { e.preventDefault(); exportJSON(); return; }
  if (ctrl && e.key === '0') { e.preventDefault(); fitView(); return; }
  if (ctrl && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomCenter(1.15); return; }
  if (ctrl && e.key === '-') { e.preventDefault(); zoomCenter(1 / 1.15); return; }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelection(); return; }
  if (k === 'l' && !ctrl) { toggleLinkMode(); return; }
  if (e.key.indexOf('Arrow') === 0) {
    e.preventDefault();
    const s = e.shiftKey ? GRID * 5 : GRID;
    if (e.key === 'ArrowLeft') nudge(-s, 0); else if (e.key === 'ArrowRight') nudge(s, 0);
    else if (e.key === 'ArrowUp') nudge(0, -s); else if (e.key === 'ArrowDown') nudge(0, s);
  }
});
document.addEventListener('keyup', function (e) { if (e.code === 'Space') spaceDown = false; });
/* =================== 属性面板 =================== */
let inspSign = '', histTimer = null;
function debounceHist() { clearTimeout(histTimer); histTimer = setTimeout(pushHist, 450); }

function opt(v, cur, txt) { return `<option value="${v}"${v === cur ? ' selected' : ''}>${txt || v}</option>`; }
function typeOptions(cur) {
  return CATALOG.map(d => opt(d.key, cur, d.name)).join('')
    + (CUSTOM.length ? '<option disabled>── 自定义 ──</option>' + CUSTOM.map(d => opt(d.key, cur, d.name)).join('') : '');
}
function portOptions(cur) {
  return opt('auto', cur, '自动') + opt('top', cur, '上') + opt('right', cur, '右') + opt('bottom', cur, '下') + opt('left', cur, '左');
}
function fmtDate() { const d = new Date(); const p = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

function buildInspector() {
  const body = $('#inspBody'), title = $('#inspTitle');
  if (S.selLink) {
    const l = S.links.filter(x => x.id === S.selLink)[0];
    if (!l) { S.selLink = null; return buildInspector(); }
    const a = N(l.from), b = N(l.to);
    title.textContent = '链路属性';
    body.innerHTML = `
      <div class="field"><label>连接设备</label><input value="${esc(a ? a.name : '?')} ⇄ ${esc(b ? b.name : '?')}" readonly></div>
      <div class="grid2">
        <div class="field"><label>本端端口</label><select data-f="fp">${portOptions(l.fp)}</select></div>
        <div class="field"><label>对端端口</label><select data-f="tp">${portOptions(l.tp)}</select></div>
      </div>
      <div class="field"><label>链路标签（接口 / 描述）</label><input data-f="label" value="${esc(l.label)}" placeholder="如 GE0/0/1 — GE0/0/24"></div>
      <div class="field"><label>带宽</label><select data-f="bandwidth">
        ${opt('', l.bandwidth, '未标注')}${opt('100M', l.bandwidth, '100 Mbps')}${opt('1G', l.bandwidth, '1 Gbps')}
        ${opt('10G', l.bandwidth, '10 Gbps')}${opt('WiFi', l.bandwidth, '无线')}</select></div>
      <div class="sec-title">链路状态</div>
      <div class="stat-row"><span>当前状态</span><b id="iMeta">—</b></div>
      <div class="btn-row" style="margin-top:10px"><button class="btn danger" data-act="deleteLink">删除链路</button></div>`;
  } else if (S.sel.size > 1) {
    title.textContent = '已选中 ' + S.sel.size + ' 台设备';
    body.innerHTML = `
      <div class="sec-title">对齐</div>
      <div class="btn-row">
        <button class="btn" data-act="al:l">左对齐</button><button class="btn" data-act="al:ch">水平居中</button><button class="btn" data-act="al:r">右对齐</button>
        <button class="btn" data-act="al:t">顶对齐</button><button class="btn" data-act="al:cv">垂直居中</button><button class="btn" data-act="al:b">底对齐</button>
      </div>
      <div class="sec-title">分布</div>
      <div class="btn-row"><button class="btn" data-act="al:dh">水平等距</button><button class="btn" data-act="al:dv">垂直等距</button></div>
      <div class="sec-title">批量状态</div>
      <div class="btn-row">
        <button class="btn" data-act="st:online">在线</button><button class="btn" data-act="st:warn">告警</button>
        <button class="btn" data-act="st:offline">离线</button><button class="btn" data-act="st:unknown">未知</button>
      </div>
      <div class="sec-title">操作</div>
      <div class="btn-row"><button class="btn" data-act="copy">复制</button><button class="btn" data-act="root">自动布局</button><button class="btn danger" data-act="delete">删除</button></div>`;
  } else if (S.sel.size === 1) {
    const n = N(Array.from(S.sel)[0]);
    if (!n) { S.sel.clear(); return buildInspector(); }
    title.textContent = '设备属性';
    body.innerHTML = `
      <div class="field"><label>设备名称</label><input data-f="name" value="${esc(n.name)}"></div>
      <div class="field"><label>设备类型</label><select data-f="type">${typeOptions(n.type)}</select></div>
      <div class="grid2">
        <div class="field"><label>IP 地址</label><input data-f="ip" value="${esc(n.ip || '')}" placeholder="192.168.1.x"></div>
        <div class="field"><label>接口数</label><input data-f="ports" type="number" min="1" max="96" value="${esc(n.ports || 1)}"></div>
      </div>
      <div class="field"><label>MAC 地址</label><input data-f="mac" value="${esc(n.mac || '')}"></div>
      <div class="field"><label>型号 / 厂商</label><input data-f="model" value="${esc(n.model || '')}"></div>
      <div class="grid2">
        <div class="field"><label>运行状态</label><select data-f="status">
          ${opt('online', n.status, '在线')}${opt('warn', n.status, '告警')}${opt('offline', n.status, '离线')}${opt('unknown', n.status, '未知')}</select></div>
        <div class="field"><label>延迟 ms</label><input data-f="latency" type="number" min="0" value="${esc(n.latency == null ? '' : n.latency)}"></div>
      </div>
      <div class="field"><label>备注</label><textarea data-f="note" placeholder="位置、用途、责任人…">${esc(n.note || '')}</textarea></div>
      <div class="sec-title">外观（仅影响这一台）</div>
      <div class="field"><label>图标</label><select data-f="icon">
        <option value="">跟随设备类型</option>
        ${CATALOG.map(c => opt(c.key, n.icon || '', c.name + (c.key === n.type ? '（当前类型）' : ''))).join('')}
        ${CUSTOM.length ? '<option disabled>── 自定义 ──</option>' + CUSTOM.map(c => opt(c.key, n.icon || '', c.name)).join('') : ''}
      </select></div>
      <div class="grid2">
        <div class="field"><label>显示尺寸</label><select data-f="size">
          <option value="s"${n.size === 's' ? ' selected' : ''}>小</option>
          <option value=""${!n.size ? ' selected' : ''}>标准</option>
          <option value="l"${n.size === 'l' ? ' selected' : ''}>大</option></select></div>
        <div class="field"><label>强调色</label>
          <div class="row-inline"><input type="color" data-f="color" value="${esc(n.color || '#2563eb')}">
          <button class="mini" data-act="clearColor" style="height:30px">清除</button></div></div>
      </div>
      <div class="field"><label>快捷配色</label><div class="swatch" id="ncSw">${PALETTE.map(c =>
        `<button data-sw2="${c}" class="${(n.color || '') === c ? 'sel' : ''}" style="background:${c}" title="${c}"></button>`).join('')}</div></div>
      <label class="switch"><input type="checkbox" data-f="hideIP"${n.hideIP ? ' checked' : ''}><span class="track"></span><span>隐藏 IP 地址</span></label>
      <div class="sec-title">连接信息</div>
      <div id="iMeta"></div>
      <div class="btn-row" style="margin-top:10px">
        <button class="btn" data-act="copy">复制</button><button class="btn" data-act="disconnect">断链</button><button class="btn" data-act="root">以此布局</button>
      </div>
      <div class="btn-row"><button class="btn danger" data-act="delete">删除设备</button></div>`;
  } else {
    title.textContent = '画布设置';
    body.innerHTML = `
      <div class="field"><label>图纸标题（导出图片时显示在左上角）</label><input data-f="title" value="${esc(S.title)}"></div>
      <div class="sec-title">显示</div>
      <div class="field"><label>连线样式</label><select data-f="linkStyle">
        ${opt('elbow', S.linkStyle, '正交折线')}${opt('line', S.linkStyle, '直线')}${opt('curve', S.linkStyle, '平滑曲线')}</select></div>
      <label class="switch"><input type="checkbox" data-f="grid"${S.grid ? ' checked' : ''}><span class="track"></span><span>显示网格</span></label>
      <label class="switch"><input type="checkbox" data-f="snap"${S.snap ? ' checked' : ''}><span class="track"></span><span>对齐网格</span></label>
      <label class="switch"><input type="checkbox" data-f="showFlow"${S.showFlow ? ' checked' : ''}><span class="track"></span><span>链路流量动画</span></label>
      <label class="switch"><input type="checkbox" data-f="showLabels"${S.showLabels ? ' checked' : ''}><span class="track"></span><span>显示链路标签</span></label>
      <div class="sec-title">统计</div>
      <div id="iStats"></div>
      <div class="sec-title">操作提示</div>
      <div class="empty-tip">
        从左侧设备库<b>拖拽</b>设备到画布<br>
        悬停设备后拖出<b>蓝色圆点</b>连线<br>
        <kbd>L</kbd> 连线模式 · <kbd>Space</kbd>+拖动 平移<br>
        <kbd>Ctrl</kbd>+<kbd>C</kbd>/<kbd>V</kbd> 复制粘贴 · <kbd>Del</kbd> 删除<br>
        右键画布可载入示例或清空
      </div>`;
  }
  refreshInspector();
}
function refreshInspector() {
  const meta = $('#iMeta'), stats = $('#iStats');
  if (meta && S.selLink) {
    const l = S.links.filter(x => x.id === S.selLink)[0];
    if (l) { const m = { online: '正常', warn: '告警', offline: '中断', unknown: '未知' }; meta.textContent = m[linkStatus(l)] || '—'; }
  }
  if (meta && S.sel.size === 1) {
    const n = N(Array.from(S.sel)[0]);
    if (n) {
      const deg = S.links.filter(l => l.from === n.id || l.to === n.id).length;
      const nb = S.links.filter(l => l.from === n.id || l.to === n.id).map(l => {
        const o = N(l.from === n.id ? l.to : l.from); return o ? o.name : '?';
      });
      meta.innerHTML = `<div class="stat-row"><span>链路数</span><b>${deg}</b></div>
        <div class="stat-row"><span>延迟</span><b>${n.status === 'offline' ? '不可达' : (n.latency == null ? '—' : n.latency + ' ms')}</b></div>
        <div class="stat-row"><span>相邻设备</span><b style="max-width:150px;text-align:right">${esc(nb.join('、') || '—')}</b></div>`;
    }
  }
  if (stats) {
    let on = 0, wa = 0, off = 0, sum = 0, cnt = 0;
    S.nodes.forEach(n => {
      if (n.status === 'warn') wa++; else if (n.status === 'offline') off++; else if (n.status === 'online') on++;
      if (n.latency != null) { sum += n.latency; cnt++; }
    });
    stats.innerHTML = `<div class="stat-row"><span>设备总数</span><b>${S.nodes.length}</b></div>
      <div class="stat-row"><span>链路总数</span><b>${S.links.length}</b></div>
      <div class="stat-row"><span>在线 / 告警 / 离线</span><b>${on} / ${wa} / ${off}</b></div>
      <div class="stat-row"><span>平均延迟</span><b>${cnt ? Math.round(sum / cnt) + ' ms' : '—'}</b></div>`;
  }
}
function updateInspector() {
  const sign = S.selLink ? 'link:' + S.selLink
    : (S.sel.size === 1 ? 'node:' + Array.from(S.sel)[0]
      : (S.sel.size > 1 ? 'multi:' + S.sel.size : 'canvas'));
  if (sign !== inspSign) { inspSign = sign; buildInspector(); }
  else refreshInspector();
}
let propTimer = null;
function onField(e) {
  const t = e.target, f = t.dataset.f;
  if (!f) return;
  const v = t.type === 'checkbox' ? t.checked : t.value;
  if (f === 'title') { S.title = v; scheduleSave(); return; }
  if (['grid', 'snap', 'showFlow', 'showLabels', 'linkStyle'].indexOf(f) >= 0) { S[f] = v; render(); scheduleSave(); return; }
  if (S.selLink) {
    const l = S.links.filter(x => x.id === S.selLink)[0];
    if (l) { l[f] = v; render(); debounceHist(); }
    return;
  }
  if (S.sel.size === 1) {
    const n = N(Array.from(S.sel)[0]);
    if (!n) return;
    if (f === 'type') { n.type = v; const m = TYPE[v]; if (m) { n.model = m.model; n.ports = m.ports; } }
    else if (f === 'latency') n.latency = v === '' ? null : Number(v);
    else if (f === 'ports') n.ports = Number(v) || 1;
    else n[f] = v;
    clearTimeout(propTimer);
    render();
    debounceHist();
  }
}

/* =================== 导入导出 =================== */
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function fname(ext) { return (S.title || '网络拓扑图').replace(/[\\/:*?"<>|]/g, '') + '-' + fmtDate() + '.' + ext; }
function exportJSON() {
  const data = JSON.stringify(proj(), null, 2);
  download(new Blob([data], { type: 'application/json' }), fname('json'));
  toast('工程已导出为 JSON');
}
function importJSON(file) {
  const fr = new FileReader();
  fr.onload = function () {
    try {
      const o = JSON.parse(fr.result);
      if (!o || !Array.isArray(o.nodes)) throw new Error('bad');
      // 工程内自带的自定义设备类型：合并进来（同名同 key 保留本地版本）
      if (Array.isArray(o.customTypes) && o.customTypes.length) {
        const has = {}; CUSTOM.forEach(d => { has[d.key] = 1; });
        o.customTypes.forEach(d => { if (d && d.key && !has[d.key]) CUSTOM.push(d); });
        rebuildTypes(); saveCustom(); buildDefs(); renderLibrary();
      }
      S.nodes = o.nodes; S.links = Array.isArray(o.links) ? o.links : [];
      S.title = o.title || S.title; S.linkStyle = o.linkStyle || 'elbow';
      S.sel.clear(); S.selLink = null;
      pushHist(); render(); fitView();
      toast('已导入 ' + S.nodes.length + ' 台设备');
    } catch (err) { toast('导入失败：文件格式不正确'); }
  };
  fr.readAsText(file);
}
function buildExportSVG() {
  const b = contentBox();
  if (!b) { toast('画布为空，无法导出'); return null; }
  const m = 46, th = S.title ? 40 : 0;
  const w = Math.round(b.w + m * 2), h = Math.round(b.h + m * 2 + th);
  const fixVar = s => s.replace(/var\(--canvas-bg[^)]*\)/g, '#ffffff')
    .replace(/var\(--grid2[^)]*\)/g, '#d8e1ed').replace(/var\(--grid[^)]*\)/g, '#e6ecf4');
  const clone = svg.cloneNode(true);
  clone.setAttribute('width', w); clone.setAttribute('height', h);
  clone.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  clone.removeAttribute('id');
  clone.removeAttribute('style');
  const cvp = clone.querySelector('#viewport');
  cvp.setAttribute('transform', 'translate(' + (m - b.x) + ',' + (m - b.y + th) + ')');
  ['#layerOverlay', '#layerTemp'].forEach(s => { const e = clone.querySelector(s); if (e) e.innerHTML = ''; });
  const defs = clone.querySelector('#svgDefs');
  if (defs) defs.innerHTML = fixVar(defs.innerHTML);
  // 把 <use> 引用的图标 symbol 内联展开，保证在各类看图/办公软件中都能显示
  const symMap = {};
  $$('symbol', clone).forEach(s => { symMap['#' + s.getAttribute('id')] = s.innerHTML; });
  $$('use', clone).forEach(u => {
    const href = u.getAttribute('href') || u.getAttribute('xlink:href') || '';
    const key = href.charAt(0) === '#' ? href : '#' + href.replace(/^.*#/, '');
    const inner = symMap[key];
    if (inner == null) return;
    const g = document.createElementNS(SVGNS, 'g');
    const uw = parseFloat(u.getAttribute('width')), uh = parseFloat(u.getAttribute('height'));
    if ((uw && uw !== 48) || (uh && uh !== 48)) g.setAttribute('transform', 'scale(' + ((uw || 48) / 48) + ',' + ((uh || 48) / 48) + ')');
    g.innerHTML = inner;
    u.parentNode.replaceChild(g, u);
  });
  const st = document.createElementNS(SVGNS, 'style');
  st.textContent = fixVar($('#svgStyle').textContent) +
    '\n.sel-box{display:none!important}.port{display:none}';
  clone.insertBefore(st, clone.firstChild);
  const bg = document.createElementNS(SVGNS, 'rect');
  bg.setAttribute('x', 0); bg.setAttribute('y', 0); bg.setAttribute('width', w); bg.setAttribute('height', h);
  bg.setAttribute('fill', '#ffffff');
  clone.insertBefore(bg, cvp);
  if (S.title) {
    const F = 'font-family:"PingFang SC","Microsoft YaHei",Arial,sans-serif;';
    const t1 = document.createElementNS(SVGNS, 'text');
    t1.setAttribute('x', m); t1.setAttribute('y', 28);
    t1.setAttribute('style', F + 'font-size:17px;font-weight:700;fill:#0f172a');
    t1.textContent = S.title;
    const t2 = document.createElementNS(SVGNS, 'text');
    t2.setAttribute('x', w - m); t2.setAttribute('y', 28); t2.setAttribute('text-anchor', 'end');
    t2.setAttribute('style', F + 'font-size:11px;fill:#64748b');
    t2.textContent = fmtDate() + ' · 虎王星图轻量版';
    clone.insertBefore(t2, cvp.nextSibling);
    clone.insertBefore(t1, cvp.nextSibling);
  }
  return { svg: clone, w: w, h: h };
}
function serializeSVG(node) {
  let s = new XMLSerializer().serializeToString(node);
  if (!/^<svg[^>]+xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="' + SVGNS + '"');
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + s;
}
function exportSVG() {
  const r = buildExportSVG(); if (!r) return;
  const s = serializeSVG(r.svg);
  download(new Blob([s], { type: 'image/svg+xml' }), fname('svg'));
  toast('已导出 SVG 矢量图');
}
/* 把导出的 SVG 光栅化到 canvas（白底） */
function svgRasterize(r, scale) {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.onload = function () {
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(r.w * scale));
      c.height = Math.max(1, Math.round(r.h * scale));
      const x = c.getContext('2d');
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, c.width, c.height);
      x.drawImage(img, 0, 0, c.width, c.height);
      resolve(c);
    };
    img.onerror = function () { reject(new Error('SVG 渲染失败')); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serializeSVG(r.svg));
  });
}
function exportPNG() {
  const r = buildExportSVG(); if (!r) return;
  svgRasterize(r, 2).then(function (c) {
    c.toBlob(function (blob) { download(blob, fname('png')); toast('已导出 PNG（2 倍高清）'); });
  }).catch(function () { toast('导出失败，请改用 SVG 导出'); });
}

/* =================== 导出 PDF（纯前端生成，零依赖） =================== */
/* 用浏览器内置的 CompressionStream 做 zlib 压缩（deflate = zlib 格式，正是 PDF 需要的） */
function zlibCompress(u8) {
  if (typeof CompressionStream === 'undefined' || typeof Response === 'undefined') return Promise.resolve(null);
  try {
    const st = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate'));
    return new Response(st).arrayBuffer().then(b => new Uint8Array(b)).catch(() => null);
  } catch (e) { return Promise.resolve(null); }
}
function d64ToBytes(u) {
  const bin = atob(u.slice(u.indexOf(',') + 1));
  const a = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
const pnum = v => (Math.round(v * 100) / 100).toString();
/* 组装一个单页、整页嵌入图像的 PDF 文件 */
function buildPDF(o) {
  const parts = []; const off = []; let len = 0;
  function put(x) { const b = (typeof x === 'string') ? new TextEncoder().encode(x) : x; parts.push(b); len += b.length; }
  function obj(i, body) { off[i] = len; put(i + ' 0 obj\n' + body + '\nendobj\n'); }
  function streamObj(i, dict, data) {
    off[i] = len;
    put(i + ' 0 obj\n' + dict + ' /Length ' + data.length + ' >>\nstream\n');
    put(data); put('\nendstream\nendobj\n');
  }
  put('%PDF-1.4\n');
  put(Uint8Array.from([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));   // 二进制文件标记
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pnum(o.pageW) + ' ' + pnum(o.pageH) +
    '] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
  streamObj(4, '<<', new TextEncoder().encode(
    'q ' + pnum(o.dw) + ' 0 0 ' + pnum(o.dh) + ' ' + pnum(o.x) + ' ' + pnum(o.y) + ' cm /Im0 Do Q'));
  streamObj(5, '<< /Type /XObject /Subtype /Image /Width ' + o.iw + ' /Height ' + o.ih +
    ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /' + o.filter, o.bytes);
  const xref = len;
  put('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) { let s = String(off[i]); while (s.length < 10) s = '0' + s; put(s + ' 00000 n \n'); }
  put('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
  let total = 0; parts.forEach(p => { total += p.length; });
  const out = new Uint8Array(total); let k = 0;
  parts.forEach(p => { out.set(p, k); k += p.length; });
  return out;
}
const A4W = 595.28, A4H = 841.89;
function pdfPageInfo(r, paper) {
  const fitW = r.w * 0.75, fitH = r.h * 0.75;            // 96dpi 的 CSS 像素 → PDF 点(pt)
  if (paper === 'a4') {
    const land = fitW > fitH;
    const pageW = land ? A4H : A4W, pageH = land ? A4W : A4H;
    const m = 28, s = Math.min((pageW - m * 2) / fitW, (pageH - m * 2) / fitH);
    const dw = fitW * s, dh = fitH * s;
    return { pageW: pageW, pageH: pageH, dw: dw, dh: dh, x: (pageW - dw) / 2, y: (pageH - dh) / 2, land: land };
  }
  return { pageW: fitW, pageH: fitH, dw: fitW, dh: fitH, x: 0, y: 0, land: fitW > fitH };
}
function refreshPdfInfo() {
  const r = buildExportSVG(); const el = $('#pdfInfo');
  if (!el) return;
  if (!r) { el.innerHTML = '画布为空，无法导出。'; return; }
  const p = pdfPageInfo(r, $('#pdfPaper').value);
  const sc = parseFloat($('#pdfDpi').value) || 2;
  const mm = v => Math.round(v / 72 * 25.4);
  const dpi = Math.round(r.w * sc / (p.dw / 72));
  el.innerHTML = '页面：<b>' + mm(p.pageW) + ' × ' + mm(p.pageH) + ' mm</b>（' + (p.land ? '横向' : '纵向') +
    '）· 图像：<b>' + Math.round(r.w * sc) + ' × ' + Math.round(r.h * sc) + ' px</b>（约 ' + dpi + ' dpi）';
}
function exportPDF(paper, scale) {
  const r = buildExportSVG(); if (!r) return;
  const pg = pdfPageInfo(r, paper);
  toast('正在生成 PDF…');
  let chain;
  if (r.w * scale > 16000 || r.h * scale > 16000) {
    chain = Promise.reject(new Error('图像尺寸超出浏览器上限，请降低清晰度'));
  } else {
    chain = svgRasterize(r, scale);
  }
  chain.then(function (c) {
    const iw = c.width, ih = c.height;
    let bytes = null, filter = '';
    // 小图走无损 RGB + FlateDecode；超大图退回高质量 JPEG，避免内存溢出
    if (iw * ih <= 40e6) {
      const d = c.getContext('2d').getImageData(0, 0, iw, ih).data;
      const rgb = new Uint8Array(iw * ih * 3);
      for (let i = 0, j = 0; i < d.length; i += 4) { rgb[j++] = d[i]; rgb[j++] = d[i + 1]; rgb[j++] = d[i + 2]; }
      return zlibCompress(rgb).then(function (z) {
        if (z) { bytes = z; filter = 'FlateDecode'; }
        else { bytes = d64ToBytes(c.toDataURL('image/jpeg', 0.95)); filter = 'DCTDecode'; }
        return { iw: iw, ih: ih, bytes: bytes, filter: filter };
      });
    }
    bytes = d64ToBytes(c.toDataURL('image/jpeg', 0.94)); filter = 'DCTDecode';
    return { iw: iw, ih: ih, bytes: bytes, filter: filter };
  }).then(function (im) {
    const pdf = buildPDF({
      pageW: pg.pageW, pageH: pg.pageH, x: pg.x, y: pg.y, dw: pg.dw, dh: pg.dh,
      iw: im.iw, ih: im.ih, bytes: im.bytes, filter: im.filter
    });
    download(new Blob([pdf], { type: 'application/pdf' }), fname('pdf'));
    toast('已导出 PDF · ' + Math.round(pdf.length / 1024) + ' KB · ' +
      (im.filter === 'FlateDecode' ? '无损' : '高质量'));
  }).catch(function (e) {
    toast('PDF 导出失败：' + (e && e.message ? e.message : '请改用 PNG / SVG 导出'));
  });
}

/* =================== 实时监控 =================== */
let monTimer = null;
function tick() {
  if (!S.nodes.length) return;
  const k = Math.max(1, Math.round(S.nodes.length * 0.07));
  for (let i = 0; i < k; i++) {
    const n = S.nodes[Math.floor(Math.random() * S.nodes.length)], r = Math.random();
    if (n.status === 'offline') { if (r < .35) n.status = 'online'; }
    else n.status = r < .05 ? 'offline' : (r < .16 ? 'warn' : 'online');
    n.latency = n.status === 'offline' ? null : (n.status === 'warn' ? Math.floor(90 + Math.random() * 260) : Math.floor(3 + Math.random() * 30));
  }
  S.nodes.forEach(n => {
    if (n.status === 'online') n.latency = Math.max(1, (n.latency || 10) + Math.round((Math.random() - .5) * 8));
    else if (n.status === 'warn') n.latency = Math.max(40, (n.latency || 120) + Math.round((Math.random() - .5) * 40));
  });
  render();
}
function setMonitor(on) {
  S.monitor = on;
  clearInterval(monTimer);
  if (on) { monTimer = setInterval(tick, 2500); toast('实时监控已开启（模拟状态与延迟变化）'); }
  else toast('实时监控已停止');
}

/* =================== 自定义设备：管理 + 编辑器 =================== */
const PALETTE = ['#2563eb', '#0891b2', '#16a34a', '#ca8a04', '#ea580c', '#dc2626', '#9333ea', '#db2777', '#475569'];
let cuDraft = null;   // 正在编辑的自定义设备草稿

function sanitizeSVG(text, prefix) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl || doc.querySelector('parsererror')) throw new Error('不是有效的 SVG 文件');
  $$('script,foreignObject,animate,set', svgEl).forEach(e => e.remove());
  const map = {};
  $$('[id]', svgEl).forEach(e => { const o = e.getAttribute('id'); map[o] = prefix + o; e.setAttribute('id', prefix + o); });
  const fixAttr = e => {
    ['href', 'xlink:href'].forEach(a => {
      const v = e.getAttribute(a);
      if (v && v.charAt(0) === '#' && map[v.slice(1)]) e.setAttribute(a, '#' + map[v.slice(1)]);
    });
    ['fill', 'stroke', 'mask', 'filter', 'clip-path'].forEach(a => {
      const v = e.getAttribute(a);
      if (v && /url\(#/.test(v)) e.setAttribute(a, v.replace(/url\(#([^)]+)\)/g, (m, i) => map[i] ? 'url(#' + map[i] + ')' : m));
    });
    const st = e.getAttribute('style');
    if (st && /url\(#/.test(st)) e.setAttribute('style', st.replace(/url\(#([^)]+)\)/g, (m, i) => map[i] ? 'url(#' + map[i] + ')' : m));
  };
  fixAttr(svgEl); $$('*', svgEl).forEach(fixAttr);
  $$('*', svgEl).forEach(e => {
    Array.prototype.slice.call(e.attributes).forEach(a => {
      if (a.name.indexOf('on') === 0) e.removeAttribute(a.name);
      if (/^javascript:/i.test(a.value)) e.removeAttribute(a.name);
    });
  });
  let vb = svgEl.getAttribute('viewBox');
  if (!vb) {
    const w = parseFloat(svgEl.getAttribute('width')) || 48, h = parseFloat(svgEl.getAttribute('height')) || 48;
    vb = '0 0 ' + w + ' ' + h;
  }
  return { content: svgEl.innerHTML.trim(), vb: vb };
}

function cuPreview(d, big) {
  if (!d) return '<div class="cu-prev empty">无图标</div>';
  const kind = d.iconKind || 'builtin';
  let inner = '';
  if (kind === 'emoji') inner = customIconSVG(d);
  else if (kind === 'svg' && d.svg) inner = d.svg;
  else inner = ICONS[d.icon] || ICONS.pc;
  const vb = kind === 'svg' ? (d.vb || '0 0 48 48') : '0 0 48 48';
  const cls = big ? 'cu-prev' : 'pv';
  return `<div class="${cls}"><svg viewBox="${vb}">${inner}</svg></div>`;
}

/* --------- 管理列表 --------- */
function openCustomManager() {
  $('#cuTitle').textContent = '自定义设备';
  const list = CUSTOM.length ? '<div class="cu-list">' + CUSTOM.map(d =>
    `<div class="cu-item">${cuPreview(d)}
      <div class="nm"><b>${esc(d.name)}</b><span>${esc(d.cat)} · ${d.ports || 1} 口 · ${esc(d.model || '—')}</span></div>
      <button class="mini" data-cu="edit:${d.key}">编辑</button>
      <button class="mini" data-cu="dup:${d.key}">复制</button>
      <button class="mini del" data-cu="del:${d.key}">删除</button>
    </div>`).join('') + '</div>'
    : '<div class="cu-empty">还没有自定义设备<br>点击「＋ 新建自定义设备」创建你的第一种设备类型</div>';
  $('#cuBody').innerHTML = `
    <p class="small">自定义设备会出现在左侧设备库，可像内置设备一样拖入画布、连线、设置 IP 与状态，并随工程一起导出。</p>
    <div style="height:12px"></div>${list}`;
  $('#cuFoot').innerHTML = `<button class="btn" data-cu="close">关闭</button><button class="btn primary" data-cu="new">＋ 新建自定义设备</button>`;
  $('#cuModal').classList.add('show');
}

/* --------- 编辑表单 --------- */
function openCustomEditor(key) {
  const src = key ? CUSTOM.filter(d => d.key === key)[0] : null;
  cuDraft = src ? JSON.parse(JSON.stringify(src))
    : { key: 'cu_' + uid(''), name: '', cat: '自定义设备', model: '', ports: 1, color: '#2563eb', iconKind: 'builtin', icon: 'sw', svg: '', vb: '', emoji: '' };
  $('#cuTitle').textContent = src ? '编辑自定义设备' : '新建自定义设备';
  renderCuForm();
  $('#cuModal').classList.add('show');
}
function renderCuForm() {
  const d = cuDraft, kind = d.iconKind || 'builtin';
  const catList = allCats().map(c => `<option value="${esc(c)}"></option>`).join('');
  const iconBtns = CATALOG.map(c =>
    `<button data-ic="${c.key}" class="${kind === 'builtin' && d.icon === c.key ? 'sel' : ''}" title="${esc(c.name)}">
      <svg viewBox="0 0 48 48">${ICONS[c.key]}</svg></button>`).join('');
  const sw = PALETTE.map(c => `<button data-sw="${c}" class="${(d.color || '') === c ? 'sel' : ''}" style="background:${c}" title="${c}"></button>`).join('');
  let pane = '';
  if (kind === 'builtin') {
    pane = `<div class="small">从内置图标中挑选一个作为外观基础：</div><div class="icongrid">${iconBtns}</div>`;
  } else if (kind === 'emoji') {
    pane = `<div class="field"><label>表情 / 文字</label>
        <div class="row-inline">
          <input type="text" id="cuEmoji" value="${esc(d.emoji || '🖥️')}" placeholder="输入表情或 1-2 个汉字" style="max-width:130px;font-size:16px">
          <button class="mini" data-cu="emojiClr">清空</button>
        </div></div>
      <div class="field"><label>图标底色</label><div class="row-inline"><input type="color" id="cuPick" value="${d.color || '#2563eb'}"><div class="swatch">${sw}</div></div></div>
      <p class="small">提示：Windows 用 <kbd>Win</kbd>+<kbd>.</kbd>、macOS 用 <kbd>Ctrl</kbd>+<kbd>Cmd</kbd>+<kbd>空格</kbd> 可呼出表情面板。</p>`;
  } else {
    pane = `<div class="field"><label>上传 SVG 图标文件</label>
        <input type="file" id="cuFile" accept=".svg,image/svg+xml"></div>
      ${d.svg ? '<div class="small" style="color:var(--ok)">已载入 SVG 图标（viewBox ' + esc(d.vb || '0 0 48 48') + '），可重新上传替换</div>'
        : '<div class="small">建议使用单色或扁平风格的图标，尺寸不限，系统会自动缩放到 48×48 显示。</div>'}
      <div class="warnbox">上传的 SVG 会移除脚本与外链，仅保留图形内容。</div>`;
  }
  $('#cuBody').innerHTML = `
    <div class="crow">
      ${cuPreview(d, true)}
      <div style="flex:1">
        <div class="field"><label>设备名称 *</label><input type="text" id="cuName" value="${esc(d.name)}" placeholder="如：门禁控制器 / 视频矩阵"></div>
        <div class="field"><label>所属分类</label>
          <input type="text" id="cuCat" list="cuCats" value="${esc(d.cat || '')}" placeholder="可输入新分类名">
          <datalist id="cuCats">${catList}</datalist></div>
      </div>
    </div>
    <div class="crow">
      <div class="field"><label>默认型号 / 厂商</label><input type="text" id="cuModel" value="${esc(d.model || '')}" placeholder="选填"></div>
      <div class="field"><label>默认接口数</label><input type="number" id="cuPorts" min="1" max="96" value="${d.ports || 1}"></div>
    </div>
    <div class="sec-title">图标</div>
    <div class="tabs">
      <button data-tab="builtin" class="${kind === 'builtin' ? 'active' : ''}">内置图标</button>
      <button data-tab="emoji" class="${kind === 'emoji' ? 'active' : ''}">表情 / 文字</button>
      <button data-tab="svg" class="${kind === 'svg' ? 'active' : ''}">上传 SVG</button>
    </div>
    <div class="pane active">${pane}</div>`;
  $('#cuFoot').innerHTML = `<button class="btn" data-cu="cancel">取消</button><button class="btn primary" data-cu="save">保存</button>`;
}
function cuReadForm() {
  const d = cuDraft, v = id => { const e = $(id); return e ? e.value : ''; };
  d.name = v('#cuName').trim();
  d.cat = v('#cuCat').trim() || '自定义设备';
  d.model = v('#cuModel').trim();
  d.ports = Math.max(1, Math.min(96, parseInt(v('#cuPorts'), 10) || 1));
  if (d.iconKind === 'emoji') {
    d.emoji = v('#cuEmoji').trim() || '📦';
    const p = $('#cuPick'); if (p) d.color = p.value;
  }
  return d;
}
function cuSave() {
  const d = cuReadForm();
  if (!d.name) { toast('请填写设备名称'); const e = $('#cuName'); if (e) e.focus(); return; }
  if (d.iconKind === 'emoji') d.icon = d.emoji;
  if (d.iconKind === 'svg' && !d.svg) { d.iconKind = 'builtin'; d.icon = d.icon || 'sw'; }
  const i = CUSTOM.findIndex(x => x.key === d.key);
  if (i >= 0) CUSTOM[i] = d; else CUSTOM.push(d);
  rebuildTypes(); saveCustom(); buildDefs(); renderLibrary(); render();
  $('#cuModal').classList.remove('show');
  toast((i >= 0 ? '已更新自定义设备：' : '已创建自定义设备：') + d.name);
}
function cuDelete(key) {
  const d = CUSTOM.filter(x => x.key === key)[0]; if (!d) return;
  const used = S.nodes.filter(n => n.type === key).length;
  if (!confirm('删除自定义设备「' + d.name + '」？' + (used ? '\n画布上有 ' + used + ' 台该类型设备，将自动回退为「台式电脑」外观。' : ''))) return;
  CUSTOM = CUSTOM.filter(x => x.key !== key);
  S.nodes.forEach(n => { if (n.type === key) { n.type = 'pc'; n.icon = ''; } if (n.icon === key) n.icon = ''; });
  rebuildTypes(); saveCustom(); buildDefs(); renderLibrary(); pushHist(); render();
  toast('已删除：' + d.name);
}
function cuDup(key) {
  const d = CUSTOM.filter(x => x.key === key)[0]; if (!d) return;
  const c = JSON.parse(JSON.stringify(d));
  c.key = 'cu_' + uid(''); c.name = d.name + ' 副本';
  CUSTOM.push(c);
  rebuildTypes(); saveCustom(); buildDefs(); renderLibrary();
  toast('已复制为：' + c.name);
  openCustomManager();
}
function bindCustomUI() {
  const m = $('#cuModal');
  m.addEventListener('click', function (e) {
    if (e.target === this) { this.classList.remove('show'); return; }
    const tab = e.target.closest ? e.target.closest('[data-tab]') : null;
    if (tab) { cuReadForm(); cuDraft.iconKind = tab.dataset.tab; renderCuForm(); return; }
    const ic = e.target.closest ? e.target.closest('[data-ic]') : null;
    if (ic) { cuDraft.icon = ic.dataset.ic; renderCuForm(); return; }
    const sw = e.target.closest ? e.target.closest('[data-sw]') : null;
    if (sw) { cuDraft.color = sw.dataset.sw; renderCuForm(); return; }
    const b = e.target.closest ? e.target.closest('[data-cu]') : null;
    if (!b) return;
    const a = b.dataset.cu;
    if (a === 'close' || a === 'cancel') { this.classList.remove('show'); return; }
    if (a === 'new') { openCustomEditor(null); return; }
    if (a === 'save') { cuSave(); return; }
    if (a === 'emojiClr') { cuDraft.emoji = ''; renderCuForm(); return; }
    if (a.indexOf('edit:') === 0) { openCustomEditor(a.slice(5)); return; }
    if (a.indexOf('dup:') === 0) { cuDup(a.slice(4)); return; }
    if (a.indexOf('del:') === 0) { cuDelete(a.slice(4)); return; }
  });
  m.addEventListener('input', function (e) {
    if (e.target.id === 'cuName' || e.target.id === 'cuEmoji') {
      cuReadForm();
      if (e.target.id === 'cuName') { /* 仅更新草稿，预览不重绘以免丢焦点 */ }
      else { const p = m.querySelector('.cu-prev'); if (p) p.outerHTML = cuPreview(cuDraft, true); }
    }
    if (e.target.id === 'cuPick') { cuDraft.color = e.target.value; const p = m.querySelector('.cu-prev'); if (p) p.outerHTML = cuPreview(cuDraft, true); }
  });
  m.addEventListener('change', function (e) {
    if (e.target.id === 'cuFile' && e.target.files[0]) {
      const f = e.target.files[0];
      const fr = new FileReader();
      fr.onload = function () {
        try {
          const r = sanitizeSVG(fr.result, 'cu' + uid('') + '_');
          cuDraft.svg = r.content; cuDraft.vb = r.vb; cuDraft.iconKind = 'svg';
          renderCuForm(); toast('SVG 图标已载入');
        } catch (err) { toast('SVG 解析失败：' + (err.message || '文件格式有误')); }
      };
      fr.readAsText(f);
    }
  });
  $('#cuClose').onclick = () => m.classList.remove('show');
}

/* =================== 工具栏绑定与启动 =================== */

function bindUI() {
  $('#inspBody').addEventListener('input', onField);
  $('#inspBody').addEventListener('change', onField);
  $('#inspBody').addEventListener('click', function (e) {
    const sw2 = e.target.closest ? e.target.closest('[data-sw2]') : null;
    if (sw2) { setColor(sw2.dataset.sw2); return; }
    const b = e.target.closest ? e.target.closest('button[data-act]') : null;
    if (!b) return;
    const a = b.dataset.act;
    if (a.indexOf('al:') === 0) alignSel(a.slice(3));
    else runAction(a);
  });
  $('#libSearch').addEventListener('input', renderLibrary);

  $('#btnNew').onclick = function () {
    if (S.nodes.length && !confirm('新建将清空当前画布，继续？')) return;
    S.nodes = []; S.links = []; S.sel.clear(); S.selLink = null;
    pushHist(); render(); toast('空白画布已就绪，从左侧拖入设备开始绘制');
  };
  $('#btnImport').onclick = () => $('#fileInput').click();
  $('#fileInput').onchange = function (e) { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ''; };
  $('#btnSave').onclick = exportJSON;
  $('#btnUndo').onclick = undo;
  $('#btnRedo').onclick = redo;
  $('#btnLink').onclick = toggleLinkMode;
  $('#btnCustom').onclick = openCustomManager;
  bindCustomUI();
  $('#btnLayout').onclick = () => autoLayout('v');
  $('#btnFit').onclick = fitView;
  $('#btnExportPNG').onclick = exportPNG;
  $('#btnExportSVG').onclick = exportSVG;
  $('#btnExportPDF').onclick = function () { refreshPdfInfo(); $('#pdfModal').classList.add('show'); };
  $('#pdfClose').onclick = $('#pdfCancel').onclick = () => $('#pdfModal').classList.remove('show');
  $('#pdfModal').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });
  $('#pdfPaper').addEventListener('change', refreshPdfInfo);
  $('#pdfDpi').addEventListener('change', refreshPdfInfo);
  $('#pdfGo').onclick = function () {
    const paper = $('#pdfPaper').value, sc = parseFloat($('#pdfDpi').value) || 2;
    $('#pdfModal').classList.remove('show');
    exportPDF(paper, sc);
  };
  $('#swMonitor').onchange = function (e) { setMonitor(e.target.checked); };
  $('#zoomIn').onclick = () => zoomCenter(1.15);
  $('#zoomOut').onclick = () => zoomCenter(1 / 1.15);
  $('#btnTheme').onclick = function () {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', dark ? '' : 'dark');
    try { localStorage.setItem('nettopo.theme', dark ? 'light' : 'dark'); } catch (e) { }
  };
  $('#btnHelp').onclick = () => $('#helpModal').classList.add('show');
  $('#helpClose').onclick = () => $('#helpModal').classList.remove('show');
  $('#helpModal').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('show'); });
  window.addEventListener('resize', function () { render(); });
}

function init() {
  loadCustom();          // 先恢复自定义设备类型，再生成图标 symbol
  buildDefs();
  renderLibrary();
  let loaded = false;
  try {
    const saved = localStorage.getItem(LSKEY);
    if (saved) {
      const o = JSON.parse(saved);
      if (o && Array.isArray(o.nodes) && o.nodes.length) {
        S.nodes = o.nodes; S.links = Array.isArray(o.links) ? o.links : [];
        S.title = o.title || S.title; S.linkStyle = o.linkStyle || 'elbow';
        loaded = true;
      }
    }
    const th = localStorage.getItem('nettopo.theme');
    if (th === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) { }
  if (!loaded) demo();
  bindUI();
  HIST = []; HI = -1; pushHist();
  fitView();
  if (!loaded) setTimeout(() => toast('已载入示例拓扑，可右键画布 → 清空后自行绘制'), 500);
}

init();
})();
