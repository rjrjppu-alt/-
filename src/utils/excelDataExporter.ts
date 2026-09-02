import * as XLSX from 'xlsx';
import { DashboardDataState } from '../context/DataContext';

export interface ExportOptions {
  mode: 'withData' | 'template';
  filename?: string;
}

/**
 * Generates and downloads a complete multi-sheet Excel file (.xlsx)
 * Contains all business tables required by the executive dashboard.
 */
export function exportDashboardToExcel(data: DashboardDataState, options: ExportOptions = { mode: 'withData' }) {
  const isTemplate = options.mode === 'template';
  const wb = XLSX.utils.book_new();

  // 1. Sheet 0: Instructions and field dictionary
  const instructionsData = [
    ['【保意决 · 寿险高管经营决策看板】数据填报与导入标准规范说明'],
    ['版本：2026 Q3 企业版'],
    ['适用范围：用于总公司高管层经营分析大盘、客户经营全景、机构分支战报、个险队伍人力及AI精算沙盘的数据填报与批量更新。'],
    [''],
    ['【填报注意事项】'],
    ['1. 请保留各工作表的表头名称，系统在导入时将自动匹配中英文表头列名。'],
    ['2. 金额字段若无特殊标注，金额单位通常为“万元”或“元”，请参考各列标题提示。'],
    ['3. 百分比字段（如达成率、继续率）请直接填写数字（如 94.5，无需加%号）。'],
    ['4. 本工作簿中每一张 Sheet 均可独立修改，导入时支持整本 Excel 上传或单表 CSV 上传。'],
    ['5. 导入成功后，系统会自动保存到本地浏览器缓存中，并立即驱动全站图表与精算沙盘动态重绘。'],
    [''],
    ['【工作表目录索引】'],
    ['Sheet 1: 1-核心经营大盘KPI (总规模保费、首年期交、价值、继续率等宏观大盘)'],
    ['Sheet 2: 2-分公司机构战报 (各分公司达标率、期交、继续率及红黑榜排行)'],
    ['Sheet 3: 3-险种产品结构 (增额寿、养老年金、重疾、医疗、分红险等期交贡献)'],
    ['Sheet 4: 4-客户分群与价值矩阵 (黑金私行、白金高客、中产家庭等客群规模与件均)'],
    ['Sheet 5: 5-退保与脱落高危预警 (宽限期倒计时、断缴风险、孤儿单高危清单)'],
    ['Sheet 6: 6-360客户画像全景 (典型客户家庭画像、保单全景、缺口诊断与加保机会)'],
    ['Sheet 7: 7-营销队伍人力金字塔 (总监、主管、MDRT、成熟代理人、新兵收入与产能)'],
    ['Sheet 8: 8-高管战略督战令 (督导指令、紧急度、责任分总、目标与达成进度)'],
  ];
  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, wsInstructions, '0-填报指南与目录');

  // 2. Sheet 1: Executive KPIs
  const kpiRows = isTemplate
    ? [
        {
          指标标识: 'kpi_gwp',
          指标名称: '总规模保费 (GWP)',
          当前数值: 42.85,
          数值单位: '亿元',
          年度目标值: '50.00 亿元',
          达成进度百分比: 85.7,
          同比增幅百分比: 14.2,
          环比增幅百分比: 3.8,
          状态评级: 'normal',
          经营归因与状态说明: '年累达成进度超时间进度 2.4%',
        },
      ]
    : Object.entries(data.executiveKPIs).map(([key, kpi]) => ({
        指标标识: kpi.id || key,
        指标名称: kpi.title,
        当前数值: kpi.numericValue !== undefined ? kpi.numericValue : kpi.value,
        数值单位: kpi.unit,
        年度目标值: kpi.target || '',
        达成进度百分比: kpi.completionRate || 0,
        同比增幅百分比: kpi.yoy || 0,
        环比增幅百分比: kpi.mom || 0,
        状态评级: kpi.status,
        经营归因与状态说明: kpi.subText || '',
      }));
  const wsKPI = XLSX.utils.json_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(wb, wsKPI, '1-核心经营大盘KPI');

  // 3. Sheet 2: Branch Performance
  const branchRows = isTemplate
    ? [
        {
          机构ID: 'br_sh',
          机构名称: '上海分公司',
          所属大区: '华东',
          机构负责人: '张文渊 (分总)',
          目标期交万元: 32000,
          实际期交万元: 36480,
          期交达成率百分比: 114.0,
          规模保费万元: 118500,
          新业务价值万元: 12400,
          有效人力人: 4280,
          '13个月继续率百分比': 94.6,
          家庭加保率百分比: 38.4,
          业绩排名: 1,
          考核状态: 'top',
        },
      ]
    : data.branches.map((b) => ({
        机构ID: b.id,
        机构名称: b.name,
        所属大区: b.region,
        机构负责人: b.director,
        目标期交万元: b.targetFYP,
        实际期交万元: b.actualFYP,
        期交达成率百分比: b.achievementRate,
        规模保费万元: b.gwp,
        新业务价值万元: b.nbev,
        有效人力人: b.activeAgents,
        '13个月继续率百分比': b.persistency13M,
        家庭加保率百分比: b.familyAddonRate,
        业绩排名: b.rank,
        考核状态: b.status,
      }));
  const wsBranches = XLSX.utils.json_to_sheet(branchRows);
  XLSX.utils.book_append_sheet(wb, wsBranches, '2-分公司机构战报');

  // 4. Sheet 3: Product Breakdown
  const productRows = isTemplate
    ? [
        {
          产品险种名称: '增额终身寿险（盛世尊享/金越传世）',
          险种类别: '寿险',
          首年期交万元: 54800,
          规模保费万元: 182000,
          保费占比百分比: 44.0,
          同比增幅百分比: 24.5,
          新业务价值率百分比: 34.2,
          业务增速百分比: 18.2,
        },
      ]
    : data.products.map((p) => ({
        产品险种名称: p.name,
        险种类别: p.category,
        首年期交万元: p.fyp,
        规模保费万元: p.gwp,
        保费占比百分比: p.share,
        同比增幅百分比: p.yoy,
        新业务价值率百分比: p.vnbMargin,
        业务增速百分比: p.growthRate,
      }));
  const wsProducts = XLSX.utils.json_to_sheet(productRows);
  XLSX.utils.book_append_sheet(wb, wsProducts, '3-险种产品结构');

  // 5. Sheet 4: Customer Segments
  const segmentRows = isTemplate
    ? [
        {
          客群ID: 'seg_hnw',
          客群名称: '顶级黑金 / 私行高客',
          客群代码: 'HNW_BLACK',
          在册客户规模人: 14850,
          客群占比百分比: 4.0,
          件均年化保费元: 485000,
          人均保单件数: 5.8,
          总客户生命周期价值万元: 720225,
          核心保障需求: '家族财富定向传承, 大额资产风险隔离, 高端康养社区保证入住',
          主要流失风险: '对利率下行敏感，容易受私人银行和信托机构分流',
          '13M留存率百分比': 96.8,
        },
      ]
    : data.customerSegments.map((s) => ({
        客群ID: s.id,
        客群名称: s.name,
        客群代码: s.code,
        在册客户规模人: s.count,
        客群占比百分比: s.proportion,
        件均年化保费元: s.avgAnnualPremium,
        人均保单件数: s.avgPoliciesPerCapita,
        总客户生命周期价值万元: s.totalLTV,
        核心保障需求: s.coreNeeds.join(', '),
        主要流失风险: s.keyRisk,
        '13M留存率百分比': s.retentionRate,
      }));
  const wsSegments = XLSX.utils.json_to_sheet(segmentRows);
  XLSX.utils.book_append_sheet(wb, wsSegments, '4-客户分群与价值矩阵');

  // 6. Sheet 5: Lapse Warning Hall
  const warningRows = isTemplate
    ? [
        {
          预警编号: 'warn_001',
          关联客户ID: 'cust_003',
          客户姓名: '韩建国',
          保单合同号: 'POL_2021_88192',
          保险产品名称: '金悦一生·增额终身寿险',
          年交保费元: 150000,
          缴费到期日: '2026-08-25',
          宽限倒计时天数: 12,
          风险等级: '高危',
          风险评分: 88,
          主要断缴风险原因: '保单借款率85% + 原代理人已离职 + 宽限期仅剩12天',
          服务代理人: '何伟 (离职)',
          代理人状态: '离职孤儿单',
          所属机构分支: '四川分公司 高新中支',
          高管建议干预举措: '指派高新中支金牌保全专管员上门，提供减额交清或分期还息保全复效方案。',
          督导责任分总: '赵大勇 (分总督导)',
          处置推进状态: '待处理',
        },
      ]
    : data.lapseWarnings.map((w) => ({
        预警编号: w.id,
        关联客户ID: w.customerId,
        客户姓名: w.customerName,
        保单合同号: w.policyNo,
        保险产品名称: w.productName,
        年交保费元: w.annualPremium,
        缴费到期日: w.dueDate,
        宽限倒计时天数: w.daysRemaining,
        风险等级: w.riskLevel,
        风险评分: w.riskScore,
        主要断缴风险原因: w.primaryRiskReason,
        服务代理人: w.agentName,
        代理人状态: w.agentStatus,
        所属机构分支: w.branch,
        高管建议干预举措: w.suggestedAction,
        督导责任分总: w.assignedSupervisor || '',
        处置推进状态: w.interventionStatus,
      }));
  const wsWarnings = XLSX.utils.json_to_sheet(warningRows);
  XLSX.utils.book_append_sheet(wb, wsWarnings, '5-退保与脱落高危预警');

  // 7. Sheet 6: Detailed Customer Profiles
  const profileRows = isTemplate
    ? [
        {
          客户ID: 'cust_001',
          客户姓名: '林振华',
          性别: '男',
          年龄: 48,
          常住城市: '上海市 浦东新区',
          客群等级: '顶级黑金私行客',
          年收入水平: '500万+',
          资产规模估算: '8000万左右 (高新制造业拟上市企业创始人)',
          服务代理人姓名: '沈曼 (MDRT/TOT顶级顾问)',
          代理人工号: 'AGT_SH_089',
          代理人电话: '13800006688',
          代理人在职状态: '在职绩优',
          首单投保年份: 2018,
          年缴总保费元: 1250000,
          持有保单总件数: 6,
          家庭成员总数: 4,
          已参保成员数: 4,
          综合保障评分: 78,
          保障缺口与短板诊断: '寿险保额高达3000万，但家庭信托隔离尚未对接，妻子与次子缺乏专属高端医疗与品质养老年金。',
          退保脱落风险分: 18,
          客户特征标签: '企业主, 大额保单, 已发放康养社区函, 拟家族信托',
          潜在二次加保额度万元: 200,
          近期互动记录: '3天前参加总公司举办的“家族办公室与新公司法财富风控”闭门私享汇。',
          AI高管策略建议: '以“企业上市前股东资产隔离与家族第二信托架构”为切入点，配置《金越传世分红终身寿险》年缴200万×5年。',
        },
      ]
    : data.customerProfiles.map((c) => ({
        客户ID: c.id,
        客户姓名: c.name,
        性别: c.gender,
        年龄: c.age,
        常住城市: c.city,
        客群等级: c.tier,
        年收入水平: c.annualIncome,
        资产规模估算: c.assetsEst,
        服务代理人姓名: c.agentName,
        代理人工号: c.agentId,
        代理人电话: c.agentPhone,
        代理人在职状态: c.agentStatus,
        首单投保年份: c.firstPolicyYear,
        年缴总保费元: c.totalAnnualPremium,
        持有保单总件数: c.totalPoliciesCount,
        家庭成员总数: c.familyMembersCount,
        已参保成员数: c.insuredMembersCount,
        综合保障评分: c.protectionScore,
        保障缺口与短板诊断: c.gapSummary,
        退保脱落风险分: c.churnRiskScore,
        客户特征标签: c.tags.join(', '),
        潜在二次加保额度万元: c.potentialFYP,
        近期互动记录: c.recentInteraction,
        AI高管策略建议: c.recommendedAction,
      }));
  const wsProfiles = XLSX.utils.json_to_sheet(profileRows);
  XLSX.utils.book_append_sheet(wb, wsProfiles, '6-360客户画像全景');

  // 8. Sheet 7: Agency Workforce
  const workforce = data.agencyWorkforce;
  const workforceSummary = [
    { 指标项目: '在册个险营销总人力 (人)', 核心数值: workforce.totalHeadcount },
    { 指标项目: '有效活动人力 (人)', 核心数值: workforce.activeHeadcount },
    { 指标项目: '有效人力活动率 (%)', 核心数值: workforce.activeRate },
    { 指标项目: 'MDRT / 绩优菁英人数 (人)', 核心数值: workforce.mdrtCount },
    { 指标项目: '绩优菁英占比 (%)', 核心数值: workforce.mdrtProportion },
    { 指标项目: '月度新入职增员人数 (人)', 核心数值: workforce.newRecruitsMTD },
    { 指标项目: '3个月新人留存率 (%)', 核心数值: workforce.newAgent3MRetention },
    { 指标项目: '6个月转正稳固率 (%)', 核心数值: workforce.newAgent6MRetention },
    { 指标项目: '人均首年期交产能 (元/人/月)', 核心数值: workforce.monthlyPerCapitaFYP },
    { 指标项目: '人均月度保单件数 (件/人/月)', 核心数值: workforce.monthlyPerCapitaCases },
    { 指标项目: '主管/团队长总数 (人)', 核心数值: workforce.supervisorCount },
  ];
  const wsWorkforceSummary = XLSX.utils.json_to_sheet(workforceSummary);
  XLSX.utils.book_append_sheet(wb, wsWorkforceSummary, '7-营销队伍宏观指标');

  const pyramidRows = workforce.pyramidData.map((p) => ({
    队伍层级名称: p.layer,
    层级人力规模人: p.count,
    人均年收入元: p.avgIncome,
    有效活动率百分比: p.activeRate,
    保费贡献占比百分比: p.fypShare,
  }));
  const wsPyramid = XLSX.utils.json_to_sheet(pyramidRows);
  XLSX.utils.book_append_sheet(wb, wsPyramid, '7B-队伍金字塔产能结构');

  // 9. Sheet 8: Directives
  const directiveRows = isTemplate
    ? [
        {
          督战令编号: 'dir_001',
          督战令标题: '关于在全系统开展“Q3高客家庭第二张保单专项攻坚战役”的督导令',
          业务分类: '客户经营',
          接收机构分支: '全国各分公司',
          完成截止日期: '2026-09-30',
          紧急程度: '特急',
          发起督办部门: '总裁室 / 个险业务决策委员会',
          督战指令正文与执行要求: '重点针对在册年缴10万以上客户，全面普及家庭保单数字化全景检视，配置增额寿与高端养老信托，要求家庭单二次加保渗透率提升至35%以上。',
          考核预期目标: '拉动Q3家庭加保首年期交保费突破 3.5 亿元',
          达成进度百分比: 68,
          当前状态: '执行中',
          下发日期: '2026-08-15',
        },
      ]
    : data.directives.map((d) => ({
        督战令编号: d.id,
        督战令标题: d.title,
        业务分类: d.category,
        接收机构分支: d.targetBranch,
        完成截止日期: d.deadline,
        紧急程度: d.priority,
        发起督办部门: d.initiator,
        督战指令正文与执行要求: d.content,
        考核预期目标: d.expectedGoal,
        达成进度百分比: d.progress,
        当前状态: d.status,
        下发日期: d.createdAt,
      }));
  const wsDirectives = XLSX.utils.json_to_sheet(directiveRows);
  XLSX.utils.book_append_sheet(wb, wsDirectives, '8-高管战略督战令');

  // Trigger file download
  const dateStr = new Date().toISOString().slice(0, 10);
  const defaultFilename = isTemplate
    ? `保意决_寿险经营决策看板_标准数据填报模板_${dateStr}.xlsx`
    : `保意决_寿险经营决策看板_全套经营数据表_${dateStr}.xlsx`;

  XLSX.writeFile(wb, options.filename || defaultFilename);
}

