import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { BranchRegion, TimeRange } from '../../types';
import { useInsuranceData } from '../../context/DataContext';

interface PerformanceDashboardProps {
  timeRange: TimeRange;
  selectedBranch: BranchRegion;
  onOpenCopilotWithTopic: (topic: string) => void;
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  timeRange,
  selectedBranch,
  onOpenCopilotWithTopic,
}) => {
  const { data } = useInsuranceData();
  const mockExecutiveKPIs = data.executiveKPIs;
  const mockProducts = data.products;
  const mockBranches = data.branches;

  const [productViewType, setProductViewType] = useState<'fyp' | 'vnb'>('fyp');

  const monthlyTrendData = [
    { month: '1月', 实际FYP: 18500, 目标预算: 16000, 价值率: 32.5 },
    { month: '2月', 实际FYP: 14200, 目标预算: 13000, 价值率: 31.8 },
    { month: '3月', 实际FYP: 21000, 目标预算: 19000, 价值率: 33.2 },
    { month: '4月', 实际FYP: 16800, 目标预算: 17000, 价值率: 30.9 },
    { month: '5月', 实际FYP: 19400, 目标预算: 18000, 价值率: 31.4 },
    { month: '6月', 实际FYP: 23600, 目标预算: 21000, 价值率: 32.8 },
    { month: '7月', 实际FYP: 20200, 目标预算: 19500, 价值率: 31.6 },
    { month: '8月 (当前)', 实际FYP: 22800, 目标预算: 20000, 价值率: 32.0 },
  ];

  const channelMixData = [
    { name: '个险代理人营销', value: 72400, share: 58.1, color: '#3b82f6' },
    { name: '银保期交主渠道', value: 31200, share: 25.0, color: '#f59e0b' },
    { name: '经代与高端中介', value: 13500, share: 10.8, color: '#10b981' },
    { name: '数字网销与直销', value: 7500, share: 6.1, color: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6">
      {/* Top 4 Performance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GWP */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.gwp.title}</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.gwp.value}</span>
            <span className="text-xs text-slate-500">{mockExecutiveKPIs.gwp.unit}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{mockExecutiveKPIs.gwp.yoy}% 同比
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>目标: {mockExecutiveKPIs.gwp.target}</span>
            <span className="text-emerald-700 font-semibold">达成率 {mockExecutiveKPIs.gwp.completionRate}%</span>
          </div>
        </div>

        {/* FYP */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.fyp.title}</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.fyp.value}</span>
            <span className="text-xs text-slate-500">{mockExecutiveKPIs.fyp.unit}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{mockExecutiveKPIs.fyp.yoy}% 同比
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>10年期及以上: <span className="text-slate-800 font-bold">68.4%</span></span>
            <span className="text-blue-600 font-semibold">达成率 {mockExecutiveKPIs.fyp.completionRate}%</span>
          </div>
        </div>

        {/* VNB */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.vnb.title}</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.vnb.value}</span>
            <span className="text-xs text-slate-500">{mockExecutiveKPIs.vnb.unit}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{mockExecutiveKPIs.vnb.yoy}% 同比
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>价值率 (Margin): <span className="text-emerald-700 font-bold">31.5%</span></span>
            <span className="text-blue-600 font-semibold">超额达成</span>
          </div>
        </div>

        {/* Persistency */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{mockExecutiveKPIs.persistency13M.title}</span>
            <span className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
              <Shield className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{mockExecutiveKPIs.persistency13M.value}</span>
            <span className="text-xs text-slate-500">{mockExecutiveKPIs.persistency13M.unit}</span>
            <span className="text-xs font-bold text-rose-600 flex items-center ml-auto">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {mockExecutiveKPIs.persistency13M.yoy}%
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>25个月继续率: <span className="text-slate-800 font-bold">88.2%</span></span>
            <span className="text-amber-700 font-semibold">品质重点监控</span>
          </div>
        </div>
      </div>

      {/* Main Charts: Monthly Trajectory vs Budget & Channel Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <BarChart2 className="w-4 h-4 mr-1.5 text-blue-600" />
                月度首年期交 (FYP) 达成走势与新业务价值率
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">实际达成 vs 年初精算预算基准线</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center text-blue-600">
                <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></span>
                实际FYP (万元)
              </span>
              <span className="flex items-center text-slate-400">
                <span className="w-3 h-0.5 bg-slate-400 mr-1"></span>
                目标预算
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="fypGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`¥${Number(val).toLocaleString()} 万元`, '保费']}
                />
                <Area type="monotone" dataKey="实际FYP" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#fypGradient)" />
                <Line type="monotone" dataKey="目标预算" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Channel Mix Pie */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <PieIcon className="w-4 h-4 mr-1.5 text-amber-500" />
              四大销售渠道保费贡献结构
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">个险为价值核心，银保贡献规模支撑</p>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelMixData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {channelMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`¥${(Number(val) / 10000).toFixed(2)} 亿元`, '保费贡献']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            {channelMixData.map((ch, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }}></span>
                  <span className="text-slate-700 font-medium">{ch.name}</span>
                </div>
                <span className="text-slate-900 font-mono font-bold">
                  ¥{(ch.value / 10000).toFixed(1)}亿 ({ch.share}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Mix Breakdown & Margins */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
              主打险种结构、新业务价值率与客群偏好拆解
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              增额寿与养老年金合计占总期交保费 70.2%，重疾险向高额多次给付结构化转型
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onOpenCopilotWithTopic('险种结构转型分析：如何加大分红险与品质养老年金对冲低利率风险？')}
              className="text-blue-600 hover:text-blue-700 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 font-semibold flex items-center space-x-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>险种结构AI策略建议</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold">
              <tr>
                <th className="py-3 px-3">险种分类 / 代表性产品</th>
                <th className="py-3 px-3">首年期交 (FYP)</th>
                <th className="py-3 px-3">保费占比</th>
                <th className="py-3 px-3">新业务价值率 (VNB Margin)</th>
                <th className="py-3 px-3">同比增长率</th>
                <th className="py-3 px-3">高管战略定位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockProducts.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{prod.name}</div>
                    <div className="text-xs text-blue-600 font-medium">{prod.category}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-slate-900 font-bold text-sm">
                      ¥{(prod.fyp / 10000).toFixed(2)} 亿元
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${prod.share}%` }}></div>
                      </div>
                      <span className="font-mono font-medium">{prod.share}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {prod.vnbMargin}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`font-bold ${prod.yoy >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {prod.yoy >= 0 ? `+${prod.yoy}%` : `${prod.yoy}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-xs text-slate-600">
                    {prod.category === '寿险' && '主力基本盘，需严控利差损并逐步向分红增额寿切换'}
                    {prod.category === '年金险' && '战略核心增长极，绑定康养社区入住权益加速拓客'}
                    {prod.category === '重疾险' && '高价值保障底座，主推家庭单加保与多次给付'}
                    {prod.category === '医疗险' && '低门槛引流利器，快速建立客户信任与高客圈层'}
                    {prod.category === '分红投连' && '战略试点新品，客户与公司利益共享，抵御降息'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Branch Performance Red/Black Leaderboard */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Building className="w-4 h-4 mr-1.5 text-blue-600" />
              全国主力分公司战力排行榜 (对标红黑榜)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              衡量 FYP达成进度、13M继续率、家庭加保率及队伍活动率综合健康度
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">更新时间: 今日 05:00 准实时切片</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold">
              <tr>
                <th className="py-3 px-3">排名</th>
                <th className="py-3 px-3">分公司机构 / 负责人</th>
                <th className="py-3 px-3">首年期交 (实际/目标)</th>
                <th className="py-3 px-3">达成率进度</th>
                <th className="py-3 px-3">13M继续率</th>
                <th className="py-3 px-3">家庭加保率</th>
                <th className="py-3 px-3">有效人力</th>
                <th className="py-3 px-3">健康评级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockBranches.map((br) => (
                <tr key={br.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-3">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        br.rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : br.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : br.rank === 3
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {br.rank}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900">{br.name}</div>
                    <div className="text-xs text-slate-500">总指挥: {br.director}</div>
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="text-slate-900 font-bold">¥{(br.actualFYP / 10000).toFixed(2)}亿</span>
                    <span className="text-slate-400 text-xs"> / ¥{(br.targetFYP / 10000).toFixed(1)}亿</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            br.achievementRate >= 100 ? 'bg-emerald-500' : br.achievementRate >= 90 ? 'bg-blue-600' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, br.achievementRate)}%` }}
                        ></div>
                      </div>
                      <span className={`font-bold ${br.achievementRate >= 100 ? 'text-emerald-600' : br.achievementRate >= 90 ? 'text-blue-600' : 'text-rose-600'}`}>
                        {br.achievementRate}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        br.persistency13M >= 93
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : br.persistency13M >= 90
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {br.persistency13M}%
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-blue-700 font-semibold">{br.familyAddonRate}%</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-800 font-medium">
                    {br.activeAgents.toLocaleString()} 人
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        br.status === 'top'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : br.status === 'normal'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {br.status === 'top' ? '🌟 红榜标杆' : br.status === 'normal' ? '稳健达标' : '⚠️ 黑榜预警'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
