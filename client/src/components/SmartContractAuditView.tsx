import React, { useState } from 'react';
import { Code2, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles, Terminal, FileCode, Play } from 'lucide-react';
import { AuditRecord } from '../types';
import { runClientSmartContractAudit } from '../services/clientAuditEngine';

interface SmartContractAuditViewProps {
  onAuditCompleted: (audit: AuditRecord) => void;
}

export const SmartContractAuditView: React.FC<SmartContractAuditViewProps> = ({ onAuditCompleted }) => {
  const sampleVulnerable = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // CRITICAL: Reentrancy vulnerability (Checks-Effects-Interactions violated)
    function emergencyWithdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // External low-level call before state update
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }

    // HIGH: Phishing vulnerability with tx.origin
    function setOwner(address newOwner) public {
        require(tx.origin == owner, "Not owner");
        owner = newOwner;
    }
}`;

  const sampleSecure = `// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SecureVault is ReentrancyGuard, Ownable {
    mapping(address => uint256) private _balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        _balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        
        // Checks-Effects-Interactions: State updated FIRST
        _balances[msg.sender] -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }
}`;

  const [contractCode, setContractCode] = useState(sampleVulnerable);
  const [contractName, setContractName] = useState('VulnerableVault');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditRecord | null>(null);

  const handleRunAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/audits/smart-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: contractCode,
          contractName,
          projectName: `${contractName}.sol`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.audit);
        onAuditCompleted(data.audit);
      } else {
        throw new Error('API unavailable, switching to Serverless Client Engine');
      }
    } catch (e) {
      console.warn('Using client-side serverless audit engine:', e);
      try {
        const fallback = await runClientSmartContractAudit(contractCode, contractName);
        setAuditResult(fallback.audit);
        onAuditCompleted(fallback.audit);
      } catch (fallbackErr) {
        console.error('Client audit failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#1a1c2b] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Code2 className="w-4 h-4" />
            Module A: Smart Contract Audit Engine
          </div>
          <h2 className="text-xl font-extrabold text-white">Solidity Security & Reentrancy Scanner</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Integrated Slither, Foundry, and AST static analyzer for vulnerability detection, access-control analysis, and gas optimization.
          </p>
        </div>
      </div>

      {/* Preset Buttons & Code Editor */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-300">Contract Name:</label>
            <input
              type="text"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              className="bg-[#141d30] border border-[#24334f] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Load Template:</span>
            <button
              onClick={() => {
                setContractCode(sampleVulnerable);
                setContractName('VulnerableVault');
              }}
              className="py-1 px-2.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold cursor-pointer"
            >
              Vulnerable Contract
            </button>
            <button
              onClick={() => {
                setContractCode(sampleSecure);
                setContractName('SecureVault');
              }}
              className="py-1 px-2.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
            >
              Secure Contract
            </button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="relative rounded-xl overflow-hidden border border-[#24334f] bg-[#0a0e1a]">
          <div className="flex items-center justify-between px-4 py-2 bg-[#101626] border-b border-[#24334f] text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="ml-2 font-bold text-slate-300">{contractName}.sol</span>
            </div>
            <span>Solidity 0.8.x</span>
          </div>
          <textarea
            value={contractCode}
            onChange={(e) => setContractCode(e.target.value)}
            rows={14}
            className="w-full bg-[#0a0e1a] p-4 font-mono text-xs text-amber-200/90 leading-relaxed focus:outline-none resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Engines: AST Static Parser + Crytic Slither Adapter + Aderyn</span>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isLoading}
            className="py-2.5 px-6 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isLoading ? 'Scanning AST & Invariants...' : 'Run Smart Contract Audit'}</span>
          </button>
        </div>
      </div>

      {/* Audit Findings Display */}
      {auditResult && (
        <div className="bg-[#111726] border border-amber-500/40 rounded-xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                AUDIT COMPLETED
              </span>
              <h3 className="text-lg font-bold text-white mt-1">
                {auditResult.projectName} — Security Score: {auditResult.score}/100
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-slate-400 block">{auditResult.auditNumber}</span>
              <span className="text-xs font-bold text-amber-400">
                {auditResult.findings.length} Finding(s) Detected
              </span>
            </div>
          </div>

          {/* Plain Language Summary */}
          <div className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-1.5 text-xs text-slate-200">
            <p className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Plain-Language Executive Summary
            </p>
            <p className="leading-relaxed">{auditResult.summary.executiveSummary}</p>
          </div>

          {/* Detailed Findings Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Vulnerability Breakdown & Safe Remediation</h4>
            {auditResult.findings.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-[#141d30] border border-[#24334f] rounded-xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        f.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : f.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {f.severity}
                    </span>
                    <h5 className="font-semibold text-white">{f.title}</h5>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{f.cweOrRef}</span>
                </div>

                {f.evidenceSnippet && (
                  <div className="p-2 bg-[#0c101a] rounded border border-slate-800 text-[11px] font-mono text-rose-300">
                    <span className="text-slate-500 text-[10px] block">Flagged Code:</span>
                    {f.evidenceSnippet}
                  </div>
                )}

                <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-amber-400">Plain Language Explanation:</p>
                  <p className="text-slate-300 leading-relaxed">{f.plainLanguageExplanation}</p>
                </div>

                <div className="p-3 bg-[#0c101c] rounded-lg border border-slate-800 space-y-1">
                  <p className="text-[11px] font-bold text-emerald-400">Recommended Action:</p>
                  <p className="text-emerald-300 leading-relaxed">{f.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

