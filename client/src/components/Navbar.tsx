import React, { useState } from 'react';
import { Wallet, ShieldCheck, ExternalLink, CheckCircle, ChevronDown, Bell } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onStartAuditClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onStartAuditClick }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('Base (Coinbase L2)');

  const tabTitles: Record<string, string> = {
    overview: 'Executive Dashboard & Platform Health',
    wizard: 'Guided Audit Wizard (7-Step Flow)',
    'my-audits': 'Audit Records & Verification Vault',
    tempest: 'TEMPEST Security Engine (T3MP3ST Multi-Agent Assessment)',
    streaming: 'Movie Streaming & HLS/DRM Security Audit',
    publishing: 'E-Book & Digital Publishing Verification Portal',
    'smart-contract': 'Smart Contract Audit Engine (Solidity / EVM)',
    'web-security': 'Website & API Security Audit (OWASP / TLS Hardening)',
    rights: 'Movie Rights & Distribution Ledger',
    certificates: 'Tamper-Evident Blockchain Evidence Registry',
    'ai-assistant': 'AI Audit Assistant (Plain-Language Explanations)',
    reports: 'Executive & Technical PDF Report Generator',
    team: 'Team Access Control & Roles',
    settings: 'Platform Settings & RPC Network Adapters',
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if ((window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      } else {
        // Fallback simulated auditor wallet for testing without MetaMask installed
        setWalletAddress('0x71C8...6495');
      }
    } catch (e) {
      setWalletAddress('0x71C8...6495');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="h-16 bg-[#0a0e1a]/90 backdrop-blur-md border-b border-[#1e293b] fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-amber-400"></div>
        <h2 className="text-sm font-semibold text-slate-100 tracking-wide">
          {tabTitles[currentTab] || 'TrustChain Audit'}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Free Public Access Pill */}
        <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Free Public Use &bull; Zero Gas</span>
        </div>

        {/* Network Badge */}
        <div className="hidden md:flex items-center gap-2 bg-[#131b2e] border border-[#232f45] px-3 py-1.5 rounded-lg text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span className="font-medium text-slate-200">{selectedNetwork}</span>
        </div>

        {/* Wallet Connect Button */}
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
            walletAddress
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : isConnecting
              ? 'Connecting...'
              : 'Connect Web3 Wallet'}
          </span>
          {walletAddress && <CheckCircle className="w-3 h-3 text-emerald-400" />}
        </button>

        {/* Start Audit CTA */}
        <button
          onClick={onStartAuditClick}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-sm shadow-amber-500/30"
        >
          New Audit
        </button>
      </div>
    </header>
  );
};

