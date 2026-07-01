/* ============================================
   湖南大学土木工程学院教师信息库 - 全局脚本
   ============================================ */

const App = {
  data: null, teachers: [], metadata: {}, departments: [], allResearchInterests: [],
  filters: { departments: [], titles: [], research: [], search: "" },
};

const SITE_RETURN_KEY = "hnuTeacherReturnState";
const COLLAB_SEARCH_HISTORY_KEY = "hnuCollabSearchHistory";



const DEPT_ORDER = ["建筑工程系", "桥梁工程系", "水工程与科学系", "建筑环境与能源应用工程系", "岩土与地下工程系", "建造管理与防灾工程系", "道路与交通工程系", "智能建造系", "建筑材料研究中心", "土木工程学院"];
const TITLE_ORDER = ["教授", "副教授", "助理教授", "研究员", "高级工程师", "工程师"];
const DEPT_ICONS = {
  "建筑工程系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21V9l8-6 8 6v12"/><path d="M9 15v4h6v-4"/><rect x="10" y="11" width="4" height="4" rx="0.5"/><path d="M7 5h2M15 5h2"/></svg>`,
  "桥梁工程系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 12h20"/><path d="M6 12v-3a3 3 0 013-3h6a3 3 0 013 3v3"/><path d="M6 12v5M18 12v5"/></svg>`,
  "水工程与科学系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2c-3 4-8 7-8 12a8 8 0 0016 0c0-5-5-8-8-12z"/><path d="M12 14a2 2 0 100-4 2 2 0 000 4z"/></svg>`,
  "建筑环境与能源应用工程系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  "岩土与地下工程系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3 21l9-15 9 15"/><path d="M6 15h12"/><path d="M8 18h8"/><path d="M10 21h4"/></svg>`,
  "建造管理与防灾工程系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/><path d="M9 12l2 2 4-4"/></svg>`,
  "道路与交通工程系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/><path d="M6 12h12"/></svg>`,
  "智能建造系": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1" fill="currentColor"/><circle cx="6" cy="18" r="1" fill="currentColor"/></svg>`,
  "建筑材料研究中心": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="8" y="14" width="8" height="7" rx="1"/></svg>`,
  "default": `<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M4 21V7l8-6 8 6v12"/></svg>`
};

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

function safeExternalUrl(value, fallback = "#") {
  const url = String(value || "").trim();
  if (!url || url === "http://" || url === "https://") return fallback;
  try {
    const parsed = new URL(url, window.location.href);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : fallback;
  } catch (e) {
    return fallback;
  }
}

function teacherDetailUrlByName(name) {
  var teacher = (App.teachers || []).find(function(item) { return item && item.name === name; });
  if (teacher && teacher.id) return "detail.html?id=" + encodeURIComponent(teacher.id);
  return "scholar.html?name=" + encodeURIComponent(name || "");
}

function getCurrentRelativeUrl() {
  return window.location.pathname.split("/").pop() + window.location.search + window.location.hash;
}

function isBackForwardNavigation() {
  var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
  return entries && entries[0] && entries[0].type === "back_forward";
}

function rememberReturnState(extra) {
  try {
    var state = Object.assign({ url: getCurrentRelativeUrl(), savedAt: Date.now() }, extra || {});
    sessionStorage.setItem(SITE_RETURN_KEY, JSON.stringify(state));
  } catch (e) {}
}

