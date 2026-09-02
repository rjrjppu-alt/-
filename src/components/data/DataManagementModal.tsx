import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Layers,
  ArrowRight,
  Database,
  Building2,
  Users,
  ShieldAlert,
  TrendingUp,
  X,
  FileDown,
  Sliders,
  Sparkles,
  Check,
} from 'lucide-react';
import { useInsuranceData } from '../../context/DataContext';
import { exportDashboardToExcel, exportSingleTableCSV } from '../../utils/excelDataExporter';
import { parseExcelOrCsvFile, ImportParsedResult } from '../../utils/excelDataImporter';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const { data, applyBulkImportData, updateKPIs, updateAgencyWorkforce, resetToDefaultData } = useInsuranceData();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'quickEdit'>('export');

  // Import State
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importResult, setImportResult] = useState<ImportParsedResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [importApplied, setImportApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Edit Form State
  const [editGWP, setEditGWP] = useState<number>(data.executiveKPIs.gwp?.numericValue ? data.executiveKPIs.gwp.numericValue / 10000 : 42.85);
  const [editFYP, setEditFYP] = useState<number>(data.executiveKPIs.fyp?.numericValue ? data.executiveKPIs.fyp.numericValue / 10000 : 12.46);
  const [editVNB, setEditVNB] = useState<number>(data.executiveKPIs.vnb?.numericValue ? data.executiveKPIs.vnb.numericValue / 10000 : 3.92);
  const [editPersistency, setEditPersistency] = useState<number>(data.executiveKPIs.persistency13M?.numericValue || 91.8);
  const [editTotalCustomers, setEditTotalCustomers] = useState<number>(data.executiveKPIs.totalCustomers?.numericValue ? data.executiveKPIs.totalCustomers.numericValue / 10000 : 368.5);
  const [editWorkforce, setEditWorkforce] = useState<number>(data.agencyWorkforce?.totalHeadcount || 24850);
  const [editActiveRate, setEditActiveRate] = useState<number>(data.agencyWorkforce?.activeRate || 70.0);
  const [quickSaveSuccess, setQuickSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle File Drop & Selection
  const handleFile = async (file: File) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setIsParsing(true);
    setImportResult(null);
    setImportApplied(false);

    try {
      const result = await parseExcelOrCsvFile(file, data);
      setImportResult(result);
    } catch (e: any) {
      setImportResult({
        success: false,
        sheetsFound: [],
        parsedData: {},
        summaryCounts: {
          kpis: 0,
          branches: 0,
          products: 0,
          segments: 0,
          customers: 0,
          warnings: 0,
          directives: 0,
          workforceUpdated: false,
        },
        warnings: [],
        errors: [`文件解析异常：${e.message || String(e)}`],
      });
    } finally {
      setIsParsing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyImport = () => {
    if (!importResult || !importResult.success) return;
    applyBulkImportData(importResult.parsedData);
    setImportApplied(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleQuickSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newKPIs = { ...data.executiveKPIs };

    if (newKPIs.gwp) {
      newKPIs.gwp = {
        ...newKPIs.gwp,
        value: editGWP.toFixed(2),
        numericValue: Math.round(editGWP * 10000),
      };
    }
    if (newKPIs.fyp) {
      newKPIs.fyp = {
        ...newKPIs.fyp,
        value: editFYP.toFixed(2),
        numericValue: Math.round(editFYP * 10000),
      };
    }
    if (newKPIs.vnb) {
      newKPIs.vnb = {
        ...newKPIs.vnb,
        value: editVNB.toFixed(2),
        numericValue: Math.round(editVNB * 10000),
      };
    }
    if (newKPIs.persistency13M) {
      newKPIs.persistency13M = {
        ...newKPIs.persistency13M,
        value: editPersistency.toFixed(1),
        numericValue: editPersistency,
        status: editPersistency >= 93.5 ? 'excellent' : editPersistency >= 90 ? 'warning' : 'critical',
      };
    }
    if (newKPIs.totalCustomers) {
      newKPIs.totalCustomers = {
        ...newKPIs.totalCustomers,
        value: editTotalCustomers.toFixed(1),
        numericValue: Math.round(editTotalCustomers * 10000),
      };
    }

    updateKPIs(newKPIs);

    // Workforce update
    const newWorkforce = {
      ...data.agencyWorkforce,
      totalHeadcount: editWorkforce,
      activeRate: editActiveRate,
      activeHeadcount: Math.round((editWorkforce * editActiveRate) / 100),
    };
    updateAgencyWorkforce(newWorkforce);

    setQuickSaveSuccess(true);
    setTimeout(() => setQuickSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">数据导入与导出中心</h2>
                {data.isCustomData ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    已加载自定义业务数据
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    当前为预设示范数据
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                支持一键下载全量报表与标准填报模板，支持批量拖拽 Excel / CSV 覆盖全站看板大盘
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-white flex space-x-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>导出数据表格与标准填报模板</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Excel / CSV 批量导入与解析</span>
          </button>

          <button
            onClick={() => setActiveTab('quickEdit')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'quickEdit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>高管宏观指标在线速改</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Primary Download Excel Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Data Excel */}
                <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-6 -mt-6 pointer-events-none" />
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 rounded-xl bg-blue-600 text-white">
                        <FileSpreadsheet className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        导出全量 Excel 报表工作簿 (.xlsx)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                      包含当前看板全部 8 张核心数据工作表（宏观大盘、分公司战报、险种结构、客群矩阵、高危退保清单、360画像全景、营销队伍金字塔、战略督战令），直接下载即可进行离线分析或留存。
                    </p>
                  </div>

                  <button
                    onClick={() => exportDashboardToExcel(data, { mode: 'withData' })}
                    className="mt-5 w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>立即下载全套 Excel 数据表 (.xlsx)</span>
                  </button>
                </div>

                {/* Blank Template Excel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="p-2 rounded-xl bg-emerald-600 text-white">
                        <FileDown className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        下载空白标准数据填报模板 (.xlsx)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                      预置标准中文表头、数据类型规范、单位换算指南与字段字典，方便各分公司或精算、运营、个险部门直接填入实际业务数据后导入回传。
                    </p>
                  </div>

                  <button
                    onClick={() => exportDashboardToExcel(data, { mode: 'template' })}
                    className="mt-5 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载标准数据填报模板 (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* Single Table CSV Download Section */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <FileText className="w-4 h-4 mr-1.5 text-slate-500" />
                    按需单表 CSV 快速导出 (UTF-8 with BOM 兼容 Excel)
                  </h4>
                  <span className="text-[11px] text-slate-400">点击任意卡片即可直接下载单表</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    { id: 'kpis', name: '核心经营大盘KPI', icon: TrendingUp, desc: 'GWP/FYP/继续率' },
                    { id: 'branches', name: '分公司机构战报', icon: Building2, desc: '各机构达成率排行' },
                    { id: 'segments', name: '客户分群与价值矩阵', icon: Users, desc: '5大客群规模与件均' },
                    { id: 'warnings', name: '退保脱落高危预警', icon: ShieldAlert, desc: '宽限期倒计时清单' },
                    { id: 'customers', name: '360客户画像全景', icon: Users, desc: '典型客户保单缺口' },
                    { id: 'workforce', name: '营销队伍金字塔', icon: Layers, desc: '总监/主管/代理人' },
                    { id: 'directives', name: '高管战略督战令', icon: FileText, desc: '督办下达与达成进度' },
                  ].map((table) => {
                    const Icon = table.icon;
                    return (
                      <button
                        key={table.id}
                        onClick={() => exportSingleTableCSV(table.id as any, data)}
                        className="p-3 text-left border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition-all group flex flex-col justify-between cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </span>
                          <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">
                            {table.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{table.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Drag & Drop Upload Box */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70 scale-[1.01]'
                    : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />

                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  点击选择文件 或 将 Excel / CSV 报表拖拽至此处
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  支持标准 <span className="font-semibold text-slate-700">.xlsx</span>、
                  <span className="font-semibold text-slate-700">.xls</span> 或{' '}
                  <span className="font-semibold text-slate-700">.csv</span> 文件，系统将自动识别并核验所有数据表
                </p>

                <div className="flex items-center space-x-2 mt-4">
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-600 font-medium">
                    自动匹配中英文表头
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-600 font-medium">
                    多工作表一体化合并
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] text-slate-600 font-medium">
                    本地持久化存储
                  </span>
                </div>
              </div>

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center space-x-3 text-xs text-blue-800">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>正在解析报表并进行精算与业务数据结构校验，请稍候...</span>
                </div>
              )}

              {/* Parsed Result Preview Card */}
              {importResult && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      {importResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {importResult.success ? '报表解析与数据核验通过' : '数据解析存在问题'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          来源文件：<span className="font-mono text-slate-700">{uploadedFileName}</span> (包含工作表:{' '}
                          {importResult.sheetsFound.join(', ') || '单表'})
                        </p>
                      </div>
                    </div>

                    {importResult.success && (
                      <button
                        onClick={handleApplyImport}
                        disabled={importApplied}
                        className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer ${
                          importApplied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                        }`}
                      >
                        {importApplied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>已成功生效并覆盖大盘！</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>立即生效覆盖全站大盘</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Summary Badges Grid */}
                  {importResult.success && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">核心经营大盘KPI</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {importResult.summaryCounts.kpis > 0 ? (
                            <span className="text-emerald-600">已识别 {importResult.summaryCounts.kpis} 项指标</span>
                          ) : (
                            <span className="text-slate-400">保留当前</span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">分公司机构战报</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {importResult.summaryCounts.branches > 0 ? (
                            <span className="text-emerald-600">已识别 {importResult.summaryCounts.branches} 家机构</span>
                          ) : (
                            <span className="text-slate-400">保留当前</span>
                          )}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">客户分群与360画像</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          <span className="text-emerald-600">
                            {importResult.summaryCounts.segments} 客群 / {importResult.summaryCounts.customers} 案例
                          </span>
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">高危退保与营销人力</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          <span className="text-emerald-600">
                            {importResult.summaryCounts.warnings} 条预警 /{' '}
                            {importResult.summaryCounts.workforceUpdated ? '人力已更新' : '保留当前'}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Errors display */}
                  {importResult.errors.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 space-y-1">
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          {err}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUICK EDIT */}
          {activeTab === 'quickEdit' && (
            <form onSubmit={handleQuickSave} className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">高管宏观经营核心指标实时微调</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      无需上传表格，可直接修改核心经营数字并即时重绘大盘与精算沙盘
                    </p>
                  </div>

                  {quickSaveSuccess && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center">
                      <Check className="w-3.5 h-3.5 mr-1" />
                      修改已成功生效！
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* GWP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      总规模保费 GWP (亿元)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editGWP}
                      onChange={(e) => setEditGWP(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* FYP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      首年期交保费 FYP (亿元)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFYP}
                      onChange={(e) => setEditFYP(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* VNB */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      新业务价值 NBEV (亿元)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editVNB}
                      onChange={(e) => setEditVNB(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* 13M Persistency */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      13个月继续率 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editPersistency}
                      onChange={(e) => setEditPersistency(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Total Customers */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      在册有效客户总数 (万人)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editTotalCustomers}
                      onChange={(e) => setEditTotalCustomers(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Agency Headcount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      在册营销总人力 (人)
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={editWorkforce}
                      onChange={(e) => setEditWorkforce(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>保存并实时生效大盘</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (window.confirm('确定要清除所有自定义导入数据，恢复为出厂预设示范数据吗？')) {
                resetToDefaultData();
                onClose();
              }
            }}
            className="text-slate-500 hover:text-rose-600 flex items-center space-x-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>恢复系统出厂示范数据</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
