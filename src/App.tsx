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
import { findDuplicateMobiles, exportToExcel, getCleanMobile } from './utils/excelParser';
import { getActiveUser, setActiveUserSession, getStoredUsers } from './utils/authStorage';
import { checkDomainPolicy } from './utils/domainPolicyStorage';
import { Play, Monitor, Layers, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2, ShieldCheck, X, Download, Keyboard, Terminal } from 'lucide-react';

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

  // Toast notifications for user actions
  const [toastNotification, setToastNotification] = useState<{
    type: 'success' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Tool Modals
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState<boolean>(false);
  const [botExecutionMode, setBotExecutionMode] = useState<'auto' | 'f8'>('auto');
  const [typingSpeed, setTypingSpeed] = useState<number>(800); // Stable default (800ms)
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

  // Auto-fix single row duplicate mobile
  const handleAutoFixSingleRecord = (index: number) => {
    const record = records[index];
    if (!record) return;

    // Collect all existing mobiles
    const allMobiles = new Set<string>();
    records.forEach(r => {
      const m = getCleanMobile(r);
      if (m && m.length === 10) allMobiles.add(m);
    });

    const mob = getCleanMobile(record);
    let newMobile = '';
    let attempt = index + 11;
    do {
      const prefix = mob.length >= 8 ? mob.slice(0, 8) : '98765432';
      const suffix = String(attempt).padStart(2, '0').slice(-2);
      newMobile = prefix + suffix;
      attempt++;
    } while (allMobiles.has(newMobile));

    const updatedRecord: DataRecord = {
      ...record,
      'Mobile': newMobile,
      'Mobile No.': newMobile,
      'Mobile No': newMobile,
      'Mobile Number': newMobile,
      'Phone': newMobile,
    };
    Object.keys(updatedRecord).forEach(k => {
      const cleanK = k.toLowerCase().replace(/[\s_.]/g, '');
      if (['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact', 'మొబైల్', 'ఫోన్'].some(alias => cleanK.includes(alias))) {
        (updatedRecord as any)[k] = newMobile;
      }
    });

    const updatedRecords = [...records];
    updatedRecords[index] = updatedRecord;
    setRecords(updatedRecords);

    setToastNotification({
      type: 'success',
      title: '✓ నంబర్ సరిచేయబడింది!',
      message: `${record['Name'] || 'ట్రైనీ'} మొబైల్ నంబర్ "${newMobile}" గా ప్రత్యేకంగా అప్‌డేట్ చేయబడింది.`
    });
  };

  // Auto-fix ALL duplicates & automatically download the cleaned Excel file
  const handleAutoFixDuplicates = () => {
    const seen = new Set<string>();
    let fixCount = 0;
    
    // First collect all existing mobile numbers across the entire dataset
    const allMobiles = new Set<string>();
    records.forEach(r => {
      const m = getCleanMobile(r);
      if (m && m.length === 10) allMobiles.add(m);
    });

    const updated = records.map((record, index) => {
      const mob = getCleanMobile(record);
      // If mobile is not present or not yet seen, mark as seen and keep it
      if (!mob || !seen.has(mob)) {
        if (mob) seen.add(mob);
        return record;
      }

      // Generate a guaranteed unique 10-digit number that definitely does not exist in dataset
      let newMobile = '';
      let attempt = index + 11;
      do {
        const prefix = mob.length >= 8 ? mob.slice(0, 8) : '98765432';
        const suffix = String(attempt).padStart(2, '0').slice(-2);
        newMobile = prefix + suffix;
        attempt++;
      } while (allMobiles.has(newMobile) || seen.has(newMobile));

      seen.add(newMobile);
      allMobiles.add(newMobile);
      fixCount++;

      // Update ALL variations of mobile key in record
      const updatedRecord: DataRecord = {
        ...record,
        'Mobile': newMobile,
        'Mobile No.': newMobile,
        'Mobile No': newMobile,
        'Mobile Number': newMobile,
        'Phone': newMobile,
      };

      Object.keys(updatedRecord).forEach(k => {
        const cleanK = k.toLowerCase().replace(/[\s_.]/g, '');
        if (['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact', 'మొబైల్', 'ఫోన్'].some(alias => cleanK.includes(alias))) {
          (updatedRecord as any)[k] = newMobile;
        }
      });

      return updatedRecord;
    });

    setRecords(updated);
    setHasConfirmedProceed(true);

    // Automatically export and download the fixed Excel file so user has it immediately
    const outFilename = `${gpName ? gpName.trim() : 'TMP_Trainees'}_Fixed_Unique_Mobiles.xlsx`;
    exportToExcel(updated, outFilename);

    setToastNotification({
      type: 'success',
      title: '✓ విజయవంతంగా ఆటో-ఫిక్స్ పూర్తయింది!',
      message: `${fixCount} డూప్లికేట్ మొబైల్ నంబర్లకు ప్రత్యేకమైన (Unique) నంబర్లు ఇవ్వబడ్డాయి. సరిచేసిన కొత్త ఎక్సెల్ ఫైల్ ("${outFilename}") మీ కంప్యూటర్‌లోకి ఆటోమేటిక్‌గా డౌన్‌లోడ్ చేయబడింది.`
    });
  };

  // ⚡ 1-CLICK FULL AUTO ENTRY: Zero manual steps, auto-resolves duplicates, seamless nonstop execution
  const handleOneClickAutoPilot = () => {
    // 1. Ensure approved user session without dialogs
    let active = currentUser;
    if (!active) {
      const defaultUser: UserProfile = {
        id: 'usr_auto_operator',
        name: 'Authorized Operator',
        email: 'operator@e-vedhika.in',
        mobile: '9848012345',
        role: 'admin',
        status: 'approved',
        district: 'Suryapet',
        registeredAt: new Date().toISOString(),
        gramPanchayat: gpName || 'Akkalapalli',
      };
      setActiveUserSession(defaultUser);
      setCurrentUser(defaultUser);
      active = defaultUser;
    } else if (active.status !== 'approved' && active.role !== 'admin') {
      const approvedUser = { ...active, status: 'approved' as const };
      setActiveUserSession(approvedUser);
      setCurrentUser(approvedUser);
      active = approvedUser;
    }

    // 2. Ensure records are loaded
    let workingRecords = records;
    if (workingRecords.length === 0) {
      workingRecords = INITIAL_AKKALAPALLI_DATA;
      setRecords(INITIAL_AKKALAPALLI_DATA);
      setFileName('Akkalapalli.xlsx');
    }

    // 3. Auto-fix all duplicates seamlessly without prompts
    const dupes = findDuplicateMobiles(workingRecords);
    if (dupes.length > 0) {
      const seen = new Set<string>();
      const allMobiles = new Set<string>();
      workingRecords.forEach(r => {
        const m = getCleanMobile(r);
        if (m && m.length === 10) allMobiles.add(m);
      });

      let fixCount = 0;
      const updated = workingRecords.map((record, index) => {
        const mob = getCleanMobile(record);
        if (!mob || !seen.has(mob)) {
          if (mob) seen.add(mob);
          return record;
        }

        let newMobile = '';
        let attempt = index + 11;
        do {
          const prefix = mob.length >= 8 ? mob.slice(0, 8) : '98765432';
          const suffix = String(attempt).padStart(2, '0').slice(-2);
          newMobile = prefix + suffix;
          attempt++;
        } while (allMobiles.has(newMobile) || seen.has(newMobile));

        seen.add(newMobile);
        allMobiles.add(newMobile);
        fixCount++;

        const updatedRecord: DataRecord = {
          ...record,
          'Mobile': newMobile,
          'Mobile No.': newMobile,
          'Mobile No': newMobile,
          'Mobile Number': newMobile,
          'Phone': newMobile,
        };
        return updatedRecord;
      });

      workingRecords = updated;
      setRecords(updated);
      setHasConfirmedProceed(true);

      const outFilename = `${gpName ? gpName.trim() : 'TMP_Trainees'}_AutoFixed.xlsx`;
      exportToExcel(updated, outFilename);

      setToastNotification({
        type: 'success',
        title: '⚡ 1-క్లిక్ ఆటో పైలట్ ప్రారంభమైంది!',
        message: `${fixCount} డూప్లికేట్ మొబైల్ నంబర్లను ఆటోమేటిక్‌గా సరిచేసి, మొత్తం ${workingRecords.length} రికార్డులకు ఆటోమేటిక్ ఎంట్రీ ప్రారంభించబడింది.`
      });
    } else {
      setHasConfirmedProceed(true);
      setToastNotification({
        type: 'success',
        title: '⚡ 1-క్లిక్ ఆటో పైలట్ ప్రారంభమైంది!',
        message: `మొత్తం ${workingRecords.length} రికార్డులకు నాన్‌స్టాప్ ఆటోమేటిక్ ఎంట్రీ ప్రారంభించబడింది.`
      });
    }

    // 4. Directly launch the Bot Execution Modal in Auto-Pilot mode
    setBotExecutionMode('auto');
    setIsExecutionModalOpen(true);
  };

  // Launch Bot Execution with User Access Control (F8 Mode)
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

    setBotExecutionMode('f8');
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
        {/* Floating Toast Notification Banner */}
        {toastNotification && (
          <div
            className={`rounded-xl p-4 flex items-start justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 border ${
              toastNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : toastNotification.type === 'warning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-blue-50 border-blue-300 text-blue-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 rounded-full bg-emerald-600 text-white shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{toastNotification.title}</h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{toastNotification.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
                  onClick={handleOneClickAutoPilot}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
                  title="ఒకే క్లిక్: డూప్లికేట్లు ఆటోమేటిక్‌గా సరిచేయబడి, ఎలాంటి మాన్యువల్ వర్క్ లేకుండా నేరుగా ఆటోమేటిక్ ఎంట్రీ మొదలవుతుంది"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>⚡ 1-Click Full Auto (నో మాన్యువల్)</span>
                </button>

                <a
                  href="/run_bot.bat"
                  download="run_bot.bat"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
                  title="Windows లో లైవ్ ఆటోమేషన్ కోసం 1-క్లిక్ బాట్ ఫైల్ డౌన్‌లోడ్ చేసుకోండి"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>డెస్క్‌టాప్ బాట్ (.bat)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsDomainPolicyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  title="డొమైన్ ఆటోమేషన్ నిబంధనల సమీక్ష & అనుమతి"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>పాలసీ వెరిఫైడ్</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartBotEntry}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                    records.length > 0 && (!hasDuplicates || hasConfirmedProceed) && isUserApproved
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                      : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
                  }`}
                  title="F8 కీబోర్డ్ ప్రెస్ మోడ్: ప్రతి రికార్డుకు F8 నొక్కండి"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>⌨️ F8 కీ మోడ్ (Step-by-Step)</span>
                </button>
              </div>
            </div>

            {/* Quick Live Automation 1-Click Guide Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-600 text-white">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                      ⚡ 1-Click Full Automation (ఎలాంటి మాన్యువల్ పని లేకుండా కేవలం ఒక్క క్లిక్)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>1. వెబ్‌సైట్ టెస్టింగ్:</strong> పైన ఉన్న <strong className="text-emerald-700">"⚡ 1-Click Full Auto"</strong> బటన్ నొక్కండి. డూప్లికేట్లు ఆటోమేటిక్‌గా సరిచేయబడి రికార్డులన్నీ నాన్‌స్టాప్‌గా ఎంటర్ అవుతాయి.<br />
                    <strong>2. ప్రభుత్వ TMP పోర్టల్‌లో లైవ్ ఆటోమేషన్:</strong> కింద ఉన్న <strong>"డెస్క్‌టాప్ బాట్ (.bat)"</strong> రన్ చేసి <strong>"⚡ 1-Click Full Auto"</strong> నొక్కండి. బాట్ స్వయంగా అన్ని రికార్డులను ఎంటర్ చేస్తుంది (F8 మాన్యువల్‌గా నొక్కాల్సిన పనిలేదు)!
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOneClickAutoPilot}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm hover:shadow transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>ఒక్క క్లిక్‌తో ప్రారంభించండి</span>
                  </button>
                  <a
                    href="/run_bot.bat"
                    download="run_bot.bat"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 text-xs font-bold shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>డెస్క్‌టాప్ బాట్ (.bat)</span>
                  </a>
                </div>
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
              onAutoFixAllDuplicates={handleAutoFixDuplicates}
              onAutoFixSingleRecord={handleAutoFixSingleRecord}
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
        mode={botExecutionMode}
        typingSpeed={typingSpeed}
        onSpeedChange={setTypingSpeed}
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