function readReturnState() {
  try {
    return JSON.parse(sessionStorage.getItem(SITE_RETURN_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function readCollabSearchHistory() {
  try {
    var saved = JSON.parse(localStorage.getItem(COLLAB_SEARCH_HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(Boolean).slice(0, 8) : [];
  } catch (e) {
    return [];
  }
}

function saveCollabSearchHistory(name) {
  var value = String(name || "").trim();
  if (!value) return;
  try {
    var history = readCollabSearchHistory().filter(function(item) { return item !== value; });
    history.unshift(value);
    localStorage.setItem(COLLAB_SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  } catch (e) {}
}

function goBackOrFallback(fallback) {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  window.location.href = fallback || "index.html";
}

function collaborationPairUrl(source, target) {
  return "collaboration.html?source=" + encodeURIComponent(source || "") + "&target=" + encodeURIComponent(target || "");
}

function collaborationNetworkUrl(name) {
  return "index.html?collabTeacher=" + encodeURIComponent(name || "") + "#collaboration";
}

function renderTeacherNameLink(name, className) {
  return '<a href="' + teacherDetailUrlByName(name) + '" data-preserve-return="1"' + (className ? ' class="' + className + '"' : '') + '>' + escapeHTML(name) + '</a>';
}

async function loadData() {
  if (App.data) return App.data;
  if (window.__TEACHERS_DATA__) {
    App.data = window.__TEACHERS_DATA__;
    App.teachers = App.data.teachers || [];
    App.metadata = App.data.metadata || {};
    initAppData();
    return App.data;
  }
  try {
    const resp = await fetch('data/teachers.json?v=' + Date.now(), { cache: 'no-store' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    App.data = await resp.json();
    App.teachers = App.data.teachers || [];
    App.metadata = App.data.metadata || {};
    initAppData();
    return App.data;
  } catch (e) { console.error('数据加载失败:', e); return null; }
}

function initAppData() {
  const deptSet = new Set(App.teachers.map(t => t.department));
  App.departments = [...deptSet].sort(function(a,b) { var ai = DEPT_ORDER.indexOf(a), bi = DEPT_ORDER.indexOf(b); if (ai < 0) ai = 99; if (bi < 0) bi = 99; return ai - bi; });
  const interestSet = new Set();
  App.teachers.forEach(t => { (t.research_interests || []).forEach(ri => interestSet.add(ri)); });
  App.allResearchInterests = [...interestSet].sort();
}

// ===== 头像渲染（优先级：本地 > 远程 > SVG占位）=====
function getTeacherAvatar(t, size) {
  var url = t.avatar_local ? 'data/' + t.avatar_local.replace(/^data\//, '') : (t.avatar || '');
  if (url) {
    var fallback = generateAvatar(t.name, size);
    return '<img src="' + escapeHTML(url) + '" alt="' + escapeHTML(t.name) + '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.onerror=null;this.src=\'' + fallback + '\';">';
  }
  return '<img src="' + generateAvatar(t.name, size) + '" alt="' + escapeHTML(t.name) + '" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
}

var _avatarCounter = 0;
function generateAvatar(name, size = 64) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  var hue = Math.abs(hash % 360);
  var bg1 = 'hsl(' + hue + ', 22%, 68%)';
  var bg2 = 'hsl(' + (hue + 20) + ', 25%, 58%)';
  var iconC = 'hsl(' + hue + ', 28%, 42%)';
  var half = size / 2;
  var hR = size * 0.14;
  var bW = size * 0.26;
  var gid = 'g' + (Math.random() * 1e6 | 0);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';
  svg += '<defs><linearGradient id="' + gid + '" x1="0%" y1="0%" x2="100%" y2="100%">';
  svg += '<stop offset="0%" stop-color="' + bg1 + '"/><stop offset="100%" stop-color="' + bg2 + '"/>';
  svg += '</linearGradient></defs>';
  svg += '<circle cx="' + half + '" cy="' + half + '" r="' + half + '" fill="url(#' + gid + ')"/>';
  // person: head circle
  svg += '<circle cx="' + half + '" cy="' + (half - hR * 1.2) + '" r="' + hR + '" fill="' + iconC + '" opacity="0.5"/>';
  // person: body arc
  svg += '<path d="M' + (half - bW) + ' ' + (half + bW * 0.9) + ' Q' + half + ' ' + (half - hR * 2) + ' ' + (half + bW) + ' ' + (half + bW * 0.9) + '" fill="' + iconC + '" opacity="0.35"/>';
  svg += '</svg>';
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function searchTeachers(query) {
  if (!query || !query.trim()) return App.teachers;
  const q = query.trim().toLowerCase();
  return App.teachers.filter(t => {
    const fields = [t.name, t.department, t.title, t.intro, ...(t.research_interests || []), ...(t.research_projects || []), ...(t.publications || []), ...(t.awards || []), t.position || "", t.email || ""];
    return fields.some(f => f && f.toLowerCase().includes(q));
  });
}

  // ===== 搜索建议专用（姓名匹配优先，避免无关结果）=====
  function searchTeachersForSuggestions(query) {
    if (!query || !query.trim()) return [];
    var q = query.trim().toLowerCase();
    var scored = App.teachers.map(function(t) {
      var score = 0, name = (t.name || "").toLowerCase();
      if (name === q) score += 500;
      if (name.indexOf(q) === 0) score += 300;
      if (name.indexOf(q) >= 0) score += 200;
      var ris = (t.research_interests || []);
      for (var i = 0; i < ris.length; i++) { if (ris[i].toLowerCase().indexOf(q) >= 0) { score += 60; break; } }
      if ((t.department || "").toLowerCase().indexOf(q) >= 0) score += 30;
      if ((t.intro || "").toLowerCase().indexOf(q) >= 0) score += 15;
      return { teacher: t, score: score };
    });
    return scored.filter(function(s) { return s.score > 0; }).sort(function(a,b) { return b.score - a.score; }).map(function(s) { return s.teacher; });
  }

function attachHomeSuggestions(searchInput) {
  if (!searchInput || searchInput.dataset.suggestionsReady === "1") return;
  var box = document.getElementById("home-suggestions");
  if (!box) return;
  searchInput.dataset.suggestionsReady = "1";

  searchInput.addEventListener("input", debounce(function() {
    var q = searchInput.value.trim();
    if (!q || q.length < 1) { box.classList.remove("show"); return; }
    var matches = searchTeachersForSuggestions(q).slice(0, 8);
    if (matches.length === 0) { box.classList.remove("show"); return; }
    box.innerHTML = matches.map(function(t) {
      var av = getTeacherAvatar(t, 32);
      return '<div class="suggestion-item" data-id="' + escapeHTML(t.id) + '"><div class="sug-avatar">' + av + '</div><div class="sug-info"><div class="sug-name">' + escapeHTML(t.name) + '</div><div class="sug-detail">' + escapeHTML(t.title) + ' / ' + escapeHTML(t.department) + '</div></div></div>';
    }).join("");
    box.classList.add("show");
    box.querySelectorAll(".suggestion-item").forEach(function(item) {
      item.addEventListener("mousedown", function(e) {
        e.preventDefault();
        rememberReturnState({ type: "page" });
        window.location.href = "detail.html?id=" + encodeURIComponent(this.getAttribute("data-id"));
      });
    });
  }, 150));

  searchInput.addEventListener("compositionend", function() {
    searchInput.dispatchEvent(new Event("input"));
  });

  searchInput.addEventListener("blur", function() {
    setTimeout(function() { box.classList.remove("show"); }, 200);
  });

  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !box.contains(e.target)) {
      box.classList.remove("show");
    }
  });
}

function filterTeachers(teachers) {
  let result = teachers;
  if (App.filters.departments.length > 0) result = result.filter(t => App.filters.departments.includes(t.department));
  if (App.filters.titles.length > 0) result = result.filter(t => App.filters.titles.includes(t.title));
  if (App.filters.research.length > 0) result = result.filter(t => { const interests = t.research_interests || []; return App.filters.research.some(r => interests.includes(r)); });
  return result;
}

function getFilteredTeachers() { const s = searchTeachers(App.filters.search); return filterTeachers(s); }

function computeStats() {
  const titles = App.teachers.map(t => t.title);
  const profCount = titles.filter(t => t === "教授").length;
  const assocCount = titles.filter(t => t === "副教授").length;
  const interests = new Set();
  App.teachers.forEach(t => (t.research_interests || []).forEach(i => interests.add(i)));
  let pubCount = 0;
  App.teachers.forEach(t => { pubCount += (t.publications || []).length; });
  return { teacherCount: App.teachers.length, deptCount: App.departments.length, profCount, assocCount, interestCount: interests.size, pubCount };
}

// ===== 导航 =====
function initNavbar() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar-menu a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) a.classList.add("active");
  });
  const toggle = document.querySelector(".navbar-toggle");
  const menu = document.querySelector(".navbar-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", () => menu.classList.toggle("open"));
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
  }
}

// ===== 首页 =====
async function renderHome() {
  await loadData();
  if (!App.data) { document.getElementById("app").innerHTML = '<p style="text-align:center;padding:64px;">数据加载失败</p>'; return; }
  const stats = computeStats();
  const app = document.getElementById("app");
  if (!app) return;

  document.getElementById("stat-teachers").textContent = stats.teacherCount;
  document.getElementById("stat-depts").textContent = stats.deptCount;
  document.getElementById("stat-profs").textContent = stats.profCount;
  document.getElementById("stat-assoc").textContent = stats.assocCount;
  document.getElementById("stat-interests").textContent = stats.interestCount;
  document.getElementById("stat-pubs").textContent = stats.pubCount;

  const searchInput = document.getElementById("home-search");
  const searchBtn = document.getElementById("home-search-btn");
  const doSearch = () => { const q = searchInput.value.trim(); window.location.href = q ? "list.html?search=" + encodeURIComponent(q) : "list.html"; };
  if (searchBtn) searchBtn.addEventListener("click", doSearch);
  if (searchInput) searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
  attachHomeSuggestions(searchInput);

  renderDeptCards();
  renderResearchTags();
  renderCollaborationNetwork();
}

function renderDeptCards() {
  const grid = document.getElementById("dept-grid");
  if (!grid) return;
  const deptTeachers = {};
  App.teachers.forEach(t => {
    if (!deptTeachers[t.department]) deptTeachers[t.department] = { count: 0 };
    deptTeachers[t.department].count++;
  });
  grid.innerHTML = App.departments.map(dept => {
    const info = deptTeachers[dept] || { count: 0 };
    const icon = DEPT_ICONS[dept] || DEPT_ICONS["default"];
    return '<div class="card dept-card"><div class="dept-icon">' + icon + '</div><h3>' + escapeHTML(dept) + '</h3><div class="dept-count">' + info.count + ' 位教师</div><a href="list.html?dept=' + encodeURIComponent(dept) + '" class="btn btn-outline btn-sm">查看教师 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="vertical-align:-2px"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a></div>';
  }).join("");
}

function renderResearchTags() {
  const area = document.getElementById("research-tags-area");
  if (!area) return;
  const interestCount = {};
  App.teachers.forEach(t => { (t.research_interests || []).forEach(i => { interestCount[i] = (interestCount[i] || 0) + 1; }); });
  const topInterests = Object.entries(interestCount).sort((a, b) => b[1] - a[1]).slice(0, 16);
  area.innerHTML = topInterests.map(([name, count]) => '<button class="research-tag-btn" onclick="window.location.href=\'list.html?research=' + encodeURIComponent(name) + '\'" title="' + count + '位教师">' + name + "</button>").join("");
}

// ===== 教师列表页 =====
function normalizeCollabText(value) {
  return String(value || "").replace(/[\s\u00a0\u3000]/g, "").toLowerCase();
}

function getCollabPairKey(a, b) {
  return [a, b].sort().join("::");
}

const COLLAB_SURNAME_PINYIN = [
  "ouyang", "sima", "shangguan", "zhuge", "dongfang", "ximen",
  "chen", "deng", "fang", "feng", "gong", "guo", "huang", "jiang", "kang",
  "kong", "liang", "liao", "liu", "long", "luo", "meng", "peng", "qi", "qin",
  "shi", "song", "su", "sun", "tan", "tang", "tian", "wang", "wei", "wen",
  "wu", "xiang", "xiao", "xie", "xu", "xue", "yang", "yao", "yi", "yin",
  "yuan", "zhang", "zhao", "zheng", "zhou", "zhu", "zou", "ai", "bi", "bu",
  "cao", "cui", "du", "fan", "fu", "gao", "he", "hu", "hua", "jia", "jin",
  "lai", "lan", "le", "lei", "li", "lin", "lv", "ma", "niu", "pan", "rao",
  "ren", "shen", "sheng", "tao", "wan", "xiong", "yan", "yu"
].sort(function(a, b) { return b.length - a.length; });

function getTeacherSlug(t) {
  var page = String(t && t.personal_page || "");
  var slug = page.split("/").filter(Boolean).pop() || "";
  return slug.toLowerCase().replace(/[^a-z]/g, "");
}

function splitPinyinSlug(slug) {
  for (var i = 0; i < COLLAB_SURNAME_PINYIN.length; i++) {
    var surname = COLLAB_SURNAME_PINYIN[i];
    if (slug.indexOf(surname) === 0 && slug.length > surname.length) {
      return { surname: surname, given: slug.slice(surname.length) };
    }
  }
  return null;
}

function splitGivenPinyin(given) {
  if (!given) return [];
  if (given.length <= 4) return [given];
  var syllables = ["ang", "eng", "ing", "ong", "ai", "an", "ao", "ei", "en", "er", "ia", "ie", "in", "iu", "ou", "ua", "ui", "un", "uo"];
  for (var i = 0; i < syllables.length; i++) {
    var idx = given.indexOf(syllables[i]);
    var cut = idx + syllables[i].length;
    if (idx >= 0 && cut > 1 && cut < given.length) return [given.slice(0, cut), given.slice(cut)];
  }
  var half = Math.ceil(given.length / 2);
  return [given.slice(0, half), given.slice(half)];
}

function getTeacherNameAliases(t) {
  var aliases = new Set();
  if (t && t.name) aliases.add(t.name);
  var slug = getTeacherSlug(t);
  if (slug) aliases.add(slug);
  var parts = splitPinyinSlug(slug);
  if (parts) {
    var givenParts = splitGivenPinyin(parts.given).filter(Boolean);
    var givenSpaced = givenParts.join(" ");
    aliases.add(parts.surname + parts.given);
    aliases.add(parts.given + parts.surname);
    aliases.add(parts.surname + " " + parts.given);
    aliases.add(parts.given + " " + parts.surname);
    if (givenSpaced) {
      aliases.add(parts.surname + " " + givenSpaced);
      aliases.add(givenSpaced + " " + parts.surname);
    }
  }
  return Array.from(aliases).filter(function(alias) {
    var normalized = normalizeCollabText(alias);
    var asciiOnly = /^[a-z]+$/.test(normalized);
    return asciiOnly ? normalized.length >= 5 : normalized.length >= 2;
  });
}

function collectTeacherPublicationTexts(t) {
  var items = [];
  function add(value) {
    var text = String(value || "").trim();
    if (text.length >= 12 && /(?:19|20)\d{2}|[,，.;；]/.test(text)) items.push(text);
  }
  (t.publications || []).forEach(add);
  (t.profile_sections || []).forEach(function(section) {
    var title = String(section && section.title || "");
    if (/论文|成果|著作|专利|publication|paper|article|journal/i.test(title)) {
      (section.items || []).forEach(add);
    }
  });
  var inAcademicBlock = false;
  (t.profile_flow || []).forEach(function(block) {
    if (!block) return;
    if (block.type === "heading") {
      var heading = String(block.text || "");
      inAcademicBlock = /论文|成果|著作|专利|publication|paper|article|journal/i.test(heading);
      return;
    }
    if (inAcademicBlock && block.text) add(block.text);
  });
  return Array.from(new Set(items));
}

function parseCollabPaper(raw) {
  var text = String(raw || "").replace(/\s+/g, " ").trim();
  var yearMatches = text.match(/(?:19|20)\d{2}/g) || [];
  var year = yearMatches.length ? yearMatches[yearMatches.length - 1] : "";
  var yearParenMatch = text.match(/^(.+?)\s*\(((?:19|20)\d{2})\)\.\s*(.+)$/);
  if (yearParenMatch) {
    var afterYear = yearParenMatch[3].trim();
    var afterYearParts = afterYear.split(/\s*,\s*/).map(function(part) { return part.trim(); }).filter(Boolean);
    return {
      raw: text,
      title: afterYearParts[0] || afterYear,
      year: yearParenMatch[2],
      venue: afterYearParts[1] || "",
      authors: yearParenMatch[1].trim()
    };
  }
  var sentenceParts = text.split(/[.。]/).map(function(part) { return part.trim(); }).filter(Boolean);
  if (sentenceParts.length >= 3 && /[,，、]/.test(sentenceParts[0])) {
    return {
      raw: text,
      title: sentenceParts[1],
      year: year,
      venue: sentenceParts[2].replace(/[,，]?(?:19|20)\d{2}.*/, "").trim(),
      authors: sentenceParts[0]
    };
  }
  var parts = text.split(/[，,；;。]/).map(function(part) { return part.trim(); }).filter(Boolean);
  var title = "";
  var venue = "";
  var authors = parts.length ? parts[0] : "";
  for (var i = 1; i < parts.length; i++) {
    var part = parts[i];
    if (!title && part.length >= 8 && !/(?:19|20)\d{2}/.test(part)) {
      title = part;
      continue;
    }
    if (title && !venue && part.length >= 2 && !/^\d+(\.\d+)?$/.test(part)) {
      venue = part.replace(/(?:19|20)\d{2}.*/, "").trim();
      if (venue) break;
    }
  }
  if (!title && parts.length > 1) title = parts[1];
  if (!title) title = text.length > 90 ? text.slice(0, 90) + "..." : text;
  return { raw: text, title: title, year: year, venue: venue, authors: authors };
}

function getTeacherPaperCount(t) {
  return collectTeacherPublicationTexts(t).length;
}

function buildCollaborationData() {
  if (App.collaboration) return App.collaboration;
  var teacherByName = new Map();
  var aliasIndex = [];
  App.teachers.forEach(function(t) {
    if (!t || !t.name) return;
    teacherByName.set(t.name, t);
    getTeacherNameAliases(t).forEach(function(alias) {
      aliasIndex.push({ name: t.name, alias: alias, normalized: normalizeCollabText(alias), teacher: t });
    });
  });
  var nodeMap = new Map();
  var edgeMap = new Map();
  App.teachers.forEach(function(t) {
    nodeMap.set(t.name, {
      id: t.name,
      name: t.name,
      teacherId: t.id,
      department: t.department || "",
      title: t.title || "",
      researchFields: t.research_interests || [],
      paperCount: getTeacherPaperCount(t),
      cooperationCount: 0,
      collaboratorCount: 0
    });
  });
  App.teachers.forEach(function(owner) {
    collectTeacherPublicationTexts(owner).forEach(function(raw) {
      var text = String(raw || "").trim();
      if (text.length < 12) return;
      var normalizedPaper = normalizeCollabText(text);
      var matched = aliasIndex.filter(function(item) {
        return item.normalized.length >= 2 && normalizedPaper.indexOf(item.normalized) >= 0;
      }).map(function(item) { return item.name; });
      matched = Array.from(new Set(matched));
      if (matched.length < 2) return;
      var paper = parseCollabPaper(text);
      var paperKey = normalizeCollabText(paper.title || text).slice(0, 160);
      for (var i = 0; i < matched.length; i++) {
        for (var j = i + 1; j < matched.length; j++) {
          var source = matched[i];
          var target = matched[j];
          var key = getCollabPairKey(source, target);
          if (!edgeMap.has(key)) {
            edgeMap.set(key, { source: source, target: target, count: 0, papers: [], paperKeys: new Set() });
          }
          var edge = edgeMap.get(key);
          if (edge.paperKeys.has(paperKey)) continue;
          edge.paperKeys.add(paperKey);
          edge.count += 1;
          edge.papers.push(paper);
        }
      }
    });
  });
  var collaboratorSets = new Map();
  nodeMap.forEach(function(node) { collaboratorSets.set(node.name, new Set()); });
  var edges = Array.from(edgeMap.values()).map(function(edge) {
    delete edge.paperKeys;
    edge.papers.sort(function(a, b) { return Number(b.year || 0) - Number(a.year || 0); });
    var sourceNode = nodeMap.get(edge.source);
    var targetNode = nodeMap.get(edge.target);
    if (sourceNode) sourceNode.cooperationCount += edge.count;
    if (targetNode) targetNode.cooperationCount += edge.count;
    if (collaboratorSets.has(edge.source)) collaboratorSets.get(edge.source).add(edge.target);
    if (collaboratorSets.has(edge.target)) collaboratorSets.get(edge.target).add(edge.source);
    return edge;
  }).sort(function(a, b) { return b.count - a.count; });
  collaboratorSets.forEach(function(set, name) {
    var node = nodeMap.get(name);
    if (node) node.collaboratorCount = set.size;
  });
  App.collaboration = {
    nodes: Array.from(nodeMap.values()),
    edges: edges,
    nodeMap: nodeMap,
    edgeMap: new Map(edges.map(function(edge) { return [getCollabPairKey(edge.source, edge.target), edge]; })),
    teacherByName: teacherByName
  };
  return App.collaboration;
}

function getRecentPaperTitle(edge) {
  var paper = edge && edge.papers && edge.papers[0];
  return paper && paper.title ? paper.title : "";
}

function extractPaperDOI(paper) {
  var text = String((paper && (paper.raw || paper.title)) || "");
  var match = text.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return match ? match[0].replace(/[),.;\]]+$/, "") : "";
}

