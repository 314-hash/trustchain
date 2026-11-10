import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Overview } from './components/Overview';
import { AuditWizard } from './components/AuditWizard';
import { MyAudits } from './components/MyAudits';
import { StreamingAuditView } from './components/StreamingAuditView';
import { PublishingAuditView } from './components/PublishingAuditView';
import { SmartContractAuditView } from './components/SmartContractAuditView';
import { RightsVerificationView } from './components/RightsVerificationView';
import { BlockchainCertificatesView } from './components/BlockchainCertificatesView';
import { AiAuditAssistantView } from './components/AiAuditAssistantView';
import { ReportsView } from './components/ReportsView';
import { TeamManagementView } from './components/TeamManagementView';
import { SettingsView } from './components/SettingsView';
import { AuditRecord, BlockchainCertificate, MovieRightsRecord, PublishingRecord } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [certificates, setCertificates] = useState<BlockchainCertificate[]>([]);
  const [movieRights, setMovieRights] = useState<MovieRightsRecord[]>([]);
  const [publishingRecords, setPublishingRecords] = useState<PublishingRecord[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Fetch initial seed data from backend
  const loadPlatformData = async () => {
    try {
      const [auditsRes, certsRes, rightsRes, pubRes] = await Promise.all([
        fetch('/api/audits'),
        fetch('/api/certificates'),
        fetch('/api/movie-rights'),
        fetch('/api/publishing'),
      ]);

      if (auditsRes.ok) setAudits(await auditsRes.json());
      if (certsRes.ok) setCertificates(await certsRes.json());
      if (rightsRes.ok) setMovieRights(await rightsRes.json());
      if (pubRes.ok) setPublishingRecords(await pubRes.json());
    } catch (e) {
      console.warn('Backend loading warning:', e);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleAuditCompleted = (newAudit: AuditRecord) => {
    setAudits((prev) => [newAudit, ...prev]);
    loadPlatformData();
  };

  const handleSelectAudit = (auditId: string) => {
    setSelectedAuditId(auditId);
    setCurrentTab('my-audits');
  };

  const handlePublicationAdded = (record: PublishingRecord, cert: BlockchainCertificate) => {
    setPublishingRecords((prev) => [record, ...prev]);
    setCertificates((prev) => [cert, ...prev]);
  };

  const handleMovieAdded = (record: MovieRightsRecord) => {
    setMovieRights((prev) => [record, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex">
      {/* 12-Item Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onStartAuditClick={() => setCurrentTab('wizard')}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header Navbar */}
        <Navbar
          currentTab={currentTab}
          onStartAuditClick={() => setCurrentTab('wizard')}
        />

        {/* Content Body */}
        <main className="flex-1 p-8 mt-16 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <Overview
              audits={audits}
              certificates={certificates}
              movieRights={movieRights}
              publishingRecords={publishingRecords}
              onStartAuditClick={() => setCurrentTab('wizard')}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onSelectAudit={handleSelectAudit}
            />
          )}

          {currentTab === 'wizard' && (
            <AuditWizard
              onAuditCompleted={handleAuditCompleted}
              onGoToDetail={handleSelectAudit}
            />
          )}

          {currentTab === 'my-audits' && (
            <MyAudits
              audits={audits}
              selectedAuditId={selectedAuditId}
              onClearSelectedAudit={() => setSelectedAuditId(null)}
              onSelectAudit={handleSelectAudit}
              onStartAuditClick={() => setCurrentTab('wizard')}
            />
          )}

          {currentTab === 'streaming' && (
            <StreamingAuditView onAuditCompleted={handleAuditCompleted} />
          )}

          {currentTab === 'publishing' && (
            <PublishingAuditView
              publishingRecords={publishingRecords}
              onPublicationAdded={handlePublicationAdded}
            />
          )}

          {currentTab === 'smart-contract' && (
            <SmartContractAuditView onAuditCompleted={handleAuditCompleted} />
          )}

          {currentTab === 'rights' && (
            <RightsVerificationView
              movieRights={movieRights}
              onMovieAdded={handleMovieAdded}
            />
          )}

          {currentTab === 'certificates' && (
            <BlockchainCertificatesView certificates={certificates} />
          )}

          {currentTab === 'ai-assistant' && (
            <AiAuditAssistantView audits={audits} />
          )}

          {currentTab === 'reports' && (
            <ReportsView audits={audits} />
          )}

          {currentTab === 'team' && (
            <TeamManagementView />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
