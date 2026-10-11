import React, { useState } from 'react';
import { Settings, Monitor, FileText, ChevronDown, Check, ShieldAlert, ArrowRight, Lock } from 'lucide-react';
import { SelectedModule, UserProfile } from '../types';
import { EVGearLogo } from './EVGearLogo';

interface ModuleSelectorCardProps {
  selectedModule: SelectedModule;
  onSelectModule: (module: SelectedModule) => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
}

export const ModuleSelectorCard: React.FC<ModuleSelectorCardProps> = ({
  selectedModule,
  onSelectModule,
  currentUser,
  onOpenAuthModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isApproved = currentUser?.status === 'approved' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const handleChoose = (mod: SelectedModule) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    if (!isApproved) {
      alert('క్షమించండి! మీ ఖాతా ఇంకా అడ్మిన్ ద్వారా ఆమోదించబడలేదు. అడ్మిన్ ఆమోదం (Approval) వచ్చిన తర్వాత మాత్రమే అనుమతి లభిస్తుంది.');
      return;
    }
    if (mod === 'future_updates' && !isAdmin) {
      alert('క్షమించండి! ఈ మాడ్యూల్ కేవలం అడ్మిన్‌కు మాత్రమే అందుబాటులో ఉంటుంది. యూజర్లకు TMP పోర్టల్ మాత్రమే అనుమతించబడింది.');
      return;
    }
    onSelectModule(mod);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 sm:py-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-6 sm:p-10 text-center relative overflow-visible">
        {/* Rotating Gear with EV Logo in center (Right-to-Left spinning gear) */}
        <div className="mb-4 sm:mb-5">
          <EVGearLogo size={84} />
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#0c3875] tracking-tight">
          Select Portal / Module
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
          Please choose the required portal or module from the list below to continue.
        </p>

        {/* Auth status warning if not approved */}
        {currentUser && !isApproved && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 text-left flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                గమనిక: అడ్మిన్ ఆమోదం కోసం వేచి ఉంది (Pending Admin Approval)
              </p>
              <p className="text-2xs text-amber-800 mt-0.5">
                మీరు వెబ్‌సైట్‌లో విజయవంతంగా రిజిస్టర్ అయ్యారు. అడ్మిన్ (Owner) మీకు అనుమతి ఇచ్చిన తర్వాత ఈ మాడ్యూల్స్ అన్నీ ఆటోమేటిక్‌గా అన్‌లాక్ అవుతాయి.
              </p>
            </div>
          </div>
        )}

        {!currentUser && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 text-left flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>అప్లికేషన్ ఉపయోగించడానికి మొదట రిజిస్టర్ / లాగిన్ అవ్వండి.</span>
            </div>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0 cursor-pointer"
            >
              రిజిస్టర్ అవ్వండి
            </button>
          </div>
        )}

        {/* Custom Styled Dropdown matching uploaded screenshot */}
        <div className="mt-6 max-w-xl mx-auto text-left relative">
          {/* Main Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 border-blue-500 bg-white hover:bg-blue-50/20 text-sm font-medium text-slate-800 transition-all shadow-xs cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-400"
          >
            <div className="flex items-center gap-2.5">
              {selectedModule === 'tmp' && (
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Monitor className="w-5 h-5 text-blue-600" />
                  <span>TMP Portal (గ్రామ పంచాయతీ డేటా ఎంట్రీ)</span>
                </div>
              )}
              {selectedModule === 'future_updates' && (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Future Updates and New Forms (డైరెక్ట్ అప్‌డేట్స్)</span>
                </div>
              )}
              {!selectedModule && (
                <span className="text-slate-400 font-normal">-- Select --</span>
              )}
            </div>

            <ChevronDown
              className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Options List */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
              {/* Option 1: TMP Portal */}
              <button
                type="button"
                onClick={() => handleChoose('tmp')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                  selectedModule === 'tmp'
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <Monitor className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-slate-900">
                    TMP Portal
                  </div>
                  <div className="text-xs text-slate-500">
                    గ్రామ పంచాయతీ బ్యాచ్ డేటా ఎంట్రీ, డూప్లికేట్ మొబైల్ చెకర్ మరియు సెలీనియం బాట్
                  </div>
                </div>
                {selectedModule === 'tmp' && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>

              {/* Option 2: Future Updates and New Forms (Admin Only) */}
              {isAdmin && (
                <>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    type="button"
                    onClick={() => handleChoose('future_updates')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                      selectedModule === 'future_updates'
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                        <span>Future Updates and New Forms</span>
                        <span className="text-3xs bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          అడ్మిన్ అప్‌లోడ్ • డైరెక్ట్ సింక్
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        అడ్మిన్ డైరెక్ట్‌గా అప్‌లోడ్ చేసే నూతన ప్రభుత్వ ఫారాలు (Admin Only Management)
                      </div>
                    </div>
                    {selectedModule === 'future_updates' && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick action buttons if module selected */}
        {selectedModule && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-slate-500 font-medium">
              ఎంచుకున్న మాడ్యూల్: <strong className="text-slate-800">{selectedModule === 'tmp' ? 'TMP Portal' : 'Future Updates & New Forms'}</strong>
            </span>
            <button
              type="button"
              onClick={() => onSelectModule('')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
            >
              రీసెట్ / మార్చండి
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