/**
 * Exports a single table as a CSV file with UTF-8 BOM so Excel opens Chinese text perfectly.
 */
export function exportSingleTableCSV(
  tableName: 'branches' | 'kpis' | 'segments' | 'warnings' | 'customers' | 'workforce' | 'directives',
  data: DashboardDataState
) {
  let rows: any[] = [];
  let filename = '';
  const dateStr = new Date().toISOString().slice(0, 10);

  switch (tableName) {
    case 'kpis':
      filename = `01_核心经营大盘KPI_${dateStr}.csv`;
      rows = Object.entries(data.executiveKPIs).map(([key, kpi]) => ({
        指标标识: kpi.id || key,
        指标名称: kpi.title,
        当前数值: kpi.numericValue !== undefined ? kpi.numericValue : kpi.value,
        单位: kpi.unit,
        目标值: kpi.target || '',
        达成率: kpi.completionRate || 0,
        同比: kpi.yoy || 0,
        环比: kpi.mom || 0,
        状态: kpi.status,
        归因说明: kpi.subText || '',
      }));
      break;

    case 'branches':
      filename = `02_分公司机构战报_${dateStr}.csv`;
      rows = data.branches.map((b) => ({
        机构ID: b.id,
        分公司名称: b.name,
        所属大区: b.region,
        负责人: b.director,
        目标期交_万元: b.targetFYP,
        实际期交_万元: b.actualFYP,
        达成率_pct: b.achievementRate,
        规模保费_万元: b.gwp,
        新业务价值_万元: b.nbev,
        有效人力_人: b.activeAgents,
        '13M继续率_pct': b.persistency13M,
        家庭加保率_pct: b.familyAddonRate,
        排名: b.rank,
        状态: b.status,
      }));
      break;

    case 'segments':
      filename = `03_客户分群与价值矩阵_${dateStr}.csv`;
      rows = data.customerSegments.map((s) => ({
        客群ID: s.id,
        客群名称: s.name,
        代码: s.code,
        客户数_人: s.count,
        占比_pct: s.proportion,
        件均保费_元: s.avgAnnualPremium,
        人均件数: s.avgPoliciesPerCapita,
        LTV_万元: s.totalLTV,
        核心需求: s.coreNeeds.join('; '),
        主要流失风险: s.keyRisk,
        留存率_pct: s.retentionRate,
      }));
      break;

    case 'warnings':
      filename = `04_退保与脱落高危预警清单_${dateStr}.csv`;
      rows = data.lapseWarnings.map((w) => ({
        预警ID: w.id,
        客户ID: w.customerId,
        客户姓名: w.customerName,
        保单号: w.policyNo,
        产品名称: w.productName,
        年交保费_元: w.annualPremium,
        缴费到期日: w.dueDate,
        宽限剩余天数: w.daysRemaining,
        风险等级: w.riskLevel,
        风险评分: w.riskScore,
        断缴风险原因: w.primaryRiskReason,
        责任代理人: w.agentName,
        代理人状态: w.agentStatus,
        所属机构: w.branch,
        建议措施: w.suggestedAction,
        责任督办分总: w.assignedSupervisor || '',
        处置状态: w.interventionStatus,
      }));
      break;

    case 'customers':
      filename = `05_360客户画像全景案例_${dateStr}.csv`;
      rows = data.customerProfiles.map((c) => ({
        客户ID: c.id,
        姓名: c.name,
        性别: c.gender,
        年龄: c.age,
        城市: c.city,
        客群层级: c.tier,
        年收入: c.annualIncome,
        资产估算: c.assetsEst,
        代理人: c.agentName,
        工号: c.agentId,
        电话: c.agentPhone,
        代理人状态: c.agentStatus,
        首次投保年份: c.firstPolicyYear,
        年缴总保费_元: c.totalAnnualPremium,
        保单总件数: c.totalPoliciesCount,
        家庭成员数: c.familyMembersCount,
        保障评分: c.protectionScore,
        保障缺口: c.gapSummary,
        退保风险评分: c.churnRiskScore,
        标签: c.tags.join('; '),
        潜在加保额度_万元: c.potentialFYP,
        AI建议: c.recommendedAction,
      }));
      break;

    case 'workforce':
      filename = `06_营销队伍金字塔结构_${dateStr}.csv`;
      rows = data.agencyWorkforce.pyramidData.map((p) => ({
        层级名称: p.layer,
        人力规模_人: p.count,
        人均年收入_元: p.avgIncome,
        活动率_pct: p.activeRate,
        保费贡献_pct: p.fypShare,
      }));
      break;

    case 'directives':
      filename = `07_高管战略督战令_${dateStr}.csv`;
      rows = data.directives.map((d) => ({
        指令ID: d.id,
        标题: d.title,
        分类: d.category,
        接收机构: d.targetBranch,
        截止日期: d.deadline,
        紧急程度: d.priority,
        发起部门: d.initiator,
        正文要求: d.content,
        预期目标: d.expectedGoal,
        进度_pct: d.progress,
        状态: d.status,
      }));
      break;
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(ws);
  // Add UTF-8 BOM so Excel opens Chinese CSV without mojibake
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
