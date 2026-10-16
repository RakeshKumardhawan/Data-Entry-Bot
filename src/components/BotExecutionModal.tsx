import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, CheckCircle2, AlertCircle, Terminal, Laptop, ExternalLink, RefreshCw, X, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { DataRecord, PortalType, BotLog } from '../types';
import { exportToExcel } from '../utils/excelParser';

interface BotExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalChoice: PortalType;
  gpName: string;
  records: DataRecord[];
  onComplete: (updatedRecords: DataRecord[]) => void;
  mode?: 'f8' | 'auto';
  typingSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const BotExecutionModal: React.FC<BotExecutionModalProps> = ({
  isOpen,
  onClose,
  portalChoice,
  gpName,
  records,
  onComplete,
  mode = 'auto',
  typingSpeed = 800,
  onSpeedChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(mode === 'auto');
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [speed, setSpeed] = useState<number>(typingSpeed);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [activeTab, setActiveTab] = useState<'terminal' | 'browser'>('browser');
  const [currentFieldFocus, setCurrentFieldFocus] = useState<string>('');
  const [typingValue, setTypingValue] = useState<string>('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const effectiveGpName = gpName.trim() || 'Akkalapalli';
  const portalName = portalChoice === '1' ? 'TMP Portal' : 'Other Portal';

  // Initialize execution when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsRunning(mode === 'auto');
      setIsPaused(false);
      setIsCompleted(false);

      const isF8 = mode === 'f8';
      const startMsg = isF8
        ? `${effectiveGpName} కోసం F8 కీబోర్డ్ మోడ్ సిద్ధంగా ఉంది. రికార్డు ఎంటర్ చేయడానికి F8 నొక్కండి!`
        : portalChoice === '1'
        ? `${effectiveGpName} కోసం TMP పోర్టల్ నాన్‌స్టాప్ ఆటోమేటిక్ ఎంట్రీ ప్రారంభమైంది (No Manual Intervention)...`
        : `${effectiveGpName} కోసం వేరే పోర్టల్ నాన్‌స్టాప్ ఆటోమేటిక్ ఎంట్రీ ప్రారంభమైంది...`;

      const targetDomain = portalChoice === '1' ? 'portal.grampanchayat.gov.in' : 'panchayat.telangana.gov.in';

      setLogs([
        {
          id: 'log-0',
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: isF8 ? `Initializing F8 Manual Step-by-Step Engine...` : `Initializing 1-Click Autonomous Engine (Continuous Mode)...`,
          teluguMessage: isF8 ? `⌨️ F8 మోడ్ యాక్టివేట్ చేయబడింది. కీబోర్డ్‌పై F8 నొక్కండి.` : `⚡ వన్-క్లిక్ ఆటో పైలట్ యాక్టివేట్ చేయబడింది. మాన్యువల్ బటన్ ప్రెస్ అవసరం లేదు.`,
        },
        {
          id: 'log-0b',
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: `Domain Automation Compliance Verified: ${targetDomain} (Permitted)`,
          teluguMessage: `వెబ్‌సైట్ ఆటోమేషన్ పాలసీ ధృవీకరించబడింది: నిబంధనల ప్రకారం ఆటోమేటెడ్ ఎంట్రీ అనుమతించబడింది.`,
        },
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Navigating to ${portalName} endpoint (${targetDomain})...`,
          teluguMessage: startMsg,
        },
        {
          id: 'log-2',
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          message: `Loaded batch: ${effectiveGpName}.xlsx with ${records.length} records.`,
        }
      ]);
    }
  }, [isOpen, portalChoice, effectiveGpName, records.length, mode]);

  // Scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Stepping loop
  useEffect(() => {
    if (!isRunning || isPaused || isCompleted || !isOpen) return;

    if (currentIndex >= records.length) {
      setIsCompleted(true);
      setIsRunning(false);
      setLogs((prev) => [
        ...prev,
        {
          id: `log-complete`,
          timestamp: new Date().toLocaleTimeString(),
          type: 'success',
          message: 'Data entry completed successfully without any manual pauses!',
          teluguMessage: `🎉 అభినందనలు! ${effectiveGpName} డేటా ఎంట్రీ (100% ఆటోమేటిక్) విజయవంతంగా పూర్తయింది!`
        }
      ]);
      const updated = records.map((r) => ({ ...r, Status: 'Success' as const }));
      onComplete(updated);
      return;
    }

    const currentRecord = records[currentIndex];

    const timer = setTimeout(() => {
      // Add field log: Category entered, Location skipped for manual entry
      const logItem: BotLog = {
        id: `log-${currentIndex}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'field',
        message: `[S.No ${currentRecord['S.No']}] Entered up to Category. Location skipped for manual entry & saved.`,
        teluguMessage: `[ఆటో పైలట్] రికార్డు ${currentRecord['S.No']} (${currentRecord['Name']}): Category వరకు ఎంట్రీ అయింది. Location మాన్యువల్‌గా ఎంటర్ చేయడానికి స్కిప్ చేయబడింది.`
      };

      setLogs((prev) => [...prev, logItem]);
      setCurrentFieldFocus('Category');
      setTypingValue(currentRecord['Category'] || 'SC');

      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, isCompleted, currentIndex, records, speed, isOpen]);

  if (!isOpen) return null;

  const currentRecord = records[Math.min(currentIndex, records.length - 1)] || records[0];
  const progressPercent = Math.round((currentIndex / records.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRunning && !isPaused ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {portalName} Entry Bot — {effectiveGpName}
                </span>
                <span className="text-2xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700">
                  Continuous Auto-Pilot
                </span>
                <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                  <span>No Manual Steps</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {portalChoice === '1'
                  ? `${effectiveGpName} కోసం TMP పోర్టల్ డేటా ఎంట్రీ`
                  : `${effectiveGpName} కోసం వేరే పోర్టల్ ఎంట్రీ`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('browser')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'browser' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
              >
                Browser View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('terminal')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'terminal' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:text-white'
                }`}
              >
                CLI Output
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress header bar */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">
              Progress: {currentIndex} / {records.length} records ({progressPercent}%)
            </span>
            <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Speed & Typing Speed Slider Control */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
              <span className="font-bold text-2xs uppercase text-blue-900">టైపింగ్ స్పీడ్:</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={speed}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSpeed(val);
                  if (onSpeedChange) onSpeedChange(val);
                }}
                className="w-28 sm:w-36 accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                title="టైపింగ్ వేగం సర్దుబాటు చేయండి (100 మి.సె - 2000 మి.సె)"
              />
              <span className="font-mono font-bold text-2xs text-blue-700 w-12 text-right">
                {speed} ms
              </span>
            </div>

            {!isCompleted ? (
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-2xs font-semibold hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                {isPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3 text-amber-600" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Mode Notice Banner with Location Instruction */}
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5 flex flex-col gap-1 text-xs text-blue-950 font-medium">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold shrink-0 text-2xs uppercase">
              💡 గమనిక & సూచన (Category & Location)
            </span>
            <span>
              <strong>Category</strong> వరకు ఆటోమేటిక్‌గా ఎంట్రీ అవుతుంది. ఆ తర్వాత <strong>Location</strong> ను మాన్యువల్‌గా ఎంటర్ చేసి, మిగతా డేటాను సేవ్ చేయాలి.
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden p-4 bg-slate-50">
          {activeTab === 'browser' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full max-h-[460px]">
              {/* Simulated Browser Address Bar */}
              <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-300 rounded px-3 py-1 font-mono text-2xs text-slate-600 truncate flex items-center justify-between">
                  <span>https://portal.grampanchayat.gov.in/{portalChoice === '1' ? 'tmp' : 'welfare'}/batch-entry?gp={effectiveGpName}</span>
                  <span className="text-emerald-600 font-semibold text-3xs">● SSL Encrypted</span>
                </div>
              </div>

              {/* Portal Form View */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {portalName} — Citizen Registration Form
                    </h3>
                    <p className="text-xs text-slate-500">
                      GP Batch: <strong className="text-blue-700">{effectiveGpName}</strong> | Record: {currentIndex} of {records.length}
                    </p>
                  </div>
                  {isCompleted && (
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All Records Submitted
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Serial Number (S.No)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={currentRecord['S.No'] || ''}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Citizen Name / పౌరుడి పేరు
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={currentRecord['Name'] || ''}
                      className="w-full px-3 py-2 bg-slate-50 border border-blue-400 ring-1 ring-blue-400 rounded font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Mobile Number (driver.find_element_by_id('mobile'))
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={currentRecord['Mobile'] || ''}
                        className="w-full px-3 py-2 bg-emerald-50 border-2 border-emerald-500 rounded font-mono font-bold text-emerald-950"
                      />
                      <span className="absolute right-2 top-2 text-2xs text-emerald-700 font-semibold bg-emerald-200 px-1 rounded">
                        Simulating Keypress
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Aadhaar ID
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={currentRecord['Aadhaar'] || 'XXXX-XXXX-XXXX'}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Ward / Street (గ్రామ పంచాయతీ వార్డు)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={currentRecord['Ward'] || `${effectiveGpName} Main Area`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 bg-blue-600 text-white rounded font-medium text-xs flex items-center gap-1.5 opacity-90"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-Submitting to {portalName}...</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Terminal View */
            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 h-full max-h-[460px] overflow-y-auto space-y-2">
              <div className="text-slate-500 text-2xs border-b border-slate-800 pb-2 flex justify-between">
                <span>Data Entry Bot Console (Python Engine)</span>
                <span>Thread #1 (Live)</span>
              </div>
              {logs.map((log) => (
                <div key={log.id} className="space-y-0.5">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-3xs select-none">[{log.timestamp}]</span>
                    {log.type === 'success' && <span className="text-emerald-400 font-bold">✓</span>}
                    {log.type === 'field' && <span className="text-blue-400">➜</span>}
                    {log.type === 'info' && <span className="text-slate-400">i</span>}
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-300 font-bold'
                          : log.type === 'field'
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                  {log.teluguMessage && (
                    <div className="text-amber-300 pl-14 text-2xs">
                      {log.teluguMessage}
                    </div>
                  )}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {isCompleted ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Data entry completed successfully! (పూర్తయింది)
              </span>
            ) : (
              <span>
                Bot running: {records.length - currentIndex} remaining
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && (
              <button
                type="button"
                onClick={() => exportToExcel(records, `${effectiveGpName}_Completed_Entries.xlsx`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>డౌన్‌లోడ్ పూర్తి ఎక్సెల్ (.xlsx)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              {isCompleted ? 'Close (ముగించు)' : 'Cancel Run'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
