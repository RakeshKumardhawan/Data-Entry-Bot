import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Plus, ArrowRight, CheckCircle2, Clock, Upload, Trash2, ShieldCheck, Lock, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { DynamicForm, UserProfile } from '../types';
import * as XLSX from 'xlsx';

interface FutureUpdatesModuleProps {
  currentUser: UserProfile | null;
  onLaunchFormInBot: (formTitle: string, sampleFields: string[]) => void;
}

const STORAGE_KEY = 'e_vedhika_published_forms_v1';

const INITIAL_DYNAMIC_FORMS: DynamicForm[] = [
  {
    id: 'form-1',
    title: 'GP Annual Attendance Entry 2026',
    teluguTitle: 'గ్రామ పంచాయతీ వార్షిక అటెండెన్స్ వివరాలు 2026',
    category: 'Attendance & Records',
    description: 'Flash News లో పేర్కొన్న 2026 గ్రామ పంచాయతీ సిబ్బంది మరియు వార్షిక హాజరు వివరాల ఆన్‌లైన్ ఎంట్రీ ఫారం.',
    fields: ['Employee ID', 'Name', 'Designation', 'Present Days', 'Remarks'],
    version: 'v.1.0.0',
    lastUpdated: 'Today',
    isLive: true,
  },
  {
    id: 'form-2',
    title: 'New Ration & Welfare Verification',
    teluguTitle: 'నూతన రేషన్ కార్డు & సంక్షేమ పథకాల ధృవీకరణ',
    category: 'Citizen Welfare',
    description: 'లబ్ధిదారుల ఆధార్, రేషన్ కార్డు నంబర్లు మరియు ఫోన్ నంబర్ల ఆటోమేటిక్ ధృవీకరణ ఫారం.',
    fields: ['S.No', 'Beneficiary Name', 'Ration Card No', 'Mobile', 'Status'],
    version: 'v.1.0.0',
    lastUpdated: 'Yesterday',
    isLive: true,
  },
  {
    id: 'form-3',
    title: 'MGNREGS E-Attendance Portal Entry',
    teluguTitle: 'ఉపాధి హామీ పథకం (MGNREGS) ఈ-హాజరు ఎంట్రీ',
    category: 'Employment Guarantee',
    description: 'గ్రామీణ ఉపాధి పనుల రోజువారీ మస్టర్ రోల్ మరియు వేతనదారుల హాజరు డైరెక్ట్ ఎంట్రీ.',
    fields: ['Job Card No', 'Worker Name', 'Work Code', 'Days Worked', 'Wage'],
    version: 'v.1.0.0',
    lastUpdated: 'Oct 07',
    isLive: true,
  }
];

