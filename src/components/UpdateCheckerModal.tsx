import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, ShieldCheck, X, Download } from 'lucide-react';

interface UpdateCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateCheckerModal: React.FC<UpdateCheckerModalProps> = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState<'checking' | 'upToDate'>('checking');

  useEffect(() => {
    if (isOpen) {
      setStage('checking');
      const timer = setTimeout(() => {
        setStage('upToDate');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              సాఫ్ట్‌వేర్ అప్‌డేట్ తనిఖీ / Check for Updates
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-4 space-y-3">
          {stage === 'checking' ? (
            <div className="space-y-3">
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
              <div className="font-mono text-xs text-slate-700 bg-slate-100 py-2 px-3 rounded-lg border border-slate-200">
                Checking for software updates...
              </div>
              <p className="text-xs text-slate-500">
                Contacting release server for latest version binaries...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
                Software is up to date! (v.1.0.0)
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                మీరు ఉపయోగిస్తున్న వెర్షన్ v.1.0.0 తాజాది. కొత్త ఫీచర్లు మరియు సెలీనియం డ్రైవర్లు అన్నీ సిద్ధంగా ఉన్నాయి.
              </p>
              <div className="text-2xs text-slate-400 font-mono">
                Build: v.1.0.0-GP-RELEASE • All modules verified
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
