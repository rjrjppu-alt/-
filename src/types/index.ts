export type TimeRange = 'today' | 'mtd' | 'qtd' | 'ytd';
export type BranchRegion = 'all' | 'east' | 'south' | 'north' | 'west' | 'central';

export interface KPICardData {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  unit: string;
  target?: string;
  completionRate?: number;
  yoy: number; // Year-over-Year change %
  mom: number; // Month-over-Month change %
  trend: 'up' | 'down' | 'flat';
  status: 'excellent' | 'normal' | 'warning' | 'critical';
  subText?: string;
  sparkline?: number[];
}

export interface ProductBreakdown {
  name: string;
  category: '寿险' | '年金险' | '重疾险' | '医疗险' | '意外险' | '分红投连';
  fyp: number; // 首年期交 (万元)
  gwp: number; // 规模保费 (万元)
  share: number; // 占比 %
  yoy: number;
  vnbMargin: number; // 新业务价值率 %
  growthRate: number;
}

export interface BranchPerformance {
  id: string;
  name: string;
  region: string;
  director: string;
  targetFYP: number;
  actualFYP: number;
  achievementRate: number;
  gwp: number;
  nbev: number;
  activeAgents: number;
  persistency13M: number; // 13月继续率 %
  familyAddonRate: number; // 家庭加保率 %
  rank: number;
  status: 'top' | 'warning' | 'normal';
}

export interface CustomerSegment {
  id: string;
  name: string;
  code: string;
  count: number;
  proportion: number;
  avgAnnualPremium: number; // 件均年化保费 (元)
  avgPoliciesPerCapita: number; // 人均件数
  totalLTV: number; // 总客户生命周期价值 (万元)
  coreNeeds: string[];
  keyRisk: string;
  retentionRate: number;
  color: string;
}

export interface CustomerPolicy {
  policyNo: string;
  productName: string;
  productType: string;
  insuredName: string;
  relation: string; // 本人 / 配偶 / 子女 / 父母
  annualPremium: number;
  sumAssured: number; // 基本保额
  effectiveDate: string;
  payPeriod: string; // 如 10年交 / 终身
  status: '有效' | '宽限期' | '已满期' | '贷款中' | '预警中';
  cashValue: number;
  hasLoan: boolean;
  loanAmount?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  city: string;
  tier: '顶级黑金私行客' | '卓越白金高客' | '中产富裕家庭' | '新锐成长白领' | '银发品质养老';
  annualIncome: string;
  assetsEst: string;
  agentName: string;
  agentId: string;
  agentPhone: string;
  agentStatus: '在职绩优' | '在职普通' | '已离职(孤儿单)';
  firstPolicyYear: number;
  totalAnnualPremium: number;
  totalPoliciesCount: number;
  familyMembersCount: number;
  insuredMembersCount: number;
  protectionScore: number; // 综合保障评分 0-100
  gapSummary: string;
  churnRiskScore: number; // 0-100, 高风险 > 70
  churnReasons?: string[];
  tags: string[];
  policies: CustomerPolicy[];
  radarData: {
    subject: string;
    actual: number;
    recommended: number;
    fullMark: number;
  }[];
  recentInteraction: string;
  recommendedAction: string;
  potentialFYP: number; // 潜在加保额度 (万元)
}

export interface LapseWarningItem {
  id: string;
  customerId: string;
  customerName: string;
  policyNo: string;
  productName: string;
  annualPremium: number;
  dueDate: string;
  daysRemaining: number;
  riskLevel: '高危' | '中危' | '低危';
  riskScore: number;
  primaryRiskReason: string;
  agentName: string;
  agentStatus: '在职' | '离职孤儿单';
  branch: string;
  suggestedAction: string;
  assignedSupervisor?: string;
  interventionStatus: '待处理' | '已派单' | '跟进中' | '已挽回' | '已退保';
}

export interface AgencyWorkforce {
  totalHeadcount: number;
  activeHeadcount: number;
  activeRate: number; // 活动率 %
  mdrtCount: number; // MDRT/绩优人力
  mdrtProportion: number; // 绩优占比 %
  newRecruitsMTD: number;
  newAgent3MRetention: number; // 3个月留存率 %
  newAgent6MRetention: number; // 6个月留存率 %
  monthlyPerCapitaFYP: number; // 人均首年期交 (元)
  monthlyPerCapitaCases: number; // 人均件数 (件/人/月)
  supervisorCount: number;
  pyramidData: {
    layer: string;
    count: number;
    avgIncome: number;
    activeRate: number;
    fypShare: number;
  }[];
  weeklyActivityTrend: {
    week: string;
    visitCount: number;
    customerKYCCount: number;
    proposalCount: number;
    closedPolicies: number;
  }[];
}

export interface StrategicDirective {
  id: string;
  title: string;
  category: '客户经营' | '退保挽回' | '高客攻坚' | '队伍督导' | '险种转型';
  targetBranch: string;
  deadline: string;
  priority: '特急' | '紧急' | '常规';
  initiator: string;
  content: string;
  expectedGoal: string;
  progress: number;
  status: '已下达' | '执行中' | '已达成' | '需督导';
  createdAt: string;
}

export interface DecisionSimulationInput {
  addonIncentiveRate: number; // 加保专项激励投入幅度 (+0% ~ +50%)
  hightNetWorthServiceTier: '基础体检' | '三甲绿通+VIP私享' | '全家康养社区免抵押直通';
  newAgentSubsidyBoost: number; // 新人津贴上浮幅度 (+0% ~ +40%)
  orphanPolicyServiceBudget: number; // 孤儿单专管员关怀基金 (万元)
  elderlyPensionPushWeight: number; // 养老年金主推权重加成 (%)
}

export interface SimulationResult {
  executiveSummary: string;
  predictedFYP: string;
  predictedNBEV: string;
  predictedRetentionRate: string;
  activeAgentGrowth: string;
  crossSellRate: string;
  roiEstimate: string;
  keyTradeoffs: string[];
  recommendation: string;
}
