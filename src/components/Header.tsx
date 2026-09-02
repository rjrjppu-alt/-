import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Sparkles,
  TrendingUp,
  Volume2,
  Maximize2,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Database,
} from 'lucide-react';
import { BranchRegion, TimeRange } from '../types';
import { mockLiveTicker } from '../data/mockData';

interface HeaderProps {
  timeRange: TimeRange;
  setTimeRange: (t: TimeRange) => void;
  selectedBranch: BranchRegion;
  setSelectedBranch: (b: BranchRegion) => void;
  onOpenAIChat?: () => void;
  onOpenAICopilot?: () => void;
  onOpenDataManager?: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
  isCustomData?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  timeRange,
  setTimeRange,
  selectedBranch,
  setSelectedBranch,
  onOpenAIChat,
  onOpenAICopilot,
  onOpenDataManager,
  onRefreshData,
  isRefreshing = false,
  isCustomData = false,
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('zh-CN', { hour12: false }));

  const handleOpenAI = onOpenAIChat || onOpenAICopilot || (() => {});

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    }, 1000);

    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % mockLiveTicker.length);
    }, 4500);

    return () => {
      clearInterval(timeInterval);
      clearInterval(tickerInterval);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="border-b border-slate-200/90 bg-white sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Ticker */}
      <div className="bg-slate-900 px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="flex items-center text-blue-400 font-semibold whitespace-nowrap">
            <Volume2 className="w-3.5 h-3.5 mr-1" />
            实时战报播报:
          </span>
          <div className="text-slate-200 truncate font-medium">
            {mockLiveTicker[tickerIndex]}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4 text-slate-400">
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            实时行情同步: <span className="text-slate-200 font-mono ml-1 font-semibold">{currentTime}</span>
          </span>
          <span className="flex items-center text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            核心承保系统正常
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                保意决 <span className="text-blue-600 font-normal ml-2 text-base">| 集团高管经营决策看板</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                实时数据更新中
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              数据口径: 准实时(5分钟切片) · 核心聚焦: <span className="text-blue-700 font-semibold">客户全生命周期精细化经营与继续率风控</span>
            </p>
          </div>
        </div>

        {/* Global Controls: Time Range & Branch selector & AI Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 flex items-center text-xs">
            {(
              [
                { id: 'today', label: '今日实时' },
                { id: 'mtd', label: '本月 MTD' },
                { id: 'qtd', label: '本季 QTD' },
                { id: 'ytd', label: '本年 YTD' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                id={`time-tab-${item.id}`}
                onClick={() => setTimeRange(item.id as TimeRange)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  timeRange === item.id || (item.id === 'mtd' && timeRange === '本月 MTD') || (item.id === 'today' && timeRange === '今日实时') || (item.id === 'qtd' && timeRange === '本季 QTD') || (item.id === 'ytd' && timeRange === '本年 YTD')
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Branch Filter */}
          <div className="relative">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-xs">
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <select
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value as BranchRegion)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer pr-2"
              >
                <option value="全国全系统">全国总公司大盘</option>
                <option value="华东大区">华东大区 (沪苏浙)</option>
                <option value="华南大区">华南大区 (粤闽)</option>
                <option value="华北大区">华北大区 (京津冀)</option>
                <option value="西南大区">西南大区 (川渝)</option>
                <option value="华中大区">华中大区 (鄂湘)</option>
              </select>
            </div>
          </div>

          {/* Refresh Action */}
          {onRefreshData && (
            <button
              id="btn-refresh"
              onClick={onRefreshData}
              title="刷新全量指标"
              className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          {/* Data Import / Export Button */}
          {onOpenDataManager && (
            <button
              id="btn-open-data-manager"
              onClick={onOpenDataManager}
              title="数据管理：导入/导出 Excel 及填报模板"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                isCustomData
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">数据导入/导出</span>
              {isCustomData && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>
          )}

          {/* Full Screen */}
          <button
            id="btn-fullscreen"
            onClick={toggleFullScreen}
            title="全屏投屏模式"
            className="hidden sm:inline-flex p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* AI Decision Assistant Button */}
          <button
            id="btn-open-ai-copilot"
            onClick={handleOpenAI}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>高管 AI 智囊</span>
          </button>
        </div>
      </div>
    </header>
  );
};
