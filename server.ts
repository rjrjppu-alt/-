import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini SDK cleanly
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Executive Decision Insight
app.post('/api/ai/decision-insight', async (req, res) => {
  try {
    const { context, metrics, currentFocus, dimension } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        fallback: true,
        insight: {
          title: '【系统离线分析】客户经营与业务价值深度研判',
          overallStatus: '整体经营稳中向好，但中产家庭二次加保率与13月续保率出现分化波谷，需重点干预。',
          keyRisks: [
            '25-38岁中青年中产客群退保预警上升4.2%，主要集中在早期高额趸交与重疾险。',
            '新单加保率（一主多附）渗透仅为26.4%，家庭单保单件均件数低于行业头部标杆（3.2件/户）。',
            '个险新入职半年内代理人客户拜访频次下降18%，直接影响老客户唤醒。',
          ],
          keyOpportunities: [
            '高净值客群（总资产>1000万）对增额终身寿险与养老年金信托的承接需求激增35%。',
            '银发养老社区对接权益型保单（预定保费>200万）转化率高达41.8%，具备规模化复制空间。',
            '通过家庭保单全景图检视工具，老客转介绍成功率提高至52%。',
          ],
          actionDirectives: [
            '【客户经营】下发《Q3家庭保障全生命周期检视工程》，主推“老带新+家庭单加保”专属赠险与健康增值权益。',
            '【续保挽回】对13个月退保高危名单实施“高管挂帅+金牌督导”48小时内一对一拜访，匹配保单贷款或保障重构方案。',
            '【队伍赋能】将客户KYC画像与保单检视雷达图嵌入队伍展业通，提升主管级人均有效面访量。',
          ],
          predictedImpact: '预计可挽回潜在退保保费约3,800万元，拉动Q3家庭加保新单FYP突破1.45亿元。',
        },
      });
    }

    const systemPrompt = `你是一位顶级大型寿险公司的首席战略官兼执行副总裁（COO/CSO）。
请根据前端传递的保险经营数据指标（业绩大盘、客户经营、人力队伍），运用专业的寿险精算与客户经营框架（如新业务价值NBEV、客户全生命周期LTV、13/25个月继续率、家庭保单渗透率、MDRT绩优画像），输出一份供董事长/总经理进行决策判断的高管级智能经营研判报告。

请以严格的 JSON 格式输出，不要包含 markdown 标记外的其他杂质，数据需高度具体、数据化、针对性强：
{
  "title": "简明有力的研判标题",
  "overallStatus": "1-2句整体态势定性评述",
  "keyRisks": ["风险点1(含数据与根因)", "风险点2", "风险点3"],
  "keyOpportunities": ["机会点1(含客群特征与突破口)", "机会点2", "机会点3"],
  "actionDirectives": ["指令1(明确责任方与抓手)", "指令2", "指令3"],
  "predictedImpact": "决策实施后的量化预期财务与业务效果"
}`;

    const userPrompt = `当前关注维度: ${dimension || '客户经营'}
业务聚焦点: ${currentFocus || '全盘监控'}
经营环境与实时指标:
${JSON.stringify(metrics || {}, null, 2)}
补充业务背景:
${JSON.stringify(context || {}, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        { text: systemPrompt },
        { text: userPrompt },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, insight: parsed });
  } catch (error: any) {
    console.error('Error generating decision insight:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate decision insight',
    });
  }
});

// AI Customer Strategy & Add-on Coverage Generator
app.post('/api/ai/customer-strategy', async (req, res) => {
  try {
    const { customer } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        fallback: true,
        strategy: {
          clientLevel: customer?.tier || '卓越白金客户',
          lifecycleStage: '财富成长期 / 成熟家庭期',
          gapDiagnosis: '重疾与终身寿险保额充足，但家庭第二支柱养老年金与高端医疗（特别是特需/海外直付）存在明显缺口，缺乏家族财富信托隔离架构。',
          recommendedProducts: [
            {
              productName: '颐享金生·养老年金保险（分红型）+ 康养社区直通权益',
              targetCoverage: '年金领取 20万/年，首期保费 50万×5年交',
              strategicReason: '对接高净值康养社区保证入住函，契合客户55岁品质养老与资产保值诉求。',
            },
            {
              productName: '传世尊享·终身增额寿险',
              targetCoverage: '基本保额 1000万，年缴保费 100万×3年交',
              strategicReason: '定向传承给子女，隔离婚姻财产与企业经营代持风险。',
            },
          ],
          actionPlan: [
            '第一步：由资深私人财富顾问陪同主管，以《家庭保单年度尊享检视函》名义上门拜访。',
            '第二步：赠送高客专属三甲医院VIP绿通与高端体检套餐，建立深度服务触点。',
            '第三步：借“降息周期下锁定长期确定性利率”主题，出具定制化养老信托组合方案。',
          ],
          churnRiskPrevention: '针对该客户保单已过5年现金价值临界点的特征，重点强调提前退保的复利损失与免税传承优势。',
        },
      });
    }

    const prompt = `你是一名保险公司高客经营与核保核赔资深专家。
针对以下客户的完整档案与现有保单，进行精细化经营诊断，输出针对性的加保策略、推荐险种组合、高管督导拜访脚本及退保防范建议：
客户档案:
${JSON.stringify(customer || {}, null, 2)}

