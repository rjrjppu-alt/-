import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Send,
  RefreshCw,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileText,
  Clock,
  Building,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import {
  BranchRegion,
  DecisionSimulationInput,
  SimulationResult,
  StrategicDirective,
  TimeRange,
} from '../../types';
import { useInsuranceData } from '../../context/DataContext';

interface DecisionSandboxProps {
  timeRange: TimeRange;
  selectedBranch: BranchRegion;
  onOpenCopilotWithTopic: (topic: string) => void;
}

export const DecisionSandbox: React.FC<DecisionSandboxProps> = ({
  timeRange,
  selectedBranch,
  onOpenCopilotWithTopic,
}) => {
  const { data: contextData } = useInsuranceData();
  const [params, setParams] = useState<DecisionSimulationInput>({
    addonIncentiveRate: 15, // 加保专项激励投入 15%
    hightNetWorthServiceTier: '全家康养社区免抵押直通',
    newAgentSubsidyBoost: 20, // 新人津贴上浮 20%
    orphanPolicyServiceBudget: 500, // 孤儿单基金 500万元
    elderlyPensionPushWeight: 25, // 养老年金权重 25%
  });

  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult>({
    executiveSummary: '模拟方案【加保专项激励 +15%, 新人津贴上浮 +20%, 全家康养直通权益, 孤儿单基金500万】精算预演：',
    predictedFYP: '14.82 亿元 (+18.9%)',
    predictedNBEV: '4.85 亿元 (+23.7%)',
    predictedRetentionRate: '93.6% (+1.8pct 回升至达标线以上)',
    activeAgentGrowth: '+1,850 人 (活动率提升至 74.2%)',
    crossSellRate: '36.8% (老客二次加保率提升 5.6pct)',
    roiEstimate: '1 : 4.8 (每投入1元运营激励产生4.8元首年期交边际利润)',
    keyTradeoffs: [
      '短期首年销售综合费用率上升约 1.1%，但在册13M继续率回升至93.6%，带来长周期稳态续期现金流。',
      '需对新人津贴设立“月度有效面访15次+转正考核”双阀门，防止虚假增员挂单骗补。',
    ],
    recommendation: '该决策预期综合收益显著，强烈建议在总公司Q3经营例会上正式立项并在主力分公司推进。',
  });

  // Directives State
  const [directives, setDirectives] = useState<StrategicDirective[]>(contextData.directives);

  React.useEffect(() => {
    setDirectives(contextData.directives);
  }, [contextData.directives]);
  const [showNewDirectiveModal, setShowNewDirectiveModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBranch, setNewBranch] = useState('全国各分公司');
  const [newContent, setNewContent] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newPriority, setNewPriority] = useState<'特急' | '紧急' | '常规'>('紧急');

  const runSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/ai/scenario-simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameters: params,
          baseMetrics: {
            currentFYP: '12.46 亿元',
            currentNBEV: '3.92 亿元',
            current13M: '91.8%',
            currentAddonRate: '31.2%',
            currentActiveAgents: 17395,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.simulation) {
        setResult(data.simulation);
      }
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: StrategicDirective = {
      id: `dir_${Date.now()}`,
      title: newTitle,
      category: '客户经营',
      targetBranch: newBranch,
      deadline: '2026-09-30',
      priority: newPriority,
      initiator: '总裁室 / 战略决策委员会',
      content: newContent,
      expectedGoal: newGoal || '全面达成Q3经营与继续率指标',
      progress: 0,
      status: '已下达',
      createdAt: new Date().toLocaleDateString('zh-CN'),
    };

    setDirectives([item, ...directives]);
    setShowNewDirectiveModal(false);
    setNewTitle('');
    setNewContent('');
    setNewGoal('');
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Decision Simulation Sandbox */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Sliders className="w-4 h-4 mr-1.5 text-blue-600" />
                保险经营战略沙盘模拟器 (AI Actuarial Sandbox)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                精算弹性模型
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              实时调整加保资源、高客权益、新人津贴及孤儿单预算，运用大模型与寿险经营动力学模拟未来保费与继续率走向
            </p>
          </div>

          <button
            onClick={runSimulation}
            disabled={simulating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
          >
            {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
            <span>{simulating ? '正在进行精算仿真推演...' : '启动沙盘精算推演'}</span>
          </button>
        </div>

        {/* Input Parameters Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          {/* Addon Incentive Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">① 老客加保专项激励增投</span>
              <span className="font-mono text-blue-700 font-bold">+{params.addonIncentiveRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.addonIncentiveRate}
              onChange={(e) => setParams({ ...params, addonIncentiveRate: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>基准(0%)</span>
              <span>积极(+25%)</span>
              <span>饱和投入(+50%)</span>
            </div>
          </div>

          {/* New Agent Subsidy */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">② 新人首年转正津贴上浮</span>
              <span className="font-mono text-blue-700 font-bold">+{params.newAgentSubsidyBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={params.newAgentSubsidyBoost}
              onChange={(e) => setParams({ ...params, newAgentSubsidyBoost: Number(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>常规(0%)</span>
              <span>稳健(+20%)</span>
              <span>强力吸纳(+40%)</span>
            </div>
          </div>

          {/* Orphan Policy Budget */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">③ 孤儿单专管员关怀保全基金</span>
              <span className="font-mono text-emerald-700 font-bold">{params.orphanPolicyServiceBudget} 万元</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={params.orphanPolicyServiceBudget}
              onChange={(e) => setParams({ ...params, orphanPolicyServiceBudget: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>100万</span>
              <span>500万 (建议)</span>
              <span>1000万</span>
            </div>
          </div>

          {/* High Net Worth Service Tier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">④ 高客增值服务体系配置</span>
              <span className="text-[11px] text-slate-500">{params.hightNetWorthServiceTier}</span>
            </div>
            <select
              value={params.hightNetWorthServiceTier}
              onChange={(e) => setParams({ ...params, hightNetWorthServiceTier: e.target.value as any })}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value="基础体检">基础体检套餐 (标准版)</option>
              <option value="三甲绿通+VIP私享">三甲名医绿通 + VIP私享沙龙</option>
              <option value="全家康养社区免抵押直通">全家康养社区保证入住直通函 (顶配)</option>
            </select>
          </div>

          {/* Pension Push Weight */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="font-semibold text-slate-900">⑤ 养老年金与分红险主推权重</span>
              <span className="font-mono text-purple-700 font-bold">+{params.elderlyPensionPushWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={params.elderlyPensionPushWeight}
              onChange={(e) => setParams({ ...params, elderlyPensionPushWeight: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>均衡(0%)</span>
              <span>重点推进(+20%)</span>
              <span>战略倾斜(+40%)</span>
            </div>
          </div>
        </div>

        {/* Simulation Output Cards */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-700 font-bold mb-1 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                精算仿真结论执行摘要
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {result.executiveSummary}
              </p>
            </div>

            {/* 4 Projected Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">预测首年期交 (FYP)</div>
                <div className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {result.predictedFYP}
                </div>
                <div className="text-[11px] text-blue-600 mt-0.5 font-medium">较基准大幅增厚</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">预测新业务价值 (NBEV)</div>
                <div className="text-base sm:text-lg font-bold text-emerald-700 mt-1">
                  {result.predictedNBEV}
                </div>
                <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">高价值产品联动</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">预测13M继续率</div>
                <div className="text-base sm:text-lg font-bold text-blue-700 mt-1">
                  {result.predictedRetentionRate}
                </div>
                <div className="text-[11px] text-blue-600 mt-0.5 font-medium">有效遏制退保</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">精算综合ROI评估</div>
                <div className="text-base sm:text-lg font-bold text-purple-700 mt-1">
                  {result.roiEstimate}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-medium">边际投入产出卓越</div>
              </div>
            </div>

            {/* Tradeoffs & Strategic Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-rose-700 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  精算风险与潜在权衡 (Trade-offs)
                </span>
                <ul className="space-y-1.5 text-slate-600">
                  {result.keyTradeoffs.map((t, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-rose-500 mr-1.5">•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  高管决策综合裁定建议
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {result.recommendation}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setShowNewDirectiveModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>一键将此模拟方案转化为高管督战令</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Strategic Directives & Dispatch Center */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-blue-600" />
              高管督办通报与战略督战令下发大厅
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              总公司领导向各分公司、营业部下达的重点客户战役、品质整改与资源赋能督办通报
            </p>
          </div>

          <button
            onClick={() => setShowNewDirectiveModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>新建督战令</span>
          </button>
        </div>

        {/* Directives List */}
        <div className="space-y-3">
          {directives.map((dir) => (
            <div
              key={dir.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dir.priority === '特急'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : dir.priority === '紧急'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {dir.priority}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{dir.title}</span>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-500">
                    发令部门: <span className="text-slate-800 font-medium">{dir.initiator}</span>
                  </span>
                  <span className="text-slate-500">
                    截止: <span className="text-slate-800 font-medium">{dir.deadline}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      dir.status === '已达成'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : dir.status === '需督导'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {dir.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-medium">
                {dir.content}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  目标: <span className="text-blue-700 font-semibold">{dir.expectedGoal}</span> · 接收机构: <span className="text-slate-800 font-medium">{dir.targetBranch}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span>达成进度: <span className="text-amber-600 font-bold">{dir.progress}%</span></span>
                  <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${dir.progress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Directive Modal */}
      {showNewDirectiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <Send className="w-4 h-4 mr-1.5 text-blue-600" />
              下达高管级督导督战指令
            </h3>

            <form onSubmit={handleCreateDirective} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">指令标题</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：关于开展2026年Q3高客家庭加保与13M继续率保全攻坚令"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">接收机构</label>
                  <input
                    type="text"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">紧急程度</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="特急">特急 (24小时内响应)</option>
                    <option value="紧急">紧急 (48小时内推进)</option>
                    <option value="常规">常规</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">指令正文与执行要求</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="明确主要抓手、涉及客群、责任分总及具体支持举措..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">考核预期目标</label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="例如：13M继续率回升至93.5%，家庭加保保费突破1.2亿元"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewDirectiveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  立即正式下达
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
