import React, { useState } from 'react';
import { Users, Shield, Plus, Mail, CheckCircle2, MoreVertical, Sparkles } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Principal Auditor' | 'Security Engineer' | 'Content Compliance Officer' | 'Executive Viewer';
  accessLevel: 'Admin' | 'Auditor' | 'Viewer';
  status: 'Active' | 'Pending Invite';
}

export const TeamManagementView: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'usr-1',
      name: 'Jan La (Founder)',
      email: 'founder@trustchain.audit',
      role: 'Principal Auditor',
      accessLevel: 'Admin',
      status: 'Active',
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova',
      email: 'elena@veritas-books.io',
      role: 'Content Compliance Officer',
      accessLevel: 'Auditor',
      status: 'Active',
    },
    {
      id: 'usr-3',
      name: 'Marcus Vance',
      email: 'marcus@aetherion.media',
      role: 'Security Engineer',
      accessLevel: 'Auditor',
      status: 'Active',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Security Engineer');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newM: TeamMember = {
      id: `usr-${Date.now()}`,
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      accessLevel: inviteRole === 'Principal Auditor' ? 'Admin' : 'Auditor',
      status: 'Active',
    };

    setMembers([...members, newM]);
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111726] to-[#162138] border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            Access Control & RBAC
          </div>
          <h2 className="text-xl font-extrabold text-white">Team Management & Role-Based Access</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Manage authorized auditors, content compliance officers, and viewer permissions across your organization.
          </p>
        </div>
      </div>

      {/* Invite Member Form */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Invite Team Member</h3>

        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="e.g. Alex Chen"
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="alex@organization.com"
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Role & Responsibility</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-[#141d30] border border-[#24334f] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Principal Auditor">Principal Auditor (Admin)</option>
              <option value="Security Engineer">Security Engineer (Auditor)</option>
              <option value="Content Compliance Officer">Content Compliance Officer</option>
              <option value="Executive Viewer">Executive Viewer (Read-only)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Send Invite</span>
            </button>
          </div>
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-[#111726] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white">Active Team Members ({members.length})</h3>

        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3.5 bg-[#141d30] border border-[#1e293b] rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center">
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{m.name}</h4>
                  <p className="text-slate-400 text-[11px]">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="font-semibold text-slate-200 block">{m.role}</span>
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">
                    {m.accessLevel}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

