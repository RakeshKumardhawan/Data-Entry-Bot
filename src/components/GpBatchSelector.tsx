import React from 'react';
import { Building2, FileSpreadsheet } from 'lucide-react';
import { SAMPLE_GRAM_PANCHAYATS } from '../utils/sampleData';

interface GpBatchSelectorProps {
  gpName: string;
  onChangeGpName: (name: string) => void;
  disabled?: boolean;
}

export const GpBatchSelector: React.FC<GpBatchSelectorProps> = ({
  gpName,
  onChangeGpName,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
            గ్రామ పంచాయతీ (బ్యాచ్) పేరు / GP Batch Name
          </label>
          <span className="text-xs text-slate-500 font-mono">file_path: {gpName || '...'}.xlsx</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          గ్రామ పంచాయతీ (బ్యాచ్) పేరు ఎంటర్ చేయండి (ఉదా: Akkalapalli)
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Building2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={gpName}
            disabled={disabled}
            onChange={(e) => onChangeGpName(e.target.value)}
            placeholder="ఉదా: Akkalapalli"
            className="w-full pl-10 pr-32 py-2.5 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-500 font-mono">
            .xlsx
          </div>
        </div>

        {/* Quick select presets */}
        <div>
          <span className="text-xs text-slate-500 font-medium mr-2">Quick Presets:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1.5">
            {SAMPLE_GRAM_PANCHAYATS.map((gp) => (
              <button
                key={gp.name}
                type="button"
                disabled={disabled}
                onClick={() => onChangeGpName(gp.name)}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                  gpName.toLowerCase() === gp.name.toLowerCase()
                    ? 'bg-blue-600 text-white border-blue-600 font-medium'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {gp.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Bot target file will look for: <strong className="font-mono text-slate-800">{gpName.trim() || 'Akkalapalli'}.xlsx</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