请以严格的 JSON 格式输出：
{
  "clientLevel": "评级与标签",
  "lifecycleStage": "全生命周期阶段判断",
  "gapDiagnosis": "深度保障缺口与资产配置结构分析",
  "recommendedProducts": [
    {
      "productName": "险种名称",
      "targetCoverage": "建议保额与缴费结构",
      "strategicReason": "推荐理由与痛点击穿点"
    }
  ],
  "actionPlan": ["行动步骤1", "行动步骤2", "行动步骤3"],
  "churnRiskPrevention": "流失/退保预警对策"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, strategy: parsed });
  } catch (error: any) {
    console.error('Error generating customer strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate customer strategy',
    });
  }
});

// AI Scenario Simulation (Executive Sandbox)
app.post('/api/ai/scenario-simulate', async (req, res) => {
  try {
    const { parameters, baseMetrics } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const budgetRate = parameters?.budgetBoost || 10;
      const agentSubsidy = parameters?.agentSubsidy || 15;
      const serviceUpgrade = parameters?.serviceUpgrade || '全系高客权益';

      return res.json({
        success: true,
        fallback: true,
        simulation: {
          executiveSummary: `模拟方案【加保资源增投 ${budgetRate}%, 新人津贴上调 ${agentSubsidy}%, 增值服务: ${serviceUpgrade}】生效预演：`,
          predictedFYP: '4.82 亿元 (+18.4%)',
          predictedNBEV: '1.63 亿元 (+22.1%)',
          predictedRetentionRate: '92.6% (+3.8pct)',
          activeAgentGrowth: '+1,420 人 (留存率提升至 68%)',
          crossSellRate: '34.2% (老客二次成交率提升 7.8pct)',
          roiEstimate: '1 : 4.6 (每投入1元运营激励产生4.6元首年期交边际利润)',
          keyTradeoffs: [
            '短期首年销售费用率上升约1.2%，但13M继续率预计回升至93%以上，带来长期续期净现金流',
            '需防范部分低质增员骗补风险，建议配套设置“首月破零+次月转正”考核双阀门',
          ],
          recommendation: '该决策预期收益远大于边际成本，强烈建议在华东、华南等主力分公司率先试点。',
        },
      });
    }

    const prompt = `你是一名保险公司精算部兼战略规划部专家。
请根据领导输入的经营调整假设参数以及当前基准指标，利用寿险经营动力学模型（含代理人产能弹性、客户转化弹性、费用率与新业务价值率）进行严密的沙盘推演：

输入参数:
${JSON.stringify(parameters || {}, null, 2)}
基准经营数据:
${JSON.stringify(baseMetrics || {}, null, 2)}

请以严格 JSON 格式返回模拟结果：
{
  "executiveSummary": "执行摘要",
  "predictedFYP": "预测首年期交规模及增幅",
  "predictedNBEV": "预测新业务价值及增幅",
  "predictedRetentionRate": "预测13M继续率及变动",
  "activeAgentGrowth": "队伍有效人力与留存变动",
  "crossSellRate": "老客加保/交叉销售渗透率",
  "roiEstimate": "投入产出比ROI精算评估",
  "keyTradeoffs": ["权衡点与潜在风险1", "权衡点与潜在风险2"],
  "recommendation": "最终高管决策建议（如：立即执行/分步试点/暂缓调整）"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, simulation: parsed });
  } catch (error: any) {
    console.error('Error simulating scenario:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to simulate scenario',
    });
  }
});

// AI Chat Copilot (Executive Q&A)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, contextData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        success: true,
        reply: '【系统助理回复】当前处于离线仿真模式。关于您询问的“客户经营与保单继续率”，建议重点调取华东分公司中产家庭加保专案数据，对近期满期及保单贷款高企客户进行主动健康关怀触达。',
      });
    }

    const systemInstruction = `你是一位服务于大型保险公司董事长、总裁、分管个险副总裁的“AI战略决策总助理”。
你掌握保险公司的三大核心大盘实时数据：
1. 业绩大盘（规模保费、首年期交FYP、新业务价值NBEV、险种结构）
2. 客户经营（核心重点！客群分层、LTV生命周期、保障缺口雷达、13/25M继续率、加保渗透率、高客健康与养老社区对接）
3. 人力分析（总人力、有效活动人力、主管产能、新人留存率、MDRT绩优占比）

当前系统实时数据上下文:
${JSON.stringify(contextData || {}, null, 2)}

回答风格要求：
- 极其专业、言简意赅、逻辑缜密、直击要害。
- 使用寿险高管熟悉的专业术语（如FYP、NBEV、13M继续率、件均保费、人均产能PBE、活动率、转介率）。
- 提出论点时结合具体数据与可落地的管理抓手（例如：组织督导通报、调整佣金激励方案、开启高客闭门品鉴会等）。`;

    const chat = ai.chats.create({
      model: 'gemini-3.7-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      },
    });

    const lastMessage = messages[messages.length - 1]?.content || '请分析当前经营关键态势';
    const response = await chat.sendMessage({
      message: lastMessage,
    });

    res.json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat',
    });
  }
});

// Vite middleware for development & static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