function isEnglishPaper(paper) {
  var title = String((paper && paper.title) || "");
  var venue = String((paper && paper.venue) || "");
  var ascii = title.replace(/[^\x00-\x7F]/g, "").length;
  return /[A-Za-z]{4,}/.test(title + " " + venue) && (!title || ascii / Math.max(title.length, 1) > 0.65);
}

function renderPaperSearchLinks(paper) {
  if (!paper || !paper.title) return "";
  var links = [
    '<a class="cnki-link" href="https://kns.cnki.net/kns8s/defaultresult/index?kw=' + encodeURIComponent(paper.title) + '" target="_blank" rel="noopener">知网检索</a>'
  ];
  var doi = extractPaperDOI(paper);
  if (doi) {
    links.push('<a class="cnki-link external-paper-link" href="https://doi.org/' + encodeURIComponent(doi).replace(/%2F/g, "/") + '" target="_blank" rel="noopener">DOI</a>');
  } else if (isEnglishPaper(paper)) {
    links.push('<a class="cnki-link external-paper-link" href="https://www.semanticscholar.org/search?q=' + encodeURIComponent(paper.title) + '" target="_blank" rel="noopener">外文检索</a>');
  }
  return " " + links.join(" ");
}

function isLikelyPaperText(text) {
  var value = String(text || "").trim();
  if (value.length < 12) return false;
  if (/^(基本信息|教育背景|工作履历|学术兼职|研究领域|科研项目|奖励|招生|分类浏览|帮助中心)$/i.test(value)) return false;
  if (/代表性|更新|通讯作者|本人指导|主要论文|论文目录|成果列表/.test(value) && value.length < 120) return false;
  return /(?:19|20)\d{2}|doi\.org|10\.\d{4,9}\/|\[J\]|\[C\]/i.test(value) &&
    /[,，.;；:：]/.test(value);
}

function renderPaperTextWithLinks(text) {
  var raw = String(text || "");
  if (!isLikelyPaperText(raw)) return escapeHTML(raw);
  var paper = parseCollabPaper(raw);
  return escapeHTML(raw) + renderPaperSearchLinks(paper);
}

function renderCollabPaperList(papers, heading) {
  var box = document.getElementById("collab-paper-list");
  if (!box) return;
  var clean = (papers || []).filter(Boolean);
  if (!clean.length) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML =
    '<div class="collab-block"><h3>' + escapeHTML(heading || "合作论文") + '</h3>' +
    '<div class="collab-paper-items">' + clean.slice(0, 12).map(function(paper) {
      var meta = [];
      if (paper.year) meta.push('<span>' + escapeHTML(paper.year) + '</span>');
      if (paper.venue) meta.push('<span>' + escapeHTML(paper.venue) + '</span>');
      return '<article class="collab-paper">' +
        '<h4>' + escapeHTML(paper.title || paper.raw || "论文题名暂缺") + renderPaperSearchLinks(paper) + '</h4>' +
        (meta.length ? '<div class="collab-paper-meta">' + meta.join("") + '</div>' : '') +
        (paper.authors ? '<div class="collab-paper-authors">作者：' + escapeHTML(paper.authors) + '</div>' : '') +
        '</article>';
    }).join("") + '</div></div>';
}

function getTeacherCollabEdges(name) {
  var data = buildCollaborationData();
  return data.edges.filter(function(edge) { return edge.source === name || edge.target === name; })
    .sort(function(a, b) { return b.count - a.count; });
}

function getCommonResearchFields(a, b) {
  var left = (a && a.researchFields) || [];
  var right = (b && b.researchFields) || [];
  var rightKeys = new Set(right.map(function(item) { return normalizeCollabText(item); }).filter(Boolean));
  return left.filter(function(item) { return rightKeys.has(normalizeCollabText(item)); }).slice(0, 4);
}

function getTitlePriority(title) {
  var text = String(title || "");
  if (/院士|杰出|长江|国家级|教授/.test(text)) return 3;
  if (/副教授|研究员|高级/.test(text)) return 2;
  if (/讲师|助理/.test(text)) return 1;
  return 0;
}

function getAcademicPathRecommendations(name) {
  var data = buildCollaborationData();
  var center = data.nodeMap.get(name);
  if (!center) return [];
  return getTeacherCollabEdges(name).map(function(edge) {
    var otherName = edge.source === name ? edge.target : edge.source;
    var other = data.nodeMap.get(otherName);
    var commonFields = getCommonResearchFields(center, other);
    var sameDept = other && center.department && other.department === center.department;
    var score = edge.count * 100 + (edge.papers || []).length * 10 + commonFields.length * 6 + (sameDept ? 4 : 0) + getTitlePriority(other && other.title);
    return {
      edge: edge,
      other: other,
      otherName: otherName,
      commonFields: commonFields,
      sameDept: sameDept,
      score: score
    };
  }).sort(function(a, b) { return b.score - a.score; });
}

function renderAcademicPathCards(name, recommendations) {
  if (!recommendations.length) {
    return '<div class="collab-block academic-path-block"><h3>学术联系路径</h3>' +
      '<p class="collab-block-note">基于论文共同署名关系，展示可能的合作联系线索。</p>' +
      '<div class="collab-empty-state">暂无可识别的学术联系路径，可尝试从研究方向、系所或教师主页信息进一步查找联系线索。</div></div>';
  }
  return '<div class="collab-block academic-path-block"><h3>学术联系路径</h3>' +
    '<p class="collab-block-note">基于论文共同署名关系，展示可能的合作联系线索。</p>' +
    '<div class="academic-path-list">' + recommendations.slice(0, 5).map(function(item) {
      var other = item.other || {};
      var fields = item.commonFields.length ? item.commonFields.join("、") : (item.sameDept ? "同一系所" : "共同署名论文");
      var note = item.commonFields.length
        ? "两位教师在" + fields + "方向有共同署名成果，可作为学术联系线索参考。"
        : "两位教师存在共同署名论文，可结合论文主题进一步判断合作线索。";
      return '<article class="academic-path-card" data-source="' + escapeHTML(item.edge.source) + '" data-target="' + escapeHTML(item.edge.target) + '" data-other="' + escapeHTML(item.otherName) + '">' +
        '<div class="academic-path-head"><strong>' + escapeHTML(item.otherName) + '</strong><span>' + escapeHTML(other.title || "职称暂缺") + '</span></div>' +
        '<p class="academic-path-dept">' + escapeHTML(other.department || "系所暂缺") + '</p>' +
        '<div class="academic-path-stats"><span>合作次数：' + item.edge.count + '次</span><span>共同论文：' + ((item.edge.papers || []).length) + '篇</span></div>' +
        '<p class="academic-path-fields">关联方向：' + escapeHTML(fields) + '</p>' +
        '<p class="academic-path-note">' + escapeHTML(note) + '</p>' +
        '<div class="academic-path-actions">' +
        '<button type="button" class="path-paper-btn" data-action="papers">查看共同论文</button>' +
        '<a href="' + teacherDetailUrlByName(item.otherName) + '">查看该教师主页</a>' +
        '<button type="button" class="path-paper-btn" data-action="evidence">展开合作依据</button>' +
        '</div>' +
        '<div class="academic-path-evidence" hidden>' + (item.edge.papers || []).slice(0, 3).map(function(paper) {
          return '<p>' + escapeHTML(paper.title || paper.raw || "论文题名暂缺") + '</p>';
        }).join("") + '</div>' +
        '</article>';
    }).join("") + '</div></div>';
}

