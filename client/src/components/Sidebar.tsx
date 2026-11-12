import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  FolderGit2,
  Tv,
  BookOpen,
  Code2,
  Globe,
  FileCheck2,
  Award,
  Bot,
  FileText,
  Users,
  Settings,
  Sparkles,
  Zap,
  Landmark,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onStartAuditClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, onStartAuditClick }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'wizard', label: 'Start New Audit', icon: Sparkles, highlight: true },
    { id: 'my-audits', label: 'My Audits', icon: FolderGit2 },
    { id: 'tempest', label: 'TEMPEST Engine', icon: Zap, highlight: true },
    { id: 'streaming', label: 'Streaming Audit', icon: Tv },
    { id: 'bir-tax-portal', label: 'BIR Tax Audit Portal', icon: Landmark, highlight: true },
    { id: 'publishing', label: 'Publishing Audit', icon: BookOpen },
    { id: 'smart-contract', label: 'Smart Contract Audit', icon: Code2 },
    { id: 'web-security', label: 'Web Security Audit', icon: Globe },
    { id: 'rights', label: 'Rights Verification', icon: FileCheck2 },
    { id: 'certificates', label: 'Blockchain Certificates', icon: Award },
    { id: 'ai-assistant', label: 'AI Audit Assistant', icon: Bot },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d121f] border-r border-[#1e293b] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1e293b] flex items-center space-x-3 bg-gradient-to-b from-[#111827] to-[#0d121f]">
        <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#f59e0b]/40 shadow-sm shadow-amber-500/20 bg-black flex-shrink-0">
          <img src="/logo.jpg" alt="TrustChain Audit" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1">
            TRUSTCHAIN <span className="text-[#f59e0b]">AUDIT</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-tight leading-none mt-1">
            Streaming &bull; Publishing &bull; Web3
          </p>
        </div>
      </div>

      {/* Quick Launch CTA */}
      <div className="p-3">
        <button
          onClick={onStartAuditClick}
          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>START NEW AUDIT</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                  GUIDED
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Network & Node Status Bar */}
      <div className="p-3 border-t border-[#1e293b] bg-[#090d16] text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Serverless RPC
          </span>
          <span className="text-amber-400 font-mono text-[10px] font-bold">Base L2 (8453)</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Architecture</span>
          <span className="text-amber-300 font-semibold">Edge / Serverless</span>
        </div>
        <div className="flex items-center justify-between text-[10px] mt-0.5">
          <span className="text-slate-500">Gas Economics</span>
          <span className="text-emerald-400 font-bold">100% Free Public</span>
        </div>
      </div>
    </aside>
  );
};
