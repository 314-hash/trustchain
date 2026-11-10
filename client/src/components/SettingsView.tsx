import React, { useState } from 'react';
import { Settings, Shield, Globe, Database, Key, CheckCircle2, Sparkles, Server } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [selectedChainId, setSelectedChainId] = useState('8453');
  const [rpcUrl, setRpcUrl] = useState('https://mainnet.base.org');
  const [customRegistryContract, setCustomRegistryContract] = useState('0x71C8354366A96C2522778B27bF13fF1A3d596495');
  const [offChainStorageMode, setOffChainStorageMode] = useState('encrypted_vault');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleChainChange = (chainId: string) => {
    setSelectedChainId(chainId);
    if (chainId === '8453') setRpcUrl('https://mainnet.base.org');
    else if (chainId === '1') setRpcUrl('https://eth.llamarpc.com');
    else if (chainId === '137') setRpcUrl('https://polygon-rpc.com');
    else if (chainId === '42161') setRpcUrl('https://arb1.arbitrum.io/rpc');
    else if (chainId === '11155111') setRpcUrl('https://rpc.sepolia.org');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            Infrastructure & Integration
          </div>
          <h2 className="text-xl font-extrabold text-white">Platform Settings & Blockchain Adapters</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Configure EVM RPC endpoints, off-chain encrypted vaults, and scanner engine timeouts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Blockchain Config */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            EVM Blockchain Evidence Adapter
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target EVM Chain</label>
              <select
                value={selectedChainId}
                onChange={(e) => handleChainChange(e.target.value)}
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="8453">Base Mainnet (Coinbase L2) — Recommended</option>
                <option value="1">Ethereum Mainnet (L1 High Security)</option>
                <option value="137">Polygon PoS</option>
                <option value="42161">Arbitrum One</option>
                <option value="11155111">Ethereum Sepolia Testnet</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">JSON-RPC Endpoint URL</label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                TrustChain Evidence Registry Contract Address
              </label>
              <input
                type="text"
                value={customRegistryContract}
                onChange={(e) => setCustomRegistryContract(e.target.value)}
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500">
                Leave default to use TrustChain's verified Base L2 registry or provide your private institutional contract.
              </span>
            </div>
          </div>
        </div>

        {/* Storage & Privacy Config */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            Off-Chain Storage & Data Retention
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Evidence Storage Engine</label>
              <select
                value={offChainStorageMode}
                onChange={(e) => setOffChainStorageMode(e.target.value)}
                className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="encrypted_vault">Local Encrypted JSON Vault (AES-256)</option>
                <option value="aws_s3">Private AWS S3 / Cloudflare R2 Bucket</option>
                <option value="postgres">PostgreSQL Enterprise Database</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Document Retention Policy</label>
              <select className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500">
                <option>Retain hashes permanently, purge raw files after 30 days</option>
                <option>Zero raw file storage (Instant hash & discard)</option>
                <option>Institutional archive (Indefinite secure retention)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Engine & API Keys */}
        <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Audit Explanation Engine
          </h3>

          <div className="text-xs space-y-3">
            <div className="p-3 bg-[#141d30] border border-[#24334f] rounded-lg">
              <span className="font-bold text-white block mb-1">Provider-Independent Architecture:</span>
              <p className="text-slate-400 leading-relaxed">
                TrustChain includes a native deterministic reasoning model pre-configured with complete cybersecurity, Solidity SWC, and DRM rules. You can also connect OpenAI or Gemini API keys in the environment for expanded conversational depth.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>

          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

