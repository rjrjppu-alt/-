import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Lightbulb,
  FileText,
  AlertTriangle,
  Flame,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react';
import { BranchRegion, TimeRange } from '../../types';

interface ExecutiveAICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  timeRange: TimeRange;
  selectedBranch: BranchRegion;
  initialQuery?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

export const ExecutiveAICopilot: React.FC<ExecutiveAICopilotProps> = ({
  isOpen,
  onClose,
  timeRange,
  selectedBranch,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `您好，我是您的**保险公司高管经营决策智能助理**。

我已接入公司三大业务大盘（**客户经营画像、业绩与险种价值、代理人人力队伍**）实时数据底座。

您可以随时向我询问：
1. **客户经营诊断**：客群分层、家庭保单加保潜力、银发康养社区转化瓶颈
2. **继续率与退保分析**：13/25个月继续率异动根因、高危保单挽留抓手
3. **经营策略与督导**：险种结构转型、MDRT产能提振、一键生成高管督办指令`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        '分析华东与西南分公司13M继续率差异的深层原因',
        '如何针对40-50岁中产家庭提升第二张保单（养老/增额寿）加保率？',
        '生成一份《关于启动Q3高客家庭保单检视专项攻坚》的高管督导通报',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      sendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.content,
          })),
          contextData: {
            currentTab: '决策大屏全景',
            timeRange,
            selectedBranch,
            coreMetrics: {
              gwp: '42.85 亿元',
              fyp: '12.46 亿元 (达成率 89.0%)',
              nbev: '3.92 亿元 (价值率 31.5%)',
              persistency13M: '91.8% (目标 93.5%)',
              totalCustomers: '368.5 万人',
              familyAddonRate: '31.2%',
              hnwVIPCount: '42,680 人',
              agencyHeadcount: '24,850 人 (活动率 70.0%)',
              mdrtCount: '1,680 人 (占比 6.76%)',
            },
          },
        }),
      });

      const data = await res.json();
      const replyText = data.reply || '抱歉，暂时未能获取分析结果，请稍后再试。';

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error('Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          content: '服务连接异常，请检查网络或配置后再试。',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">保意决 · 高管决策战略助理</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Gemini 3.7 业务底座
                </span>
              </div>
              <p className="text-xs text-slate-500">实时交互研判 · 经营归因诊断 · 战略督办通报生成</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm bg-slate-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-3.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2 text-xs sm:text-sm font-normal">
                    {m.content}
                  </div>

                  {m.sender === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{m.timestamp}</span>
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>复制研报内容</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Suggested Action Chips */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-[11px] text-slate-500 font-semibold flex items-center">
                      <Lightbulb className="w-3 h-3 mr-1 text-amber-500" />
                      您可能想进一步探询：
                    </p>
                    <div className="flex flex-col space-y-1.5">
                      {m.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(act)}
                          className="text-left px-3 py-2 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 text-xs text-slate-700 hover:text-blue-700 flex items-center justify-between transition-all group shadow-2xs cursor-pointer"
                        >
                          <span className="truncate mr-2 font-medium">{act}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none text-slate-700 text-xs flex items-center space-x-2 shadow-xs">
                <span className="animate-spin text-blue-600">⏳</span>
                <span>正在深度关联客户画像数据与精算模型进行战略推理...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Hot Topics */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs text-slate-500 whitespace-nowrap">
          <span className="flex items-center text-amber-600 shrink-0 font-semibold">
            <Flame className="w-3.5 h-3.5 mr-1" />
            决策热搜:
          </span>
          {[
            '客群加保空间分析',
            '13M退保归因与对策',
            '银发养老社区转化率',
            'MDRT队伍结构健康度',
            '生成分公司督导令',
          ].map((topic, i) => (
            <button
              key={i}
              onClick={() => sendMessage(`请全面剖析：${topic}`)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 text-xs transition-colors cursor-pointer shadow-2xs font-medium"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              id="ai-copilot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请输入您的经营疑问或管理要求（如：分析中产家庭退保原因与挽回方案）..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>发送</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