function renderCollabOverview() {
  var data = buildCollaborationData();
  var info = document.getElementById("collab-info");
  if (!info) return;
  var activeTeacherCount = data.nodes.filter(function(node) { return node.collaboratorCount > 0; }).length;
  var totalCount = data.edges.reduce(function(sum, edge) { return sum + edge.count; }, 0);
  var highFreqCount = data.edges.filter(function(edge) { return edge.count >= 2; }).length;
  var topEdges = data.edges.slice(0, 10);
  var visibleTopEdges = topEdges.slice(0, 3);
  var hiddenTopEdges = topEdges.slice(3);
  function renderTopEdge(edge) {
    return '<article class="collab-pair" data-source="' + escapeHTML(edge.source) + '" data-target="' + escapeHTML(edge.target) + '">' +
      '<div class="collab-pair-title"><span><a class="teacher-inline-link" href="' + collaborationPairUrl(edge.source, edge.target) + '">' + escapeHTML(edge.source) + '</a> - <a class="teacher-inline-link" href="' + collaborationPairUrl(edge.source, edge.target) + '">' + escapeHTML(edge.target) + '</a></span><span class="collab-count-badge">合作 ' + edge.count + ' 次</span></div>' +
      (getRecentPaperTitle(edge) ? '<div class="collab-paper-title">' + escapeHTML(getRecentPaperTitle(edge)) + '</div>' : '') +
      '</article>';
  }
  info.innerHTML =
    '<div class="collab-metrics">' +
    '<div class="collab-metric"><strong>' + activeTeacherCount + '</strong><span>参与论文合作的教师数量</span></div>' +
    '<div class="collab-metric"><strong>' + data.edges.length + '</strong><span>教师合作关系总数</span></div>' +
    '<div class="collab-metric"><strong>' + totalCount + '</strong><span>论文合作总次数</span></div>' +
    '<div class="collab-metric"><strong>' + highFreqCount + '</strong><span>高频合作组合数量</span></div>' +
    '</div>' +
    '<div class="collab-block collab-top-block"><div class="collab-block-header"><h3>高频合作 Top 10</h3><button type="button" class="collab-toggle-btn" id="collab-top-toggle">展开后 7 位</button></div><div class="collab-pair-list">' +
    visibleTopEdges.map(renderTopEdge).join("") +
    '</div><div class="collab-pair-list collab-pair-list-extra" id="collab-top-list" hidden>' +
    hiddenTopEdges.map(renderTopEdge).join("") + '</div></div>';
  var topToggle = document.getElementById("collab-top-toggle");
  var topList = document.getElementById("collab-top-list");
  if (topToggle && topList) {
    topToggle.addEventListener("click", function() {
      var willShow = topList.hidden;
      topList.hidden = !willShow;
      topToggle.textContent = willShow ? "收起后 7 位" : "展开后 7 位";
    });
  }
  info.querySelectorAll(".collab-pair").forEach(function(item) {
    item.addEventListener("click", function() {
      var edge = data.edgeMap.get(getCollabPairKey(this.dataset.source, this.dataset.target));
      if (edge) window.location.href = collaborationPairUrl(edge.source, edge.target);
    });
  });
  renderCollabPaperList([], "");
}

function renderTeacherCollabInfo(name) {
  var data = buildCollaborationData();
  var info = document.getElementById("collab-info");
  if (!info) return;
  var node = data.nodeMap.get(name);
  var teacher = data.teacherByName.get(name);
  if (!node || !teacher) return;
  var edges = getTeacherCollabEdges(name);
  var total = edges.reduce(function(sum, edge) { return sum + edge.count; }, 0);
  var top = edges.slice(0, 5);
  var pathRecommendations = getAcademicPathRecommendations(name);
  info.innerHTML =
    '<div class="collab-teacher-head"><h3>' + renderTeacherNameLink(name, "teacher-heading-link") + '</h3>' +
    '<p>' + escapeHTML(node.title || "职称暂缺") + ' / ' + escapeHTML(node.department || "系所暂缺") + '</p>' +
    (node.researchFields.length ? '<div class="collab-tags">' + node.researchFields.slice(0, 4).map(function(tag) { return '<span class="collab-tag">' + escapeHTML(tag) + '</span>'; }).join("") + '</div>' : '') +
    '</div>' +
    '<div class="collab-metrics" style="margin-top:14px;">' +
    '<div class="collab-metric"><strong>' + node.paperCount + '</strong><span>论文总数</span></div>' +
    '<div class="collab-metric"><strong>' + node.collaboratorCount + '</strong><span>合作教师数量</span></div>' +
    '<div class="collab-metric"><strong>' + total + '</strong><span>学术合作总次数</span></div>' +
    '<div class="collab-metric"><strong>' + top.length + '</strong><span>高频合作教师</span></div>' +
    '</div>' +
    (edges.length ?
      '<div class="collab-block"><h3>合作最频繁教师 Top 5</h3><div class="collab-person-list">' +
      top.map(function(edge) {
        var other = edge.source === name ? edge.target : edge.source;
        return '<article class="collab-person" data-source="' + escapeHTML(edge.source) + '" data-target="' + escapeHTML(edge.target) + '">' +
          '<div class="collab-person-title"><span><a class="teacher-inline-link" href="' + collaborationPairUrl(name, other) + '">' + escapeHTML(other) + '</a></span><span class="collab-count-badge">' + edge.count + ' 次</span></div>' +
          (getRecentPaperTitle(edge) ? '<div class="collab-paper-title">' + escapeHTML(getRecentPaperTitle(edge)) + '</div>' : '') +
          '</article>';
      }).join("") + '</div></div>' :
      '<div class="collab-empty-state">暂未发现该教师与本学院其他教师的论文合作记录。</div>');
    info.innerHTML += renderAcademicPathCards(name, pathRecommendations);
  info.querySelectorAll(".collab-person").forEach(function(item) {
    item.addEventListener("click", function() {
      var edge = data.edgeMap.get(getCollabPairKey(this.dataset.source, this.dataset.target));
      if (edge) window.location.href = collaborationPairUrl(edge.source, edge.target);
    });
  });
  info.querySelectorAll(".academic-path-card").forEach(function(item) {
    item.addEventListener("click", function(e) {
      if (e.target && e.target.closest("a")) return;
      var edge = data.edgeMap.get(getCollabPairKey(this.dataset.source, this.dataset.target));
      if (!edge) return;
      var other = this.dataset.other;
      if (e.target && e.target.dataset && e.target.dataset.action === "papers") {
        window.location.href = collaborationPairUrl(name, other);
        return;
      }
      if (e.target && e.target.dataset && e.target.dataset.action === "evidence") {
        var evidence = this.querySelector(".academic-path-evidence");
        if (evidence) evidence.hidden = !evidence.hidden;
        return;
      }
      showCollaborationPath(name, other, edge);
    });
  });
  renderCollabPaperList([], "");
}

function showCollaborationPath(centerName, otherName, edge) {
  var data = buildCollaborationData();
  var edges = getTeacherCollabEdges(centerName);
  var names = new Set([centerName]);
  edges.forEach(function(item) { names.add(item.source); names.add(item.target); });
  var nodes = Array.from(names).map(function(item) { return data.nodeMap.get(item); }).filter(Boolean);
  setCollabGraphHeader(centerName + " 与 " + otherName + " 的合作关系", "共同论文 " + ((edge.papers || []).length) + " 篇，合作次数 " + edge.count + " 次");
  drawCollabBubbleGraph(nodes, edges, centerName, getCollabPairKey(centerName, otherName));
  renderCollabPaperList([], "");
}

function setCollabGraphHeader(title, subtitle) {
  var titleEl = document.getElementById("collab-graph-title");
  var subEl = document.getElementById("collab-graph-subtitle");
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle || "";
}

function drawCollabGraph(nodes, edges, centerName) {
  var el = document.getElementById("collab-graph");
  var empty = document.getElementById("collab-empty");
  if (!el) return;
  if (!window.echarts) {
    el.innerHTML = '<div class="collab-fallback">关系图组件正在加载或被浏览器拦截。左侧列表仍可查看合作次数与合作论文。</div>';
    return;
  }
  if (empty) empty.hidden = edges.length > 0;
  if (!edges.length) {
    el.innerHTML = "";
    return;
  }
  if (App.collabChart) App.collabChart.dispose();
  App.collabChart = echarts.init(el);
  var maxCount = Math.max.apply(null, edges.map(function(edge) { return edge.count; }));
  var graphNodes = nodes.map(function(node, index) {
    var isCenter = centerName && node.name === centerName;
    var labelPositions = ["right", "left", "top", "bottom"];
    return {
      id: node.name,
      name: node.name,
      value: node.cooperationCount || node.paperCount || 1,
      symbolSize: isCenter ? 50 : Math.max(24, Math.min(38, 22 + Math.sqrt(node.cooperationCount || 1) * 3.2)),
      category: isCenter ? 0 : 1,
      draggable: true,
      itemStyle: {
        color: isCenter ? "#8b1a2b" : "#7fb0d6",
        borderColor: isCenter ? "#d4a017" : "#ffffff",
        borderWidth: isCenter ? 3 : 1.5,
        shadowBlur: isCenter ? 10 : 5,
        shadowColor: isCenter ? "rgba(139,26,43,0.24)" : "rgba(18,59,97,0.14)"
      },
      label: {
        color: isCenter ? "#8b1a2b" : "#26475e",
        fontWeight: isCenter ? 900 : 600,
        position: isCenter ? "top" : labelPositions[index % labelPositions.length],
        distance: isCenter ? 10 : 7,
        backgroundColor: "rgba(255,255,255,0.76)",
        borderRadius: 4,
        padding: [2, 4]
      },
      raw: node
    };
  });
  var graphLinks = edges.map(function(edge) {
    var high = edge.count >= Math.max(2, Math.ceil(maxCount * 0.6));
    var showCountLabel = high || edge.count >= Math.max(3, Math.ceil(maxCount * 0.42));
    return {
      source: edge.source,
      target: edge.target,
      value: edge.count,
      lineStyle: {
        width: Math.max(1.5, Math.min(8, 1.2 + Math.sqrt(edge.count) * 1.25)),
        color: high ? "#8b1a2b" : "#9fb8cc",
        opacity: high ? 0.9 : 0.48,
        curveness: high ? 0.08 : 0.04
      },
      label: {
        show: showCountLabel,
        formatter: edge.count + "次",
        color: high ? "#8b1a2b" : "#5d7487",
        fontSize: high ? 12 : 10,
        fontWeight: high ? 800 : 600,
        backgroundColor: "rgba(255,255,255,0.82)",
        borderRadius: 4,
        padding: [2, 4]
      },
      raw: edge
    };
  });
  App.collabChart.setOption({
    animationDuration: 450,
    color: ["#8b1a2b", "#7fb0d6"],
    tooltip: {
      trigger: "item",
      confine: true,
      formatter: function(params) {
        if (params.dataType === "node") {
          var node = params.data.raw || {};
          var withCurrent = "";
          if (centerName && centerName !== node.name) {
            var edge = buildCollaborationData().edgeMap.get(getCollabPairKey(centerName, node.name));
            if (edge) withCurrent = "<br>与当前教师合作次数：" + edge.count;
          }
          return "<strong>" + escapeHTML(node.name) + "</strong><br>" +
            escapeHTML(node.department || "系所暂缺") + "<br>" +
            escapeHTML(node.title || "职称暂缺") + "<br>" +
            "研究方向：" + escapeHTML((node.researchFields || []).slice(0, 3).join("、") || "暂无") + "<br>" +
            "论文数量：" + (node.paperCount || 0) + withCurrent;
        }
        var edgeData = params.data.raw || {};
        return "<strong>" + escapeHTML(edgeData.source) + " - " + escapeHTML(edgeData.target) + "</strong><br>" +
          "合作次数：" + (edgeData.count || 0) + "<br>" +
          "最近论文：" + escapeHTML(getRecentPaperTitle(edgeData) || "暂无题名");
      }
    },
    series: [{
      type: "graph",
      layout: "force",
      left: 24,
      right: 42,
      top: 28,
      bottom: 34,
      roam: true,
      draggable: true,
      data: graphNodes,
      links: graphLinks,
      categories: [{ name: "中心教师" }, { name: "合作教师" }],
      label: { show: true, fontSize: 11 },
      edgeLabel: { show: true },
      edgeSymbol: ["none", "arrow"],
      edgeSymbolSize: [0, 8],
      labelLayout: { hideOverlap: true },
      force: { repulsion: centerName ? 520 : 360, edgeLength: centerName ? [120, 210] : [110, 190], gravity: 0.045, friction: 0.58 },
      emphasis: { focus: "adjacency", lineStyle: { opacity: 1 } }
    }]
  });
  App.collabChart.on("click", function(params) {
    if (params.dataType === "node" && params.data && params.data.name) {
      if (centerName && params.data.name !== centerName) window.location.href = collaborationPairUrl(centerName, params.data.name);
      else {
        rememberReturnState({ type: "collaboration", teacher: params.data.name });
        window.location.href = teacherDetailUrlByName(params.data.name);
      }
    }
    if (params.dataType === "edge" && params.data && params.data.raw) {
      var edge = params.data.raw;
      window.location.href = collaborationPairUrl(edge.source, edge.target);
    }
  });
  window.removeEventListener("resize", App._collabResizeHandler || function() {});
  App._collabResizeHandler = function() { if (App.collabChart) App.collabChart.resize(); };
  window.addEventListener("resize", App._collabResizeHandler);
}

