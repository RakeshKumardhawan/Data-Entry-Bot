import React, { useState } from 'react';
import { Users, ShieldCheck, Check, X, Clock, Trash2, Search, CheckCircle2, AlertOctagon } from 'lucide-react';
import { UserProfile } from '../types';
import { getStoredUsers, updateUserApproval } from '../utils/authStorage';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersUpdated: () => void;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(getStoredUsers());
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleSetStatus = (userId: string, status: 'approved' | 'rejected' | 'pending') => {
    const updated = updateUserApproval(userId, status);
    setUsers(updated);
    onUsersUpdated();
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.mobile.includes(s) ||
      u.gramPanchayat.toLowerCase().includes(s)
    );
  });

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0c3875] text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  యూజర్ల అప్రూవల్ & అనుమతి మేనేజ్మెంట్ (Admin Approvals)
                </h3>
                {pendingCount > 0 && (
                  <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-2xs text-blue-200">
                యూజర్లు రిజిస్టర్ చేసుకున్న తర్వాత ఇక్కడ మీరు అనుమతి ఇవ్వవచ్చు.
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

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">
              మొత్తం రిజిస్టర్డ్ యూజర్లు: {users.length}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, mobile, GP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs w-48 text-slate-800"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">User Details (పేరు / ఇమెయిల్)</th>
                <th className="py-2.5 px-3">Mobile No</th>
                <th className="py-2.5 px-3">Gram Panchayat / District</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-center">అనుమతి హోదా (Status)</th>
                <th className="py-2.5 px-3 text-right">చర్య (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-2xs text-slate-500 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {u.mobile}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{u.gramPanchayat}</span>
                    <span className="text-2xs text-slate-500 block">{u.district}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-3xs font-bold px-2 py-0.5 rounded-full uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {u.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Approved
                      </span>
                    ) : u.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {u.role !== 'admin' ? (
                      <div className="inline-flex items-center gap-1">
                        {u.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(u.id, 'approved')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs cursor-pointer shadow-2xs transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>అనుమతి ఇవ్వండి</span>
                          </button>
                        )}
                        {u.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleSetStatus(u.id, 'pending')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 font-medium text-2xs cursor-pointer transition-colors"
                          >
                            <span>రద్దు చేయండి</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-3xs text-slate-400 font-mono">Owner (Auto-Approved)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <p className="text-2xs text-slate-500">
            అనుమతి ఇవ్వబడిన యూజర్లు మాత్రమే అప్లికేషన్ మరియు డేటా ఎంట్రీ బాట్‌ను యాక్సెస్ చేయగలరు.
          </p>
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
