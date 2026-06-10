/* ============================================
   湖南大学土木工程学院教师信息库 - 全局脚本
   ============================================ */

const App = {
  data: null, teachers: [], metadata: {}, departments: [], allResearchInterests: [],
  filters: { departments: [], titles: [], research: [], search: "" },
};



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

  renderDeptCards();
  renderResearchTags();
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
      item._sugHandler = function(e) { e.preventDefault(); window.location.href = "detail.html?id=" + encodeURIComponent(this.getAttribute("data-id")); };
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
  return '<div class="card teacher-card"><div class="teacher-avatar">' + avatarHtml + '</div><div class="teacher-info"><div class="teacher-name">' + escapeHTML(t.name) + '</div><div class="teacher-title">' + escapeHTML(t.title) + (t.position ? " / " + escapeHTML(t.position) : "") + '</div><div class="teacher-dept">' + escapeHTML(t.department) + '</div><div class="teacher-tags">' + tags + '</div><div class="teacher-bio">' + escapeHTML(defaultBio) + '</div><div class="teacher-actions"><a href="detail.html?id=' + encodeURIComponent(t.id) + '" class="btn btn-primary btn-sm">查看详情</a><a href="' + safeExternalUrl(t.personal_page) + '" target="_blank" rel="noopener" class="btn btn-outline btn-sm">官网链接</a></div></div></div>';
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
  if (!t) { document.getElementById("app").innerHTML = '<div class="empty-state"><p>未找到该教师信息</p><a href="list.html" class="btn btn-primary">返回</a></div>'; return; }
  renderDetail(t);
}

function renderDetail(t) {
  const app = document.getElementById("app");
  if (!app) return;
  const tags = (t.research_interests || []).map(i => '<span class="tag tag-primary">' + i + '</span>').join(" ");

  app.innerHTML =
    '<div class="breadcrumb container"><a href="index.html">首页</a> / <a href="list.html">教师名录</a> / <span>' + t.name + '</span></div>' +
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
  return '<div class="detail-section official-flow-section"><div class="official-flow">' +
    flow.map(renderFlowBlock).join("") +
    '</div></div>';
}

function renderFlowBlock(block) {
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
  return text ? '<p class="flow-text">' + text + '</p>' : "";
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
    (t.publications && t.publications.length ? renderSection("学术成果", renderList(t.publications)) : "") +
    (t.awards && t.awards.length ? renderSection("奖励与荣誉", renderList(t.awards)) : "") +
    (t.enrollment ? renderSection("招生信息", '<p style="color:var(--text-secondary);">' + escapeHTML(t.enrollment) + '</p>') : "");
}

function renderSourceSection(section) {
  if (!section || !section.items || !section.items.length) return "";
  const title = escapeHTML(section.title || "其他信息");
  return renderSection(title, renderList(section.items), "source-profile-section");
}

function renderList(items) {
  const cleanItems = (items || []).filter(Boolean);
  return '<ul class="detail-list">' + cleanItems.map(i => '<li>' + escapeHTML(String(i)) + '</li>').join("") + '</ul>';
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
async function renderAboutPage() { await loadData(); }

// ===== 入口 =====
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  const path = window.location.pathname.split("/").pop() || "index.html";
  const handler = (async () => {
    try {
      if (path === "index.html" || path === "") await renderHome();
      else if (path === "list.html") await renderListPage();
      else if (path === "detail.html") await renderDetailPage();
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
  if (window.location.pathname.indexOf("index.html") < 0 && window.location.pathname !== "/" && window.location.pathname !== "") return;
  var tries = 0;
  var timer = setInterval(function() {
    tries++;
    var input = document.getElementById("home-search");
    if (input && App.teachers && App.teachers.length > 0) {
      clearInterval(timer);
      setupHomeSuggestions(input);
    }
    if (tries > 50) clearInterval(timer);
  }, 200);

  function setupHomeSuggestions(searchInput) {
    var box = document.getElementById("home-suggestions");
    if (!box) return;

    searchInput.addEventListener("input", debounce(function() {
      var q = searchInput.value.trim();
      if (!q || q.length < 1) { box.classList.remove("show"); return; }
      var matches = searchTeachersForSuggestions(q).slice(0, 8);
      if (matches.length === 0) { box.classList.remove("show"); return; }
      box.innerHTML = matches.map(function(t) {
        var av = getTeacherAvatar(t, 32);
        return '<div class="suggestion-item" data-id="' + t.id + '"><div class="sug-avatar">' + av + '</div><div class="sug-info"><div class="sug-name">' + t.name + '</div><div class="sug-detail">' + t.title + ' / ' + t.department + '</div></div></div>';
      }).join("");
      box.classList.add("show");
      box.querySelectorAll(".suggestion-item").forEach(function(item) {
        item.addEventListener("mousedown", function(e) {
          e.preventDefault();
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
