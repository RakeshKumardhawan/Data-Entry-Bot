import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem } from '../types';

const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    text: 'గ్రామ పంచాయతీ వార్షిక అటెండెన్స్ వివరాలు 2026 ఇప్పుడు అందుబాటులో ఉన్నాయి.',
    isNew: true,
    date: 'Today',
  },
  {
    id: 'news-2',
    text: 'TMP పోర్టల్ డేటా ఎంట్రీ బాట్ v.1.0.0 అప్‌డేట్ విజయవంతంగా యాక్టివేట్ చేయబడింది.',
    isNew: true,
    date: 'Oct 09',
  },
  {
    id: 'news-3',
    text: 'కొత్త రిజిస్టర్డ్ యూజర్లకు అడ్మిన్ ద్వారా మాత్రమే అనుమతి ఇవ్వబడుతుంది (Website Sync Active).',
    isNew: false,
    date: 'Oct 08',
  },
  {
    id: 'news-4',
    text: 'భవిష్యత్తు నూతన ఫారాలు మరియు ఆన్‌లైన్ మాడ్యూల్స్ నేరుగా (Direct Sync) ద్వారా అప్‌డేట్ అవుతాయి.',
    isNew: true,
    date: 'Oct 07',
  }
];

export const FlashNewsBar: React.FC = () => {
  const [newsList] = useState<NewsItem[]>(INITIAL_NEWS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate news every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsList.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [newsList.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? newsList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsList.length);
  };

  const currentNews = newsList[currentIndex];

  return (
    <div className="w-full max-w-5xl mx-auto my-4 px-3 sm:px-4">
      <div className="bg-white rounded-xl border-2 border-red-500/80 shadow-md overflow-hidden flex items-stretch min-h-[48px]">
        {/* Flash News Red Badge with Megaphone icon */}
        <div className="bg-[#d32f2f] text-white px-3 sm:px-4 py-2.5 flex items-center gap-2 font-bold text-xs sm:text-sm tracking-wide shrink-0 select-none shadow-sm">
          <Megaphone className="w-4 h-4 fill-white animate-bounce" />
          <span className="uppercase font-sans whitespace-nowrap">Flash News</span>
        </div>

        {/* Scrolling / Animated News content */}
        <div className="flex-1 flex items-center px-3 sm:px-4 py-1.5 overflow-hidden">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-800 font-medium truncate animate-in fade-in duration-300">
            <span className="text-red-600 font-bold text-sm shrink-0">●</span>
            <span className="truncate">{currentNews.text}</span>
            {currentNews.isNew && (
              <span className="bg-[#d32f2f] text-white text-3xs font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 shadow-2xs">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center border-l border-slate-200 px-1 sm:px-2 bg-slate-50 shrink-0 gap-0.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title="Previous announcement"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors cursor-pointer"
            title="Next announcement"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