export const FutureUpdatesModule: React.FC<FutureUpdatesModuleProps> = ({
  currentUser,
  onLaunchFormInBot,
}) => {
  const [forms, setForms] = useState<DynamicForm[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_DYNAMIC_FORMS;
  });

  const [newTitle, setNewTitle] = useState('');
  const [newTeluguTitle, setNewTeluguTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General Portal Entry');
  const [newDescription, setNewDescription] = useState('');
  const [parsedFields, setParsedFields] = useState<string[]>(['S.No', 'Name', 'Mobile', 'Status']);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Persist forms when updated
  const saveForms = (updated: DynamicForm[]) => {
    setForms(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Handle direct file upload by admin (Excel or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert('క్షమించండి! డైరెక్ట్ అప్‌లోడ్ అధికారం కేవలం అడ్మిన్ కు మాత్రమే ఉంటుంది.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    // Autofill title if empty
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!newTitle) setNewTitle(baseName);
    if (!newTeluguTitle) setNewTeluguTitle(`${baseName} నూతన ఫారం`);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

        if (data && data.length > 0) {
          const headerRow = data[0] as string[];
          const validHeaders = headerRow
            .map((h) => String(h || '').trim())
            .filter((h) => h.length > 0);
          if (validHeaders.length > 0) {
            setParsedFields(validHeaders);
          }
        }
      } catch (err) {
        console.error('File parse error', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAddNewForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('ఈ చర్య కేవలం అడ్మిన్ కు మాత్రమే అనుమతించబడింది.');
      return;
    }

    if (!newTitle.trim() || !newTeluguTitle.trim()) return;

    const newForm: DynamicForm = {
      id: `form-${Date.now()}`,
      title: newTitle.trim(),
      teluguTitle: newTeluguTitle.trim(),
      category: newCategory.trim() || 'General Portal Entry',
      description: newDescription.trim() || 'అడ్మిన్ ద్వారా డైరెక్ట్‌గా అప్‌లోడ్ చేసి పబ్లిష్ చేయబడిన సరికొత్త ప్రభుత్వ ఫారం.',
      fields: parsedFields.length > 0 ? parsedFields : ['S.No', 'Name', 'Mobile', 'ID', 'Status'],
      version: 'v.1.0.0',
      lastUpdated: 'Just now',
      isLive: true,
    };

    const updated = [newForm, ...forms];
    saveForms(updated);

    // Reset form
    setNewTitle('');
    setNewTeluguTitle('');
    setNewCategory('General Portal Entry');
    setNewDescription('');
    setUploadedFileName(null);
    setParsedFields(['S.No', 'Name', 'Mobile', 'Status']);
    setShowAddForm(false);
    alert('కొత్త ఫారం విజయవంతంగా అప్‌లోడ్ అయ్యి పబ్లిష్ చేయబడింది! అందరు యూజర్లకు డైరెక్ట్‌గా అందుబాటులోకి వచ్చింది.');
  };

  const handleDeleteForm = (id: string) => {
    if (!isAdmin) {
      alert('కేవలం అడ్మిన్ మాత్రమే ఫారాలను తొలగించగలరు.');
      return;
    }
    if (confirm('ఈ ఫారంను నిజంగానే తొలగించాలనుకుంటున్నారా?')) {
      const updated = forms.filter((f) => f.id !== id);
      saveForms(updated);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner explaining Direct Future Updates */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>డైరెక్ట్ సింక్ / Direct Update Engine (v.1.0.0)</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            Future Updates and New Forms (భవిష్యత్తు నూతన ఫారాలు)
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
            భవిష్యత్తులో కొత్త ప్రభుత్వ ఫారాలు వచ్చినప్పుడు <strong>కేవలం అడ్మిన్ మాత్రమే డైరెక్ట్‌గా అప్‌లోడ్ చేసి పబ్లిష్ చేయగలరు</strong>. 
            యూజర్లు ఎలాంటి మాన్యువల్ వర్క్ లేకుండా అడ్మిన్ అప్‌లోడ్ చేసిన ఫారాలను నేరుగా చూసి బాట్ ద్వారా డేటా ఎంట్రీ ప్రారంభించవచ్చు.
          </p>
        </div>

        {/* Upload Button: Rendered ONLY for Admin */}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-all shadow-md cursor-pointer shrink-0"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>అడ్మిన్ డైరెక్ట్ అప్‌లోడ్ & పబ్లిష్</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-800/50 border border-emerald-400/40 text-emerald-100 text-xs font-semibold shrink-0">
            <Lock className="w-4 h-4 text-emerald-300" />
            <span>అప్‌లోడ్: అడ్మిన్ కి మాత్రమే అనుమతి (Admin Only)</span>
          </div>
        )}
      </div>

      {/* Notice for Regular Users */}
      {!isAdmin && (
        <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>యూజర్ అనుమతి గమనిక:</strong> కొత్త ప్రభుత్వ ఫారాలను డైరెక్ట్‌గా అప్‌లోడ్ చేసే అధికారం కేవలం అడ్మిన్ కు మాత్రమే ఉంది. మీరు అడ్మిన్ ద్వారా ధృవీకరించబడిన ఫారాలలో నేరుగా డేటా ఎంట్రీని రన్ చేసుకోవచ్చు.
            </span>
          </div>
        </div>
      )}

      {/* Admin Direct Upload & Form Publisher Section (ADMIN ONLY) */}
      {showAddForm && isAdmin && (
        <form
          onSubmit={handleAddNewForm}
          className="bg-white rounded-xl border-2 border-emerald-500 p-5 sm:p-6 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  అడ్మిన్ డైరెక్ట్ ఫారం / ఎక్సెల్ టెంప్లేట్ అప్‌లోడ్
                </h4>
                <p className="text-2xs text-slate-500">
                  ఓన్లీ అడ్మిన్ మాత్రమే కొత్త ప్రభుత్వ ఫారాలను అప్‌లోడ్ చేసి పబ్లిష్ చేయగలరు
                </p>
              </div>
            </div>

            <span className="text-2xs font-bold font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              Admin Exclusive
            </span>
          </div>

          {/* Option A: Direct File Upload */}
          <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl text-center space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
            <div className="text-xs font-semibold text-slate-800">
              {uploadedFileName ? (
                <span className="text-emerald-700 font-bold">✓ ఎంపిక చేసిన ఫైల్: {uploadedFileName}</span>
              ) : (
                'కొత్త ప్రభుత్వ ఫారం ఎక్సెల్ / CSV ఫైల్‌ను ఇక్కడ అప్‌లోడ్ చేయండి (Optional File Upload)'
              )}
            </div>
            <p className="text-2xs text-slate-500">
              ఫైల్‌లోని కాలమ్స్ (Fields) ఆటోమేటిక్‌గా ఈ ఫారంలోకి సంగ్రహించబడతాయి.
            </p>
            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5" />
              <span>ఫైల్ ఎంచుకోండి (.xlsx, .csv)</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Option B: Form Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                ఫారం పేరు (తెలుగులో) *
              </label>
              <input
                type="text"
                required
                value={newTeluguTitle}
                onChange={(e) => setNewTeluguTitle(e.target.value)}
                placeholder="ఉదా: కొత్త పింఛన్ ధృవీకరణ ఫారం 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Form Title (English) *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Pension Verification Form 2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                కేటగిరీ (Category)
              </label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="ఉదా: Citizen Welfare / Panchayat Records"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                వివరణ (Description)
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="ఉదా: లబ్ధిదారుల సమాచారం తనిఖీ మరియు ఎంట్రీ"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Parsed Fields Preview */}
          <div className="text-xs">
            <span className="block font-medium text-slate-700 mb-1">
              ఫీల్డులు / కాలమ్స్ (Fields: {parsedFields.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              {parsedFields.map((f, i) => (
                <span key={i} className="text-2xs bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              రద్దు (Cancel)
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>డైరెక్ట్ అప్‌లోడ్ చేసి పబ్లిష్ చేయండి (Publish Live)</span>
            </button>
          </div>
        </form>
      )}

      {/* Available Live Dynamic Forms Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>అందుబాటులో ఉన్న నూతన ఫారాలు (Active Direct Forms)</span>
          </h4>
          <span className="text-2xs text-slate-500 font-mono">
            {isAdmin ? 'Admin Upload Active' : 'User View & Direct Entry Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-emerald-500/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {form.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-3xs font-mono text-slate-400">
                      {form.lastUpdated}
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteForm(form.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete this form"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <h5 className="font-bold text-sm text-slate-900 leading-snug">
                  {form.teluguTitle}
                </h5>
                <p className="text-xs text-slate-500 font-medium">
                  {form.title}
                </p>

                <p className="text-2xs text-slate-600 leading-relaxed pt-1">
                  {form.description}
                </p>

                <div className="pt-2">
                  <span className="text-3xs text-slate-400 block font-mono">Fields:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {form.fields.map((f, i) => (
                      <span key={i} className="text-3xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onLaunchFormInBot(form.teluguTitle, form.fields)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <span>డైరెక్ట్ ఎంట్రీ స్టార్ట్ చేయండి</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
