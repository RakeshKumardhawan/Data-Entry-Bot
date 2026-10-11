import React from 'react';
import { Globe, Layers, CheckCircle2 } from 'lucide-react';
import { PortalType } from '../types';

interface PortalSelectorProps {
  selectedPortal: PortalType;
  onSelectPortal: (portal: PortalType) => void;
  disabled?: boolean;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({
  selectedPortal,
  onSelectPortal,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
            పోర్టల్ ఎంపిక / Select Portal
          </label>
          <span className="text-xs text-slate-500 font-mono">portal_choice in ['1', '2']</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          మీరు ఏ పోర్టల్ కోసం ఎంట్రీ చేయాలనుకుంటున్నారు? (Choose which portal to run data entry for):
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Option 1: TMP Portal */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectPortal('1')}
          className={`flex items-start p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
            selectedPortal === '1'
              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <div className={`p-2.5 rounded-lg mr-3.5 ${
            selectedPortal === '1' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                Option 1
              </span>
              <span className="font-semibold text-slate-900 text-sm">TMP Portal</span>
            </div>
            <p className="text-xs text-blue-900 font-medium mt-1">
              TMP పోర్టల్ డేటా ఎంట్రీ
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Automated Chrome browser field entry for Gram Panchayat TMP portal records.
            </p>
          </div>
          {selectedPortal === '1' && (
            <CheckCircle2 className="w-5 h-5 text-blue-600 absolute top-4 right-4" />
          )}
        </button>

        {/* Option 2: Other Portal */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectPortal('2')}
          className={`flex items-start p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
            selectedPortal === '2'
              ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
          }`}
        >
          <div className={`p-2.5 rounded-lg mr-3.5 ${
            selectedPortal === '2' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-800">
                Option 2
              </span>
              <span className="font-semibold text-slate-900 text-sm">Other Portal</span>
            </div>
            <p className="text-xs text-slate-800 font-medium mt-1">
              వేరే పోర్టల్ ఎంట్రీ
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Custom government or secondary welfare site field mappings and entries.
            </p>
          </div>
          {selectedPortal === '2' && (
            <CheckCircle2 className="w-5 h-5 text-blue-600 absolute top-4 right-4" />
          )}
        </button>
      </div>
    </div>
  );
};
