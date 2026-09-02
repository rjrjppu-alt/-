import * as XLSX from 'xlsx';
import { DashboardDataState } from '../context/DataContext';
import {
  BranchPerformance,
  CustomerProfile,
  CustomerSegment,
  KPICardData,
  LapseWarningItem,
  ProductBreakdown,
  StrategicDirective,
} from '../types';

export interface ImportParsedResult {
  success: boolean;
  sheetsFound: string[];
  parsedData: Partial<DashboardDataState>;
  summaryCounts: {
    kpis: number;
    branches: number;
    products: number;
    segments: number;
    customers: number;
    warnings: number;
    directives: number;
    workforceUpdated: boolean;
  };
  warnings: string[];
  errors: string[];
}

function parseNumber(val: any, defaultVal = 0): number {
  if (val === undefined || val === null || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : val;
  const cleanStr = String(val).replace(/[,，%¥元万人次\s]/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? defaultVal : num;
}

function parseString(val: any, defaultVal = ''): string {
  if (val === undefined || val === null) return defaultVal;
  return String(val).trim();
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file and maps rows into typed dashboard models.
 */
export async function parseExcelOrCsvFile(file: File, currentData: DashboardDataState): Promise<ImportParsedResult> {
  const result: ImportParsedResult = {
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
    errors: [],
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    result.sheetsFound = workbook.SheetNames;

    const parsedData: Partial<DashboardDataState> = {};

    // Helper: Find sheet by keywords
    const getSheetData = (keywords: string[]): any[] | null => {
      const matchedName = workbook.SheetNames.find((name) =>
        keywords.some((k) => name.toLowerCase().includes(k.toLowerCase()))
      );
      if (!matchedName) return null;
      const ws = workbook.Sheets[matchedName];
      return XLSX.utils.sheet_to_json(ws, { defval: '' });
    };

    // 1. Parse KPIs
    const kpiRaw = getSheetData(['kpi', '指标', '大盘', '经营']);
    if (kpiRaw && kpiRaw.length > 0) {
      const newKPIs: Record<string, KPICardData> = { ...currentData.executiveKPIs };
      kpiRaw.forEach((row: any) => {
        const id = parseString(row['指标标识'] || row['id'] || row['标识'] || row['ID']);
        const title = parseString(row['指标名称'] || row['title'] || row['名称']);
        const numVal = parseNumber(row['当前数值'] || row['numericValue'] || row['数值'] || row['value']);
        const unit = parseString(row['数值单位'] || row['单位'] || row['unit']);
        const target = parseString(row['年度目标值'] || row['目标值'] || row['target']);
        const completionRate = parseNumber(row['达成进度百分比'] || row['达成率'] || row['completionRate']);
        const yoy = parseNumber(row['同比增幅百分比'] || row['同比'] || row['yoy']);
        const mom = parseNumber(row['环比增幅百分比'] || row['环比'] || row['mom']);
        const status = parseString(row['状态评级'] || row['状态'] || row['status'], 'normal') as any;
        const subText = parseString(row['经营归因与状态说明'] || row['归因说明'] || row['subText']);

        // Find key in executiveKPIs
        let targetKey = Object.keys(newKPIs).find(
          (k) => k === id || newKPIs[k].id === id || (title && newKPIs[k].title.includes(title))
        );

        if (!targetKey && id) {
          targetKey = id;
        }

        if (targetKey) {
          const old = newKPIs[targetKey] || ({} as KPICardData);
          newKPIs[targetKey] = {
            ...old,
            id: id || old.id || targetKey,
            title: title || old.title || targetKey,
            numericValue: numVal || old.numericValue || 0,
            value: numVal ? String(numVal) : old.value || '',
            unit: unit || old.unit || '',
            target: target || old.target,
            completionRate: completionRate || old.completionRate,
            yoy: yoy !== undefined ? yoy : old.yoy,
            mom: mom !== undefined ? mom : old.mom,
            trend: yoy >= 0 ? 'up' : 'down',
            status: ['excellent', 'normal', 'warning', 'critical'].includes(status) ? status : 'normal',
            subText: subText || old.subText,
          };
          result.summaryCounts.kpis++;
        }
      });
      if (result.summaryCounts.kpis > 0) {
        parsedData.executiveKPIs = newKPIs;
      }
    }

    // 2. Parse Branches
    const branchRaw = getSheetData(['机构', '分公司', 'branch', '战报']);
    if (branchRaw && branchRaw.length > 0) {
      const branches: BranchPerformance[] = branchRaw
        .map((row: any, idx: number) => {
          const name = parseString(row['机构名称'] || row['分公司名称'] || row['name']);
          if (!name) return null;
          return {
            id: parseString(row['机构ID'] || row['id'], `br_${idx + 1}`),
            name,
            region: parseString(row['所属大区'] || row['大区'] || row['region'], '全国'),
            director: parseString(row['机构负责人'] || row['负责人'] || row['director'], '分总'),
            targetFYP: parseNumber(row['目标期交万元'] || row['目标期交_万元'] || row['targetFYP']),
            actualFYP: parseNumber(row['实际期交万元'] || row['实际期交_万元'] || row['actualFYP']),
            achievementRate: parseNumber(row['期交达成率百分比'] || row['达成率_pct'] || row['达成率'] || row['achievementRate']),
            gwp: parseNumber(row['规模保费万元'] || row['规模保费_万元'] || row['gwp']),
            nbev: parseNumber(row['新业务价值万元'] || row['新业务价值_万元'] || row['nbev']),
            activeAgents: parseNumber(row['有效人力人'] || row['有效人力_人'] || row['activeAgents']),
            persistency13M: parseNumber(row['13个月继续率百分比'] || row['13M继续率_pct'] || row['13M继续率'] || row['persistency13M']),
            familyAddonRate: parseNumber(row['家庭加保率百分比'] || row['家庭加保率_pct'] || row['家庭加保率'] || row['familyAddonRate']),
            rank: parseNumber(row['业绩排名'] || row['排名'] || row['rank'], idx + 1),
            status: parseString(row['考核状态'] || row['状态'] || row['status'], 'normal') as any,
          };
        })
        .filter(Boolean) as BranchPerformance[];

      if (branches.length > 0) {
        parsedData.branches = branches;
        result.summaryCounts.branches = branches.length;
      }
    }

    // 3. Parse Products
    const productRaw = getSheetData(['产品', '险种', 'product']);
    if (productRaw && productRaw.length > 0) {
      const products: ProductBreakdown[] = productRaw
        .map((row: any) => {
          const name = parseString(row['产品险种名称'] || row['产品名称'] || row['name']);
          if (!name) return null;
          return {
            name,
            category: parseString(row['险种类别'] || row['category'], '寿险') as any,
            fyp: parseNumber(row['首年期交万元'] || row['首年期交_万元'] || row['fyp']),
            gwp: parseNumber(row['规模保费万元'] || row['规模保费_万元'] || row['gwp']),
            share: parseNumber(row['保费占比百分比'] || row['占比_pct'] || row['占比'] || row['share']),
            yoy: parseNumber(row['同比增幅百分比'] || row['同比_pct'] || row['同比'] || row['yoy']),
            vnbMargin: parseNumber(row['新业务价值率百分比'] || row['价值率'] || row['vnbMargin']),
            growthRate: parseNumber(row['业务增速百分比'] || row['增速'] || row['growthRate']),
          };
        })
        .filter(Boolean) as ProductBreakdown[];

      if (products.length > 0) {
        parsedData.products = products;
        result.summaryCounts.products = products.length;
      }
    }

    // 4. Parse Customer Segments
    const segmentRaw = getSheetData(['客群', '分群', 'segment']);
    if (segmentRaw && segmentRaw.length > 0) {
      const segments: CustomerSegment[] = segmentRaw
        .map((row: any, idx: number) => {
          const name = parseString(row['客群名称'] || row['客群分类名称'] || row['name']);
          if (!name) return null;
          const coreNeedsStr = parseString(row['核心保障需求'] || row['核心需求'] || row['coreNeeds']);
          return {
            id: parseString(row['客群ID'] || row['id'], `seg_${idx + 1}`),
            name,
            code: parseString(row['客群代码'] || row['代码'] || row['code'], `SEG_${idx + 1}`),
            count: parseNumber(row['在册客户规模人'] || row['客户数_人'] || row['客户规模'] || row['count']),
            proportion: parseNumber(row['客群占比百分比'] || row['占比_pct'] || row['占比'] || row['proportion']),
            avgAnnualPremium: parseNumber(row['件均年化保费元'] || row['件均保费_元'] || row['件均保费'] || row['avgAnnualPremium']),
            avgPoliciesPerCapita: parseNumber(row['人均保单件数'] || row['人均件数'] || row['avgPoliciesPerCapita']),
            totalLTV: parseNumber(row['总客户生命周期价值万元'] || row['LTV_万元'] || row['totalLTV']),
            coreNeeds: coreNeedsStr ? coreNeedsStr.split(/[,，;；]/).map((s) => s.trim()).filter(Boolean) : ['家庭保障'],
            keyRisk: parseString(row['主要流失风险'] || row['流失风险'] || row['keyRisk'], '市场竞品分流'),
            retentionRate: parseNumber(row['13M留存率百分比'] || row['留存率_pct'] || row['留存率'] || row['retentionRate']),
            color: ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'][idx % 5],
          };
        })
        .filter(Boolean) as CustomerSegment[];

      if (segments.length > 0) {
        parsedData.customerSegments = segments;
        result.summaryCounts.segments = segments.length;
      }
    }

    // 5. Parse Lapse Warnings
    const warningRaw = getSheetData(['预警', '退保', '脱落', '断缴', 'warning']);
    if (warningRaw && warningRaw.length > 0) {
      const warnings: LapseWarningItem[] = warningRaw
        .map((row: any, idx: number) => {
          const customerName = parseString(row['客户姓名'] || row['customerName'] || row['姓名']);
          if (!customerName) return null;
          return {
            id: parseString(row['预警编号'] || row['预警ID'] || row['id'], `warn_${idx + 1}`),
            customerId: parseString(row['关联客户ID'] || row['客户ID'] || row['customerId'], `cust_${idx + 1}`),
            customerName,
            policyNo: parseString(row['保单合同号'] || row['保单号'] || row['policyNo'], 'POL_UNKNOWN'),
            productName: parseString(row['保险产品名称'] || row['产品名称'] || row['productName'], '终身寿险'),
            annualPremium: parseNumber(row['年交保费元'] || row['年交保费_元'] || row['annualPremium']),
            dueDate: parseString(row['缴费到期日'] || row['到期日'] || row['dueDate'], '2026-09-30'),
            daysRemaining: parseNumber(row['宽限倒计时天数'] || row['宽限剩余天数'] || row['daysRemaining']),
            riskLevel: parseString(row['风险等级'] || row['riskLevel'], '高危') as any,
            riskScore: parseNumber(row['风险评分'] || row['riskScore'], 80),
            primaryRiskReason: parseString(row['主要断缴风险原因'] || row['断缴风险原因'] || row['primaryRiskReason'], '宽限期即将到期'),
            agentName: parseString(row['服务代理人'] || row['责任代理人'] || row['agentName'], '网格专管员'),
            agentStatus: parseString(row['代理人状态'] || row['agentStatus'], '在职') as any,
            branch: parseString(row['所属机构分支'] || row['所属机构'] || row['branch'], '总公司'),
            suggestedAction: parseString(row['高管建议干预举措'] || row['建议措施'] || row['suggestedAction'], '指派专管员登门拜访'),
            assignedSupervisor: parseString(row['督导责任分总'] || row['责任督办分总'] || row['assignedSupervisor']),
            interventionStatus: parseString(row['处置推进状态'] || row['处置状态'] || row['interventionStatus'], '待处理') as any,
          };
        })
        .filter(Boolean) as LapseWarningItem[];

      if (warnings.length > 0) {
        parsedData.lapseWarnings = warnings;
        result.summaryCounts.warnings = warnings.length;
      }
    }

    // 6. Parse Detailed Customer Profiles
    const profileRaw = getSheetData(['画像', '客户', 'profile', 'customer']);
    if (profileRaw && profileRaw.length > 0) {
      const profiles: CustomerProfile[] = profileRaw
        .map((row: any, idx: number) => {
          const name = parseString(row['客户姓名'] || row['姓名'] || row['name']);
          if (!name) return null;
          const tagsStr = parseString(row['客户特征标签'] || row['标签'] || row['tags']);
          return {
            id: parseString(row['客户ID'] || row['id'], `cust_${idx + 1}`),
            name,
            gender: parseString(row['性别'] || row['gender'], '男') as any,
            age: parseNumber(row['年龄'] || row['age'], 40),
            city: parseString(row['常住城市'] || row['城市'] || row['city'], '上海市'),
            tier: parseString(row['客群等级'] || row['客群层级'] || row['tier'], '中产富裕家庭') as any,
            annualIncome: parseString(row['年收入水平'] || row['年收入'] || row['annualIncome'], '100万'),
            assetsEst: parseString(row['资产规模估算'] || row['资产估算'] || row['assetsEst'], '1000万'),
            agentName: parseString(row['服务代理人姓名'] || row['代理人'] || row['agentName'], '资深顾问'),
            agentId: parseString(row['代理人工号'] || row['工号'] || row['agentId'], 'AGT_001'),
            agentPhone: parseString(row['代理人电话'] || row['电话'] || row['agentPhone'], '13800000000'),
            agentStatus: parseString(row['代理人在职状态'] || row['代理人状态'] || row['agentStatus'], '在职绩优') as any,
            firstPolicyYear: parseNumber(row['首单投保年份'] || row['首次投保年份'] || row['firstPolicyYear'], 2020),
            totalAnnualPremium: parseNumber(row['年缴总保费元'] || row['年缴总保费_元'] || row['totalAnnualPremium']),
            totalPoliciesCount: parseNumber(row['持有保单总件数'] || row['保单总件数'] || row['totalPoliciesCount'], 2),
            familyMembersCount: parseNumber(row['家庭成员总数'] || row['家庭成员数'] || row['familyMembersCount'], 3),
            insuredMembersCount: parseNumber(row['已参保成员数'] || row['insuredMembersCount'], 2),
            protectionScore: parseNumber(row['综合保障评分'] || row['保障评分'] || row['protectionScore'], 75),
            gapSummary: parseString(row['保障缺口与短板诊断'] || row['保障缺口'] || row['gapSummary'], '保障良好'),
            churnRiskScore: parseNumber(row['退保脱落风险分'] || row['退保风险评分'] || row['churnRiskScore'], 20),
            tags: tagsStr ? tagsStr.split(/[,，;；]/).map((s) => s.trim()).filter(Boolean) : ['优质高客'],
            recentInteraction: parseString(row['近期互动记录'] || row['recentInteraction'], '近期有业务交流'),
            recommendedAction: parseString(row['AI高管策略建议'] || row['AI建议'] || row['recommendedAction'], '按常规推进家庭加保'),
            potentialFYP: parseNumber(row['潜在二次加保额度万元'] || row['潜在加保额度_万元'] || row['potentialFYP'], 10),
            policies: currentData.customerProfiles[idx]?.policies || [],
            radarData: currentData.customerProfiles[idx]?.radarData || [
              { subject: '人身寿险保障', actual: 80, recommended: 90, fullMark: 100 },
              { subject: '重疾健康防线', actual: 75, recommended: 90, fullMark: 100 },
              { subject: '品质养老储备', actual: 70, recommended: 95, fullMark: 100 },
              { subject: '高端医疗直付', actual: 65, recommended: 90, fullMark: 100 },
              { subject: '财富信托传承', actual: 40, recommended: 95, fullMark: 100 },
              { subject: '家庭成员覆盖', actual: 75, recommended: 100, fullMark: 100 },
            ],
          };
        })
        .filter(Boolean) as CustomerProfile[];

      if (profiles.length > 0) {
        parsedData.customerProfiles = profiles;
        result.summaryCounts.customers = profiles.length;
      }
    }

    // 7. Parse Directives
    const directiveRaw = getSheetData(['督战', '指令', '督导', 'directive']);
    if (directiveRaw && directiveRaw.length > 0) {
      const directives: StrategicDirective[] = directiveRaw
        .map((row: any, idx: number) => {
          const title = parseString(row['督战令标题'] || row['标题'] || row['title']);
          if (!title) return null;
          return {
            id: parseString(row['督战令编号'] || row['指令ID'] || row['id'], `dir_${idx + 1}`),
            title,
            category: parseString(row['业务分类'] || row['分类'] || row['category'], '客户经营') as any,
            targetBranch: parseString(row['接收机构分支'] || row['接收机构'] || row['targetBranch'], '全国各分公司'),
            deadline: parseString(row['完成截止日期'] || row['截止日期'] || row['deadline'], '2026-09-30'),
            priority: parseString(row['紧急程度'] || row['priority'], '特急') as any,
            initiator: parseString(row['发起督办部门'] || row['发起部门'] || row['initiator'], '总裁室'),
            content: parseString(row['督战指令正文与执行要求'] || row['正文要求'] || row['content'], '执行专项督战推进'),
            expectedGoal: parseString(row['考核预期目标'] || row['预期目标'] || row['expectedGoal'], '达成既定指标'),
            progress: parseNumber(row['达成进度百分比'] || row['进度_pct'] || row['progress'], 50),
            status: parseString(row['当前状态'] || row['状态'] || row['status'], '执行中') as any,
            createdAt: parseString(row['下发日期'] || row['createdAt'], new Date().toISOString().slice(0, 10)),
          };
        })
        .filter(Boolean) as StrategicDirective[];

      if (directives.length > 0) {
        parsedData.directives = directives;
        result.summaryCounts.directives = directives.length;
      }
    }

    // 8. Parse Workforce
    const workforceSummaryRaw = getSheetData(['7-营销队伍宏观指标', '队伍宏观', '人力大盘']);
    const pyramidRaw = getSheetData(['金字塔', '产能结构', '7b']);

    if (workforceSummaryRaw || pyramidRaw) {
      const newWorkforce = { ...currentData.agencyWorkforce };
      if (workforceSummaryRaw) {
        workforceSummaryRaw.forEach((row: any) => {
          const item = parseString(row['指标项目'] || row['项目'] || row['指标']);
          const val = parseNumber(row['核心数值'] || row['数值'] || row['value']);
          if (item.includes('总人力')) newWorkforce.totalHeadcount = val;
          else if (item.includes('活动人力')) newWorkforce.activeHeadcount = val;
          else if (item.includes('活动率')) newWorkforce.activeRate = val;
          else if (item.includes('MDRT') || item.includes('绩优人数')) newWorkforce.mdrtCount = val;
          else if (item.includes('绩优占比')) newWorkforce.mdrtProportion = val;
          else if (item.includes('新入职') || item.includes('增员')) newWorkforce.newRecruitsMTD = val;
          else if (item.includes('3个月') || item.includes('新人留存')) newWorkforce.newAgent3MRetention = val;
          else if (item.includes('6个月')) newWorkforce.newAgent6MRetention = val;
          else if (item.includes('人均首年期交') || item.includes('人均期交')) newWorkforce.monthlyPerCapitaFYP = val;
          else if (item.includes('人均月度保单') || item.includes('人均件数')) newWorkforce.monthlyPerCapitaCases = val;
          else if (item.includes('主管') || item.includes('团队长')) newWorkforce.supervisorCount = val;
        });
      }

      if (pyramidRaw && pyramidRaw.length > 0) {
        newWorkforce.pyramidData = pyramidRaw.map((row: any) => ({
          layer: parseString(row['队伍层级名称'] || row['层级名称'] || row['layer'], '营销层级'),
          count: parseNumber(row['层级人力规模人'] || row['人力规模_人'] || row['count']),
          avgIncome: parseNumber(row['人均年收入元'] || row['人均年收入_元'] || row['avgIncome']),
          activeRate: parseNumber(row['有效活动率百分比'] || row['活动率_pct'] || row['activeRate']),
          fypShare: parseNumber(row['保费贡献占比百分比'] || row['保费贡献_pct'] || row['fypShare']),
        }));
      }

      parsedData.agencyWorkforce = newWorkforce;
      result.summaryCounts.workforceUpdated = true;
    }

    result.parsedData = parsedData;
    const totalRecognized =
      result.summaryCounts.kpis +
      result.summaryCounts.branches +
      result.summaryCounts.products +
      result.summaryCounts.segments +
      result.summaryCounts.customers +
      result.summaryCounts.warnings +
      result.summaryCounts.directives +
      (result.summaryCounts.workforceUpdated ? 1 : 0);

    if (totalRecognized > 0) {
      result.success = true;
    } else {
      result.errors.push('未能识别出符合规范的数据工作表，请确认工作表名称包含“KPI”、“机构”、“客群”、“退保”或“画像”等关键词，或下载标准模板填报。');
    }
  } catch (err: any) {
    result.errors.push(`文件解析失败：${err.message || String(err)}`);
  }

  return result;
}
