import React, { useState } from 'react';
import { User, Lock, Mail, Phone, Building2, MapPin, CheckCircle2, AlertTriangle, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { registerUser, loginUser, ADMIN_EMAIL } from '../utils/authStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('Akkalapalli');
  const [district, setDistrict] = useState('Anantapur / Sri Sathya Sai');
  const [mandal, setMandal] = useState('Hindupur');
  const [loginInput, setLoginInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = registerUser({
      name,
      email,
      mobile,
      gramPanchayat,
      district,
      mandal,
    });

    if (res.success && res.user) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 1200);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const res = loginUser(loginInput);
    if (res.success && res.user) {
      setFeedback({ type: 'success', text: res.message });
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 1000);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleQuickLoginAsAdmin = () => {
    const res = loginUser(ADMIN_EMAIL);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0c3875] text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                E-Vedhika యూజర్ పోర్టల్ రిజిస్ట్రేషన్
              </h3>
              <p className="text-2xs text-blue-200">
                Unified Web & Applet Synchronization
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

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('register'); setFeedback(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'register'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            కొత్త రిజిస్ట్రేషన్ (Register)
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setFeedback(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ఖాతా లాగిన్ (Login)
          </button>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3 text-xs mx-5 mt-4 rounded-lg flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {tab === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-slate-700 leading-relaxed text-2xs">
                💡 <strong>ముఖ్య గమనిక:</strong> ఇక్కడ రిజిస్టర్ చేసుకున్న వివరాలు మన వెబ్‌సైట్‌కు సింక్ చేయబడతాయి. యూజర్ రిజిస్టర్ చేసిన తర్వాత అడ్మిన్ అనుమతి (Approval) ఇచ్చిన వెంటనే అప్లికేషన్ పూర్తిగా అన్‌లాక్ అవుతుంది.
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  పూర్తి పేరు (Full Name) *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ఉదా: బి. లక్ష్మీ నారాయణ"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    మొబైల్ నంబర్ (10-Digit Mobile) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="98480XXXXX"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ఇమెయిల్ అడ్రస్ (Email) *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@gmail.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    గ్రామ పంచాయతీ పేరు (GP Name) *
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={gramPanchayat}
                      onChange={(e) => setGramPanchayat(e.target.value)}
                      placeholder="ఉదా: Akkalapalli"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    జిల్లా (District) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="ఉదా: Anantapur"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  వెబ్‌సైట్ & అప్లికేషన్ రిజిస్టర్ అవ్వండి (Submit Registration)
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-600 text-2xs leading-relaxed">
                మీ రిజిస్టర్డ్ ఇమెయిల్ లేదా 10-అంకెల మొబైల్ నంబర్ ఎంటర్ చేసి లాగిన్ అవ్వండి.
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ఇమెయిల్ లేదా మొబైల్ నంబర్
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="email@gmail.com లేదా 9848011223"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                లాగిన్ చేయండి (Login)
              </button>
            </form>
          )}

          {/* Quick Demo Switch to Owner/Admin */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
            <span>యజమాని / Admin Login:</span>
            <button
              type="button"
              onClick={handleQuickLoginAsAdmin}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              ఓనర్ (Rakesh Kumar) గా లాగిన్ అవ్వండి
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
