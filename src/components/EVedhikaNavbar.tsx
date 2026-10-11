import React, { useState } from 'react';
import { Home, User, ChevronDown, LogOut, ShieldCheck, Users, CheckCircle2, Clock, AlertTriangle, Key } from 'lucide-react';
import { UserProfile } from '../types';
import { EVAnimatedLogo } from './EVAnimatedLogo';

interface EVedhikaNavbarProps {
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenAdminUsersModal: () => void;
  onOpenDomainPolicyModal: () => void;
  onOpenExeModal: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const EVedhikaNavbar: React.FC<EVedhikaNavbarProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenAdminUsersModal,
  onOpenDomainPolicyModal,
  onOpenExeModal,
  onNavigateHome,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#0c3875] via-[#15549d] to-[#1964b7] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand & Emblem Logo */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-3.5 cursor-pointer group select-none"
        >
          {/* EV Animated Logo requested by user */}
          <EVAnimatedLogo size={46} />

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-white drop-shadow-xs font-serif">
                E-Vedhika
              </span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-200 border border-blue-400/30">
                v.1.0.0
              </span>
            </div>
            {/* Slogan with yellow accent underline matching screenshot */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-4 h-0.5 bg-amber-400 inline-block"></span>
              <p className="text-2xs text-amber-300 font-medium tracking-wide">
                All Problems, One Solution
              </p>
              <span className="w-4 h-0.5 bg-amber-400 inline-block"></span>
            </div>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Home Link */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          {/* Divider */}
          <span className="text-white/30 font-light text-sm hidden sm:inline">|</span>

          {/* Domain Compliance Policies */}
          <button
            type="button"
            onClick={onOpenDomainPolicyModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="వెబ్‌సైట్ ఆటోమేషన్ పాలసీలు & నిబంధనల తనిఖీ"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
            <span>డొమైన్ పాలసీలు (Compliance)</span>
          </button>

          {/* Protected EXE Tool quick link */}
          <button
            type="button"
            onClick={onOpenExeModal}
            title="e-Vedhika.Data.entry_bot.exe డౌన్‌లోడ్ & కాన్ఫిగరేషన్"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400/40 hover:bg-emerald-500/30 text-emerald-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Key className="w-3.5 h-3.5 text-emerald-300" />
            <span>e-Vedhika.Data.entry_bot.exe</span>
          </button>

          {/* User Profile / Auth Dropdown */}
          <div className="relative">
            {currentUser ? (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer select-none"
              >
                <div className="w-6 h-6 rounded-full bg-white text-[#15549d] flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.name.split(' ')[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#15549d] hover:bg-slate-100 text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>రిజిస్టర్ / లాగిన్ (Login)</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {isDropdownOpen && currentUser && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-3xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                  
                  {/* Status Banner */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-2xs">
                    <span className="text-slate-600">అనుమతి హోదా (Status):</span>
                    {currentUser.status === 'approved' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved (ఆమోదించబడింది)
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending Approval
                      </span>
                    )}
                  </div>
                  <div className="text-3xs text-slate-500 mt-1">
                    GP: <strong>{currentUser.gramPanchayat || 'Akkalapalli'}</strong> ({currentUser.district || 'AP'})
                  </div>
                </div>

                {/* Dropdown Links */}
                <div className="py-1">
                  {currentUser.role === 'admin' && (
                    <button
                      type="button"
                      onClick={onOpenAdminUsersModal}
                      className="w-full px-4 py-2 text-left text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>యూజర్ల అప్రూవల్ మేనేజ్మెంట్ (Admin Approvals)</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onOpenDomainPolicyModal}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>డొమైన్ ఆటోమేషన్ పాలసీలు (Domain Rules)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenExeModal}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>రక్షిత .EXE కాన్ఫిగరేషన్ (Anti-Edit Lock)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAuthModal}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>వేరే ఖాతాతో లాగిన్ / రిజిస్టర్ అవ్వండి</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>లాగ్ అవుట్ (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
