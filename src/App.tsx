import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  Sliders,
  Sparkles,
  Shield,
  Layers,
  Flame,
  Bot,
  MessageSquare,
  Activity,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { BranchRegion, TimeRange } from './types';
import { Header } from './components/Header';
import { StrategicDiagnosticBanner } from './components/ai/StrategicDiagnosticBanner';
import { CustomerOverview } from './components/customer/CustomerOverview';
import { PerformanceDashboard } from './components/performance/PerformanceDashboard';
import { AgencyDashboard } from './components/agency/AgencyDashboard';
import { DecisionSandbox } from './components/decision/DecisionSandbox';
import { ExecutiveAICopilot } from './components/ai/ExecutiveAICopilot';
import { DataProvider, useInsuranceData } from './context/DataContext';
import { DataManagementModal } from './components/data/DataManagementModal';

function AppContent() {
  const { data } = useInsuranceData();
  const [activeTab, setActiveTab] = useState<'customer' | 'performance' | 'agency' | 'decision'>('customer');
  const [timeRange, setTimeRange] = useState<TimeRange>('本月 MTD');
  const [selectedBranch, setSelectedBranch] = useState<BranchRegion>('全国全系统');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState<string | undefined>(undefined);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  const handleOpenCopilotWithTopic = (topic: string) => {
    setCopilotInitialQuery(topic);
    setIsCopilotOpen(true);
  };

  const navTabs = [
    {
      id: 'customer',
      label: '客户经营全景 (核心)',
      badge: '重点深耕',
      icon: Users,
      desc: '客群分层 · 加保转化 · 13M退保预警 · KYC策略',
    },
    {
      id: 'performance',
      label: '业绩与险种大盘',
      badge: '价值看板',
      icon: TrendingUp,
      desc: 'FYP/NBEV达成 · 险种结构 · 分公司红黑榜',
    },
    {
      id: 'agency',
      label: '营销人力与产能',
      badge: '队伍活力',
      icon: Activity,
      desc: '队伍金字塔 · MDRT绩优 · 活动率 · 新人留存',
    },
    {
      id: 'decision',
      label: '决策沙盘与督战令',
      badge: 'AI精算仿真',
      icon: Sliders,
      desc: '参数调节模拟 · 边际ROI推演 · 督办下达',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* 1. Header Bar */}
      <Header
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        isCustomData={data.isCustomData}
        onOpenDataManager={() => setIsDataManagerOpen(true)}
        onOpenAICopilot={() => {
          setCopilotInitialQuery(undefined);
          setIsCopilotOpen(true);
        }}
      />

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2. Executive Strategic AI Diagnostic Banner */}
        <StrategicDiagnosticBanner
          timeRange={timeRange}
          selectedBranch={selectedBranch}
          currentTab={activeTab}
          onOpenActionSandbox={() => setActiveTab('decision')}
          onOpenCopilotWithTopic={handleOpenCopilotWithTopic}
        />

        {/* 3. Primary Top Navigation Segmented Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`p-2 rounded-xl transition-colors ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-900'}`}>{tab.label}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <p className={`text-[11px] mt-2.5 line-clamp-1 font-medium ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>{tab.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 4. Tab Views Content */}
        <div className="transition-all duration-300">
          {activeTab === 'customer' && (
            <CustomerOverview
              timeRange={timeRange}
              selectedBranch={selectedBranch}
              onOpenCopilotWithTopic={handleOpenCopilotWithTopic}
            />
          )}

          {activeTab === 'performance' && (
            <PerformanceDashboard
              timeRange={timeRange}
              selectedBranch={selectedBranch}
              onOpenCopilotWithTopic={handleOpenCopilotWithTopic}
            />
          )}

          {activeTab === 'agency' && (
            <AgencyDashboard
              timeRange={timeRange}
              selectedBranch={selectedBranch}
              onOpenCopilotWithTopic={handleOpenCopilotWithTopic}
            />
          )}

          {activeTab === 'decision' && (
            <DecisionSandbox
              timeRange={timeRange}
              selectedBranch={selectedBranch}
              onOpenCopilotWithTopic={handleOpenCopilotWithTopic}
            />
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5">
        <button
          onClick={() => setIsDataManagerOpen(true)}
          className="px-3.5 py-3 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-2xl shadow-lg border border-slate-200 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold hidden sm:inline">导入/导出数据</span>
        </button>

        <button
          onClick={() => {
            setCopilotInitialQuery(undefined);
            setIsCopilotOpen(true);
          }}
          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center space-x-2.5 group border border-slate-700 cursor-pointer"
        >
          <span className="p-1 rounded-lg bg-blue-600 text-white">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold pr-0.5 hidden sm:inline">高管战略AI助理</span>
        </button>
      </div>

      {/* Executive AI Copilot Slide-over Drawer */}
      <ExecutiveAICopilot
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        timeRange={timeRange}
        selectedBranch={selectedBranch}
        initialQuery={copilotInitialQuery}
      />

      {/* Data Management & Import/Export Modal */}
      <DataManagementModal
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
