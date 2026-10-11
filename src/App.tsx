import React, { useState, useMemo, useEffect } from 'react';
import { EVedhikaNavbar } from './components/EVedhikaNavbar';
import { FlashNewsBar } from './components/FlashNewsBar';
import { ModuleSelectorCard } from './components/ModuleSelectorCard';
import { FutureUpdatesModule } from './components/FutureUpdatesModule';
import { AuthModal } from './components/AuthModal';
import { AdminUsersModal } from './components/AdminUsersModal';
import { ExeGeneratorModal } from './components/ExeGeneratorModal';
import { UpdateCheckerModal } from './components/UpdateCheckerModal';
import { BotExecutionModal } from './components/BotExecutionModal';
import { DomainPolicyModal } from './components/DomainPolicyModal';
import { GpBatchSelector } from './components/GpBatchSelector';
import { ExcelManager } from './components/ExcelManager';
import { DuplicateMobileAlert } from './components/DuplicateMobileAlert';
import { DataPreviewTable } from './components/DataPreviewTable';
import { DataRecord, PortalType, SelectedModule, UserProfile } from './types';
import { INITIAL_AKKALAPALLI_DATA } from './utils/sampleData';
import { findDuplicateMobiles } from './utils/excelParser';
import { getActiveUser, setActiveUserSession, getStoredUsers } from './utils/authStorage';
import { checkDomainPolicy } from './utils/domainPolicyStorage';
import { Play, Monitor, Layers, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export function App() {
  // Navigation & Module State
  const [selectedModule, setSelectedModule] = useState<SelectedModule>('tmp');
  const [selectedPortal, setSelectedPortal] = useState<PortalType>('1');

  // User Authentication State (Website & App Sync)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getActiveUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminUsersModalOpen, setIsAdminUsersModalOpen] = useState(false);
  const [isDomainPolicyModalOpen, setIsDomainPolicyModalOpen] = useState(false);

  // GP Batch Data State
  const [gpName, setGpName] = useState<string>('Akkalapalli');
  const [fileName, setFileName] = useState<string | null>('Akkalapalli.xlsx');
  const [records, setRecords] = useState<DataRecord[]>(INITIAL_AKKALAPALLI_DATA);
  const [hasConfirmedProceed, setHasConfirmedProceed] = useState<boolean>(false);

  // Tool Modals
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState<boolean>(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState<boolean>(false);

  // Refresh user data from storage
  const refreshUser = () => {
    setCurrentUser(getActiveUser());
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Compute duplicates
  const duplicateGroups = useMemo(() => findDuplicateMobiles(records), [records]);
  const duplicateMobilesSet = useMemo(() => {
    return new Set(duplicateGroups.map((g) => g.mobile));
  }, [duplicateGroups]);

  const hasDuplicates = duplicateGroups.length > 0;
  const isUserApproved = currentUser?.status === 'approved' || currentUser?.role === 'admin';

  // Handle file loaded
  const handleDataLoaded = (newRecords: DataRecord[], newFileName: string) => {
    setRecords(newRecords);
    setFileName(newFileName);
    setHasConfirmedProceed(false);
  };

  // Add a new row
  const handleAddRecord = () => {
    const newSNo = records.length + 1;
    const newRecord: DataRecord = {
      'S.No': newSNo,
      'Name': `Citizen ${newSNo}`,
      'Mobile': `98000000${String(newSNo).padStart(2, '0')}`,
      'Aadhaar': `1234-5678-${String(newSNo).padStart(4, '0')}`,
      'RationCard': `WAP12089${String(newSNo).padStart(3, '0')}`,
      'Ward': `Ward 1`,
      'Status': 'Pending',
    };
    setRecords([...records, newRecord]);
  };

  // Update a record
  const handleUpdateRecord = (index: number, updated: DataRecord) => {
    const updatedRecords = [...records];
    updatedRecords[index] = updated;
    setRecords(updatedRecords);
  };

  // Delete a record
  const handleDeleteRecord = (index: number) => {
    const updated = records.filter((_, idx) => idx !== index);
    setRecords(updated);
  };

  // Auto-fix duplicates
  const handleAutoFixDuplicates = () => {
    const seen = new Set<string>();
    const updated = records.map((record, index) => {
      const mob = String(record['Mobile'] || '').trim();
      if (!seen.has(mob)) {
        seen.add(mob);
        return record;
      }
      const suffix = String(index + 10).slice(-2);
      const newMobile = mob.slice(0, 8) + suffix;
      seen.add(newMobile);
      return {
        ...record,
        'Mobile': newMobile,
      };
    });
    setRecords(updated);
    setHasConfirmedProceed(true);
  };

  // Launch Bot Execution with User Access Control
  const handleStartBotEntry = () => {
    if (!currentUser) {
      alert('దయచేసి అప్లికేషన్ ఉపయోగించడానికి మొదట రిజిస్టర్ లేదా లాగిన్ అవ్వండి.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!isUserApproved) {
      alert('క్షమించండి! మీ రిజిస్ట్రేషన్ ఇంకా అడ్మిన్ ఆమోదం (Approval) పొందలేదు. అడ్మిన్ మీకు అనుమతి ఇచ్చిన తర్వాత మాత్రమే డేటా ఎంట్రీ రన్ అవుతుంది.');
      return;
    }

    // 1. Verify Target Website Automation Compliance (No Guessing Blacklists, Safe Halt on Unknown)
    const targetDomain = selectedPortal === '1' ? 'portal.grampanchayat.gov.in' : 'panchayat.telangana.gov.in';
    const compliance = checkDomainPolicy(targetDomain);

    if (!compliance.allowed) {
      if (compliance.status === 'restricted') {
        alert(`[X] ఆటోమేషన్ నిలిపివేయబడింది: '${compliance.policy?.domain}' వెబ్‌సైట్ నిబంధనల ప్రకారం ఆటోమేటెడ్ ఎంట్రీ నిషేధించబడింది.\n\nకారణం: ${compliance.message}\nనిబంధనల ఉల్లంఘన జరగకుండా సేఫ్‌గా ఆపడం జరిగింది.`);
        setIsDomainPolicyModalOpen(true);
        return;
      }
      if (compliance.status === 'unknown') {
        alert(`[!] భద్రతా హెచ్చరిక: '${targetDomain}' డొమైన్ ఆటోమేషన్ పాలసీ ఇంకా స్పష్టంగా ధృవీకరించబడలేదు!\n\nవెబ్‌సైట్ నిబంధనల ఉల్లంఘన జరగకుండా సేఫ్‌గా ఆపి మాన్యువల్ రివ్యూ కోరడం జరిగింది.\nదయచేసి అడ్మిన్ ఈ డొమైన్ నిబంధనలను సమీక్షించి కాన్ఫిగర్ చేయండి.`);
        setIsDomainPolicyModalOpen(true);
        return;
      }
    }

    if (records.length === 0) {
      alert('దయచేసి ఎక్సెల్ డేటాను లోడ్ చేయండి (Please load data before running bot).');
      return;
    }

    if (hasDuplicates && !hasConfirmedProceed) {
      alert('హెచ్చరిక: మొబైల్ నంబర్లలో రిపీట్‌లు ఉన్నాయి. దయచేసి "Continue Anyway (y)" ఎంచుకోండి లేదా నంబర్లను మార్చండి.');
      return;
    }

    setIsExecutionModalOpen(true);
  };

  const handleLaunchDynamicForm = (formTitle: string, sampleFields: string[]) => {
    if (!currentUser) {
      alert('దయచేసి మొదట లాగిన్ అవ్వండి.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!isUserApproved) {
      alert('అడ్మిన్ అనుమతి (Approval) తర్వాత మాత్రమే ఈ ఫారాలను రన్ చేయగలరు.');
      return;
    }

    // Switch to TMP engine preloaded with the dynamic form
    setSelectedModule('tmp');
    alert(`'${formTitle}' విజయవంతంగా లోడ్ అయింది! ఇప్పుడు మీరు బ్యాచ్ ఎంట్రీని రన్ చేయవచ్చు.`);
  };

  const handleLogout = () => {
    setActiveUserSession(null);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* 1. E-Vedhika Top Navigation Bar */}
      <EVedhikaNavbar
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminUsersModal={() => setIsAdminUsersModalOpen(true)}
        onOpenDomainPolicyModal={() => setIsDomainPolicyModalOpen(true)}
        onOpenExeModal={() => setIsExeModalOpen(true)}
        onNavigateHome={() => setSelectedModule('')}
        onLogout={handleLogout}
      />

      {/* 2. Flash News Announcement Ticker (Matching Screenshot) */}
      <FlashNewsBar />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        {/* 3. Center Module Selection Card (Matching Screenshot) */}
        <ModuleSelectorCard
          selectedModule={selectedModule}
          onSelectModule={setSelectedModule}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* 4A. If TMP Portal Selected: Render Full Data Entry Bot Suite */}
        {selectedModule === 'tmp' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* TMP Banner & Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <Monitor className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    TMP Portal — గ్రామ పంచాయతీ డేటా ఎంట్రీ బాట్
                  </h3>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    v.1.0.0 Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  గ్రామ పంచాయతీ బ్యాచ్ ఎక్సెల్ షీట్ (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-semibold">{gpName || 'Akkalapalli'}.xlsx</code>)
                  తనిఖీ చేస్తుంది, రిపీట్ అయిన మొబైల్ నంబర్లను ఫిల్టర్ చేస్తుంది మరియు ఆటోమేటిక్ పోర్టల్ ఎంట్రీ నిర్వహిస్తుంది.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDomainPolicyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  title="డొమైన్ ఆటోమేషన్ నిబంధనల సమీక్ష & అనుమతి"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>పాలసీ వెరిఫైడ్ (portal.grampanchayat.gov.in)</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartBotEntry}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer ${
                    records.length > 0 && (!hasDuplicates || hasConfirmedProceed) && isUserApproved
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 ring-2 ring-blue-500/20'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Data Entry Bot (ఎంట్రీ స్టార్ట్ చేయండి)</span>
                </button>
              </div>
            </div>

            {/* Step 2 & 3: GP Batch Selector & Excel Loader */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <GpBatchSelector
                gpName={gpName}
                onChangeGpName={setGpName}
              />

              <ExcelManager
                gpName={gpName}
                data={records}
                onDataLoaded={handleDataLoaded}
                fileName={fileName}
              />
            </div>

            {/* Duplicate Mobile Warning Alert (Telugu & English) */}
            {records.length > 0 && (
              <DuplicateMobileAlert
                duplicates={duplicateGroups}
                hasConfirmedProceed={hasConfirmedProceed}
                onProceed={(proceed) => setHasConfirmedProceed(proceed)}
                onAutoFixDuplicates={handleAutoFixDuplicates}
              />
            )}

            {/* In-browser Excel Table & Inline Editor */}
            <DataPreviewTable
              data={records}
              duplicateMobiles={duplicateMobilesSet}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddRecord={handleAddRecord}
            />
          </div>
        )}

        {/* 4B. If Future Updates & New Forms Selected: Render Dynamic Forms Hub (Admin Only) */}
        {selectedModule === 'future_updates' && currentUser?.role === 'admin' && (
          <FutureUpdatesModule
            currentUser={currentUser}
            onLaunchFormInBot={handleLaunchDynamicForm}
          />
        )}
      </main>

      {/* --- Global Modals --- */}

      {/* Automated Bot Execution Simulation Modal */}
      <BotExecutionModal
        isOpen={isExecutionModalOpen}
        onClose={() => setIsExecutionModalOpen(false)}
        portalChoice={selectedPortal}
        gpName={gpName}
        records={records}
        onComplete={(updated) => setRecords(updated)}
      />

      {/* User Registration & Website Sync Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Admin Approvals & User Access Management Modal */}
      <AdminUsersModal
        isOpen={isAdminUsersModalOpen}
        onClose={() => setIsAdminUsersModalOpen(false)}
        onUsersUpdated={refreshUser}
      />

      {/* Protected Single-File EXE Builder & Anti-Edit Protection Modal */}
      <ExeGeneratorModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
      />

      {/* Software Update Checker Modal */}
      <UpdateCheckerModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      {/* Configurable Domain Automation Compliance Modal */}
      <DomainPolicyModal
        isOpen={isDomainPolicyModalOpen}
        onClose={() => setIsDomainPolicyModalOpen(false)}
      />
    </div>
  );
}

export default App;
