import React from 'react';
import { AlertOctagon, Check, X, ShieldAlert, ArrowRight, Wand2, Info } from 'lucide-react';
import { DuplicateGroup, DataRecord } from '../types';

interface DuplicateMobileAlertProps {
  duplicates: DuplicateGroup[];
  hasConfirmedProceed: boolean;
  onProceed: (proceed: boolean) => void;
  onAutoFixDuplicates: () => void;
}

export const DuplicateMobileAlert: React.FC<DuplicateMobileAlertProps> = ({
  duplicates,
  hasConfirmedProceed,
  onProceed,
  onAutoFixDuplicates,
}) => {
  if (duplicates.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            ✓
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              మొబైల్ నంబర్ల తనిఖీ పూర్తయింది / Mobile Duplicate Check Passed
            </h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              Excel లో ఎటువంటి రిపీటెడ్ మొబైల్ నంబర్లు లేవు. All phone numbers are unique.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono">
          0 Duplicates
        </span>
      </div>
    );
  }

  const totalDuplicateRecords = duplicates.reduce((acc, curr) => acc + curr.records.length, 0);

  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header Banner */}
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-amber-950 tracking-tight">
              హెచ్చరిక: Excel లో రిపీట్ అయిన మొబైల్ నంబర్లు ఉన్నాయి!
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
              {duplicates.length} Unique Numbers ({totalDuplicateRecords} Rows)
            </span>
          </div>
          <p className="text-xs text-amber-800 mt-1 font-medium">
            Warning: The loaded Excel sheet contains duplicate mobile numbers across multiple citizen entries.
          </p>
        </div>
      </div>

      {/* Duplicate list matching Python CLI output */}
      <div className="bg-slate-900 rounded-lg p-3 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
        <div className="text-slate-400 text-2xs uppercase tracking-wider mb-2 pb-1 border-b border-slate-800 flex justify-between">
          <span>Terminal Output Log (check_duplicate_mobiles)</span>
          <span>Matched by 'Mobile' column</span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {duplicates.map((group) => (
            <div key={group.mobile} className="border-l-2 border-amber-400 pl-2.5 py-0.5">
              <span className="text-amber-300 font-semibold">Mobile: {group.mobile}</span>
              <span className="text-slate-400 text-2xs ml-2">({group.count} occurrences)</span>
              <div className="space-y-0.5 mt-0.5 pl-2">
                {group.records.map((r) => (
                  <div key={`${group.mobile}-${r['S.No']}`} className="text-slate-300 text-2xs flex items-center gap-2">
                    <span className="text-blue-400">Serial No: {r['S.No']}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-emerald-300">{r['Name']}</span>
                    {r['Ward'] && <span className="text-slate-400">({r['Ward']})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guide for TMP Portal Existing Trainee Popup */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-950 space-y-1 shadow-2xs">
        <div className="font-bold flex items-center gap-1.5 text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>TMP పోర్టల్‌లో 'Kindly check below Trainee details having same Mobile No' వస్తే:</span>
        </div>
        <p className="text-2xs text-blue-900 leading-relaxed">
          ఈ ఎర్రర్ వచ్చినప్పుడు ఆ వ్యక్తి పోర్టల్ డేటాబేస్‌లో ముందే నమోదై ఉన్నారని అర్థం. 
          పోర్టల్ స్క్రీన్‌పై కింద కనిపించే బ్లూ టేబుల్‌లో <strong>'Select [✓]' చెక్‌బాక్స్‌ను టిక్ చేసి పైన 'Save' నొక్కండి</strong>, వెంటనే ఎంట్రీ సేవ్ అవుతుంది!
          ఎక్సెల్ ఫైల్‌లోని డూప్లికేట్లను సరిచేసి కొత్త ఫైల్ డౌన్‌లోడ్ చేసుకోవడానికి కింద ఉన్న <strong>"Auto-Fix Numbers (🪄)"</strong> బటన్ వాడండి.
        </p>
      </div>

      {/* Decision Prompt matching Python input() */}
      <div className="bg-white/80 rounded-lg p-3.5 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">
            ఈ రిపీటెడ్ నంబర్లను మార్చి మళ్ళీ రన్ చేస్తారా? లేక ఇలాగే కంటిన్యూ చేయాలా?
          </p>
          <p className="text-2xs text-slate-600 mt-0.5">
            Do you want to fix these repeated numbers or proceed anyway? (y=continue / n=stop)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onAutoFixDuplicates}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer transition-all shadow-sm ring-2 ring-indigo-500/20 active:scale-95"
            title="Auto-generates sequential alternate placeholder numbers for duplicates"
          >
            <Wand2 className="w-4 h-4 animate-pulse" />
            <span>🪄 Auto-Fix Duplicates (ఆటోమేటిక్‌గా సరిచేయండి)</span>
          </button>

          <button
            type="button"
            onClick={() => onProceed(false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              !hasConfirmedProceed
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Stop (n)</span>
          </button>

          <button
            type="button"
            onClick={() => onProceed(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors shadow-2xs ${
              hasConfirmedProceed
                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/20'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Continue Anyway (y)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
