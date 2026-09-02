import React, { useState } from 'react';
import {
  Users,
  Shield,
  Layers,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Heart,
  ChevronRight,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Award,
  Send,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';
import {
  CustomerProfile,
  CustomerSegment,
  LapseWarningItem,
  TimeRange,
  BranchRegion,
} from '../../types';
import { useInsuranceData } from '../../context/DataContext';
import { CustomerProfileModal } from './CustomerProfileModal';

interface CustomerOverviewProps {
  timeRange: TimeRange;
  selectedBranch: BranchRegion;
  onOpenCopilotWithTopic: (topic: string) => void;
}

export const CustomerOverview: React.FC<CustomerOverviewProps> = ({
  timeRange,
  selectedBranch,
  onOpenCopilotWithTopic,
}) => {
  const { data } = useInsuranceData();
  const mockExecutiveKPIs = data.executiveKPIs;
  const mockCustomerSegments = data.customerSegments;
  const mockCustomerLifecycleStages = data.customerLifecycleStages;
  const mockDetailedCustomers = data.customerProfiles;

  const [subView, setSubView] = useState<'segments' | 'funnel' | 'gap_radar' | 'lapse_hall'>('segments');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  // Lapse hall filters
  const [lapseRiskFilter, setLapseRiskFilter] = useState<'all' | '高危' | '中危' | '低危'>('all');
  const [lapseWarningList, setLapseWarningList] = useState<LapseWarningItem[]>(data.lapseWarnings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep local warning list synced if context changes
  React.useEffect(() => {
    setLapseWarningList(data.lapseWarnings);
  }, [data.lapseWarnings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleIntervene = (item: LapseWarningItem) => {
    setLapseWarningList((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, interventionStatus: '已派单' } : it
      )
    );
    showToast(`已向【${item.branch}】下发针对【${item.customerName}】的48小时高管挽回保全令！`);
  };

  const filteredCustomers = mockDetailedCustomers.filter((c) => {
    const matchesSearch =
      c.name.includes(searchQuery) ||
      c.city.includes(searchQuery) ||
      c.agentName.includes(searchQuery) ||
      c.tags.some((t) => t.includes(searchQuery));
    const matchesTier = selectedTierFilter === 'all' || c.tier === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredLapseList = lapseWarningList.filter((item) => {
    if (lapseRiskFilter === 'all') return true;
    return item.riskLevel === lapseRiskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Customer Operations Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.totalCustomers.title}</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.totalCustomers.value}</span>
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.totalCustomers.unit}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{mockExecutiveKPIs.totalCustomers.yoy}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>达成进度: <span className="text-slate-800 font-bold">92.1%</span></span>
            <span className="text-blue-600 font-medium">高客客群占比 14.6%</span>
          </div>
        </div>

        {/* Family Addon Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.familyAddonRate.title}</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.familyAddonRate.value}</span>
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.familyAddonRate.unit}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{mockExecutiveKPIs.familyAddonRate.yoy}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>目标差距: <span className="text-amber-700 font-bold">-6.8pct</span></span>
            <span className="text-blue-600 font-medium">加保件均 ¥4.8万</span>
          </div>
        </div>

        {/* HNW Pension & Community Pass Count */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.hnwCount.title}</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.hnwCount.value}</span>
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.hnwCount.unit}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center ml-auto bg-emerald-50 px-2 py-0.5 rounded-md">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{mockExecutiveKPIs.hnwCount.yoy}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>康养社区函: <span className="text-slate-800 font-bold">6,850 份</span></span>
            <span className="text-emerald-700 font-medium">贡献保费 54.8%</span>
          </div>
        </div>

        {/* 13M Persistency & Orphan Lapse Risk */}
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-700 font-medium flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mr-1" />
              13个月继续率 / 退保预警
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              品质警戒
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl sm:text-3xl font-bold text-rose-600 tracking-tight">{mockExecutiveKPIs.persistency13M.value}</span>
            <span className="text-xs text-slate-500 font-medium">% (目标 93.5%)</span>
            <span className="text-xs font-semibold text-rose-600 flex items-center ml-auto bg-rose-50 px-2 py-0.5 rounded-md">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {mockExecutiveKPIs.persistency13M.yoy}%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>离职孤儿单存续: <span className="text-rose-600 font-bold">84.6%</span></span>
            <button
              onClick={() => setSubView('lapse_hall')}
              className="text-blue-600 font-semibold hover:underline flex items-center"
            >
              进入挽回大厅
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Operations Navigation Tabs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
          {[
            { id: 'segments', label: '客群分层金字塔与价值矩阵', icon: Layers },
            { id: 'funnel', label: '全生命周期转化漏斗与瓶颈', icon: BarChart3 },
            { id: 'gap_radar', label: '六维保障缺口雷达与家庭矩阵', icon: Shield },
            { id: 'lapse_hall', label: '13M退保流失预警与挽回调度大厅 🚨', icon: AlertTriangle, count: lapseWarningList.length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSubView(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
                  subView === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${subView === tab.id ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 font-bold'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onOpenCopilotWithTopic('请针对当前客户分层与加保转化瓶颈给出全套高管推进方案')}
          className="text-xs text-blue-700 font-semibold hover:bg-blue-100 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center space-x-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>AI 诊断客户经营策略</span>
        </button>
      </div>

      {/* SUB-VIEW 1: 客群分层金字塔与价值矩阵 */}
      {subView === 'segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Customer Tier Distribution Bar / Pyramid */}
            <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    客户价值金字塔分层结构 (全量在册 368.5万人)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    高客客群件均保费高达48.5万元，以4%的客户数贡献了超过50%的期交与新业务价值
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-medium">客户规模 / 件均年缴保费</span>
              </div>

              {/* Visual Tier Cards */}
              <div className="space-y-3">
                {mockCustomerSegments.map((seg) => (
                  <div
                    key={seg.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: seg.color }}
                        ></span>
                        <span className="text-sm font-bold text-slate-900">{seg.name}</span>
                        <span className="text-xs text-slate-500 font-medium">
                          {seg.count.toLocaleString()} 人 ({seg.proportion}%)
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs font-medium">
                        <span className="text-slate-600">
                          件均保费: <span className="text-slate-900 font-bold">¥{(seg.avgAnnualPremium / 10000).toFixed(1)}万</span>
                        </span>
                        <span className="text-slate-600">
                          人均保单: <span className="text-blue-600 font-bold">{seg.avgPoliciesPerCapita} 件</span>
                        </span>
                        <span className="text-slate-600">
                          续存率: <span className="text-emerald-600 font-bold">{seg.retentionRate}%</span>
                        </span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${seg.proportion * 2.5}%`,
                          backgroundColor: seg.color,
                        }}
                      ></div>
                    </div>

                    <div className="mt-2.5 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      <span>核心诉求: <span className="text-slate-800 font-medium">{seg.coreNeeds.join(' · ')}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Pie Chart and HNW Strategic Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  保费价值贡献度矩阵
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">不同客群保费贡献与LTV生命周期价值</p>

                <div className="h-52 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockCustomerSegments}
                        dataKey="totalLTV"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {mockCustomerSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`¥${(Number(val) / 10000).toFixed(1)} 亿元`, '总LTV估值']}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', borderRadius: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs space-y-1.5">
                <div className="text-blue-900 font-bold flex items-center text-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  高客深耕战略洞察
                </div>
                <p className="text-slate-700 leading-relaxed font-normal">
                  在册黑金与白金高客合计占比仅 25.3%，却贡献了全司 72.8% 的新业务价值。随着降息周期与预定利率调整，建议加大增额终身寿险与分红险高客信托架构培训。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: 全生命周期转化漏斗与瓶颈 */}
      {subView === 'funnel' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                客户全生命周期转化漏斗与卡点归因
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                从公私域引流获客 → 首张保单激活 → 黄金期加保 (一主多附) → 13M续期保全 → 家族财富深度传承
              </p>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
              首单至加保平均转化周期: 114 天
            </span>
          </div>

          {/* Funnel Stage Rows */}
          <div className="space-y-3.5">
            {mockCustomerLifecycleStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      0{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{stage.stage}</span>
                    <span className="text-xs text-slate-500 font-medium">
                      池内客量: <span className="text-slate-800 font-bold">{stage.userCount.toLocaleString()} 人</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs font-medium">
                    <span className="text-slate-600">
                      阶段转化率: <span className="text-blue-600 font-bold">{stage.conversionRate}%</span>
                    </span>
                    {stage.dropRate > 0 && (
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-bold">
                        流失/脱落: {stage.dropRate}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar visual width based on count */}
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${Math.max(10, (stage.userCount / 584000) * 100)}%`,
                    }}
                  ></div>
                </div>

                {/* Details: Levers & Bottlenecks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="text-slate-700 flex items-start">
                    <span className="text-blue-600 font-bold mr-1.5 shrink-0">🚀 经营抓手:</span>
                    <span>{stage.keyActions}</span>
                  </div>
                  <div className="text-slate-700 flex items-start">
                    <span className="text-rose-600 font-bold mr-1.5 shrink-0">⚠️ 核心卡点:</span>
                    <span>{stage.bottleneck}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: 六维保障缺口雷达与家庭矩阵 */}
      {subView === 'gap_radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              全司在册客户六维保障缺口热力分布
            </h3>
            <p className="text-xs text-slate-500">
              重疾与医疗渗透率较高，但养老储备、财富传承及家庭全员覆盖缺口巨大（未配置比例超 60%）
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={[
                    { subject: '人身寿险保障', 实际配置: 68, 标准配置: 85 },
                    { subject: '重疾健康防线', 实际配置: 76, 标准配置: 90 },
                    { subject: '品质养老储备', 实际配置: 38, 标准配置: 85 },
                    { subject: '高端医疗直付', 实际配置: 42, 标准配置: 80 },
                    { subject: '财富信托传承', 实际配置: 22, 标准配置: 75 },
                    { subject: '家庭全员覆盖', 实际配置: 31, 标准配置: 90 },
                  ]}
                >
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar name="全司在册客户实际均值" dataKey="实际配置" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
                  <Radar name="高价值家庭建议标配" dataKey="标准配置" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#ffffff', borderColor: '#334155', borderRadius: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs font-semibold">
              <span className="flex items-center text-blue-600">
                <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1.5"></span>
                全司客户实际配置率
              </span>
              <span className="flex items-center text-amber-600">
                <span className="w-3 h-3 bg-amber-500 rounded-sm mr-1.5"></span>
                高价值家庭目标标配线
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                加保产品重点主推推荐矩阵
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">根据缺口雷达匹配重点攻坚险种</p>

              <div className="space-y-3 mt-3.5">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-blue-700">① 养老年金 + 康养社区入住权</div>
                  <p className="text-xs text-slate-600 mt-1">
                    锁定50岁+中产与银发客群，件均保费20-50万，击中高品质养老与看护痛点。
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-amber-700">② 增额终身寿险（分红型）+ 家族信托</div>
                  <p className="text-xs text-slate-600 mt-1">
                    锁定民营企业主与黑金高客，年缴100万×5年交，实现定向传承与债务风险隔离。
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                  <div className="text-xs font-bold text-emerald-700">③ 家庭单少儿高端医疗 + 特药直付</div>
                  <p className="text-xs text-slate-600 mt-1">
                    以子女健康为切入点撬动夫妻双人保单，实现“一主多附”家庭单裂变。
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenCopilotWithTopic('如何基于六维保障缺口雷达，在全国分公司铺开家庭保单检视营销工程？')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>生成全国分公司加保营销方案</span>
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: 13M/25M 退保流失预警与挽回调度大厅 */}
      {subView === 'lapse_hall' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-500" />
                  13M / 25M 退保流失预警与高管督战挽回调度大厅
                </h3>
                <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold">
                  待挽回风险保费: ¥1.28 亿元
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                实时聚合“保单借款超80%、宽限期逾期倒计时、代理人脱落孤儿单、降额退保咨询”高危预警保单
              </p>
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(['all', '高危', '中危', '低危'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLapseRiskFilter(lvl)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    lapseRiskFilter === lvl
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'all' ? '全部风险' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Warning List Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-bold uppercase">
                <tr>
                  <th className="py-3 px-3.5">客户姓名 / 机构</th>
                  <th className="py-3 px-3.5">预警险种 / 保单号</th>
                  <th className="py-3 px-3.5">年缴保费</th>
                  <th className="py-3 px-3.5">宽限期倒计时</th>
                  <th className="py-3 px-3.5">风险等级与核心根因</th>
                  <th className="py-3 px-3.5">服务状态</th>
                  <th className="py-3 px-3.5">高管督办操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLapseList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-3.5">
                      <div className="font-bold text-slate-900 flex items-center">
                        {item.customerName}
                        {item.agentStatus === '离职孤儿单' && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            孤儿单
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center font-medium">
                        <Building className="w-3 h-3 mr-1 text-slate-400" />
                        {item.branch}
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="text-slate-800 font-semibold">{item.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.policyNo}</div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span className="text-slate-900 font-bold text-sm">
                        ¥{(item.annualPremium / 10000).toFixed(1)}万
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          item.daysRemaining <= 10
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        仅剩 {item.daysRemaining} 天
                      </span>
                    </td>

                    <td className="py-3.5 px-3.5 max-w-xs">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.riskLevel === '高危'
                              ? 'bg-rose-600 text-white'
                              : item.riskLevel === '中危'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {item.riskLevel} ({item.riskScore}分)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-tight">
                        {item.primaryRiskReason}
                      </p>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.interventionStatus === '待处理'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.interventionStatus === '已派单'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.interventionStatus}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        督导: {item.assignedSupervisor}
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5">
                      <button
                        onClick={() => handleIntervene(item)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>一键下发挽回令</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer List & KYC Explorer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              在册核心客户微观档案与加保策略库
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              点击任意客户查看完整KYC画像、家庭保单谱系、保单借款情况及AI一键生成的加保/挽留方案
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索姓名 / 城市 / 代理人..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">全客群分层</option>
              <option value="顶级黑金私行客">顶级黑金私行客</option>
              <option value="卓越白金高客">卓越白金高客</option>
              <option value="中产富裕家庭">中产富裕家庭</option>
              <option value="新锐成长白领">新锐成长白领</option>
              <option value="银发品质养老">银发品质养老</option>
            </select>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              onClick={() => setSelectedCustomer(cust)}
              className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {cust.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center">
                        {cust.name}
                        <span className="text-xs text-slate-500 font-normal ml-1">
                          ({cust.gender} · {cust.age}岁)
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{cust.city}</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {cust.tier}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500">总年缴保费:</span>
                    <div className="text-slate-900 font-bold">¥{(cust.totalAnnualPremium / 10000).toFixed(1)}万</div>
                  </div>
                  <div>
                    <span className="text-slate-500">家庭保单数:</span>
                    <div className="text-slate-800 font-semibold">{cust.totalPoliciesCount} 份 ({cust.insuredMembersCount}/{cust.familyMembersCount}人)</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {cust.gapSummary}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center">
                  <Sparkles className="w-3 h-3 text-blue-600 mr-1" />
                  潜在加保: <span className="text-blue-600 font-bold ml-1">¥{cust.potentialFYP}万</span>
                </span>

                <span className="text-blue-600 group-hover:translate-x-1 transition-transform flex items-center font-semibold">
                  查看全景 & AI方案
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Detail Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onAssignIntervention={(id, act) => showToast(act)}
        />
      )}
    </div>
  );
};
