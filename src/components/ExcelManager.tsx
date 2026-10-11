import React, { useRef } from 'react';
import { Upload, Download, RefreshCw, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { DataRecord } from '../types';
import { parseExcelFile, exportToExcel } from '../utils/excelParser';
import { INITIAL_AKKALAPALLI_DATA } from '../utils/sampleData';

interface ExcelManagerProps {
  gpName: string;
  data: DataRecord[];
  onDataLoaded: (records: DataRecord[], filename: string) => void;
  fileName: string | null;
  disabled?: boolean;
}

export const ExcelManager: React.FC<ExcelManagerProps> = ({
  gpName,
  data,
  onDataLoaded,
  fileName,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedRecords = await parseExcelFile(file);
      onDataLoaded(parsedRecords, file.name);
    } catch (err) {
      console.error('Failed to parse Excel file', err);
      alert('ఎర్రర్: ఎక్సెల్ ఫైల్ చదవడం విఫలమైంది. దయచేసి సరైన .xlsx ఫైల్ అప్‌లోడ్ చేయండి.');
    }
  };

  const handleLoadSample = () => {
    const currentName = gpName.trim() || 'Akkalapalli';
    // Deep clone sample data
    const sample = JSON.parse(JSON.stringify(INITIAL_AKKALAPALLI_DATA));
    onDataLoaded(sample, `${currentName}.xlsx`);
  };

  const handleExport = () => {
    if (data.length === 0) return;
    const name = gpName.trim() || 'Akkalapalli';
    exportToExcel(data, `${name}.xlsx`);
  };

  const hasRequiredColumns = data.length > 0 && ('Mobile' in data[0] && 'S.No' in data[0]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
            ఎక్సెల్ డేటా లోడింగ్ / Load Excel Sheet
          </label>
          <span className="text-xs text-slate-500 font-mono">pd.read_excel('{gpName || 'Akkalapalli'}.xlsx')</span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          గ్రామ పంచాయతీకి చెందిన డేటా ఎక్సెల్ షీట్ ను లోడ్ చేయండి లేదా నమూనా (Sample) డేటాను ఉపయోగించండి.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileUpload}
          className="hidden"
          disabled={disabled}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:border-slate-400 transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Upload {gpName ? `${gpName}.xlsx` : 'Excel (.xlsx)'}</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleLoadSample}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Load Sample GP Sheet</span>
        </button>

        {data.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title="Download Excel file"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download .xlsx</span>
          </button>
        )}
      </div>

      {/* File status bar */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {fileName ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              File: <span className="font-mono">{fileName}</span> ({data.length} records)
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              ఫైల్ ఇంకా లోడ్ కాలేదు (No file loaded)
            </span>
          )}
        </div>

        {data.length > 0 && (
          <div className="flex items-center gap-2 font-mono text-2xs">
            {hasRequiredColumns ? (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ 'Mobile' & 'S.No' validated
              </span>
            ) : (
              <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                ⚠ Required columns missing
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
