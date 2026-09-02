import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Activity,
  UserCheck,
  UserPlus,
  Flame,
  ArrowUpRight,
  Shield,
  Layers,
  Sparkles,
  DollarSign,
  ChevronRight,
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
  AreaChart,
  Area,
} from 'recharts';
import { BranchRegion, TimeRange } from '../../types';
import { useInsuranceData } from '../../context/DataContext';

interface AgencyDashboardProps {
  timeRange: TimeRange;
  selectedBranch: BranchRegion;
  onOpenCopilotWithTopic: (topic: string) => void;
}

export const AgencyDashboard: React.FC<AgencyDashboardProps> = ({
  timeRange,
  selectedBranch,
  onOpenCopilotWithTopic,
}) => {
  const { data: contextData } = useInsuranceData();
  const data = contextData.agencyWorkforce;

  return (
    <div className="space-y-6">
      {/* Workforce Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agency Headcount */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">在册个险营销总人力</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {data.totalHeadcount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">人</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +5.4% 环比
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>月度新入职增员: <span className="text-slate-800 font-bold">{data.newRecruitsMTD}人</span></span>
            <span className="text-blue-600 font-semibold">有效人力 {data.activeHeadcount.toLocaleString()}</span>
          </div>
        </div>

        {/* Active Ratio */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">有效人力活动率 (核心健康度)</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{data.activeRate}%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +3.2pct 同比
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>行业平均基准: 52.0%</span>
            <span className="text-emerald-700 font-semibold">跑赢行业 +18pct</span>
          </div>
        </div>

        {/* MDRT / High Performers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">MDRT / COT / TOT 顶尖绩优</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {data.mdrtCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">人</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +24.8% 同比
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>队伍绩优占比: <span className="text-slate-800 font-bold">{data.mdrtProportion}%</span></span>
            <span className="text-amber-700 font-semibold">高客经营主力军</span>
          </div>
        </div>

        {/* Per Capita FYP Productivity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">活动人力人均期交产能 (PBE)</span>
            <span className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              ¥{(data.monthlyPerCapitaFYP / 10000).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">万元/人/月</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +16.4%
            </span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>人均件数: <span className="text-slate-800 font-bold">{data.monthlyPerCapitaCases} 件/月</span></span>
            <span className="text-blue-600 font-semibold">件均提升 2.1万</span>
          </div>
        </div>
      </div>

      {/* Workforce Structure Pyramid & Layer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Workforce Hierarchy Pyramid Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
                营销队伍层级金字塔与产能分布结构
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                高管需重点监控业务主管（团队长）的增员繁殖力与新兵破零留存
              </p>
            </div>
            <button
              onClick={() => onOpenCopilotWithTopic('分析当前营销队伍结构健康度及主管育成裂变策略')}
              className="text-xs text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 font-semibold flex items-center space-x-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 队伍诊断</span>
            </button>
          </div>

          <div className="space-y-3">
            {data.pyramidData.map((layer, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="h-5 w-5 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center border border-blue-200">
                      L{idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{layer.layer}</span>
                    <span className="text-xs text-slate-500 font-mono">
                      {layer.count.toLocaleString()} 人 ({((layer.count / data.totalHeadcount) * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-slate-600">
                      人均年收入: <span className="text-slate-900 font-bold">¥{(layer.avgIncome / 10000).toFixed(1)}万</span>
                    </span>
                    <span className="text-slate-600">
                      活动率: <span className="text-emerald-700 font-bold">{layer.activeRate}%</span>
                    </span>
                    <span className="text-slate-600">
                      保费贡献: <span className="text-blue-700 font-bold">{layer.fypShare}%</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${layer.fypShare * 2.8}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: New Agent Retention & Break-Zero Analysis */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <UserPlus className="w-4 h-4 mr-1.5 text-amber-600" />
              新人留存与首月破零漏斗
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">3M留存 68.4% · 6M留存 54.2%</p>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 mb-1.5 font-medium">
                  <span>新人首月破零开单率</span>
                  <span className="text-emerald-700 font-bold">78.5%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78.5%' }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 mb-1.5 font-medium">
                  <span>3个月新人留存率</span>
                  <span className="text-blue-700 font-bold">{data.newAgent3MRetention}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.newAgent3MRetention}%` }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between text-xs text-slate-700 mb-1.5 font-medium">
                  <span>6个月转正稳固率</span>
                  <span className="text-amber-800 font-bold">{data.newAgent6MRetention}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${data.newAgent6MRetention}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-700 space-y-1">
            <span className="text-blue-800 font-bold">💡 高管管理抓手:</span>
            <p className="leading-relaxed">
              针对新兵脱落风险，建议将“家庭保单检视话术”作为新人入职第2周通关实战必修课，以老客转介名单赋能新人快速成单。
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Activity Volume Funnel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center">
              <Activity className="w-4 h-4 mr-1.5 text-blue-600" />
              队伍周度外勤拜访量与出单闭环漏斗 (最近4周)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              客户面访 → 深度KYC画像建档 → 建议书方案制作 → 成功承保出单
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">当前周面访量突破 54,900 次</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyActivityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="visitCount" name="有效客户面访量" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="customerKYCCount" name="KYC深度建档量" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="proposalCount" name="计划书出具量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="closedPolicies" name="成功出单件数" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
