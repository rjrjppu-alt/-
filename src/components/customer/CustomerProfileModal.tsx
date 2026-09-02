import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  FileText,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Heart,
  Briefcase,
  Phone,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Send,
  Loader2,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { CustomerProfile } from '../../types';

interface CustomerProfileModalProps {
  customer: CustomerProfile | null;
  onClose: () => void;
  onAssignIntervention?: (customerId: string, action: string) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  onClose,
  onAssignIntervention,
}) => {
  if (!customer) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'ai_strategy' | 'family'>('overview');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiStrategy, setAIStrategy] = useState<{
    clientLevel: string;
    lifecycleStage: string;
    gapDiagnosis: string;
    recommendedProducts: {
      productName: string;
      targetCoverage: string;
      strategicReason: string;
    }[];
    actionPlan: string[];
    churnRiskPrevention: string;
  } | null>(null);

  const [assignedToast, setAssignedToast] = useState(false);

  const handleGenerateAIStrategy = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai/customer-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer }),
      });
      const data = await res.json();
      if (data.success && data.strategy) {
        setAIStrategy(data.strategy);
        setActiveTab('ai_strategy');
      }
    } catch (e) {
      console.error('Error generating strategy:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDispatch = () => {
    onAssignIntervention?.(customer.id, '已指派分公司高管协同金牌专管员跟进加保与保全');
    setAssignedToast(true);
    setTimeout(() => setAssignedToast(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{customer.name}</h3>
                <span className="text-xs text-slate-300">({customer.gender} · {customer.age}岁)</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                  {customer.tier}
                </span>
                {customer.churnRiskScore > 70 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    退保高危 ({customer.churnRiskScore}分)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {customer.city} · 资产预估: {customer.assetsEst} · 服务代理人: {customer.agentName} ({customer.agentStatus})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex space-x-6 text-xs sm:text-sm font-medium">
            {[
              { id: 'overview', label: '客户全景KYC' },
              { id: 'policies', label: `现有保单资产 (${customer.policies.length}张)` },
              { id: 'family', label: '家庭保单谱系' },
              { id: 'ai_strategy', label: 'AI 加保与维系策略 ✨' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 border-b-2 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* AI One-Click Generate Trigger */}
          <button
            onClick={handleGenerateAIStrategy}
            disabled={loadingAI}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            {loadingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{aiStrategy ? '重新生成AI加保策略' : '智能生成加保策略'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Toast */}
          {assignedToast && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center space-x-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>督办指令已成功派发至所属分公司营业部，金牌专管员与主管将在24小时内启动面访！</span>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top KPI row for this customer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">总年缴保费</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    ¥{(customer.totalAnnualPremium / 10000).toFixed(1)} 万元/年
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-0.5">累计交清及在交保单</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">家庭保单覆盖</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">
                    {customer.insuredMembersCount} / {customer.familyMembersCount} 人
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">覆盖率 {(customer.insuredMembersCount / customer.familyMembersCount * 100).toFixed(0)}%</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">保障评分 / 缺口</div>
                  <div className="text-lg font-bold text-amber-600 mt-1">
                    {customer.protectionScore} <span className="text-xs text-slate-400 font-normal">/ 100 分</span>
                  </div>
                  <div className="text-xs text-amber-700 font-medium mt-0.5">存在养老与信托缺口</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-medium">潜在加保空间 (FYP)</div>
                  <div className="text-lg font-bold text-blue-600 mt-1">
                    ¥{customer.potentialFYP} 万元
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">基于资产与缺口测算</div>
                </div>
              </div>

              {/* Radar Chart & Gap Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Chart */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center">
                  <h4 className="text-xs font-bold text-slate-800 mb-2 self-start flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    家庭六维保障全景雷达分析
                  </h4>
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={customer.radarData}>
                        <PolarGrid stroke="#cbd5e1" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                        <Radar
                          name="现有配置"
                          dataKey="actual"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.35}
                        />
                        <Radar
                          name="建议配置"
                          dataKey="recommended"
                          stroke="#f59e0b"
                          fill="#f59e0b"
                          fillOpacity={0.15}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center space-x-4 text-xs mt-1 font-semibold">
                    <span className="flex items-center text-blue-600">
                      <span className="w-3 h-3 bg-blue-600 rounded-sm mr-1"></span>
                      现有保障实际评分
                    </span>
                    <span className="flex items-center text-amber-600">
                      <span className="w-3 h-3 bg-amber-500 rounded-sm mr-1"></span>
                      高客标准建议配置
                    </span>
                  </div>
                </div>

                {/* Gap analysis & Recent Interactivity */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      保障缺口核心诊断
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {customer.gapSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      近期关键服务触点
                    </h4>
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      {customer.recentInteraction}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">客群标签:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customer.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 font-medium text-[10px] rounded-md border border-blue-200">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleDispatch}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-md shadow-blue-500/20 transition-all shrink-0 ml-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>高管督办派单</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>名下在管保单列表 (共 {customer.policies.length} 份)</span>
                <span className="font-bold text-slate-800">总现金价值累积: ¥{(customer.policies.reduce((acc, p) => acc + p.cashValue, 0) / 10000).toFixed(1)} 万元</span>
              </div>

              <div className="space-y-3">
                {customer.policies.map((pol) => (
                  <div
                    key={pol.policyNo}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900">{pol.productName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {pol.productType}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pol.status === '有效'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : pol.status === '宽限期'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {pol.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                        <span>保单号: <span className="text-slate-700 font-mono font-medium">{pol.policyNo}</span></span>
                        <span>被保险人: <span className="text-slate-800 font-medium">{pol.insuredName} ({pol.relation})</span></span>
                        <span>生效日期: <span className="text-slate-700">{pol.effectiveDate}</span></span>
                        <span>缴费期: <span className="text-slate-700">{pol.payPeriod}</span></span>
                      </div>
                    </div>

                    <div className="flex md:flex-col md:items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500">年缴保费: </span>
                        <span className="text-slate-900 font-bold text-sm">¥{(pol.annualPremium / 10000).toFixed(1)}万</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        保额: <span className="text-slate-800 font-semibold">¥{(pol.sumAssured / 10000).toFixed(0)}万</span> · 现价: ¥{(pol.cashValue / 10000).toFixed(1)}万
                      </div>
                      {pol.hasLoan && (
                        <div className="text-rose-600 text-xs font-bold flex items-center mt-1">
                          <AlertTriangle className="w-3 h-3 mr-1 text-rose-500" />
                          已借款 ¥{(pol.loanAmount! / 10000).toFixed(1)}万 (占现价 {((pol.loanAmount! / pol.cashValue) * 100).toFixed(0)}%)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  家庭成员保障覆盖全景图 (户主: {customer.name})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* 本人 */}
                  <div className="p-3.5 bg-white rounded-xl border border-blue-300 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{customer.name} (本人)</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">已充分覆盖</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">年龄: {customer.age}岁 · 家庭经济支柱</p>
                    <div className="mt-2 text-xs text-slate-700 space-y-0.5">
                      <div>• 终身增额寿险 (保额1500万)</div>
                      <div>• 颐享金生年金险 (保额380万)</div>
                      <div>• 全球高端医疗直付 (保额2000万)</div>
                    </div>
                  </div>

                  {/* 配偶 */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">配偶 (王舒雅 45岁)</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded border border-amber-200">重疾覆盖/缺养老</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">全职主妇 / 家族资产共有人</p>
                    <div className="mt-2 text-xs text-slate-700 space-y-0.5">
                      <div>• 终身多次给付重疾险 (保额300万)</div>
                      <div className="text-amber-700 font-semibold">• 缺口: 专属女性养老与增额信托</div>
                    </div>
                  </div>

                  {/* 子女 */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">长子 (林天成 16岁)</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded border border-blue-200">教育金规划中</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">高中阶段 / 拟海外留学</p>
                    <div className="mt-2 text-xs text-slate-700 space-y-0.5">
                      <div>• 少儿未来领袖教育金 (保额240万)</div>
                      <div className="text-amber-700 font-semibold">• 缺口: 海外百万医疗与意外保障</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai_strategy' && (
            <div className="space-y-4">
              {!aiStrategy && !loadingAI && (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Sparkles className="w-10 h-10 text-blue-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-900">尚未生成针对该客户的专属 AI 加保策略</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    基于客户KYC画像、保单现金价值、家庭保障缺口及退保风险模型，一键输出针对性的加保险种组合与高管拜访脚本。
                  </p>
                  <button
                    onClick={handleGenerateAIStrategy}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    立即启动 AI 智能精算诊断
                  </button>
                </div>
              )}

              {loadingAI && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-900">正在调取 Gemini 3.7 模型与寿险精算框架生成方案...</p>
                  <p className="text-xs text-slate-500 mt-1">分析保额缺口 · 匹配产品条款 · 设计定制化高客面访话术</p>
                </div>
              )}

              {aiStrategy && (
                <div className="space-y-4 animate-fade-in">
                  {/* Diagnosis summary */}
                  <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 text-xs text-blue-800 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{aiStrategy.clientLevel} · {aiStrategy.lifecycleStage}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                      {aiStrategy.gapDiagnosis}
                    </p>
                  </div>

                  {/* Recommended Products */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center">
                      <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      精准匹配加保产品组合推荐
                    </h4>

                    {aiStrategy.recommendedProducts.map((prod, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all space-y-1 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-blue-700">
                            {prod.productName}
                          </span>
                          <span className="text-xs text-amber-700 font-semibold mt-0.5 sm:mt-0">
                            建议结构: {prod.targetCoverage}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="text-slate-400 font-medium">推荐逻辑: </span>
                          {prod.strategicReason}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Step Action Plan */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      高管/主管级督导拜访三步法脚本
                    </h4>
                    <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
                      {aiStrategy.actionPlan.map((plan, i) => (
                        <li key={i} className="leading-relaxed">{plan}</li>
                      ))}
                    </ol>

                    <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-rose-700 font-medium">
                      <span className="font-bold text-rose-600">🛡️ 流失与退保防范对策: </span>
                      {aiStrategy.churnRiskPrevention}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">客户编号: <span className="font-mono text-slate-800 font-semibold">{customer.id}</span></span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleDispatch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>下发督办工单</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