function drawCollabBubbleGraph(nodes, edges, centerName, highlightedPairKey) {
  var el = document.getElementById("collab-graph");
  var empty = document.getElementById("collab-empty");
  if (!el) return;
  if (!window.echarts) {
    el.innerHTML = '<div class="collab-fallback">关系图组件正在加载或被浏览器拦截。左侧列表仍可查看合作次数与合作论文。</div>';
    return;
  }
  if (empty) empty.hidden = edges.length > 0;
  if (!edges.length) {
    el.innerHTML = "";
    return;
  }
  if (App.collabChart) App.collabChart.dispose();
  App.collabChart = echarts.init(el);
  var bubbleFont = '"Inter", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", sans-serif';
  function cyanScale(ratio) {
    var colors = ["#dff4f6", "#bfe7ec", "#89cbd5", "#53a8b8", "#287f92"];
    var index = Math.min(colors.length - 1, Math.max(0, Math.floor(ratio * colors.length)));
    return colors[index];
  }

  var centerCoopCounts = new Map();
  var centerTotalCount = 0;
  if (centerName) {
    edges.forEach(function(edge) {
      if (edge.source === centerName || edge.target === centerName) {
        var other = edge.source === centerName ? edge.target : edge.source;
        centerCoopCounts.set(other, edge.count || 0);
        centerTotalCount += edge.count || 0;
      }
    });
  }
  var maxCenterCoop = Math.max(1, Math.max.apply(null, Array.from(centerCoopCounts.values()).concat([1])));
  var nodeMaxValue = centerName ? maxCenterCoop : Math.max.apply(null, nodes.map(function(node) {
    return Math.max(1, node.paperCount || 0);
  }));
  var highlightedNames = new Set(highlightedPairKey ? highlightedPairKey.split("::") : []);
  var graphNodes = nodes.map(function(node) {
    var isCenter = centerName && node.name === centerName;
    var isHighlighted = highlightedNames.has(node.name);
    var nodeValue = centerName
      ? (isCenter ? Math.max(1, Math.round(maxCenterCoop * 0.58)) : Math.max(1, centerCoopCounts.get(node.name) || 0))
      : Math.max(1, node.paperCount || 0);
    var ratio = nodeMaxValue ? nodeValue / nodeMaxValue : 0;
    var size = centerName
      ? Math.max(32, Math.min(86, 30 + Math.sqrt(ratio) * 56))
      : Math.max(36, Math.min(88, 34 + Math.sqrt(ratio) * 54));
    if (isCenter) size = Math.max(58, Math.min(68, size));
    return {
      id: node.name,
      name: node.name,
      value: nodeValue,
      symbolSize: size,
      category: isCenter ? 0 : 1,
      draggable: true,
      itemStyle: {
        color: isHighlighted ? "#287f92" : cyanScale(ratio),
        borderColor: "#ffffff",
        borderWidth: isHighlighted ? 2.5 : 1.5,
        shadowBlur: isHighlighted ? 15 : (isCenter ? 12 : 7),
        shadowColor: isHighlighted ? "rgba(40,127,146,0.32)" : "rgba(40,127,146,0.18)"
      },
      label: {
        show: true,
        position: "inside",
        formatter: function(params) {
          var raw = params.data.raw || {};
          var count = centerName ? (raw.cooperationCount || 0) + "次" : (raw.paperCount || 0) + "篇";
          count = (raw.paperCount || 0) + "篇";
          count = centerName
            ? ((raw.name === centerName ? centerTotalCount : (centerCoopCounts.get(raw.name) || 0)) + "次")
            : ((raw.paperCount || 0) + "篇");
          return raw.name + "\n" + count;
        },
        color: ratio > 0.55 ? "#ffffff" : "#174456",
        fontFamily: bubbleFont,
        fontWeight: 700,
        fontSize: size >= 72 ? 12 : 10,
        lineHeight: size >= 72 ? 17 : 14,
        overflow: "break",
        width: Math.max(34, size - 12)
      },
      raw: node
    };
  });
  var paperCountByName = new Map(nodes.map(function(node) { return [node.name, node.paperCount || 0]; }));
  var graphLinks = edges.map(function(edge) {
    var source = edge.source;
    var target = edge.target;
    if (centerName && (edge.source === centerName || edge.target === centerName)) {
      source = centerName;
      target = edge.source === centerName ? edge.target : edge.source;
    }
    var isHighlighted = highlightedPairKey && getCollabPairKey(edge.source, edge.target) === highlightedPairKey;
    return {
      source: source,
      target: target,
      value: edge.count,
      lineStyle: {
        width: isHighlighted ? 3.2 : Math.max(0.7, Math.min(1.8, 0.5 + Math.sqrt(edge.count) * 0.18)),
        color: isHighlighted ? "#0f6172" : "#2f8192",
        opacity: isHighlighted ? 0.95 : 0.62,
        curveness: 0
      },
      raw: edge
    };
  });

  App.collabChart.setOption({
    animationDuration: 450,
    color: ["#287f92", "#53a8b8", "#89cbd5", "#bfe7ec", "#dff4f6"],
    tooltip: {
      trigger: "item",
      confine: true,
      formatter: function(params) {
        if (params.dataType === "node") {
          var node = params.data.raw || {};
          var withCurrent = "";
          if (centerName && centerName !== node.name) {
            var edge = buildCollaborationData().edgeMap.get(getCollabPairKey(centerName, node.name));
            if (edge) withCurrent = "<br>与当前教师合作次数：" + edge.count;
          }
          return "<strong>" + escapeHTML(node.name) + "</strong><br>" +
            escapeHTML(node.department || "系所暂缺") + "<br>" +
            escapeHTML(node.title || "职称暂缺") + "<br>" +
            "论文数量：" + (node.paperCount || 0) + "<br>" +
            "合作总次数：" + (node.cooperationCount || 0) + withCurrent;
        }
        var edgeData = params.data.raw || {};
        return "<strong>" + escapeHTML(edgeData.source) + " - " + escapeHTML(edgeData.target) + "</strong><br>" +
          "合作次数：" + (edgeData.count || 0) + "<br>" +
          "最近论文：" + escapeHTML(getRecentPaperTitle(edgeData) || "暂无题名");
      }
    },
    series: [{
      type: "graph",
      layout: "force",
      left: 28,
      right: 28,
      top: 28,
      bottom: 28,
      roam: true,
      draggable: true,
      data: graphNodes,
      links: graphLinks,
      categories: [{ name: "中心教师" }, { name: "合作教师" }],
      edgeSymbol: ["none", "arrow"],
      edgeSymbolSize: [0, 7],
      labelLayout: { hideOverlap: true },
      force: { repulsion: centerName ? 310 : 260, edgeLength: centerName ? [68, 112] : [62, 106], gravity: 0.11, friction: 0.7 },
      emphasis: { focus: "adjacency", lineStyle: { opacity: 1, width: 2.4 } }
    }]
  });
  App.collabChart.on("click", function(params) {
    if (params.dataType === "node" && params.data && params.data.name) {
      if (centerName && params.data.name !== centerName) window.location.href = collaborationPairUrl(centerName, params.data.name);
      else {
        rememberReturnState({ type: "collaboration", teacher: params.data.name });
        window.location.href = teacherDetailUrlByName(params.data.name);
      }
    }
    if (params.dataType === "edge" && params.data && params.data.raw) {
      var edge = params.data.raw;
      window.location.href = collaborationPairUrl(edge.source, edge.target);
    }
  });
  window.removeEventListener("resize", App._collabResizeHandler || function() {});
  App._collabResizeHandler = function() { if (App.collabChart) App.collabChart.resize(); };
  window.addEventListener("resize", App._collabResizeHandler);
}

function renderDefaultCollabGraph() {
  var data = buildCollaborationData();
  var edges = data.edges.filter(function(edge) { return edge.count >= 2; }).slice(0, 12);
  if (edges.length < 5) edges = data.edges.slice(0, 12);
  var names = new Set();
  edges.forEach(function(edge) { names.add(edge.source); names.add(edge.target); });
  var nodes = Array.from(names).map(function(name) { return data.nodeMap.get(name); }).filter(Boolean);
  setCollabGraphHeader("高频合作关系", "默认展示合作次数最高的核心关系，可搜索教师查看个人合作网络");
  drawCollabBubbleGraph(nodes, edges, "");
}

