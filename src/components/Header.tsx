import React from 'react';
import { Bot, RefreshCw, FileSpreadsheet, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onCheckUpdates: () => void;
  isCheckingUpdates: boolean;
  onOpenExeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCheckUpdates, isCheckingUpdates, onOpenExeModal }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Data Entry Bot
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                v.1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-blue-700 font-semibold">గ్రామ పంచాయతీ</span> • Portal Automation Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenExeModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>రక్షిత .EXE ఫైల్ (Anti-Edit Lock)</span>
          </button>

          <button
            onClick={onCheckUpdates}
            disabled={isCheckingUpdates}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
            <span>Check Updates</span>
          </button>
        </div>
      </div>
    </header>
  );
};
