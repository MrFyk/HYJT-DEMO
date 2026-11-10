// ===== 路由与页面渲染 =====
const $ = (sel) => document.querySelector(sel);
const root = $("#page-root");

const PAGES = ["dashboard", "report", "biz", "cash", "issue", "meeting", "opinion", "content", "org"];

// 导航
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    navigate(page);
  });
});

function navigate(page) {
  if (!PAGES.includes(page)) page = "dashboard";
  document.querySelectorAll(".nav-item").forEach((n) => n.classList.toggle("active", n.dataset.page === page));
  render(page);
  window.scrollTo({ top: 0 });
}

function render(page) {
  const fn = {
    dashboard: renderDashboard,
    report: renderReport,
    biz: renderBiz,
    cash: renderCash,
    issue: renderIssue,
    meeting: renderMeeting,
    opinion: renderOpinion,
    content: renderContent,
    org: renderOrg,
  }[page];
  root.innerHTML = fn();
  if (window.lucide) lucide.createIcons();
  bindPageEvents(page);
}

// ===== 通用片段 =====
function pageHeader(title, subtitle, actions = "") {
  return `
    <div class="row-between" style="margin-bottom:20px">
      <div>
        <h1 class="page-title">${title}</h1>
        ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ""}
      </div>
      <div class="row gap-8">${actions}</div>
    </div>`;
}

function statusTag(status) {
  const map = {
    approved: ["已批复", "tag-green"],
    pending: ["待批复", "tag-amber"],
    rejected: ["已退回", "tag-red"],
    todo: ["待处理", "tag-gray"],
    doing: ["处理中", "tag-blue"],
    done: ["已完成", "tag-green"],
    open: ["收集中", "tag-blue"],
    processing: ["处理中", "tag-amber"],
    closed: ["已关闭", "tag-gray"],
    published: ["已发布", "tag-green"],
    review: ["审核中", "tag-amber"],
    passed: ["通过", "tag-green"],
    rejected: ["未通过", "tag-red"],
  };
  const [text, cls] = map[status] || [status, "tag-gray"];
  return `<span class="tag ${cls}">${text}</span>`;
}

function levelTag(level) {
  const map = { high: ["高", "tag-red"], mid: ["中", "tag-amber"], low: ["低", "tag-gray"] };
  const [t, c] = map[level] || [level, "tag-gray"];
  return `<span class="tag ${c}">${t}</span>`;
}

function pendingBanner() {
  const items = window.MOCK.pendingDecisions.map((d) => `<li>${d}</li>`).join("");
  return `
    <div class="callout callout-amber" style="margin-bottom:16px">
      <i data-lucide="alert-triangle" style="width:18px;height:18px;flex-shrink:0"></i>
      <div>
        <strong>原型待确认规则：</strong>以下内容在会议中未最终拍板，本原型用占位方案展示，需业务方确认后再固化。
        <ul style="margin:6px 0 0 18px;font-size:12.5px;line-height:1.7">${items}</ul>
      </div>
    </div>`;
}

// ===== 页面：工作台总览 =====
function renderDashboard() {
  const m = window.MOCK.bizMetrics;
  const cards = m.cards.map((c) => `
    <div class="card stat-card">
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-delta ${c.trend === "up" ? "delta-up" : c.trend === "down" ? "delta-down" : "delta-flat"}">
        <i data-lucide="${c.trend === "up" ? "trending-up" : c.trend === "down" ? "trending-down" : "minus"}" style="width:13px;height:13px"></i>
        ${c.delta} 环比
      </div>
    </div>`).join("");

  const modules = [
    { key: "report", icon: "file-text", name: "汇报管理", desc: "日报 / 月报 / 季报统一入口，AI 摘要辅助" },
    { key: "biz", icon: "bar-chart-3", name: "经营指标", desc: "回款、签约、工资、付款完成率" },
    { key: "cash", icon: "wallet", name: "资金与应收", desc: "现金余额、应收账龄与收支预测" },
    { key: "issue", icon: "clipboard-list", name: "问题与决议", desc: "待协调事项跟踪、投票决策留痕" },
    { key: "meeting", icon: "calendar-check", name: "月度会议", desc: "会议→决议→待办→复盘闭环管理" },
    { key: "opinion", icon: "messages-square", name: "意见收集", desc: "员工意见主题化汇总与反馈" },
    { key: "content", icon: "newspaper", name: "内容运营", desc: "内部期刊与对外公众号审核发布" },
    { key: "org", icon: "network", name: "组织信息", desc: "集团三级架构与人员岗位信息" },
  ].map((m) => `
    <div class="module-tile" data-goto="${m.key}">
      <div class="mt-icon"><i data-lucide="${m.icon}" style="width:20px;height:20px"></i></div>
      <h4>${m.name}</h4>
      <p>${m.desc}</p>
    </div>`).join("");

  const todoIssues = window.MOCK.issues.filter((i) => i.status !== "done").slice(0, 4).map((i) => `
    <tr>
      <td><code style="color:var(--brand-600)">${i.id}</code></td>
      <td>${i.title}</td>
      <td>${levelTag(i.level)}</td>
      <td>${i.owner}</td>
      <td class="${i.due < "2026-11-10" ? "tag-red" : ""}" style="color:${i.due < "2026-11-10" ? "var(--danger)" : ""}">${i.due}</td>
    </tr>`).join("");

  return `
    ${pageHeader("工作台总览", "和易集团数字化管理工作台 · 一期原型")}
    ${pendingBanner()}

    <div class="grid grid-4" style="margin-bottom:20px">${cards}</div>

    <div class="grid grid-3" style="grid-template-columns: 2fr 1fr;">
      <div class="card">
        <div class="card-header">
          <h3>待跟进事项</h3>
          <button class="btn btn-ghost btn-sm" data-goto="issue">查看全部</button>
        </div>
        <table class="table">
          <thead><tr><th>编号</th><th>事项</th><th>等级</th><th>责任人</th><th>截止</th></tr></thead>
          <tbody>${todoIssues}</tbody>
        </table>
      </div>

      <div class="card card-pad">
        <div class="section-title">
          <i data-lucide="sparkles" style="width:16px;height:16px;color:#7c3aed"></i> AI 经营摘要
        </div>
        <div class="ai-box">
          <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> 2026-11-08 摘要</div>
          <p style="font-size:13px;line-height:1.7;color:#312e81">
            集团本月回款完成率 <strong>108%</strong>，矿业事业部贡献主要增量；物流与贸易事业部低于目标。
            应收账款中 YY 建材、ZZ 贸易已逾期，建议本周启动催收。
            现金余额 ¥8,620 万，未来三月预测均为净流入。
          </p>
        </div>
        <div style="margin-top:14px" class="text-sm muted">数据来源：简道云经营看板 · 每日 18:00 更新</div>
      </div>
    </div>

    <h2 class="section-title" style="margin-top:24px">一期模块导航</h2>
    <div class="grid grid-4">${modules}</div>
  `;
}

// ===== 页面：汇报管理（日报 / 月报 / 季报 合并） =====
let _reportTab = "daily"; // 当前选中的汇报类型

function renderReport() {
  const tab = _reportTab;
  const counts = {
    daily: window.MOCK.dailyReports.length,
    monthly: window.MOCK.periodReports.filter((r) => r.type === "月报").length,
    quarterly: window.MOCK.periodReports.filter((r) => r.type === "季报").length,
  };

  // 根据当前 tab 渲染不同内容
  let tabContent = "";
  if (tab === "daily") {
    tabContent = renderDailyTab();
  } else if (tab === "monthly") {
    tabContent = renderPeriodTab("月报");
  } else {
    tabContent = renderPeriodTab("季报");
  }

  return `
    ${pageHeader("汇报管理", "日报 · 月报 · 季报统一入口，AI 自动摘要辅助批复",
      renderCreateBtn(tab))}

    <div class="tabs" style="margin-bottom:16px">
      <div class="tab ${tab === "daily" ? "active" : ""}" data-report-tab="daily">日报 (${counts.daily})</div>
      <div class="tab ${tab === "monthly" ? "active" : ""}" data-report-tab="monthly">月报 (${counts.monthly})</div>
      <div class="tab ${tab === "quarterly" ? "active" : ""}" data-report-tab="quarterly">季报 (${counts.quarterly})</div>
    </div>

    ${tabContent}
  `;
}