function showTeacherCollaboration(name) {
  var data = buildCollaborationData();
  var node = data.nodeMap.get(name);
  if (!node) return;
  rememberReturnState({ type: "collaboration", teacher: name });
  saveCollabSearchHistory(name);
  var input = document.getElementById("collab-search");
  if (input) input.value = name;
  var edges = getTeacherCollabEdges(name);
  var names = new Set([name]);
  edges.forEach(function(edge) { names.add(edge.source); names.add(edge.target); });
  var nodes = Array.from(names).map(function(item) { return data.nodeMap.get(item); }).filter(Boolean);
  setCollabGraphHeader(name + " 的个人合作网络", edges.length ? "点击节点可切换中心教师，点击连线查看合作论文" : "暂无本院共同署名合作关系");
  renderTeacherCollabInfo(name);
  drawCollabBubbleGraph(nodes, edges, name);
}

function attachCollabSearch() {
  var input = document.getElementById("collab-search");
  var box = document.getElementById("collab-suggestions");
  if (!input || !box || input.dataset.ready === "1") return;
  input.dataset.ready = "1";
  var data = buildCollaborationData();
  function bindSuggestionClicks() {
    box.querySelectorAll(".collab-suggestion").forEach(function(btn) {
      btn.addEventListener("mousedown", function(e) {
        e.preventDefault();
        box.classList.remove("show");
        showTeacherCollaboration(this.dataset.name);
      });
    });
  }
  function renderHistory() {
    var history = readCollabSearchHistory().filter(function(name) { return data.nodeMap.has(name); });
    if (!history.length) { box.classList.remove("show"); return; }
    box.innerHTML = '<div class="collab-suggestion-title">最近搜索</div>' + history.map(function(name) {
      var node = data.nodeMap.get(name) || {};
      return '<button type="button" class="collab-suggestion collab-history-item" data-name="' + escapeHTML(name) + '">' +
        '<span>' + escapeHTML(name) + '</span><small>' + escapeHTML(node.department || "历史记录") + '</small></button>';
    }).join("");
    box.classList.add("show");
    bindSuggestionClicks();
  }
  function renderSuggestions() {
    var q = input.value.trim();
    if (!q) { renderHistory(); return; }
    var normalized = normalizeCollabText(q);
    var matches = data.nodes.filter(function(node) {
      return normalizeCollabText(node.name).indexOf(normalized) >= 0;
    }).sort(function(a, b) {
      return (b.collaboratorCount - a.collaboratorCount) || (b.paperCount - a.paperCount);
    }).slice(0, 8);
    if (!matches.length) { box.classList.remove("show"); return; }
    box.innerHTML = matches.map(function(node) {
      return '<button type="button" class="collab-suggestion" data-name="' + escapeHTML(node.name) + '">' +
        '<span>' + escapeHTML(node.name) + '</span><small>' + escapeHTML(node.department || "") + '</small></button>';
    }).join("");
    box.classList.add("show");
    bindSuggestionClicks();
  }
  input.addEventListener("input", debounce(renderSuggestions, 120));
  input.addEventListener("compositionend", renderSuggestions);
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      var q = input.value.trim();
      var match = data.nodes.find(function(node) { return node.name === q; }) ||
        data.nodes.find(function(node) { return normalizeCollabText(node.name).indexOf(normalizeCollabText(q)) >= 0; });
      if (match) {
        box.classList.remove("show");
        showTeacherCollaboration(match.name);
      }
    }
    if (e.key === "Escape") box.classList.remove("show");
  });
  input.addEventListener("focus", renderSuggestions);
  input.addEventListener("blur", function() {
    setTimeout(function() { box.classList.remove("show"); }, 180);
  });
}

function renderCollaborationNetwork() {
  if (!document.getElementById("collaboration")) return;
  buildCollaborationData();
  renderCollabOverview();
  renderDefaultCollabGraph();
  attachCollabSearch();
  var savedState = readReturnState();
  var shouldRestoreSaved = !getQueryParam("collabTeacher") && isBackForwardNavigation() && savedState && savedState.type === "collaboration" && savedState.teacher;
  var focusTeacher = (getQueryParam("collabTeacher") || (shouldRestoreSaved ? savedState.teacher : "") || "").trim();
  if (focusTeacher) showTeacherCollaboration(focusTeacher);
  var reset = document.getElementById("collab-reset");
  if (reset && reset.dataset.ready !== "1") {
    reset.dataset.ready = "1";
    reset.addEventListener("click", function() {
      var input = document.getElementById("collab-search");
      if (input) input.value = "";
      rememberReturnState({ type: "collaboration", teacher: "" });
      renderCollabOverview();
      renderDefaultCollabGraph();
    });
  }
}

async function renderListPage() {
  await loadData();
  if (!App.data) return;
  const searchParam = getQueryParam("search") || "";
  const deptParam = getQueryParam("dept") || "";
  const researchParam = getQueryParam("research") || "";
  if (deptParam) App.filters.departments = [deptParam];
  if (researchParam) App.filters.research = [researchParam];
  if (searchParam) App.filters.search = searchParam;

  const searchInput = document.getElementById("list-search");
  const listSuggestBox = document.getElementById("search-suggestions");
  if (searchInput) {
    searchInput.value = searchParam;
    searchInput.addEventListener("input", debounce(() => {
      App.filters.search = searchInput.value.trim();
      if (App.filters.search && App.filters.departments.length > 0 && !getQueryParam("dept")) { }
      updateListSuggestions(searchInput.value.trim(), listSuggestBox, searchInput);
      renderTeacherCards();
    }, 150));
    searchInput.addEventListener("compositionend", () => {
      App.filters.search = searchInput.value.trim();
      updateListSuggestions(searchInput.value.trim(), listSuggestBox, searchInput);
      if (App.filters.search && !getQueryParam("dept")) { }
      renderTeacherCards();
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && listSuggestBox) listSuggestBox.classList.remove("show");
    });
    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && listSuggestBox && !listSuggestBox.contains(e.target)) {
        listSuggestBox.classList.remove("show");
      }
    });
    searchInput.addEventListener("focus", () => {
      if (App.filters.departments.length > 0 && !App.filters.search) {
        searchInput.placeholder = "搜索全院教师（当前筛选: " + App.filters.departments[0] + "）";
      }
      if (searchInput.value.trim()) updateListSuggestions(searchInput.value.trim(), listSuggestBox, searchInput);
    });
    searchInput.addEventListener("blur", () => {
      searchInput.placeholder = "搜索教师姓名、研究方向、论文关键词...";
      setTimeout(() => { if (listSuggestBox) listSuggestBox.classList.remove("show"); }, 200);
    });
  }
  renderSidebarFilters();
  renderTeacherCards();
  initMobileFilterDrawer();
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) sortSelect.addEventListener("change", () => renderTeacherCards());
}


  function updateListSuggestions(q, box, input) {
    if (!box) return;
    if (!q || q.length < 1) { box.classList.remove("show"); return; }
    var matches = searchTeachersForSuggestions(q).slice(0, 8);
    if (matches.length === 0) { box.classList.remove("show"); return; }
    box.innerHTML = matches.map(function(t) {
      var av = getTeacherAvatar(t, 32);
      return '<div class="suggestion-item" data-id="' + escapeHTML(t.id) + '"><div class="sug-avatar">' + av + '</div><div class="sug-info"><div class="sug-name">' + escapeHTML(t.name) + '</div><div class="sug-detail">' + escapeHTML(t.title) + ' / ' + escapeHTML(t.department) + '</div></div></div>';
    }).join("");
    box.classList.add("show");
    box.querySelectorAll(".suggestion-item").forEach(function(item) {
      item.removeEventListener("mousedown", item._sugHandler);
      item._sugHandler = function(e) { e.preventDefault(); rememberReturnState({ type: "page" }); window.location.href = "detail.html?id=" + encodeURIComponent(this.getAttribute("data-id")); };
      item.addEventListener("mousedown", item._sugHandler);
    });
  }

function renderSidebarFilters() {
  const deptContainer = document.getElementById("filter-departments");
  const titleContainer = document.getElementById("filter-titles");
  const researchContainer = document.getElementById("filter-research");
  if (deptContainer) deptContainer.innerHTML = App.departments.map(dept => {
    const count = App.teachers.filter(t => t.department === dept).length;
    const ck = App.filters.departments.includes(dept) ? "checked" : "";
    return '<label><input type="checkbox" value="' + dept + '" ' + ck + ' onchange="toggleFilter(\'departments\',\'' + dept.replace(/'/g,"\\'") + '\')"> ' + dept + ' <span class="filter-count">' + count + '</span></label>';
  }).join("");
  if (titleContainer) {
    const titles = [...new Set(App.teachers.map(t => t.title))].sort((a,b) => { var ai = TITLE_ORDER.indexOf(a), bi = TITLE_ORDER.indexOf(b); if (ai < 0) ai = 99; if (bi < 0) bi = 99; return ai - bi; });
    titleContainer.innerHTML = titles.map(title => {
      const count = App.teachers.filter(t => t.title === title).length;
      const ck = App.filters.titles.includes(title) ? "checked" : "";
      return '<label><input type="checkbox" value="' + title + '" ' + ck + ' onchange="toggleFilter(\'titles\',\'' + title + '\')"> ' + title + ' <span class="filter-count">' + count + '</span></label>';
    }).join("");
  }
  if (researchContainer) {
    const rc = {};
    App.teachers.forEach(t => { (t.research_interests || []).forEach(r => { rc[r] = (rc[r] || 0) + 1; }); });
    const sorted = Object.entries(rc).sort((a, b) => b[1] - a[1]).slice(0, 20);
    researchContainer.innerHTML = sorted.map(([r, count]) => {
      const ck = App.filters.research.includes(r) ? "checked" : "";
      return '<label><input type="checkbox" value="' + r + '" ' + ck + ' onchange="toggleFilter(\'research\',\'' + r.replace(/'/g,"\\'") + '\')"> ' + r + ' <span class="filter-count">' + count + '</span></label>';
    }).join("");
  }
}

function toggleFilter(type, value) {
  const arr = App.filters[type];
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1); else arr.push(value);
  App.filters[type] = arr;
  renderTeacherCards();
  syncMobileFilters();
}

function renderTeacherCards() {
  const grid = document.getElementById("teacher-grid");
  const countEl = document.getElementById("result-count");
  if (!grid) return;
  let teachers = getFilteredTeachers();
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect && sortSelect.value === "title") {
    const order = ["教授", "副教授", "助理教授", "研究员", "高级工程师", "工程师"];
    teachers.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
  }
  if (countEl) countEl.textContent = "共 " + teachers.length + " 位教师";
  if (teachers.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>未找到匹配的教师</p></div>';
    return;
  }
  grid.innerHTML = teachers.map(t => renderTeacherCard(t)).join("");
}

