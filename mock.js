// ===== 模拟数据（一期原型，全部为演示数据） =====
window.MOCK = {
  user: { name: "张建华", role: "集团运营副总", org: "和易集团" },

  orgs: ["和易集团", "矿业事业部", "物流事业部", "行政中心"],

  // ---- 模块 1: 日报 ----
  dailyReports: [
    { id: "R2026-1108", dept: "矿业事业部 · 生产部", author: "李建国", date: "2026-11-08", content: "今日选矿厂处理原矿 2,840 吨，回收率 86.3%；设备运行正常，无安全事故。", status: "approved", reviewer: "王明远", aiSummary: "生产平稳，回收率高于月度均值 1.2 个百分点。" },
    { id: "R2026-1107", dept: "物流事业部 · 运输队", author: "赵刚", date: "2026-11-07", content: "完成矿石外运 18 车次，共 900 吨；3 号车辆报修，预计明日恢复。", status: "pending", reviewer: "—", aiSummary: "运力完成率 92%，1 辆车待维修。" },
    { id: "R2026-1107", dept: "行政中心", author: "孙丽", date: "2026-11-07", content: "集团周会纪要已发布；组织年度体检报名，已收 142 份。", status: "approved", reviewer: "张建华", aiSummary: "行政事项按期推进。" },
  ],

  // ---- 模块 2: 月/季报 ----
  periodReports: [
    { id: "M-202610", org: "矿业事业部", period: "2026 年 10 月", type: "月报", author: "王明远", submitted: "2026-11-03", status: "approved", score: 92, highlights: "营收完成率 108%，成本下降 3.2%" },
    { id: "M-202610", org: "物流事业部", period: "2026 年 10 月", type: "月报", author: "赵刚", submitted: "2026-11-05", status: "pending", score: null, highlights: "运输量同比 +12%，但油耗超标" },
    { id: "Q-2026Q3", org: "和易集团", period: "2026 Q3", type: "季报", author: "财务中心", submitted: "2026-10-15", status: "approved", score: 88, highlights: "集团营收 4.2 亿，现金净流入 6,800 万" },
  ],

  // ---- 模块 3: 经营指标（从简道云取数） ----
  bizMetrics: {
    updated: "2026-11-08 18:00",
    source: "简道云 · 经营数据看板",
    cards: [
      { label: "本月回款", value: "¥3,240 万", delta: "+12.4%", trend: "up" },
      { label: "本月签约", value: "¥4,860 万", delta: "+8.1%", trend: "up" },
      { label: "本月工资支出", value: "¥682 万", delta: "+2.0%", trend: "flat" },
      { label: "实际付款", value: "¥2,110 万", delta: "-5.3%", trend: "down" },
    ],
    deptGoals: [
      { dept: "矿业事业部", target: 3000, actual: 3240, rate: 108, status: "ok" },
      { dept: "物流事业部", target: 1500, actual: 1320, rate: 88, status: "warn" },
      { dept: "贸易事业部", target: 2000, actual: 1680, rate: 84, status: "warn" },
      { dept: "行政中心", target: 0, actual: 0, rate: 0, status: "na" },
    ],
  },

  // ---- 模块 4: 资金与应收 ----
  cash: {
    totalCash: 8620,            // 万
    lastMonth: 8150,
    receivables: [
      { client: "XX 钢铁集团", amount: 1240, overdue: 0, days: 22 },
      { client: "YY 建材公司", amount: 680, overdue: 1, days: 48 },
      { client: "ZZ 贸易", amount: 320, overdue: 1, days: 92 },
      { client: "HH 物流", amount: 150, overdue: 0, days: 8 },
    ],
    forecast: [
      { month: "11 月", inflow: 3400, outflow: 2300 },
      { month: "12 月", inflow: 3800, outflow: 2600 },
      { month: "1 月", inflow: 3100, outflow: 2400 },
    ],
  },

  // ---- 模块 5: 问题与决议 ----
  issues: [
    { id: "ISS-042", title: "选矿厂 2 号球磨机轴承异响", level: "high", owner: "李建国", due: "2026-11-12", status: "doing", source: "11-07 生产例会", dimension: "上级", category: "系统问题", rootCause: "轴承长期未按周期保养，润滑失效", improvement: "制定设备巡检SOP，建立保养台账，明确责任人", verification: "连续30天无异常振动，振动值低于预警阈值" },
    { id: "ISS-041", title: "物流车队油耗超标 8%", level: "mid", owner: "赵刚", due: "2026-11-20", status: "todo", source: "10 月月报", dimension: "同级", category: "人的问题", rootCause: "司机操作不规范，频繁急加速急刹车", improvement: "组织驾驶员安全节油培训，制定行车考核细则", verification: "百公里油耗降低至行业标准±3%以内" },
    { id: "ISS-040", title: "贸易事业部应收账款超期", level: "high", owner: "周敏", due: "2026-11-15", status: "doing", source: "资金预警", dimension: "上级", category: "系统问题", rootCause: "客户信用审批流程不完善，缺乏动态信用评估", improvement: "上线信用管理系统，设置分级授信预警机制", verification: "逾期应收账款占比降至5%以下" },
    { id: "ISS-039", title: "行政中心年度体检供应商选定", level: "low", owner: "孙丽", due: "2026-11-25", status: "todo", source: "意见收集", dimension: "自查", category: "人的问题", rootCause: "采购需求提报滞后，未提前规划体检时间窗口", improvement: "建立年度体检采购提前期6个月的计划表", verification: "体检服务覆盖全员，员工满意度达90分以上" },
  ],
  decisions: [
    { id: "DEC-018", title: "批准矿业事业部 Q4 设备维修预算 120 万", date: "2026-11-05", vote: "7 赞成 / 1 反对 / 1 弃权", status: "passed" },
    { id: "DEC-017", title: "物流事业部新增 2 辆运输车采购", date: "2026-11-03", vote: "5 赞成 / 3 反对 / 1 弃权", status: "rejected" },
  ],

  // ---- 模块 6: 意见收集 ----
  opinions: [
    { id: "OP-102", topic: "食堂饭菜质量", count: 28, status: "open", latest: "建议增加面食窗口" },
    { id: "OP-101", topic: "通勤班车线路", count: 15, status: "processing", latest: "已与车队协调新增 B 线" },
    { id: "OP-100", topic: "加班补贴计算方式", count: 42, status: "closed", latest: "已于 10 月起按新规执行" },
  ],

  // ---- 模块 7: 内容运营 ----
  journals: [
    { id: "J-088", title: "和易集团 10 月要闻", author: "宣传组", date: "2026-11-05", views: 312, status: "published" },
    { id: "J-087", title: "选矿厂技改纪实", author: "矿业事业部", date: "2026-11-02", views: 186, status: "review" },
    { id: "J-086", title: "安全生产月启动仪式", author: "安全办", date: "2026-10-28", views: 445, status: "published" },
  ],
  wechat: [
    { id: "W-056", title: "和易集团与 XX 钢铁签订年度供货协议", date: "2026-11-06", reads: "2.1k", likes: 86 },
    { id: "W-055", title: "集团 2026 年第三季度经营分析会召开", date: "2026-11-01", reads: "3.4k", likes: 142 },
  ],

  // ---- 模块 8: 组织信息 ----
  orgTree: [
    { name: "和易集团", children: ["矿业事业部", "物流事业部", "贸易事业部", "行政中心", "财务中心"] },
    { name: "矿业事业部", children: ["生产部", "安全办", "设备部", "销售部"] },
    { name: "物流事业部", children: ["运输一队", "运输二队", "维保组"] },
  ],

  // ---- 模块 9: 月度会议 / 决议闭环 ----
  meetings: [
    {
      id: "MTG-2026-11",
      title: "11 月经营分析会",
      date: "2026-11-05",
      organizer: "张建华",
      attendees: ["矿业事业部", "物流事业部", "贸易事业部", "行政中心", "财务中心"],
      status: "已结束",
      decisions: [
        { id: "DEC-018", title: "批准矿业事业部 Q4 设备维修预算 120 万", owner: "王明远", status: "已通过", due: "2026-11-20" },
        { id: "DEC-019", title: "物流车队节油方案制定", owner: "赵刚", status: "进行中", due: "2026-11-30" },
        { id: "DEC-020", title: "贸易事业部应收账款专项清理", owner: "周敏", status: "待启动", due: "2026-12-05" },
      ],
    },
    {
      id: "MTG-2026-12",
      title: "12 月经营分析会（下一次）",
      date: "2026-12-05",
      organizer: "张建华",
      attendees: ["矿业事业部", "物流事业部", "贸易事业部", "行政中心", "财务中心"],
      status: "计划中",
      decisions: [],
    },
  ],

  // ---- 模块 10: 资金虚拟公司模型 ----
  virtualCompanies: [
    { name: "矿业事业部", initial: 3000, inflow: 3240, outflow: 2100, balance: 4140, level: "事业部" },
    { name: "物流事业部", initial: 1500, inflow: 1320, outflow: 1180, balance: 1640, level: "事业部" },
    { name: "贸易事业部", initial: 2000, inflow: 1680, outflow: 1200, balance: 2480, level: "事业部" },
    { name: "行政中心", initial: 800, inflow: 0, outflow: 520, balance: 280, level: "事业部" },
    { name: "财务中心", initial: 500, inflow: 0, outflow: 350, balance: 150, level: "事业部" },
  ],

  // 待确认规则（在原型中显式展示）
  pendingDecisions: [
    "组织架构终版：集团—事业部—部门三级是否固定，是否允许兼职多岗？",
    "月报批复链：部门 → 事业部 → 集团，每级批复时限与退回规则待定",
    "问题日志可见范围：全集团可见 / 仅本组织 + 上级 / 仅责任人可见",
    "资金支配权：分层额度（如部门 5 万、事业部 50 万、集团 500 万）尚未确认",
    "预警规则：回款 / 应收 / 现金余额触发阈值由财务中心提供",
  ],
};