function renderCreateBtn(tab) {
  const label = tab === "daily" ? "提交日报" : tab === "monthly" ? "提交月报" : "提交季报";
  return `<button class="btn btn-primary" onclick="openReportModal('${tab}')"><i data-lucide="plus" style="width:14px;height:14px"></i> ${label}</button>`;
}

// ---- 日报 tab ----
function renderDailyTab() {
  const rows = window.MOCK.dailyReports.map((r) => `
    <tr>
      <td><code>${r.id}</code></td>
      <td>${r.date}</td>
      <td>${r.dept}</td>
      <td>${r.author}</td>
      <td style="max-width:320px">${r.content}</td>
      <td>${r.coord ? '<span class="tag tag-amber">待协调 ' + r.coord + ' 项</span>' : '<span class="muted text-sm">—</span>'}</td>
      <td>${r.proof ? '<i data-lucide="image" style="width:16px;height:16px;color:var(--brand-500)"></i>' : '<span class="muted text-sm">—</span>'}</td>
      <td>${statusTag(r.status)}</td>
      <td>${r.reviewer}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="showDailyDetail('${r.id}')">查看</button>
      </td>
    </tr>`).join("");

  return `
    <div class="callout callout-blue" style="margin-bottom:16px">
      <i data-lucide="info" style="width:18px;height:18px"></i>
      <div>一期方案：日报由提交人在企业微信入口填写，系统调用 AI 生成摘要供上级快速浏览；支持图片佐证上传、需协调事项结构化勾选（累计 3 次自动提醒上级）；批复意见留痕，可被问题日志引用。</div>
    </div>

    <div class="callout callout-amber" style="margin-bottom:16px">
      <i data-lucide="alert-triangle" style="width:18px;height:18px"></i>
      <div><strong>功能亮点：</strong>管理者可通过组织层级筛选查看所辖下属日报；需协调事项若连续多日未解决，系统将自动升级提醒至上级。</div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>日报列表</h3>
        <div class="row gap-8">
          <select class="select" style="width:auto" id="daily-filter-org">
            <option>全集团</option>
            <optgroup label="矿业事业部">
              <option>矿业事业部 · 生产部</option>
              <option>矿业事业部 · 安全办</option>
              <option>矿业事业部 · 设备部</option>
            </optgroup>
            <optgroup label="物流事业部">
              <option>物流事业部 · 运输队</option>
              <option>物流事业部 · 维保组</option>
            </optgroup>
            <optgroup label="行政中心">
              <option>行政中心 · 综合办</option>
              <option>行政中心 · 人力资源</option>
            </optgroup>
          </select>
          <select class="select" style="width:auto"><option>全部状态</option><option>待批复</option><option>已批复</option></select>
          <select class="select" style="width:auto"><option>全部日报</option><option>含待协调事项</option><option>含图片佐证</option></select>
        </div>
      </div>
      <table class="table">
        <thead><tr><th>编号</th><th>日期</th><th>部门</th><th>提交人</th><th>内容</th><th>需协调</th><th>佐证</th><th>状态</th><th>批复人</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ---- 月报 / 季报 tab ----
function renderPeriodTab(type) {
  const all = window.MOCK.periodReports;
  const list = type === "月报" ? all.filter((r) => r.type === "月报") : all.filter((r) => r.type === "季报");
  const rows = list.map((r) => `
    <tr>
      <td><code>${r.id}</code></td>
      <td><span class="tag ${r.type === "季报" ? "tag-cyan" : "tag-blue"}">${r.type}</span></td>
      <td>${r.org}</td>
      <td>${r.period}</td>
      <td>${r.author}</td>
      <td>${r.submitted}</td>
      <td>${statusTag(r.status)}</td>
      <td>${r.score ?? "—"}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openPeriodDetail('${r.id}')">查看</button></td>
    </tr>`).join("");

  return `
    <div class="callout callout-amber" style="margin-bottom:16px">
      <i data-lucide="alert-triangle" style="width:18px;height:18px"></i>
      <div><strong>待确认：</strong>月报批复链"部门 → 事业部 → 集团"的每级时限、退回规则尚未敲定；本原型按三级串联展示。</div>
    </div>

    <div class="grid grid-3" style="margin-bottom:16px">
      <div class="card stat-card"><div class="stat-label">本月待批复</div><div class="stat-value">2</div></div>
      <div class="card stat-card"><div class="stat-label">已批复</div><div class="stat-value">1</div></div>
      <div class="card stat-card"><div class="stat-label">平均评分</div><div class="stat-value">90</div></div>
    </div>

    <div class="card">
      <table class="table">
        <thead><tr><th>编号</th><th>类型</th><th>组织</th><th>周期</th><th>提交人</th><th>提交日</th><th>状态</th><th>评分</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

// ---- 详情与新建模态 ----
function showDailyDetail(id) {
  const r = window.MOCK.dailyReports.find((x) => x.id === id);
  const coordItems = r.coord ? `<div class="field"><label>需协调事项 (${r.coord})</label>
    <div class="flex gap-8 flex-wrap">
      <span class="tag tag-amber">设备故障</span>
      <span class="tag tag-amber">跨部门配合</span>
      <span class="tag tag-gray">已协调 1 / 待协调 2</span>
    </div>
    <div class="text-sm muted mt-4">⚠ 本事项已连续 3 次未完全解决，系统已升级提醒至上级</div>
  </div>` : "";
  const proof = r.proof ? `<div class="field"><label>工作佐证</label>
    <div class="grid grid-3" style="gap:8px">
      <div style="height:80px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">现场照片 1</div>
      <div style="height:80px;background:linear-gradient(135deg,#f093fb,#f5576c);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">数据截图</div>
      <div style="height:80px;background:linear-gradient(135deg,#4facfe,#00f2fe);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px">巡检记录</div>
    </div>
  </div>` : "";

  openModal("日报详情", `
    <div class="field"><label>部门 / 提交人</label><div>${r.dept} · ${r.author}</div></div>
    <div class="field"><label>日期</label><div>${r.date}</div></div>
    <div class="ai-box">
      <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> AI 摘要</div>
      <p style="font-size:13px;color:#312e81">${r.aiSummary}</p>
    </div>
    <div class="field"><label>日报正文</label><div style="line-height:1.7">${r.content}</div></div>
    ${coordItems}
    ${proof}
    ${r.status === "pending" ? `
    <div class="field">
      <label>批复意见</label>
      <textarea class="textarea" placeholder="请输入批复意见，提交后将通知提交人"></textarea>
    </div>` : ""}
  `, r.status === "pending" ? [
    { text: "退回", cls: "btn-danger", action: () => toast("已退回") },
    { text: "批复通过", cls: "btn-primary", action: () => toast("已批复，已通知提交人") },
  ] : []);
}

function openReportModal(type) {
  const titles = { daily: "提交日报", monthly: "提交月报", quarterly: "提交季报" };
  const title = titles[type] || "提交汇报";

  let extra = "";
  if (type === "daily") {
    extra = `
      <div class="field"><label>需协调事项（可多选，系统将自动累计提醒）</label>
        <div class="checkbox-row"><input type="checkbox" id="c1" /><label for="c1" style="margin:0">设备故障需协助</label></div>
        <div class="checkbox-row"><input type="checkbox" id="c2" /><label for="c2" style="margin:0">跨部门配合请求</label></div>
        <div class="checkbox-row"><input type="checkbox" id="c3" /><label for="c3" style="margin:0">资源/材料不足</label></div>
        <div class="checkbox-row"><input type="checkbox" id="c4" /><label for="c4" style="margin:0">其他（请在下方说明）</label></div>
      </div>
      <div class="field"><label>佐证图片（工作现场照片、数据截图等）</label>
        <div style="border:2px dashed var(--border);border-radius:8px;padding:20px;text-align:center;color:var(--text-muted);cursor:pointer" onclick="toast('图片上传（演示）')">
          <i data-lucide="upload-cloud" style="width:32px;height:32px"></i>
          <div class="mt-4 text-sm">点击或拖拽上传图片 · 最多 9 张</div>
        </div>
      </div>
      <div class="field"><label>明日计划</label><textarea class="textarea" placeholder="明日计划与需要协调的资源"></textarea></div>
    `;
  } else {
    const fieldTips = type === "monthly"
      ? '<div class="callout callout-amber" style="margin-bottom:12px"><i data-lucide="file-text" style="width:16px;height:16px"></i><div><strong>月报字段提示：</strong>关键指标将与简道云数据自动比对；若人工填写与系统数据差异超过 5%，将触发口径冲突提醒。</div></div>'
      : '<div class="callout callout-amber" style="margin-bottom:12px"><i data-lucide="file-text" style="width:16px;height:16px"></i><div><strong>季报字段提示：</strong>季度汇报将自动汇总三个月月报数据，AI 会进行趋势分析和口径一致性检测。</div></div>';
    extra = `
      ${fieldTips}
      <div class="field"><label>本期关键指标完成情况</label>
        <div class="grid grid-2" style="margin-bottom:8px">
          <input class="input" placeholder="营收（万元）" />
          <input class="input" placeholder="回款（万元）" />
          <input class="input" placeholder="成本（万元）" />
          <input class="input" placeholder="产量/业务量" />
        </div>
        <textarea class="textarea" placeholder="补充说明关键指标完成情况、特殊因素说明"></textarea>
      </div>
      <div class="field"><label>问题与改进措施</label><textarea class="textarea" placeholder="本期遇到的问题、原因分析、已采取或计划的改进措施"></textarea></div>
      <div class="field"><label>下期工作计划</label><textarea class="textarea" placeholder="下期重点工作计划与目标、所需资源支持"></textarea></div>
    `;
  }

  openModal(title, `
    <div class="field"><label>所属部门</label>
      <select class="select"><option>矿业事业部 · 生产部</option><option>物流事业部 · 运输队</option><option>行政中心</option></select>
    </div>
    <div class="field"><label>${type === "daily" ? "工作内容" : "本期工作总结"}</label><textarea class="textarea" placeholder="${type === "daily" ? "今日主要工作、关键数据、异常事项" : "本期整体工作回顾与关键成果"}"></textarea></div>
    ${extra}
    <div class="checkbox-row"><input type="checkbox" id="aiSum" checked /><label for="aiSum" style="margin:0">提交后由 AI 生成摘要</label></div>
  `, [
    { text: "保存草稿", cls: "btn-ghost", action: () => toast("草稿已保存") },
    { text: "提交", cls: "btn-primary", action: () => toast(`${title}已提交，等待批复`) },
  ]);
}

function openPeriodDetail(id) {
  const r = window.MOCK.periodReports.find((x) => x.id === id);
  const isQuarterly = r.type === "季报";
  openModal(`${r.org} · ${r.period} ${r.type}`, `
    <div class="grid grid-2" style="margin-bottom:12px">
      <div class="field"><label>批复链路</label>
        <div class="text-sm">部门 → 事业部 → 集团</div>
      </div>
      <div class="field"><label>数据来源</label>
        <div class="text-sm">简道云自动取数 · 财务中心核对</div>
      </div>
    </div>

    <div class="ai-box" style="margin-bottom:12px">
      <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> AI 经营预分析（提交后自动生成）</div>
      <p style="font-size:13px;color:#312e81"><strong>经营摘要：</strong>${r.highlights}</p>
      <p class="text-sm" style="color:#059669;margin-top:6px"><strong>✓ 亮点识别：</strong>营收完成率 108%，超目标 8 个百分点</p>
      <p class="text-sm" style="color:#d97706;margin-top:2px"><strong>⚠ 异常标注：</strong>物流油耗超标 8%，需关注</p>
      ${isQuarterly ? `
      <p class="text-sm" style="color:#dc2626;margin-top:2px"><strong>✗ 口径冲突检测：</strong>矿业称"回收率稳定" vs 物流称"运输等待导致产能波动"——建议关注跨部门协同</p>` : ""}
      <p class="text-sm" style="color:#4f46e5;margin-top:2px"><strong>→ 建议动作：</strong>将油耗问题同步至物流事业部制定专项方案</p>
    </div>

    <div class="field"><label>关键指标完成情况</label>
      <table class="table" style="font-size:12.5px">
        <tr><th>指标</th><th>目标</th><th>实际</th><th>完成率</th><th>同比</th></tr>
        <tr><td>营收</td><td>3,000 万</td><td>3,240 万</td><td>108%</td><td class="text-sm" style="color:#059669">↑ +5%</td></tr>
        <tr><td>回款</td><td>2,800 万</td><td>2,910 万</td><td>104%</td><td class="text-sm" style="color:#059669">↑ +3%</td></tr>
        <tr><td>成本</td><td>≤ 2,100 万</td><td>2,030 万</td><td>达标</td><td class="text-sm" style="color:#059669">↓ -3%</td></tr>
        <tr><td>产量</td><td>10,000 吨</td><td>9,850 吨</td><td>98.5%</td><td class="text-sm" style="color:#d97706">↓ -1%</td></tr>
      </table>
    </div>

    <div class="field"><label>部门层级汇总</label>
      <div style="background:var(--neutral-50);border-radius:8px;padding:12px">
        <div class="text-sm" style="margin-bottom:8px"><strong>矿业事业部 · 10 月汇总</strong></div>
        <div class="row gap-8 flex-wrap">
          <span class="tag tag-blue">生产部：完成率 102%</span>
          <span class="tag tag-blue">安全办：完成率 100%</span>
          <span class="tag tag-blue">设备部：完成率 96%</span>
          <span class="tag tag-blue">销售部：完成率 110%</span>
        </div>
      </div>
    </div>

    <div class="field"><label>问题与改进</label><div style="line-height:1.7">选矿回收率较上月提升，但物流车队油耗超标 8%，需制定节油方案。</div></div>
    ${r.status === "pending" ? `<div class="field"><label>集团批复</label><textarea class="textarea" placeholder="批复意见与整改要求"></textarea></div>` : ""}
  `, r.status === "pending" ? [
    { text: "退回修改", cls: "btn-danger", action: () => toast("已退回") },
    { text: "批复通过", cls: "btn-primary", action: () => toast("已批复通过") },
  ] : []);
}

// ===== 页面：经营指标 =====
function renderBiz() {
  const m = window.MOCK.bizMetrics;
  const cards = m.cards.map((c) => `
    <div class="card stat-card">
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-delta ${c.trend === "up" ? "delta-up" : c.trend === "down" ? "delta-down" : "delta-flat"}">${c.delta}</div>
    </div>`).join("");

  const goals = m.deptGoals.filter((d) => d.target > 0).map((d) => {
    const cls = d.rate >= 100 ? "pb-green" : d.rate >= 90 ? "pb-amber" : "pb-red";
    return `
      <div style="padding:6px 0">
        <div class="row-between" style="margin-bottom:4px">
          <span>${d.dept}</span>
          <span class="text-sm"><strong>${d.actual}</strong> / ${d.target} 万 · <strong>${d.rate}%</strong></span>
        </div>
        <div class="progress"><div class="progress-bar ${cls}" style="width:${Math.min(d.rate, 120)}%"></div></div>
      </div>`;
  }).join("");

  return `
    ${pageHeader("经营指标", `数据来源：${m.source} · 更新于 ${m.updated}`)}

    <div class="callout callout-blue" style="margin-bottom:16px">
      <i data-lucide="info" style="width:18px;height:18px"></i>
      <div>一期方案：经营数据不重新录入，从简道云按日同步；指标口径以财务中心定义为准。应收与营收在"资金与应收"中单独展示，不计入现金资金池。</div>
    </div>

    <div class="grid grid-4" style="margin-bottom:20px">${cards}</div>

    <div class="grid" style="grid-template-columns: 1.3fr 1fr">
      <div class="card card-pad">
        <h3 class="section-title">部门目标完成率（本月）</h3>
        ${goals}
        <div class="text-sm muted mt-12">目标值来源：各事业部年度经营计划 · 月度分解</div>
      </div>

      <div class="card card-pad">
        <h3 class="section-title">AI 异常发现</h3>
        <div class="ai-box">
          <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> 自动巡检</div>
          <ul style="font-size:13px;color:#312e81;line-height:1.8;padding-left:18px">
            <li>物流事业部回款完成率 88%，低于目标 12 个百分点</li>
            <li>贸易事业部实际付款环比下降 5.3%，建议核实是否应付未付</li>
            <li>集团工资支出稳定，无异常波动</li>
          </ul>
        </div>
        <button class="btn btn-ghost btn-sm mt-12" onclick="toast('已生成异常分析报告并推送至财务中心')">生成分析报告</button>
      </div>
    </div>
  `;
}

// ===== 页面：资金与应收 =====
function renderCash() {
  const c = window.MOCK.cash;
  const recvRows = c.receivables.map((r) => `
    <tr>
      <td>${r.client}</td>
      <td>¥${r.amount} 万</td>
      <td>${r.days} 天</td>
      <td>${r.overdue ? '<span class="tag tag-red">逾期</span>' : '<span class="tag tag-gray">正常</span>'}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="toast('已生成催收任务并指派给销售部')">催收</button></td>
    </tr>`).join("");

  const forecast = c.forecast.map((f) => {
    const max = Math.max(...c.forecast.flatMap((x) => [x.inflow, x.outflow]));
    const ih = (f.inflow / max) * 100;
    const oh = (f.outflow / max) * 100;
    return `
      <div style="flex:1;text-align:center">
        <div style="display:flex;align-items:flex-end;justify-content:center;gap:6px;height:80px">
          <div style="width:22px;background:var(--brand-500);height:${ih}%;border-radius:4px 4px 0 0" title="流入"></div>
          <div style="width:22px;background:#f59e0b;height:${oh}%;border-radius:4px 4px 0 0" title="流出"></div>
        </div>
        <div class="text-sm muted mt-4">${f.month}</div>
        <div class="text-sm">净 ${f.inflow - f.outflow > 0 ? "+" : ""}${f.inflow - f.outflow} 万</div>
      </div>`;
  }).join("");

  const vc = window.MOCK.virtualCompanies || [];
  const rateTag = (rate) => {
    if (rate >= 100) return `<span class="tag tag-green">${rate}%</span>`;
    if (rate >= 80) return `<span class="tag tag-amber">${rate}%</span>`;
    return `<span class="tag tag-red">${rate}%</span>`;
  };
  const vcRows = vc.map((v) => {
    const rate = v.initial > 0 ? Math.round((v.inflow / v.initial) * 100) : 0;
    return `
      <tr>
        <td><strong>${v.name}</strong></td>
        <td>¥${v.initial} 万</td>
        <td>¥${v.inflow} 万</td>
        <td>¥${v.outflow} 万</td>
        <td><strong>¥${v.balance} 万</strong></td>
        <td>${rateTag(rate)}</td>
        <td>
          <div class="row gap-8">
            <button class="btn btn-ghost btn-sm" onclick="toast('${v.name} 资金明细（演示）')">明细</button>
            <button class="btn btn-ghost btn-sm" onclick="toast('${v.name} 资金调拨申请（演示）')">调拨</button>
          </div>
        </td>
      </tr>`;
  }).join("");

  const vcTotal = vc.reduce((s, v) => ({
    initial: s.initial + v.initial,
    inflow: s.inflow + v.inflow,
    outflow: s.outflow + v.outflow,
    balance: s.balance + v.balance,
  }), { initial: 0, inflow: 0, outflow: 0, balance: 0 });
  const vcTotalRate = vcTotal.initial > 0 ? Math.round((vcTotal.inflow / vcTotal.initial) * 100) : 0;

  return `
    ${pageHeader("资金与应收", "现金余额、应收账款、收支预测")}

    <div class="callout callout-amber" style="margin-bottom:16px">
      <i data-lucide="alert-triangle" style="width:18px;height:18px"></i>
      <div><strong>待确认：</strong>资金支配权分层额度（部门 / 事业部 / 集团）尚未确认；预警阈值待财务中心提供。本原型仅展示数据，不提供资金调拨操作。</div>
    </div>

    <div class="grid grid-3" style="margin-bottom:20px">
      <div class="card stat-card">
        <div class="stat-label">当前现金余额</div>
        <div class="stat-value">¥${c.totalCash} 万</div>
        <div class="stat-delta delta-up"><i data-lucide="trending-up" style="width:13px;height:13px"></i> 较上月 +¥${c.totalCash - c.lastMonth} 万</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">应收账款总额</div>
        <div class="stat-value">¥${c.receivables.reduce((s, r) => s + r.amount, 0)} 万</div>
        <div class="stat-delta delta-down">其中逾期 ¥${c.receivables.filter((r) => r.overdue).reduce((s, r) => s + r.amount, 0)} 万</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">未来 3 月净现金</div>
        <div class="stat-value">+¥${c.forecast.reduce((s, f) => s + (f.inflow - f.outflow), 0)} 万</div>
        <div class="stat-delta delta-up">预测持续净流入</div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1.2fr 1fr">
      <div class="card">
        <div class="card-header"><h3>应收账款明细</h3></div>
        <table class="table">
          <thead><tr><th>客户</th><th>金额</th><th>账龄</th><th>状态</th><th></th></tr></thead>
          <tbody>${recvRows}</tbody>
        </table>
      </div>

      <div class="card card-pad">
        <h3 class="section-title">未来 3 月收支预测</h3>
        <div class="flex" style="gap:8px">${forecast}</div>
        <div class="row gap-12 mt-12 text-sm">
          <span class="row gap-4"><span style="width:10px;height:10px;background:var(--brand-500);border-radius:2px"></span>流入</span>
          <span class="row gap-4"><span style="width:10px;height:10px;background:#f59e0b;border-radius:2px"></span>流出</span>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <h3>资金虚拟公司模型</h3>
        <div class="row gap-8">
          <span class="text-sm muted">每个事业部虚拟为独立公司，资金独立核算</span>
          <button class="btn btn-ghost btn-sm" onclick="toast('资金调拨申请（演示）')">调拨资金</button>
        </div>
      </div>
      <div class="callout callout-blue" style="margin-bottom:12px">
        <i data-lucide="info" style="width:18px;height:18px"></i>
        <div>一期方案：各事业部作为虚拟独立公司运作，初始资金由集团拨付，经营收入计入各自资金池；资金支配权分层额度待确认后实施。</div>
      </div>
      <table class="table">
        <thead>
          <tr><th>虚拟公司</th><th>初始资金</th><th>经营流入</th><th>经营流出</th><th>期末余额</th><th>资金完成率</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${vcRows}
          <tr style="background:var(--brand-50)">
            <td><strong>集团合计</strong></td>
            <td>¥${vcTotal.initial} 万</td>
            <td>¥${vcTotal.inflow} 万</td>
            <td>¥${vcTotal.outflow} 万</td>
            <td><strong>¥${vcTotal.balance} 万</strong></td>
            <td>${rateTag(vcTotalRate)}</td>
            <td class="muted text-sm">集团总资金池余额</td>
          </tr>
        </tbody>
      </table>
      <div class="row gap-12 mt-12">
        <div class="callout callout-blue" style="margin:0;flex:1">
          <i data-lucide="banknote" style="width:18px;height:18px"></i>
          <div>集团总资金池余额：<strong>¥${vcTotal.balance} 万</strong>（初始拨付 ¥${vcTotal.initial} 万，净流入 ¥${vcTotal.inflow - vcTotal.outflow} 万）</div>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="toast('已导出虚拟公司资金核算表（演示）')"><i data-lucide="download" style="width:14px;height:14px"></i>导出核算表</button>
      </div>
    </div>
  `;
}

// ===== 页面：问题与决议 =====
function renderIssue() {
  const dimTag = (dim) => {
    const map = { "自查": "tag-blue", "同级": "tag-cyan", "上级": "tag-amber" };
    return `<span class="tag ${map[dim] || "tag-gray"}">${dim}</span>`;
  };
  const catTag = (cat) => {
    const map = { "人的问题": "tag-gray", "系统问题": "tag-red" };
    return `<span class="tag ${map[cat] || "tag-gray"}">${cat}</span>`;
  };

  const issueRows = window.MOCK.issues.map((i) => `
    <tr>
      <td><code>${i.id}</code></td>
      <td>${i.title}</td>
      <td>${levelTag(i.level)}</td>
      <td>${dimTag(i.dimension)}</td>
      <td>${catTag(i.category)}</td>
      <td>${i.owner}</td>
      <td>${i.due}</td>
      <td>${statusTag(i.status)}</td>
      <td class="muted text-sm">${i.source}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openIssueDetail('${i.id}')">处理</button></td>
    </tr>`).join("");

  const decRows = window.MOCK.decisions.map((d) => `
    <tr>
      <td><code>${d.id}</code></td>
      <td>${d.title}</td>
      <td class="text-sm muted">${d.date}</td>
      <td>${d.vote}</td>
      <td>${statusTag(d.status)}</td>
    </tr>`).join("");

  return `
    ${pageHeader("问题与决议", "待协调事项跟踪 + 投票决策留痕",
      `<button class="btn btn-primary" onclick="openNewIssue()"><i data-lucide="plus" style="width:14px;height:14px"></i> 新建问题</button>`)}

    <div class="tabs">
      <div class="tab active" data-issue-tab="issues">问题日志 (${window.MOCK.issues.length})</div>
      <div class="tab" data-issue-tab="decisions">决议记录 (${window.MOCK.decisions.length})</div>
    </div>

    <div id="tab-issues" class="card">
      <div class="card-header">
        <h3>待协调事项</h3>
        <div class="row gap-8">
          <select class="select" style="width:auto"><option>全部等级</option><option>高</option><option>中</option><option>低</option></select>
          <select class="select" style="width:auto"><option>全部状态</option></select>
        </div>
      </div>
      <table class="table">
        <thead><tr><th>编号</th><th>事项</th><th>等级</th><th>维度</th><th>分类</th><th>责任人</th><th>截止</th><th>状态</th><th>来源</th><th></th></tr></thead>
        <tbody>${issueRows}</tbody>
      </table>
    </div>

    <div id="tab-decisions" class="card" style="display:none">
      <div class="card-header"><h3>投票决议记录</h3>
        <button class="btn btn-ghost btn-sm" onclick="openNewVote()">发起投票</button>
      </div>
      <table class="table">
        <thead><tr><th>编号</th><th>议题</th><th>日期</th><th>投票结果</th><th>状态</th></tr></thead>
        <tbody>${decRows}</tbody>
      </table>
    </div>
  `;
}

function openIssueDetail(id) {
  const i = window.MOCK.issues.find((x) => x.id === id);
  const dimMap = { "自查": "tag-blue", "同级": "tag-cyan", "上级": "tag-amber" };
  const catMap = { "人的问题": "tag-gray", "系统问题": "tag-red" };
  openModal(`处理问题 · ${i.id}`, `
    <div class="field"><label>事项</label><div>${i.title}</div></div>
    <div class="grid grid-2">
      <div class="field"><label>等级</label><div>${levelTag(i.level)}</div></div>
      <div class="field"><label>截止日期</label><div>${i.due}</div></div>
    </div>
    <div class="grid grid-2">
      <div class="field"><label>维度</label><div><span class="tag ${dimMap[i.dimension] || "tag-gray"}">${i.dimension}</span></div></div>
      <div class="field"><label>分类</label><div><span class="tag ${catMap[i.category] || "tag-gray"}">${i.category}</span></div></div>
    </div>
    <div class="field"><label>来源</label><div class="muted">${i.source}</div></div>
    <div class="field"><label>根因分析</label><div class="muted">${i.rootCause || "—"}</div></div>
    <div class="field"><label>改进措施</label><div class="muted">${i.improvement || "—"}</div></div>
    <div class="field"><label>验证标准</label><div class="muted">${i.verification || "—"}</div></div>
    <div class="field"><label>处理进展</label>
      <textarea class="textarea" placeholder="记录处理进展，系统将自动通知责任人"></textarea>
    </div>
    <div class="field"><label>状态</label>
      <select class="select"><option>待处理</option><option selected>处理中</option><option>已完成</option></select>
    </div>
  `, [
    { text: "取消", cls: "btn-ghost", action: closeModal },
    { text: "保存进展", cls: "btn-primary", action: () => toast("进展已更新，已通知责任人") },
  ]);
}

function openNewIssue() {
  openModal("新建待协调事项", `
    <div class="field"><label>提交维度</label>
      <div class="radio-group">
        <label class="radio"><input type="radio" name="dimension" value="自查" checked /><span>自查（我发现自己的问题）</span></label>
        <label class="radio"><input type="radio" name="dimension" value="同级" /><span>同级（需要同事配合）</span></label>
        <label class="radio"><input type="radio" name="dimension" value="上级" /><span>上级（需上级决策/资源）</span></label>
      </div>
    </div>
    <div class="field"><label>问题分类</label>
      <div class="radio-group">
        <label class="radio"><input type="radio" name="category" value="人的问题" checked /><span>人的问题</span></label>
        <label class="radio"><input type="radio" name="category" value="系统问题" /><span>系统问题</span></label>
      </div>
    </div>
    <div class="field"><label>事项标题</label><input class="input" placeholder="简明描述问题" /></div>
    <div class="grid grid-2">
      <div class="field"><label>等级</label><select class="select"><option>高</option><option>中</option><option>低</option></select></div>
      <div class="field"><label>截止日期</label><input class="input" type="date" /></div>
    </div>
    <div class="field"><label>责任人</label><input class="input" placeholder="选择责任人" /></div>
    <div class="field"><label>根因分析</label><textarea class="textarea" placeholder="分析问题产生的根本原因"></textarea></div>
    <div class="field"><label>改进措施</label><textarea class="textarea" placeholder="针对根因提出的具体改进措施"></textarea></div>
    <div class="field"><label>验证标准</label><textarea class="textarea" placeholder="如何确认问题已解决的标准"></textarea></div>
    <div class="field"><label>详细描述</label><textarea class="textarea" placeholder="补充问题的详细背景、影响范围等"></textarea></div>
  `, [
    { text: "取消", cls: "btn-ghost", action: closeModal },
    { text: "创建", cls: "btn-primary", action: () => toast("事项已创建并指派责任人") },
  ]);
}

function openNewVote() {
  openModal("发起投票决议", `
    <div class="field"><label>议题</label><input class="input" placeholder="例如：批准 XX 预算" /></div>
    <div class="field"><label>说明</label><textarea class="textarea" placeholder="背景、方案、影响"></textarea></div>
    <div class="field"><label>投票人范围</label>
      <select class="select"><option>集团领导班子</option><option>事业部总经理</option><option>自定义</option></select>
    </div>
    <div class="checkbox-row"><input type="checkbox" id="anon" /><label for="anon">匿名投票</label></div>
  `, [
    { text: "取消", cls: "btn-ghost", action: closeModal },
    { text: "发起投票", cls: "btn-primary", action: () => toast("投票已发起，结果将自动留痕") },
  ]);
}

// ===== 页面：月度会议（会议 → 决议 → 待办 → 复盘 闭环） =====
function decisionStatusTag(status) {
  const map = {
    "已通过": ["已通过", "tag-green"],
    "进行中": ["进行中", "tag-blue"],
    "待启动": ["待启动", "tag-gray"],
    "已完成": ["已完成", "tag-green"],
  };
  const [t, c] = map[status] || [status, "tag-gray"];
  return `<span class="tag ${c}">${t}</span>`;
}

function meetingStatusTag(status) {
  const map = { "已结束": "tag-gray", "进行中": "tag-blue", "计划中": "tag-cyan" };
  return `<span class="tag ${map[status] || "tag-gray"}">${status}</span>`;
}

function renderMeeting() {
  const meetings = [...window.MOCK.meetings].sort((a, b) => b.date.localeCompare(a.date));
  const allDecisions = meetings.flatMap((m) => m.decisions.map((d) => ({ ...d, meetingId: m.id, meetingTitle: m.title })));

  // 顶部概览统计
  const statusCount = (s) => meetings.filter((m) => m.status === s).length;
  const decCount = (s) => allDecisions.filter((d) => d.status === s).length;
  const today = "2026-11-10";
  const overdueCount = allDecisions.filter((d) => d.status !== "已完成" && d.status !== "已通过" && d.due < today).length;

  const meetingRows = meetings.map((m) => `
    <tr>
      <td><code>${m.id}</code></td>
      <td style="max-width:260px"><strong>${m.title}</strong></td>
      <td>${m.date}</td>
      <td>${m.organizer}</td>
      <td style="max-width:280px"><div class="flex wrap gap-4">${m.attendees.map((a) => `<span class="tag tag-gray">${a}</span>`).join("")}</div></td>
      <td>${meetingStatusTag(m.status)}</td>
      <td><span class="tag tag-blue">${m.decisions.length} 项</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="openMeetingDetail('${m.id}')"><i data-lucide="eye" style="width:14px;height:14px"></i> 查看详情</button></td>
    </tr>`).join("");

  const decisionRows = allDecisions.map((d) => {
    const overdue = d.status !== "已完成" && d.status !== "已通过" && d.due < today;
    return `
    <tr>
      <td class="muted text-sm">${d.meetingTitle}</td>
      <td><code style="color:var(--brand-600)">${d.id}</code> ${d.title}</td>
      <td>${d.owner}</td>
      <td class="${overdue ? "tag-red" : ""}" style="color:${overdue ? "var(--danger)" : ""}">${d.due}${overdue ? " · 已逾期" : ""}</td>
      <td>${decisionStatusTag(d.status)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openDecisionDetail('${d.meetingId}', '${d.id}')">更新进展</button></td>
    </tr>`;
  }).join("");

  // 下一次会议提醒
  const next = meetings.filter((m) => m.status === "计划中").sort((a, b) => a.date.localeCompare(b.date))[0];

  return `
    ${pageHeader("月度会议", "会议 → 决议 → 待办 → 复盘 闭环管理",
      `<button class="btn btn-primary" onclick="toast('新增会议（演示）')"><i data-lucide="plus" style="width:14px;height:14px"></i> 新建会议</button>`)}

    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="card stat-card">
        <div class="stat-label">已结束会议</div>
        <div class="stat-value">${statusCount("已结束")}</div>
        <div class="stat-delta delta-flat">进行中 ${statusCount("进行中")} · 计划中 ${statusCount("计划中")}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">决议总数</div>
        <div class="stat-value">${allDecisions.length}</div>
        <div class="stat-delta delta-flat">覆盖 ${meetings.filter((m) => m.decisions.length > 0).length} 场会议</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">已通过 / 已完成</div>
        <div class="stat-value">${decCount("已通过") + decCount("已完成")}</div>
        <div class="stat-delta delta-up"><i data-lucide="check-circle-2" style="width:13px;height:13px"></i> 闭环率 ${allDecisions.length ? Math.round((decCount("已通过") + decCount("已完成")) / allDecisions.length * 100) : 0}%</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">进行中 / 待启动</div>
        <div class="stat-value">${decCount("进行中") + decCount("待启动")}</div>
        <div class="stat-delta delta-down"><i data-lucide="alarm-clock" style="width:13px;height:13px"></i> 逾期 ${overdueCount} 项</div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 1.6fr 1fr; margin-bottom:20px">
      <div class="card">
        <div class="card-header">
          <h3>会议列表</h3>
          <div class="row gap-8">
            <select class="select" style="width:auto"><option>全部状态</option><option>已结束</option><option>进行中</option><option>计划中</option></select>
          </div>
        </div>
        <table class="table">
          <thead><tr><th>编号</th><th>会议</th><th>日期</th><th>组织人</th><th>参会事业部</th><th>状态</th><th>决议</th><th></th></tr></thead>
          <tbody>${meetingRows}</tbody>
        </table>
      </div>

      <div>
        ${next ? `
        <div class="card card-pad" style="border-left:3px solid var(--brand-500)">
          <div class="row gap-8" style="margin-bottom:8px">
            <i data-lucide="calendar-clock" style="width:18px;height:18px;color:var(--brand-600)"></i>
            <strong>下一次会议提醒</strong>
          </div>
          <h4 style="margin-bottom:6px">${next.title}</h4>
          <div class="text-sm muted" style="line-height:1.9">
            时间：${next.date}<br/>
            组织人：${next.organizer}<br/>
            参会：${next.attendees.join("、")}
          </div>
          <div class="field" style="margin-top:12px">
            <label>拟定议程</label>
            <div style="background:var(--neutral-50);border-radius:8px;padding:10px 12px;font-size:12.5px;line-height:1.9;color:var(--text-sub)">
              1. 上期决议复盘（${meetings.find((m) => m.decisions.length).decisions.length} 项待检视）<br/>
              2. 各事业部本月经营汇报<br/>
              3. 应收账款与资金专项<br/>
              4. 下月重点任务部署
            </div>
          </div>
          <div class="row gap-8 mt-12">
            <button class="btn btn-primary btn-sm" onclick="openMeetingDetail('${next.id}')">编辑议程</button>
            <button class="btn btn-ghost btn-sm" onclick="toast('会议通知已发送至 ${next.attendees.length} 个参会单位')"><i data-lucide="send" style="width:14px;height:14px"></i> 发送通知</button>
          </div>
        </div>` : ""}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>决议待办跟踪</h3>
        <div class="row gap-8">
          <select class="select" style="width:auto"><option>全部状态</option><option>已通过</option><option>进行中</option><option>待启动</option><option>已完成</option></select>
          <select class="select" style="width:auto"><option>全部会议</option>${meetings.map((m) => `<option>${m.title}</option>`).join("")}</select>
        </div>
      </div>
      ${allDecisions.length ? `
      <table class="table">
        <thead><tr><th>所属会议</th><th>决议</th><th>责任人</th><th>截止</th><th>状态</th><th></th></tr></thead>
        <tbody>${decisionRows}</tbody>
      </table>` : `
      <div class="card-pad text-sm muted" style="text-align:center;padding:24px">暂无决议待办，决议将在会议结束后自动生成跟踪项</div>`}
    </div>

    <div class="callout callout-blue mt-16">
      <i data-lucide="info" style="width:18px;height:18px"></i>
      <div>一期方案：会后由 AI 自动生成会议摘要与决议清单，决议自动转为待办并指派责任人；进展更新通过企微通知，逾期未反馈自动升级提醒；下次会议开场自动生成"上期决议复盘"议程。</div>
    </div>
  `;
}

// ---- AI 模拟摘要（按会议生成） ----
function meetingAiSummary(m) {
  if (m.status !== "已结束") {
    return "会议尚未召开。议程已就绪：会前系统将自动汇总各事业部月报与经营指标异常项，供会议讨论使用。";
  }
  const passed = m.decisions.filter((d) => d.status === "已通过").length;
  const doing = m.decisions.filter((d) => d.status !== "已通过" && d.status !== "已完成").length;
  return `本次会议围绕 Q4 经营目标展开，形成决议 ${m.decisions.length} 项（已通过 ${passed} 项，跟进中 ${doing} 项）。重点：矿业设备维修预算获批，Q4 产能保障落地；物流油耗超标问题启动专项方案，12 月初验收；贸易应收账款逾期占比较高，启动专项清理并按周汇报进展。建议下次会议优先检视以上三项决议的落实情况。`;
}

function openMeetingDetail(id) {
  const m = window.MOCK.meetings.find((x) => x.id === id);
  const decRows = m.decisions.map((d) => `
    <tr>
      <td><code style="color:var(--brand-600)">${d.id}</code></td>
      <td style="max-width:300px">${d.title}</td>
      <td>${d.owner}</td>
      <td>${d.due}</td>
      <td>${decisionStatusTag(d.status)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openDecisionDetail('${m.id}', '${d.id}')">进展</button></td>
    </tr>`).join("");

  const plannedActions = m.status === "计划中" ? [
    { text: "发送通知", cls: "btn-ghost", action: () => toast("会议通知已发送至全部参会单位") },
    { text: "保存议程", cls: "btn-primary", action: () => toast("议程已保存") },
  ] : [];

  openModal(`${m.title} · 详情`, `
    <div class="grid grid-2" style="margin-bottom:12px">
      <div class="field"><label>日期 / 组织人</label><div>${m.date} · ${m.organizer}</div></div>
      <div class="field"><label>状态</label><div>${meetingStatusTag(m.status)}</div></div>
    </div>
    <div class="field"><label>参会单位</label>
      <div class="flex wrap gap-4">${m.attendees.map((a) => `<span class="tag tag-gray">${a}</span>`).join("")}</div>
    </div>

    <div class="ai-box" style="margin:12px 0">
      <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> AI 会议摘要（会后自动生成）</div>
      <p style="font-size:13px;line-height:1.7;color:#312e81">${meetingAiSummary(m)}</p>
    </div>

    <div class="field"><label>决议清单（${m.decisions.length} 项）</label>
      ${m.decisions.length ? `
      <table class="table" style="font-size:12.5px">
        <thead><tr><th>编号</th><th>决议</th><th>责任人</th><th>截止</th><th>状态</th><th></th></tr></thead>
        <tbody>${decRows}</tbody>
      </table>` : `<div class="text-sm muted" style="padding:8px 0">会议尚未召开，暂无决议。会后由 AI 自动提取并生成跟踪项。</div>`}
    </div>

    ${m.status === "已结束" ? `
    <div class="field"><label>会议纪要（简版）</label>
      <div style="background:var(--neutral-50);border-radius:8px;padding:12px;font-size:12.5px;line-height:1.9;color:var(--text-sub)">
        <strong>一、经营情况通报</strong><br/>各事业部汇报 10 月经营完成情况，矿业回款完成率领先，物流油耗指标超标。<br/>
        <strong>二、议题讨论与决议</strong><br/>经与会人员讨论，形成 ${m.decisions.length} 项决议（详见上方清单），全部留痕归档。<br/>
        <strong>三、下步安排</strong><br/>决议进展由各责任人按周更新，行政中心汇总，下次会议开场复盘。
      </div>
    </div>` : `
    <div class="field"><label>议程编辑</label>
      <textarea class="textarea" placeholder="1. 上期决议复盘&#10;2. 各事业部经营汇报&#10;3. 专项议题讨论&#10;4. 下月任务部署"></textarea>
    </div>`}
  `, plannedActions);
}

function openDecisionDetail(meetingId, decisionId) {
  const m = window.MOCK.meetings.find((x) => x.id === meetingId);
  const d = m.decisions.find((x) => x.id === decisionId);

  // 模拟进展时间线
  const timeline = {
    "已通过": [
      { date: m.date, text: "会议决议通过，任务下达至责任人", by: m.organizer },
    ],
    "进行中": [
      { date: m.date, text: "会议决议通过，任务下达至责任人", by: m.organizer },
      { date: "2026-11-08", text: "方案初稿已完成，正在内部评审", by: d.owner },
    ],
    "待启动": [
      { date: m.date, text: "会议决议通过，任务下达至责任人", by: m.organizer },
      { date: "2026-11-09", text: "责任人已确认接收，计划按期启动", by: d.owner },
    ],
    "已完成": [
      { date: m.date, text: "会议决议通过，任务下达至责任人", by: m.organizer },
      { date: "2026-11-15", text: "阶段成果提交并通过验收", by: d.owner },
    ],
  }[d.status] || [];

  const timelineHtml = timeline.map((t) => `
    <div style="display:flex;gap:10px;padding:6px 0">
      <i data-lucide="circle-dot" style="width:14px;height:14px;color:var(--brand-500);margin-top:3px;flex-shrink:0"></i>
      <div>
        <div class="text-sm">${t.text}</div>
        <div class="text-sm muted">${t.date} · ${t.by}</div>
      </div>
    </div>`).join("");

  openModal(`决议进展 · ${d.id}`, `
    <div class="field"><label>决议内容</label><div style="line-height:1.7"><strong>${d.title}</strong></div></div>
    <div class="grid grid-3" style="margin-bottom:12px">
      <div class="field"><label>所属会议</label><div class="text-sm">${m.title}</div></div>
      <div class="field"><label>责任人</label><div>${d.owner}</div></div>
      <div class="field"><label>截止日期</label><div>${d.due}</div></div>
    </div>
    <div class="field"><label>当前状态</label><div>${decisionStatusTag(d.status)}</div></div>

    <div class="field"><label>进展时间线</label>
      <div style="background:var(--neutral-50);border-radius:8px;padding:10px 14px">${timelineHtml}</div>
    </div>

    <div class="grid grid-2">
      <div class="field"><label>更新状态</label>
        <select class="select">
          <option ${d.status === "待启动" ? "selected" : ""}>待启动</option>
          <option ${d.status === "进行中" ? "selected" : ""}>进行中</option>
          <option ${d.status === "已完成" ? "selected" : ""}>已完成</option>
        </select>
      </div>
      <div class="field"><label>进展说明</label>
        <textarea class="textarea" placeholder="记录最新进展，系统将通知组织人并留痕"></textarea>
      </div>
    </div>
    <div class="text-sm muted mt-4"><i data-lucide="info" style="width:13px;height:13px;display:inline-block;vertical-align:-2px"></i> 状态流转：待启动 → 进行中 → 已完成；逾期未更新将自动提醒责任人与组织人。</div>
  `, [
    { text: "取消", cls: "btn-ghost", action: closeModal },
    { text: "保存进展", cls: "btn-primary", action: () => toast("进展已更新，已通知组织人") },
  ]);
}

// ===== 页面：意见收集 =====
function renderOpinion() {
  const rows = window.MOCK.opinions.map((o) => `
    <tr>
      <td><code>${o.id}</code></td>
      <td>${o.topic}</td>
      <td><span class="tag tag-blue">${o.count} 条</span></td>
      <td>${statusTag(o.status)}</td>
      <td class="muted text-sm">${o.latest}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openOpinionDetail('${o.id}')">查看</button></td>
    </tr>`).join("");

  return `
    ${pageHeader("意见收集", "员工意见按主题汇总，AI 聚类后转交责任部门",
      `<div class="row gap-8">
        <button class="btn btn-ghost" onclick="toast('已生成季度意见分析报告并推送至管理层')"><i data-lucide="file-bar-chart-2" style="width:14px;height:14px"></i> 季度报告</button>
        <button class="btn btn-primary" onclick="openNewOpinion()">发起意见征集</button>
      </div>`)}

    <div class="grid grid-3" style="margin-bottom:16px">
      <div class="card stat-card"><div class="stat-label">本季度意见总数</div><div class="stat-value">85</div><div class="stat-delta delta-up">较上季 +12%</div></div>
      <div class="card stat-card"><div class="stat-label">已处理</div><div class="stat-value">62</div><div class="stat-delta">处理率 73%</div></div>
      <div class="card stat-card"><div class="stat-label">平均处理时长</div><div class="stat-value">4.2 天</div><div class="stat-delta delta-flat">与上季持平</div></div>
    </div>

    <div class="card">
      <table class="table">
        <thead><tr><th>编号</th><th>主题</th><th>条数</th><th>状态</th><th>最新反馈</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <div class="card card-pad mt-16">
      <div class="card-header">
        <h3>季度意见分析报告</h3>
        <button class="btn btn-ghost btn-sm" onclick="toast('报告已导出')">导出 PDF</button>
      </div>
      <div class="ai-box">
        <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> 2026 Q4 意见分析（截至 11 月）</div>
        <p style="font-size:13px;color:#312e81;margin-top:6px"><strong>高频主题 TOP 3：</strong>薪酬福利（28 条）、办公环境（21 条）、职业发展（15 条）</p>
        <p class="text-sm" style="color:#059669;margin-top:4px"><strong>正面趋势：</strong>对食堂满意度环比提升 18%，通勤班车新增路线获好评</p>
        <p class="text-sm" style="color:#d97706;margin-top:4px"><strong>关注建议：</strong>加班补贴计算方式仍是员工关注焦点，建议行政中心在 Q4 内完成方案优化</p>
      </div>
    </div>

    <div class="callout callout-blue mt-16">
      <i data-lucide="info" style="width:18px;height:18px"></i>
      <div>一期方案：员工在企微提交意见后，AI 自动按主题聚类并标注情绪倾向，由行政中心分派至责任部门；处理进度对提交人可见。每季度自动生成汇总报告，供管理层决策参考。</div>
    </div>
  `;
}

function openOpinionDetail(id) {
  const o = window.MOCK.opinions.find((x) => x.id === id);
  openModal(`意见主题 · ${o.topic}`, `
    <div class="grid grid-3">
      <div class="field"><label>收集条数</label><div>${o.count}</div></div>
      <div class="field"><label>状态</label><div>${statusTag(o.status)}</div></div>
      <div class="field"><label>责任部门</label><div>行政中心</div></div>
    </div>
    <div class="ai-box">
      <div class="ai-label"><i data-lucide="bot" style="width:14px;height:14px"></i> AI 聚类摘要</div>
      <p style="font-size:13px;color:#312e81">${o.latest}</p>
      <p class="text-sm mt-4" style="color:#4f46e5">情绪倾向：正面 22% / 中性 45% / 负面 33%</p>
    </div>
    <div class="field"><label>处理进展</label><textarea class="textarea" placeholder="回复进展将同步给所有提交人"></textarea></div>
  `, [
    { text: "取消", cls: "btn-ghost", action: closeModal },
    { text: "更新反馈", cls: "btn-primary", action: () => toast("反馈已更新并通知提交人") },
  ]);
}

function openNewOpinion() {
  openModal("发起意见征集", `
    <div class="field"><label>征集主题</label><input class="input" placeholder="例如：对食堂的改进建议" /></div>
    <div class="field"><label>说明</label><textarea class="textarea" placeholder="征集背景与范围"></textarea></div>
    <div class="grid grid-2">
      <div class="field"><label>截止日期</label><input class="input" type="date" /></div>
      <div class="field"><label>是否匿名</label><select class="select"><option>匿名</option><option>实名</option></select></div>
    </div>
  `, [
    { text: "取消", cls: "btn-ghost", action: closeModal },
    { text: "发布征集", cls: "btn-primary", action: () => toast("意见征集已发布") },
  ]);
}

// ===== 页面：内容运营 =====
function renderContent() {
  const jRows = window.MOCK.journals.map((j) => `
    <tr>
      <td>${j.title}</td>
      <td>${j.author}</td>
      <td>${j.date}</td>
      <td>${j.views}</td>
      <td>${statusTag(j.status)}</td>
      <td>
        ${j.status === "review" ? '<button class="btn btn-primary btn-sm" onclick="toast(\'已审核通过并发布\')">审核</button>' : '<button class="btn btn-ghost btn-sm">查看</button>'}
      </td>
    </tr>`).join("");

  const wRows = window.MOCK.wechat.map((w) => `
    <tr>
      <td>${w.title}</td>
      <td class="muted text-sm">${w.date}</td>
      <td>${w.reads}</td>
      <td>${w.likes}</td>
      <td><button class="btn btn-ghost btn-sm">数据</button></td>
    </tr>`).join("");

  return `
    ${pageHeader("内容运营", "内部期刊审核发布 + 对外公众号数据汇总")}

    <div class="grid" style="grid-template-columns: 1.3fr 1fr">
      <div class="card">
        <div class="card-header">
          <h3>内部期刊</h3>
          <button class="btn btn-primary btn-sm" onclick="toast('新建期刊草稿（演示）')">新建</button>
        </div>
        <table class="table">
          <thead><tr><th>标题</th><th>作者</th><th>日期</th><th>阅读</th><th>状态</th><th></th></tr></thead>
          <tbody>${jRows}</tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-header"><h3>对外公众号</h3></div>
        <table class="table">
          <thead><tr><th>标题</th><th>日期</th><th>阅读</th><th>点赞</th><th></th></tr></thead>
          <tbody>${wRows}</tbody>
        </table>
      </div>
    </div>

    <div class="callout callout-blue mt-16">
      <i data-lucide="info" style="width:18px;height:18px"></i>
      <div>一期方案：期刊与公众号均采用"提交 → 审核 → 发布"流程；AI 提供摘要生成、错别字检查与敏感词提示，发布后数据回流至本模块。</div>
    </div>
  `;
}

// ===== 页面：组织信息 =====
function renderOrg() {
  const tree = window.MOCK.orgTree.map((n) => `
    <div class="card card-pad" style="margin-bottom:12px">
      <div class="row gap-8">
        <i data-lucide="building" style="width:18px;height:18px;color:var(--brand-600)"></i>
        <strong>${n.name}</strong>
      </div>
      <div class="flex wrap gap-8 mt-12">
        ${n.children.map((c) => `<span class="tag tag-gray">${c}</span>`).join("")}
      </div>
    </div>`).join("");

  return `
    ${pageHeader("组织信息", "集团—事业部—部门三级架构与岗位信息")}

    <div class="callout callout-amber" style="margin-bottom:16px">
      <i data-lucide="alert-triangle" style="width:18px;height:18px"></i>
      <div><strong>待确认：</strong>组织架构终版尚未提供，以下为占位结构；是否允许一人多岗、兼职如何影响数据可见范围，需业务方确认。</div>
    </div>

    <div class="grid" style="grid-template-columns: 1fr 1fr">
      <div>
        <h3 class="section-title">组织架构（占位）</h3>
        ${tree}
      </div>
      <div>
        <h3 class="section-title">关键岗位</h3>
        <div class="card">
          <table class="table">
            <thead><tr><th>姓名</th><th>组织</th><th>岗位</th></tr></thead>
            <tbody>
              <tr><td>张建华</td><td>集团</td><td>运营副总</td></tr>
              <tr><td>王明远</td><td>矿业事业部</td><td>总经理</td></tr>
              <tr><td>赵刚</td><td>物流事业部</td><td>总经理</td></tr>
              <tr><td>周敏</td><td>贸易事业部</td><td>总经理</td></tr>
              <tr><td>孙丽</td><td>行政中心</td><td>主任</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ===== Modal 与 Toast =====
function openModal(title, body, buttons = []) {
  const modal = $("#modal");
  const btns = buttons.map((b, i) => `<button class="btn ${b.cls}" data-modal-btn="${i}">${b.text}</button>`).join("");
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3>${title}</h3>
        <button onclick="closeModal()"><i data-lucide="x" style="width:18px;height:18px;color:var(--text-sub)"></i></button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">${btns}</div>
    </div>`;
  modal.classList.add("open");
  if (window.lucide) lucide.createIcons();
  modal.querySelectorAll("[data-modal-btn]").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = +el.dataset.modalBtn;
      if (buttons[idx].action) buttons[idx].action();
      closeModal();
    });
  });
}

function closeModal() {
  $("#modal").classList.remove("open");
}

$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ===== 页面事件绑定 =====
function bindPageEvents(page) {
  // 模块卡片跳转
  document.querySelectorAll("[data-goto]").forEach((el) => {
    el.addEventListener("click", () => navigate(el.dataset.goto));
  });

  // 汇报管理 tab
  if (page === "report") {
    document.querySelectorAll("[data-report-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        _reportTab = tab.dataset.reportTab;
        render("report");
      });
    });
  }

  // 问题页 tab
  if (page === "issue") {
    document.querySelectorAll("[data-issue-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll("[data-issue-tab]").forEach((t) => t.classList.toggle("active", t === tab));
        const key = tab.dataset.issueTab;
        $("#tab-issues").style.display = key === "issues" ? "" : "none";
        $("#tab-decisions").style.display = key === "decisions" ? "" : "none";
      });
    });
  }
}

// 初始化
render("dashboard");