function renderTeacherCardLegacy(t) {
  const avatarHtml = getTeacherAvatar(t, 80);
  const tags = (t.research_interests || []).slice(0, 3).map(i => '<span class="tag tag-primary">' + escapeHTML(i) + '</span>').join("");
  const bio = t.intro || (t.education && t.education[0]) || "";
  const defaultBio = bio || [
    t.department || "",
    t.title || "",
    t.position || "",
    (t.research_interests && t.research_interests.length ? "研究方向：" + t.research_interests.slice(0, 3).join("、") : "")
  ].filter(Boolean).join(" · ") || "暂无简介";
  return '<div class="card teacher-card"><div class="teacher-avatar">' + avatarHtml + '</div><div class="teacher-info"><div class="teacher-name">' + escapeHTML(t.name) + '</div><div class="teacher-title">' + escapeHTML(t.title) + (t.position ? " / " + escapeHTML(t.position) : "") + '</div><div class="teacher-dept">' + escapeHTML(t.department) + '</div><div class="teacher-tags">' + tags + '</div><div class="teacher-bio">' + escapeHTML(defaultBio) + '</div><div class="teacher-actions"><a href="detail.html?id=' + encodeURIComponent(t.id) + '" class="btn btn-primary btn-sm">查看详情</a><a href="' + safeExternalUrl(t.personal_page) + '" target="_blank" rel="noopener" class="btn btn-outline btn-sm">官网链接</a></div></div></div>';
}

function renderTeacherCard(t) {
  const avatarHtml = getTeacherAvatar(t, 80);
  const tags = (t.research_interests || []).slice(0, 3).map(i => '<span class="tag tag-primary">' + escapeHTML(i) + '</span>').join("");
  const bio = t.intro || (t.education && t.education[0]) || "";
  const defaultBio = bio || [
    t.department || "",
    t.title || "",
    t.position || "",
    (t.research_interests && t.research_interests.length ? "研究方向：" + t.research_interests.slice(0, 3).join("、") : "")
  ].filter(Boolean).join(" · ") || "暂无简介";
  return '<div class="card teacher-card"><div class="teacher-avatar">' + avatarHtml + '</div><div class="teacher-info">' +
    renderTeacherNameLink(t.name, "teacher-name teacher-name-link") +
    '<div class="teacher-title">' + escapeHTML(t.title) + (t.position ? " / " + escapeHTML(t.position) : "") + '</div>' +
    '<div class="teacher-dept">' + escapeHTML(t.department) + '</div>' +
    '<div class="teacher-tags">' + tags + '</div>' +
    '<div class="teacher-bio">' + escapeHTML(defaultBio) + '</div>' +
    '<div class="teacher-actions"><a href="detail.html?id=' + encodeURIComponent(t.id) + '" class="btn btn-primary btn-sm">查看详情</a>' +
    '<a href="' + safeExternalUrl(t.personal_page) + '" target="_blank" rel="noopener" class="btn btn-outline btn-sm">官网链接</a></div></div></div>';
}

function initMobileFilterDrawer() {
  const toggleBtn = document.getElementById("filter-toggle");
  const drawer = document.getElementById("filter-drawer");
  const overlay = document.getElementById("filter-drawer-overlay");
  const closeBtn = document.getElementById("drawer-close");
  if (!toggleBtn || !drawer || !overlay || !closeBtn) return;
  toggleBtn.addEventListener("click", () => { drawer.classList.add("open"); overlay.classList.add("open"); });
  closeBtn.addEventListener("click", () => { drawer.classList.remove("open"); overlay.classList.remove("open"); });
  overlay.addEventListener("click", () => { drawer.classList.remove("open"); overlay.classList.remove("open"); });
  syncMobileFilters();
}

