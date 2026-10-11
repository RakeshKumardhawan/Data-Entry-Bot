import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Plus, Trash2, Edit2, Check, X, Search, Globe, ExternalLink, HelpCircle } from 'lucide-react';
import { DomainPolicy, PolicyStatus, DomainCheckResult } from '../types';
import { getStoredDomainPolicies, addOrUpdateDomainPolicy, deleteDomainPolicy, checkDomainPolicy } from '../utils/domainPolicyStorage';

interface DomainPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPoliciesUpdated?: () => void;
}

export const DomainPolicyModal: React.FC<DomainPolicyModalProps> = ({
  isOpen,
  onClose,
  onPoliciesUpdated,
}) => {
  const [policies, setPolicies] = useState<DomainPolicy[]>(getStoredDomainPolicies());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Test domain simulator
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<DomainCheckResult | null>(null);

  // Form for adding/editing
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [portalNameInput, setPortalNameInput] = useState('');
  const [statusInput, setStatusInput] = useState<PolicyStatus>('allowed');
  const [notesInput, setNotesInput] = useState('');
  const [termsUrlInput, setTermsUrlInput] = useState('');

  if (!isOpen) return null;

  const handleTestDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;
    const res = checkDomainPolicy(testUrl);
    setTestResult(res);
  };

  const handleOpenAdd = () => {
    setIsEditing(true);
    setEditId(null);
    setDomainInput('');
    setPortalNameInput('');
    setStatusInput('allowed');
    setNotesInput('అధికారిక పంచాయతీ ఆపరేటర్ లాగిన్ ద్వారా బ్యాచ్ ఎంట్రీకి అనుమతి ఉంది.');
    setTermsUrlInput('');
  };

  const handleStartEdit = (p: DomainPolicy) => {
    setIsEditing(true);
    setEditId(p.id);
    setDomainInput(p.domain);
    setPortalNameInput(p.portalName);
    setStatusInput(p.status);
    setNotesInput(p.policyNotes);
    setTermsUrlInput(p.termsUrl || '');
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    const updated = addOrUpdateDomainPolicy({
      id: editId || undefined,
      domain: domainInput.trim(),
      portalName: portalNameInput.trim() || domainInput.trim(),
      status: statusInput,
      policyNotes: notesInput.trim(),
      termsUrl: termsUrlInput.trim() || undefined,
      lastReviewed: new Date().toISOString().split('T')[0],
      reviewedBy: 'Admin (Rakesh Kumar)',
    });

    setPolicies(updated);
    setIsEditing(false);
    onPoliciesUpdated?.();
  };

  const handleDelete = (id: string) => {
    const updated = deleteDomainPolicy(id);
    setPolicies(updated);
    onPoliciesUpdated?.();
  };

  const filtered = policies.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.domain.toLowerCase().includes(term) ||
      p.portalName.toLowerCase().includes(term) ||
      p.policyNotes.toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0c3875] text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  డొమైన్ ఆటోమేషన్ పాలసీ & కంప్లయన్స్ మేనేజ్మెంట్
                </h3>
                <span className="text-3xs font-mono px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 border border-blue-400/40">
                  Compliance Rule Engine
                </span>
              </div>
              <p className="text-2xs text-blue-200">
                నిబంధనలను స్పష్టంగా వెరిఫై చేసి, అనుమతి లేని సైట్లలో ఆటోమేషన్ జరగకుండా ఆపే కాన్ఫిగరేషన్
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Policy Checker Simulator */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>డొమైన్ పాలసీ తనిఖీ (Pre-Flight Domain Verifier):</span>
            </span>
            <span className="text-2xs text-slate-500">
              వెరిఫై చేయకుండా ఊహించదు • పాలసీ తెలియకపోతే సేఫ్‌గా ఆపుతుంది
            </span>
          </div>

          <form onSubmit={handleTestDomain} className="flex gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="వెబ్‌సైట్ డొమైన్ లేదా URL ఎంటర్ చేయండి (ఉదా: portal.grampanchayat.gov.in లేదా strict-portal.ap.gov.in)"
              className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs"
            >
              పాలసీని తనిఖీ చేయండి
            </button>
          </form>

          {/* Test Result Display */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-3 animate-in fade-in duration-150 ${
                testResult.status === 'allowed'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : testResult.status === 'restricted'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              {testResult.status === 'allowed' && <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {testResult.status === 'restricted' && <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {testResult.status === 'unknown' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {testResult.status === 'allowed' && 'ఆటోమేషన్ అనుమతించబడింది (Allowed)'}
                    {testResult.status === 'restricted' && 'ఆటోమేషన్ నిలిపివేయబడింది: నిబంధనలకు విరుద్ధం (Restricted)'}
                    {testResult.status === 'unknown' && 'పాలసీ ఇంకా తెలియదు (Unknown Policy - Safe Stop)'}
                  </span>
                </div>
                <p className="text-2xs leading-relaxed font-medium">
                  {testResult.teluguMessage}
                </p>
                {testResult.status === 'unknown' && (
                  <div className="pt-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenAdd();
                        setDomainInput(testUrl);
                      }}
                      className="px-2.5 py-1 rounded bg-amber-600 text-white text-3xs font-bold hover:bg-amber-700 cursor-pointer"
                    >
                      ఈ డొమైన్‌ను ఇప్పుడే రివ్యూ చేసి లిస్ట్‌లో చేర్చండి
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal Area */}
        {isEditing && (
          <form
            onSubmit={handleSavePolicy}
            className="p-5 bg-blue-50/60 border-b-2 border-blue-300 space-y-3.5 text-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between pb-1 border-b border-blue-200">
              <h4 className="font-bold text-slate-900">
                {editId ? 'డొమైన్ పాలసీని సవరించండి (Edit Policy)' : 'కొత్త వెబ్‌సైట్ డొమైన్ పాలసీని జోడించండి (Add Domain Policy)'}
              </h4>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                రద్దు (Cancel)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">డొమైన్ / వెబ్‌సైట్ హోస్ట్ *</label>
                <input
                  type="text"
                  required
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="portal.grampanchayat.gov.in"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">పోర్టల్ పేరు (Portal Name)</label>
                <input
                  type="text"
                  value={portalNameInput}
                  onChange={(e) => setPortalNameInput(e.target.value)}
                  placeholder="ఉదా: TMP గ్రామ పంచాయతీ పోర్టల్"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">ఆటోమేషన్ అనుమతి హోదా (Policy Status) *</label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as PolicyStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs cursor-pointer"
                >
                  <option value="allowed">Allowed (ఆటోమేషన్ అనుమతించబడింది)</option>
                  <option value="restricted">Restricted (నిబంధనల ప్రకారం ఆపాలి)</option>
                  <option value="unknown">Unknown / Needs Review (మాన్యువల్ రివ్యూ పెండింగ్)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">పాలసీ వివరణ / కారణం (Notes & Reason)</label>
                <input
                  type="text"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="ఉదా: అధికారిక ఆపరేటర్లకు బల్క్ డేటా ఎంట్రీ అనుమతించబడింది."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">నిబంధనల లింక్ (Terms of Service / Policy URL)</label>
                <input
                  type="url"
                  value={termsUrlInput}
                  onChange={(e) => setTermsUrlInput(e.target.value)}
                  placeholder="https://portal.gov.in/terms"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white cursor-pointer"
              >
                రద్దు
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
              >
                పాలసీని సేవ్ చేయండి
              </button>
            </div>
          </form>
        )}

        {/* Toolbar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">
              కాన్ఫిగర్ చేసిన డొమైన్లు: {policies.length}
            </span>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>కొత్త డొమైన్ చేర్చండి (Add Domain)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search domain, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-48 text-slate-800"
            />
          </div>
        </div>

        {/* Table of Policies */}
        <div className="overflow-x-auto flex-1 p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">డొమైన్ / పోర్టల్ వివరాలు</th>
                <th className="py-2.5 px-3 text-center">ఆటోమేషన్ అనుమతి (Status)</th>
                <th className="py-2.5 px-3">పాలసీ గమనిక / నిబంధనలు (Reason & Notes)</th>
                <th className="py-2.5 px-3">చివరి సమీక్ష (Reviewed)</th>
                <th className="py-2.5 px-3 text-right">చర్యలు</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-900">{p.domain}</div>
                    <div className="text-2xs text-slate-500">{p.portalName}</div>
                    {p.termsUrl && (
                      <a
                        href={p.termsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-3xs text-blue-600 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                      >
                        <span>View Terms of Service</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.status === 'allowed' ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Allowed
                      </span>
                    ) : p.status === 'restricted' ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <X className="w-3 h-3 text-rose-600" />
                        Restricted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                        Review Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-xs text-2xs leading-relaxed">
                    {p.policyNotes}
                  </td>
                  <td className="py-3 px-3 font-mono text-2xs text-slate-500">
                    <div>{p.lastReviewed}</div>
                    <div className="text-3xs text-slate-400">{p.reviewedBy}</div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit policy"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete policy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-2xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>ఈ లిస్ట్ ఆధారంగా బాట్ అనుమతించబడిన సైట్లలో మాత్రమే డేటా ఎంట్రీని నడుపుతుంది.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Close (ముగించు)
          </button>
        </div>
      </div>
    </div>
  );
};
