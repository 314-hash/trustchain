import React, { useState } from 'react';
import { Bot, Sparkles, Send, ShieldCheck, ArrowRight, BookOpen, Tv, Code2, AlertTriangle } from 'lucide-react';
import { AuditRecord } from '../types';

interface AiAuditAssistantViewProps {
  audits: AuditRecord[];
}

export const AiAuditAssistantView: React.FC<AiAuditAssistantViewProps> = ({ audits }) => {
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello! I am your TrustChain AI Audit Assistant. I translate complicated cybersecurity, smart contract, and digital rights terminology into simple, actionable plain English. You can ask me anything about your audits, streaming security, or copyright verification.',
      time: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'Can someone drain my smart contract with a reentrancy attack?',
    'Why does our movie streaming platform need DRM if we already have logins?',
    'Does a file hash prove I legally own the copyright to my book or movie?',
    'How is the TrustChain security score calculated?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });
      const data = await res.json();

      const aiMsg = {
        role: 'assistant' as const,
        text: data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            Module F: Plain-Language AI Audit Assistant
          </div>
          <h2 className="text-xl font-extrabold text-white">Non-Technical Security & Provenance Copilot</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Explains technical vulnerabilities in plain English. Grounded strictly in verified scanner evidence and legal copyright principles.
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-4 shadow-lg space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Frequently Asked Non-Technical Questions:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left p-2.5 bg-[#141d30] hover:bg-[#1a2640] border border-[#232f45] rounded-lg text-xs text-slate-200 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-1">{q}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 flex-shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl shadow-xl flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-bold text-xs'
                    : 'bg-[#1e293b] text-amber-400 border border-amber-500/30'
                }`}
              >
                {m.role === 'user' ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                  m.role === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                    : 'bg-[#141d30] text-slate-200 border border-[#232f45] rounded-tl-none shadow-lg'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <span
                  className={`text-[9px] block text-right font-mono ${
                    m.role === 'user' ? 'text-slate-900/70' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono italic">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Analyzing audit logs and formulating plain-language response...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-[#1e293b] bg-[#0c101c] flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything (e.g. 'Explain the findings in CineChain audit in simple words')..."
            className="flex-1 bg-[#141d30] border border-[#24334f] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isTyping}
            className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