function syncMobileFilters() {
  const targets = [
    { el: "mobile-filter-departments", type: "departments", items: App.departments, countFn: (v) => App.teachers.filter(t => t.department === v).length },
    { el: "mobile-filter-titles", type: "titles", items: [...new Set(App.teachers.map(t => t.title))].sort((a,b) => { var ai = TITLE_ORDER.indexOf(a), bi = TITLE_ORDER.indexOf(b); if (ai < 0) ai = 99; if (bi < 0) bi = 99; return ai - bi; }), countFn: (v) => App.teachers.filter(t => t.title === v).length },
  ];
  targets.forEach(({ el, type, items, countFn }) => {
    const container = document.getElementById(el);
    if (container) container.innerHTML = items.map(v => {
      const count = countFn(v);
      const ck = App.filters[type].includes(v) ? "checked" : "";
      return '<label><input type="checkbox" value="' + v + '" ' + ck + ' onchange="toggleFilter(\'' + type + '\',\'' + v.replace(/'/g,"\\'") + '\')"> ' + v + ' <span class="filter-count">' + count + '</span></label>';
    }).join("");
  });
  const mr = document.getElementById("mobile-filter-research");
  if (mr) {
    const rc = {};
    App.teachers.forEach(t => { (t.research_interests || []).forEach(r => { rc[r] = (rc[r] || 0) + 1; }); });
    const sorted = Object.entries(rc).sort((a, b) => b[1] - a[1]).slice(0, 20);
    mr.innerHTML = sorted.map(([r, count]) => {
      const ck = App.filters.research.includes(r) ? "checked" : "";
      return '<label><input type="checkbox" value="' + r + '" ' + ck + ' onchange="toggleFilter(\'research\',\'' + r.replace(/'/g,"\\'") + '\')"> ' + r + ' <span class="filter-count">' + count + '</span></label>';
    }).join("");
  }
}

// ===== 教师详情页 =====
async function renderDetailPage() {
  await loadData();
  if (!App.data) return;
  const id = getQueryParam("id");
  if (!id) { window.location.href = "list.html"; return; }
  const t = App.teachers.find(t => t.id === id);
  if (!t) { document.getElementById("app").innerHTML = '<div class="empty-state"><p>未找到该教师信息</p><button type="button" class="btn btn-primary site-back-link" data-fallback="list.html">返回上一页</button></div>'; return; }
  renderDetail(t);
}

function renderDetail(t) {
  const app = document.getElementById("app");
  if (!app) return;
  const tags = (t.research_interests || []).map(i => '<span class="tag tag-primary">' + i + '</span>').join(" ");

  app.innerHTML =
    '<div class="breadcrumb container"><button type="button" class="breadcrumb-back site-back-link" data-fallback="list.html">返回上一页</button> / <a href="index.html">首页</a> / <a href="list.html">教师名录</a> / <span>' + t.name + '</span></div>' +
    '<div class="detail-hero"><div class="profile-card">' +
    '<div class="profile-avatar">' + getTeacherAvatar(t, 120) + '</div>' +
    '<div class="profile-info">' +
    '<h2>' + t.name + '</h2>' +
    '<div class="profile-title">' + t.title + (t.position ? ' · ' + t.position : '') + '</div>' +
    '<div class="profile-dept">' + t.department + '</div>' +
    '<div class="profile-meta">' + (t.email ? '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4l-10 7L2 4"/></svg> ' + t.email + '</span>' : '') + (t.office ? '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> ' + t.office + '</span>' : '') + '</div>' +
    '<div class="profile-meta" style="margin-top:4px;font-size:0.82rem;color:var(--text-muted);"><span>数据来源：<a href="' + t.source_url + '" target="_blank" rel="noopener">湖南大学土木工程学院官网</a></span><span>更新时间：' + t.last_updated + '</span></div>' +
    '<div class="profile-actions">' +
    (t.personal_page ? '<a href="' + t.personal_page + '" target="_blank" rel="noopener" class="btn btn-outline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg> 官网页面</a>' : '') +
    '<a href="list.html?dept=' + encodeURIComponent(t.department) + '" class="btn btn-outline"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> 同系所教师</a>' +
    '</div></div></div></div>' +
    '<div class="detail-content"><div class="container">' +
    renderProfileContent(t, tags) +
    renderAcademicContactEntry(t) +
    '<div class="source-bar"><strong><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> 数据来源声明：</strong>本页面信息来源于<a href="' + t.source_url + '" target="_blank" rel="noopener">湖南大学土木工程学院官网公开页面</a>（所属系所：' + t.source_department + '），采集时间：' + t.last_updated + '。仅供学术检索参考，如发现信息有误，请以官网信息为准。</div>' +
    '</div></div>';

  document.querySelectorAll(".collapse-toggle").forEach(btn => {
    btn.addEventListener("click", function() {
      const content = this.previousElementSibling;
      const isExpanded = content.classList.contains("expanded");
      content.classList.toggle("expanded");
      this.textContent = isExpanded ? "展开全部 ▼" : "收起 ▲";
    });
  });
}

function renderSection(title, content, className) {
  return '<div class="detail-section ' + (className || '') + '"><h3>' + title + '</h3>' + content + '</div>';
}

function renderAcademicContactEntry(t) {
  if (!t || !t.name) return "";
  return renderSection("学术联系路径",
    '<p class="academic-contact-intro">查看该教师与学院其他教师的论文合作关系，辅助判断可能的学术联系线索。</p>' +
    '<a class="btn btn-primary academic-contact-btn" href="' + collaborationNetworkUrl(t.name) + '">查看联系路径</a>',
    "academic-contact-section");
}

function renderCollapsible(title, content) {
  return renderSection(title, content);
}

function renderProfileContent(t, tags) {
  if (t.profile_flow && t.profile_flow.length) {
    return renderProfileFlow(t.profile_flow);
  }
  if (t.profile_flow_error) {
    return renderSection("官网主页资料", "<p class=\"flow-text\">当前源链接无法按老师个人主页一比一同步：" + escapeHTML(String(t.profile_flow_error).split("\n")[0]) + "</p>", "flow-error-section");
  }
  return renderDetailSections(t, tags) + renderProfileAssets(t);
}

function renderProfileFlow(flow) {
  var inAcademicBlock = false;
  return '<div class="detail-section official-flow-section"><div class="official-flow">' +
    flow.map(function(block) {
      if (block && block.type === "heading") {
        inAcademicBlock = /论文|成果|著作|专利|publication|paper|article|journal/i.test(block.text || "");
      }
      return renderFlowBlock(block, inAcademicBlock);
    }).join("") +
    '</div></div>';
}

function renderFlowBlock(block, withPaperLinks) {
  if (!block) return "";
  const type = block.type || "text";
  if (type === "heading") {
    const level = Math.min(Math.max(Number(block.level || 2), 2), 4);
    return '<h' + level + ' class="flow-heading flow-heading-' + level + '">' + escapeHTML(block.text || "") + '</h' + level + '>';
  }
  if (type === "image") {
    const src = block.local ? "data/" + String(block.local).replace(/^data\//, "") : block.src;
    if (!src) return "";
    return '<figure class="flow-media flow-image"><img src="' + escapeHTML(src) + '" alt="' + escapeHTML(block.alt || "") + '" loading="lazy">' +
      (block.alt ? '<figcaption>' + escapeHTML(block.alt) + '</figcaption>' : '') + '</figure>';
  }
  if (type === "video") {
    const src = block.local ? "data/" + String(block.local).replace(/^data\//, "") : block.src;
    if (!src) return "";
    return '<figure class="flow-media flow-video"><video src="' + escapeHTML(src) + '" controls preload="metadata"></video>' +
      (block.alt ? '<figcaption>' + escapeHTML(block.alt) + '</figcaption>' : '') + '</figure>';
  }
  if (type === "table") {
    const rows = (block.rows || []).map(row => '<div class="flow-table-row">' + escapeHTML(row) + '</div>').join("");
    return rows ? '<div class="flow-table">' + rows + '</div>' : "";
  }
  const text = escapeHTML(block.text || "").replace(/\n/g, "<br>");
  var linkedText = (withPaperLinks ? renderPaperTextWithLinks(block.text || "") : escapeHTML(block.text || "")).replace(/\n/g, "<br>");
  return text ? '<p class="flow-text">' + linkedText + '</p>' : "";
}

function renderDetailSections(t, tags) {
  if (t.profile_sections && t.profile_sections.length) {
    const sections = renderSection("基本信息", renderBasicInfo(t));
    const sourceSections = t.profile_sections
      .map(section => renderSourceSection(section))
      .join("");
    return sections + sourceSections;
  }

  return renderSection("基本信息", renderBasicInfo(t)) +
    (t.education && t.education.length ? renderSection("教育背景", renderList(t.education)) : "") +
    (t.work_experience && t.work_experience.length ? renderSection("工作履历", renderList(t.work_experience)) : "") +
    (t.academic_roles && t.academic_roles.length ? renderSection("学术兼职", renderList(t.academic_roles)) : "") +
    (t.research_interests && t.research_interests.length ? renderSection("研究领域", '<p style="color:var(--text-secondary);">' + tags + '</p>') : "") +
    (t.research_projects && t.research_projects.length ? renderSection("科研项目", renderList(t.research_projects)) : "") +
    (t.publications && t.publications.length ? renderSection("学术成果", renderList(t.publications, true)) : "") +
    (t.awards && t.awards.length ? renderSection("奖励与荣誉", renderList(t.awards)) : "") +
    (t.enrollment ? renderSection("招生信息", '<p style="color:var(--text-secondary);">' + escapeHTML(t.enrollment) + '</p>') : "");
}

function renderSourceSection(section) {
  if (!section || !section.items || !section.items.length) return "";
  const title = escapeHTML(section.title || "其他信息");
  var isAcademic = /论文|成果|著作|publication|paper|article|journal/i.test(section.title || "");
  return renderSection(title, renderList(section.items, isAcademic), "source-profile-section");
}

function renderList(items, withPaperLinks) {
  const cleanItems = (items || []).filter(Boolean);
  return '<ul class="detail-list">' + cleanItems.map(function(i) {
    var text = String(i);
    return '<li>' + (withPaperLinks ? renderPaperTextWithLinks(text) : escapeHTML(text)) + '</li>';
  }).join("") + '</ul>';
}

function renderProfileAssets(t) {
  const assets = (t.profile_assets || [])
    .filter(asset => asset && asset.local && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(asset.local));
  if (!assets.length) return "";
  const items = assets.map(asset => {
    const src = "data/" + asset.local.replace(/^data\//, "");
    const alt = escapeHTML((t.name || "教师") + " 资料图片");
    return '<a class="profile-media-item" href="' + src + '" target="_blank" rel="noopener">' +
      '<img src="' + src + '" alt="' + alt + '" loading="lazy">' +
      '</a>';
  }).join("");
  return renderSection("资料图片", '<div class="profile-media-grid">' + items + '</div>', "profile-media-section");
}

function renderBasicInfo(t) {
  const info = [];
  if (t.name) info.push('<strong>姓名：</strong>' + t.name);
  if (t.title) info.push('<strong>职称：</strong>' + t.title);
  if (t.position) info.push('<strong>职务：</strong>' + t.position);
  if (t.department) info.push('<strong>所属系所：</strong>' + t.department);
  if (t.email) info.push('<strong>邮箱：</strong>' + t.email);
  if (t.office) info.push('<strong>办公室：</strong>' + t.office);
  if (t.intro) info.push('<strong>简介：</strong>' + t.intro);
  return '<ul class="detail-list">' + info.map(i => '<li>' + i + '</li>').join("") + '</ul>';
}

// ===== 数据说明页 =====
function renderCollaborationPaperCard(paper) {
  if (!paper) return "";
  var meta = [];
  if (paper.year) meta.push('<span>' + escapeHTML(paper.year) + '</span>');
  if (paper.venue) meta.push('<span>' + escapeHTML(paper.venue) + '</span>');
  return '<article class="pair-paper-card">' +
    '<h3>' + escapeHTML(paper.title || paper.raw || "论文题名暂缺") + renderPaperSearchLinks(paper) + '</h3>' +
    (meta.length ? '<div class="pair-paper-meta">' + meta.join("") + '</div>' : '') +
    (paper.authors ? '<p class="pair-paper-authors">作者：' + escapeHTML(paper.authors) + '</p>' : '') +
    '</article>';
}

async function renderCollaborationPairPage() {
  await loadData();
  var app = document.getElementById("app");
  if (!app) return;
  var source = (getQueryParam("source") || "").trim();
  var target = (getQueryParam("target") || "").trim();
  if (!source || !target) {
    app.innerHTML = '<div class="empty-state"><p>请选择两位教师查看合作论文。</p><button type="button" class="btn btn-primary site-back-link" data-fallback="index.html#collaboration">返回上一页</button></div>';
    return;
  }
  var data = buildCollaborationData();
  var edge = data.edgeMap.get(getCollabPairKey(source, target));
  var sourceNode = data.nodeMap.get(source);
  var targetNode = data.nodeMap.get(target);
  var papers = edge && edge.papers ? edge.papers : [];
  app.innerHTML =
    '<div class="page-title pair-page-title"><h1>合作论文</h1><p>' + escapeHTML(source) + ' 与 ' + escapeHTML(target) + ' 的共同署名论文</p></div>' +
    '<div class="section"><div class="container pair-page-container">' +
    '<div class="pair-summary-card">' +
    '<div class="pair-teacher"><h2>' + renderTeacherNameLink(source, "teacher-heading-link") + '</h2><p>' + escapeHTML((sourceNode && sourceNode.title) || "职称暂缺") + ' / ' + escapeHTML((sourceNode && sourceNode.department) || "系所暂缺") + '</p></div>' +
    '<div class="pair-count"><strong>' + papers.length + '</strong><span>合作论文</span></div>' +
    '<div class="pair-teacher"><h2>' + renderTeacherNameLink(target, "teacher-heading-link") + '</h2><p>' + escapeHTML((targetNode && targetNode.title) || "职称暂缺") + ' / ' + escapeHTML((targetNode && targetNode.department) || "系所暂缺") + '</p></div>' +
    '</div>' +
    (papers.length ? '<div class="pair-paper-list">' + papers.map(renderCollaborationPaperCard).join("") + '</div>' : '<div class="empty-state"><p>暂未发现这两位教师的共同署名论文。</p></div>') +
    '<div class="pair-actions"><button type="button" class="btn btn-primary site-back-link" data-fallback="' + collaborationNetworkUrl(source) + '">返回上一页</button><a class="btn btn-outline" href="list.html">浏览教师名录</a></div>' +
    '</div></div>';
}

async function renderAboutPage() { await loadData(); }

function initReturnNavigation() {
  document.addEventListener("click", function(e) {
    var backControl = e.target.closest && e.target.closest(".site-back-link");
    if (backControl) {
      e.preventDefault();
      goBackOrFallback(backControl.getAttribute("data-fallback") || "index.html");
      return;
    }
    var detailLink = e.target.closest && e.target.closest('a[data-preserve-return="1"], a[href^="detail.html"], a[href^="scholar.html"]');
    if (detailLink) {
      var collabInput = document.getElementById("collab-search");
      var collabSection = document.getElementById("collaboration");
      if (collabInput && collabSection) {
        rememberReturnState({ type: "collaboration", teacher: collabInput.value.trim() });
      } else {
        rememberReturnState({ type: "page" });
      }
    }
  });
}

// ===== 入口 =====
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initReturnNavigation();
  const path = window.location.pathname.split("/").pop() || "index.html";
  const handler = (async () => {
    try {
      if (path === "index.html" || path === "") await renderHome();
      else if (path === "list.html") await renderListPage();
      else if (path === "detail.html") await renderDetailPage();
      else if (path === "collaboration.html") await renderCollaborationPairPage();
      else if (path === "about.html") await renderAboutPage();
    } catch (e) {
      console.error("页面初始化失败:", e);
      const app = document.getElementById("app");
      if (app) app.innerHTML = '<p style="text-align:center;padding:64px;color:red;">页面加载出错: ' + e.message + '</p>';
    }
  })();
  handler.catch(function(e) { console.error("Fatal:", e); });
});




// Homepage search suggestions
(function initHomeSearch() {
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  if (currentPage !== "index.html") return;
  var tries = 0;
  var timer = setInterval(function() {
    tries++;
    var input = document.getElementById("home-search");
    if (input && App.teachers && App.teachers.length > 0) {
      clearInterval(timer);
      attachHomeSuggestions(input);
    }
    if (tries > 50) clearInterval(timer);
  }, 200);
})();


// ===== Active filter chips =====
function clearFilter(type, value) {
  if (type === "search") {
    App.filters.search = "";
    const input = document.getElementById("list-search");
    if (input) input.value = "";
  } else if (App.filters[type]) {
    App.filters[type] = App.filters[type].filter(item => item !== value);
  }
  renderSidebarFilters();
  syncMobileFilters();
  renderTeacherCards();
  renderActiveFilters();
}

function renderActiveFilters() {
  const box = document.getElementById("active-filters");
  if (!box) return;
  const chips = [];
  if (App.filters.search) chips.push({ type: "search", value: App.filters.search, label: "搜索：" + App.filters.search });
  App.filters.departments.forEach(value => chips.push({ type: "departments", value, label: "系所：" + value }));
  App.filters.titles.forEach(value => chips.push({ type: "titles", value, label: "职称：" + value }));
  App.filters.research.forEach(value => chips.push({ type: "research", value, label: "方向：" + value }));
  box.innerHTML = chips.map(chip => {
    const safeValue = String(chip.value).replace(/'/g, "\\'");
    return '<button class="filter-chip" onclick="clearFilter(\'' + chip.type + '\',\'' + safeValue + '\')" title="取消筛选"><span>' + escapeHTML(chip.label) + '</span> ×</button>';
  }).join("");
}

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(renderActiveFilters, 0);
  document.addEventListener("change", function(event) {
    if (event.target && event.target.matches(".sidebar-section input[type='checkbox']")) {
      setTimeout(renderActiveFilters, 0);
    }
  });
  const listSearch = document.getElementById("list-search");
  if (listSearch) {
    listSearch.addEventListener("input", function() {
      setTimeout(renderActiveFilters, 180);
    });
  }
});
