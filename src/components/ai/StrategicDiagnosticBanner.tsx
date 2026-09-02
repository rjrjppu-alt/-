import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, TrendingUp, ShieldAlert, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { BranchRegion, TimeRange } from '../../types';
import { useInsuranceData } from '../../context/DataContext';

interface StrategicDiagnosticBannerProps {
  timeRange: TimeRange;
  selectedBranch: BranchRegion;
  currentTab: string;
  onOpenActionSandbox?: () => void;
  onOpenCopilotWithTopic?: (topic: string) => void;
}

export const StrategicDiagnosticBanner: React.FC<StrategicDiagnosticBannerProps> = ({
  timeRange,
  selectedBranch,
  currentTab,
  onOpenActionSandbox,
  onOpenCopilotWithTopic,
}) => {
  const { data: contextData } = useInsuranceData();
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<{
    title: string;
    overallStatus: string;
    keyRisks: string[];
    keyOpportunities: string[];
    actionDirectives: string[];
    predictedImpact: string;
  } | null>(null);

  const fetchStrategicInsight = async () => {
    setLoading(true);
    try {
      const kpis = contextData.executiveKPIs;
      const workforce = contextData.agencyWorkforce;
      const res = await fetch('/api/ai/decision-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimension: currentTab === 'customer' ? '客户经营与继续率风控' : currentTab === 'performance' ? '业绩与险种价值大盘' : '人力队伍产能',
          currentFocus: `时段: ${timeRange.toUpperCase()}, 机构: ${selectedBranch}`,
          metrics: {
            gwp: `${kpis.gwp?.value || '42.85'} 亿元`,
            fyp: `${kpis.fyp?.value || '12.46'} 亿元`,
            persistency13M: `${kpis.persistency13M?.value || '91.8'}%`,
            familyAddonRate: `${kpis.familyAddonRate?.value || '31.2'}%`,
            hnwCount: `${kpis.hnwCount?.value || '42,680'}人`,
            orphanLapseRisk: `${kpis.orphanLapseRate?.value || '84.6'}%`,
            activeAgentRate: `${workforce.activeRate || '70.0'}%`,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.insight) {
        setInsight(data.insight);
      }
    } catch (e) {
      console.error('Failed to fetch AI diagnostic:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategicInsight();
  }, [timeRange, selectedBranch, currentTab]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md mb-6 relative overflow-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left column: AI title and overall status */}
        <div className="flex-1">
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-blue-400 border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              高管战略研判 · 智能简报
            </span>
            <span className="text-xs text-slate-400">
              已全量穿透 368.5万客户画像与保单流动数据
            </span>
            <button
              onClick={fetchStrategicInsight}
              disabled={loading}
              className="text-slate-400 hover:text-white p-1 text-xs transition-colors"
              title="重新计算AI诊断"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          <h3 className="text-lg font-bold text-white flex items-center">
            {insight ? insight.title : '客户经营深耕与保单继续率保全高管战略研判'}
          </h3>

          <p className="text-sm text-slate-300 mt-1.5 leading-relaxed font-normal">
            {insight ? insight.overallStatus : '规模与价值保费保持双位数增长，但13M继续率（91.8%）出现分化，中产家庭加保渗透率（31.2%）仍有超70%空间待释放。'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onOpenCopilotWithTopic?.('深度剖析当前客户加保与退保风险并出具高管督战令')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 hover:text-white flex items-center space-x-1.5 transition-all"
          >
            <span>向决策助理追问</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          </button>

          {onOpenActionSandbox && (
            <button
              onClick={onOpenActionSandbox}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>进入精算沙盘推演</span>
            </button>
          )}
        </div>
      </div>

      {/* Structured Key Points: Risks, Opportunities, Directives */}
      {insight && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800 text-xs">
          {/* Risks */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center text-rose-400 font-bold mb-2 text-sm">
              <ShieldAlert className="w-4 h-4 mr-1.5" />
              重点风险警示
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {insight.keyRisks.slice(0, 2).map((risk, idx) => (
                <li key={idx} className="flex items-start leading-relaxed">
                  <span className="text-rose-400 mr-2">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center text-emerald-400 font-bold mb-2 text-sm">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              高价值增长机会
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {insight.keyOpportunities.slice(0, 2).map((opp, idx) => (
                <li key={idx} className="flex items-start leading-relaxed">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span>{opp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Levers */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center text-blue-400 font-bold mb-2 text-sm">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              高管战略建议抓手
            </div>
            <p className="text-slate-300 leading-relaxed font-normal">
              {insight.actionDirectives[0] || '启动家庭保单年度检视专项战役，强化13M高危保单高管督导包保责任制。'}
            </p>
            <div className="mt-2 text-xs text-amber-400 font-medium">
              💡 {insight.predictedImpact}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
