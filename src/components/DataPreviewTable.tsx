import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit2, AlertCircle, CheckCircle, FileSpreadsheet, Wand2, Sparkles, Check } from 'lucide-react';
import { DataRecord } from '../types';
import { getCleanMobile } from '../utils/excelParser';

interface DataPreviewTableProps {
  data: DataRecord[];
  duplicateMobiles: Set<string>;
  onUpdateRecord: (index: number, updated: DataRecord) => void;
  onDeleteRecord: (index: number) => void;
  onAddRecord: () => void;
  onAutoFixAllDuplicates?: () => void;
  onAutoFixSingleRecord?: (index: number) => void;
  disabled?: boolean;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({
  data,
  duplicateMobiles,
  onUpdateRecord,
  onDeleteRecord,
  onAddRecord,
  onAutoFixAllDuplicates,
  onAutoFixSingleRecord,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyShowDuplicates, setOnlyShowDuplicates] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editMobileValue, setEditMobileValue] = useState('');

  const filteredData = data.filter((row) => {
    const mobile = getCleanMobile(row);
    const isDup = duplicateMobiles.has(mobile);
    if (onlyShowDuplicates && !isDup) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const name = String(row['Name'] || '').toLowerCase();
    const sNo = String(row['SL No'] || row['S.No'] || '').toLowerCase();
    const ward = String(row['Ward'] || row['Designation'] || '').toLowerCase();
    return name.includes(term) || mobile.includes(term) || sNo.includes(term) || ward.includes(term);
  });

  const startEditMobile = (idx: number, currentVal: string) => {
    setEditingIndex(idx);
    setEditMobileValue(currentVal);
  };

  const saveEditMobile = (idx: number) => {
    if (editingIndex === null) return;
    const cleanNum = editMobileValue.trim().replace(/\D/g, '').slice(-10);
    const updated = {
      ...data[idx],
      'Mobile': cleanNum,
      'Mobile No.': cleanNum,
      'Mobile No': cleanNum,
      'Mobile Number': cleanNum,
      'Phone': cleanNum,
    };
    Object.keys(updated).forEach(k => {
      const cleanK = k.toLowerCase().replace(/[\s_.]/g, '');
      if (['mobile', 'mobilenumber', 'mobileno', 'phone', 'phonenumber', 'cell', 'contact', 'మొబైల్', 'ఫోన్'].some(alias => cleanK.includes(alias))) {
        (updated as any)[k] = cleanNum;
      }
    });
    onUpdateRecord(idx, updated);
    setEditingIndex(null);
  };

  const hasDesignation = data.some(r => 'Designation' in r && r['Designation']);
  const hasGender = data.some(r => ('Male/Female' in r || 'Gender' in r) && (r['Male/Female'] || r['Gender']));
  const hasCategory = data.some(r => ('Category' in r || 'Category (General, OC, OBC, SC ST)' in r));
  const hasAadhaar = data.some(r => 'Aadhaar' in r && r['Aadhaar']);
  const hasWard = data.some(r => 'Ward' in r && r['Ward']);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Table toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Excel Records ({data.length} total)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, mobile, S.No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-36 sm:w-48 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {duplicateMobiles.size > 0 && onAutoFixAllDuplicates && (
            <button
              type="button"
              onClick={onAutoFixAllDuplicates}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all cursor-pointer shadow-xs"
              title="Automatically fix all duplicate phone numbers in this table"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fix Duplicates ({duplicateMobiles.size})</span>
            </button>
          )}

          {duplicateMobiles.size > 0 && (
            <button
              type="button"
              onClick={() => setOnlyShowDuplicates(!onlyShowDuplicates)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                onlyShowDuplicates
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Filter Duplicates ({duplicateMobiles.size})
            </button>
          )}

          <button
            type="button"
            disabled={disabled}
            onClick={onAddRecord}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/90 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 w-16 text-center">S.No</th>
              <th className="py-2.5 px-3 min-w-44">Name / పేరు</th>
              <th className="py-2.5 px-3 min-w-40">Mobile Number</th>
              {hasDesignation && <th className="py-2.5 px-3 min-w-32">Designation / హోదా</th>}
              {hasGender && <th className="py-2.5 px-3 min-w-24">Gender</th>}
              {hasCategory && <th className="py-2.5 px-3 min-w-24">Category</th>}
              {hasAadhaar && <th className="py-2.5 px-3 min-w-32">Aadhaar Number</th>}
              {hasWard && <th className="py-2.5 px-3 min-w-28">Ward / Street</th>}
              <th className="py-2.5 px-3 w-24 text-center">Entry Status</th>
              <th className="py-2.5 px-3 w-16 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  డేటా కనుగొనబడలేదు (No records found matching filters).
                </td>
              </tr>
            ) : (
              filteredData.map((row) => {
                const originalIndex = data.indexOf(row);
                const cleanMob = getCleanMobile(row);
                const displayMob = row['Mobile'] || row['Mobile No.'] || row['Mobile No'] || cleanMob || '';
                const isDup = duplicateMobiles.has(cleanMob);
                const isEditing = editingIndex === originalIndex;

                return (
                  <tr
                    key={`row-${originalIndex}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isDup ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">
                      {row['SL No'] || row['S.No']}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {row['Name']}
                    </td>
                    <td className="py-2.5 px-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            maxLength={10}
                            value={editMobileValue}
                            onChange={(e) => setEditMobileValue(e.target.value)}
                            className="w-28 px-1.5 py-0.5 border border-blue-500 rounded text-xs font-mono"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveEditMobile(originalIndex)}
                            className="text-xs px-1.5 py-0.5 bg-blue-600 text-white rounded font-medium cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`font-mono font-medium ${
                              isDup ? 'text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded' : 'text-slate-800'
                            }`}
                          >
                            {displayMob}
                          </span>
                          {isDup && (
                            <span className="text-2xs text-amber-700 font-semibold bg-amber-200/70 px-1 py-0.2 rounded">
                              Duplicate
                            </span>
                          )}
                          {isDup && onAutoFixSingleRecord && (
                            <button
                              type="button"
                              onClick={() => onAutoFixSingleRecord(originalIndex)}
                              className="inline-flex items-center gap-0.5 text-2xs px-1.5 py-0.5 rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold cursor-pointer transition-colors"
                              title="Generate unique number for this row"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Fix</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => startEditMobile(originalIndex, displayMob)}
                            className="text-slate-400 hover:text-blue-600 cursor-pointer p-0.5"
                            title="Edit mobile number"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                    {hasDesignation && (
                      <td className="py-2.5 px-3 text-slate-700">
                        {row['Designation'] || '—'}
                      </td>
                    )}
                    {hasGender && (
                      <td className="py-2.5 px-3 text-slate-600">
                        {row['Male/Female'] || row['Gender'] || '—'}
                      </td>
                    )}
                    {hasCategory && (
                      <td className="py-2.5 px-3 text-slate-600">
                        {row['Category (General, OC, OBC, SC ST)'] || row['Category'] || '—'}
                      </td>
                    )}
                    {hasAadhaar && (
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {row['Aadhaar'] || '—'}
                      </td>
                    )}
                    {hasWard && (
                      <td className="py-2.5 px-3 text-slate-600">
                        {row['Ward'] || '—'}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium ${
                          row['Status'] === 'Success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row['Status'] === 'Skipped'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : row['Status'] === 'Error'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {row['Status'] || 'Pending'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onDeleteRecord(originalIndex)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
