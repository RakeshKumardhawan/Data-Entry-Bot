import React from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Table, HelpCircle, Sparkles } from 'lucide-react';
import { downloadStandardTemplate } from '../utils/excelParser';

interface ExcelFormatGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelFormatGuideModal: React.FC<ExcelFormatGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                సరైన ఎక్సెల్ ఫైల్ రూపం / Excel Sheet Format Specification
              </h2>
              <p className="text-xs text-blue-200">
                TMP పోర్టల్ మరియు e-Vedhika ఆటోమేషన్ కోసం ఎక్సెల్ కాలమ్స్ వివరాలు &amp; నమూనా
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* Quick Action Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-blue-950 text-sm">
                  రెడీమేడ్ ఎక్సెల్ టెంప్లేట్ కావాలా? (Download Blank Template)
                </h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  కింది బటన్ నొక్కిన వెంటనే సరైన కాలమ్స్ ఉన్న <strong className="font-mono">.xlsx</strong> ఫైల్ డౌన్‌లోడ్ అవుతుంది. అందులో మీ వివరాలు నింపుకోవచ్చు!
                </p>
              </div>
            </div>
            <button
              onClick={() => downloadStandardTemplate()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer shrink-0 hover:shadow-lg active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>నమూనా ఫైల్ డౌన్‌లోడ్ (.xlsx)</span>
            </button>
          </div>

          {/* Format 1: TMP Government Portal Trainee Format */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">1</span>
                <h3 className="font-bold text-slate-900 text-base">
                  రూపం 1: TMP పోర్టల్ ట్రైనీ డేటా ఫార్మాట్ (Standard Portal Columns)
                </h3>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                F8 ఆటోమేషన్‌కు ఉత్తమమైనది
              </span>
            </div>
            <p className="text-xs text-slate-600">
              మీరు TMP పోర్టల్‌లో ట్రైనీలను నమోదు చేస్తుంటే, ఎక్సెల్ ఫైల్ మొదటి వరుస (Row 1) లో ఈ క్రింది కాలమ్స్ ఉండాలి:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                    <th className="p-2.5 border-r border-slate-200 w-12 text-center">కాలమ్</th>
                    <th className="p-2.5 border-r border-slate-200 font-mono text-blue-700">హెడర్ పేరు (మీ ఫోటో ప్రకారం)</th>
                    <th className="p-2.5 border-r border-slate-200 text-slate-800">తెలుగు వివరణ</th>
                    <th className="p-2.5 border-r border-slate-200">మీ ఎక్సెల్ ఉదాహరణ</th>
                    <th className="p-2.5">నిబంధన / నిబంధనలు</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold font-mono">A</td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">SL No</td>
                    <td className="p-2.5">క్రమ సంఖ్య</td>
                    <td className="p-2.5 font-mono">1, 2, 3...</td>
                    <td className="p-2.5 text-slate-500">సంఖ్య మాత్రమే (1, 2, 3..)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-blue-50/30">
                    <td className="p-2.5 text-center font-bold font-mono text-blue-800">B</td>
                    <td className="p-2.5 font-mono font-bold text-blue-800">Name</td>
                    <td className="p-2.5 font-medium">ట్రైనీ / అభ్యర్థి పేరు</td>
                    <td className="p-2.5 font-medium">arikilla Srinadh</td>
                    <td className="p-2.5 text-emerald-700 font-semibold">తప్పనిసరి (Required)</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold font-mono">C</td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">Email</td>
                    <td className="p-2.5">ఈమెయిల్ అడ్రస్</td>
                    <td className="p-2.5 font-mono text-slate-600">NA (లేదా ఖాళీ)</td>
                    <td className="p-2.5 text-slate-500">ఈమెయిల్ లేకపోతే 'NA' లేదా ఖాళీగా ఉంచండి</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-amber-50/40">
                    <td className="p-2.5 text-center font-bold font-mono text-amber-800">D</td>
                    <td className="p-2.5 font-mono font-bold text-amber-900">Mobile No.</td>
                    <td className="p-2.5 font-medium text-amber-950">10 అంకెల మొబైల్ నెంబర్</td>
                    <td className="p-2.5 font-mono font-bold text-amber-800">9701420587</td>
                    <td className="p-2.5 text-amber-800 font-semibold">
                      కచ్చితంగా 10 అంకెలు! ప్రతి ఒక్కరికీ వేర్వేరు నంబర్ ఉండాలి.
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold font-mono">E</td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">Designation</td>
                    <td className="p-2.5">హోదా / వృత్తి</td>
                    <td className="p-2.5">pravet job / agriculture / labour</td>
                    <td className="p-2.5 text-slate-500">ఉదా: agriculture, labour, Villager</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold font-mono">F</td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">Organization</td>
                    <td className="p-2.5">సంస్థ / పంచాయతీ</td>
                    <td className="p-2.5">[ఖాళీ] (Blank)</td>
                    <td className="p-2.5 text-slate-500">ఖాళీగా ఉంటే ఆటోమేటిక్‌గా 'Gram Panchayat' తీసుకుంటుంది</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold font-mono">G</td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">Male/Female</td>
                    <td className="p-2.5">లింగము</td>
                    <td className="p-2.5">Male / Female</td>
                    <td className="p-2.5 text-slate-500">Male లేదా Female</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 text-center font-bold font-mono">H</td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">Category (General, OC, OBC, SC ST)</td>
                    <td className="p-2.5">సామాజిక వర్గం (కులం)</td>
                    <td className="p-2.5">SC / OBC / OC</td>
                    <td className="p-2.5 text-slate-500">SC, ST, OBC, OC, General</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note about Row 12 & 13 duplicate */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-rose-800">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>మీ ఫోటోలోని డూప్లికేట్ ఎర్రర్ కారణం (Row 12 &amp; 13):</span>
              </div>
              <p className="text-rose-900 leading-relaxed">
                మీరు పంపిన ఫోటోలో <strong>SL No 12 (Takire Anitha)</strong> మరియు <strong>SL No 13 (Takire Srinivas)</strong> ఇద్దరికీ ఒకే మొబైల్ నెంబర్ <strong>`8555918940`</strong> ఉంది!
                అందుకే TMP పోర్టల్‌లో <em>'Kindly check below Trainee details having same Mobile No'</em> ఎర్రర్ వచ్చింది. 
                ఆ నంబర్లలో ఒకదాన్ని మార్చితే లేదా పోర్టల్‌లో సెలెక్ట్ చేస్తే ఎంట్రీ వెంటనే పూర్తవుతుంది.
              </p>
            </div>
          </div>

          {/* Format 2: Alternative e-Vedhika Citizen Profile Format */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">2</span>
                <h3 className="font-bold text-slate-900 text-base">
                  రూపం 2: గ్రామ పంచాయతీ పౌరుల జాబితా (Citizen Profile Format)
                </h3>
              </div>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                ఆధార్ &amp; రేషన్ కార్డుల కోసం
              </span>
            </div>
            <p className="text-xs text-slate-600">
              గ్రామ పంచాయతీ స్థానిక సర్వే లేదా రేషన్ కార్డు రికార్డులకు ఈ కాలమ్స్ కూడా చెల్లుతాయి:
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto">
              <div className="flex gap-4 min-w-[500px] font-bold text-blue-900 border-b border-slate-300 pb-1.5">
                <span className="w-16">S.No</span>
                <span className="w-48">Name</span>
                <span className="w-32">Mobile</span>
                <span className="w-36">Aadhaar</span>
                <span className="w-32">RationCard</span>
                <span className="w-24">Ward</span>
              </div>
              <div className="flex gap-4 min-w-[500px] py-1 text-slate-600 border-b border-slate-200">
                <span className="w-16">1</span>
                <span className="w-48">కె. రామాంజనేయులు</span>
                <span className="w-32">9848022338</span>
                <span className="w-36">5432-8976-1201</span>
                <span className="w-32">WAP12089301</span>
                <span className="w-24">Ward 1</span>
              </div>
              <div className="flex gap-4 min-w-[500px] py-1 text-slate-600">
                <span className="w-16">2</span>
                <span className="w-48">బి. లక్ష్మీ దేవి</span>
                <span className="w-32">9440155672</span>
                <span className="w-36">6721-9043-4412</span>
                <span className="w-32">WAP12089302</span>
                <span className="w-24">Ward 2</span>
              </div>
            </div>
          </div>

          {/* Important Rules Checklist */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-amber-950 flex items-center gap-2 text-xs uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              ఎక్సెల్ ఫైల్ తయారు చేసేటప్పుడు తీసుకోవలసిన ముఖ్య జాగ్రత్తలు:
            </h4>
            <ul className="text-xs text-amber-900 space-y-1.5 pl-5 list-disc">
              <li>
                <strong>మొబైల్ నెంబర్లు:</strong> కచ్చితంగా 10 అంకెలు ఉండాలి. ముందు <code className="bg-amber-100 px-1 rounded font-mono">+91</code> లేదా <code className="bg-amber-100 px-1 rounded font-mono">0</code> లేదా స్పేస్‌లు ఉండకూడదు.
              </li>
              <li>
                <strong>డూప్లికేట్ నెంబర్లు:</strong> ఒకే మొబైల్ నెంబర్‌ను ఇద్దరు లేదా ముగ్గురు వ్యక్తులకు రిపీట్ చేస్తే పోర్టల్ తిరస్కరిస్తుంది (Duplicate Trainee Error). ప్రతి ఒక్కరికీ వేర్వేరు నంబర్ ఉండాలి.
              </li>
              <li>
                <strong>మొదటి వరుస (Row 1):</strong> హెడర్ పేర్లు Row 1 లోనే ఉండాలి. పై భాగంలో ఎలాంటి పెద్ద టైటిల్ లేదా ఖాళీ వరుసలు లేకపోతే సిస్టమ్ వేగంగా గుర్తిస్తుంది.
              </li>
              <li>
                <strong>ఫైల్ ఎక్స్‌టెన్షన్:</strong> ఫైల్‌ను <strong>.xlsx</strong> లేదా <strong>.xls</strong> రూపంలో సేవ్ చేయండి.
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            e-Vedhika Automation Suite • Excel Sheet Specification Guide
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadStandardTemplate()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>టెంప్లేట్ డౌన్‌లోడ్</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              మూసివేయి (Close)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
