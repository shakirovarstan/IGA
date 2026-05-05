import { cn } from '../lib/utils';
import { LayoutGrid, BookOpen, Library, AlertTriangle, User } from 'lucide-react';
import { AppState } from '../types';

interface BottomNavProps {
  state: AppState;
  setState: (s: AppState) => void;
  lang: 'ru' | 'ky';
}

export function BottomNav({ state, setState, lang }: BottomNavProps) {
  const navItems = [
    { id: 'landing', icon: LayoutGrid, labelRu: 'Главная', labelKy: 'Башкы' },
    { id: 'practice', icon: BookOpen, labelRu: 'Практика', labelKy: 'Практика' },
    { id: 'exam_bank', icon: Library, labelRu: 'Библиотека', labelKy: 'Банк' },
    { id: 'mistake_review', icon: AlertTriangle, labelRu: 'Ошибки', labelKy: 'Каталар' },
    { id: 'profile', icon: User, labelRu: 'Профиль', labelKy: 'Профиль' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-2 py-4 pb-8 z-50">
      {navItems.map((item) => {
        const isActive = state === item.id || (item.id === 'practice' && (state === 'drill_selector' || state === 'topic_list')) || (item.id === 'exam_bank' && (state === 'exam_bank' || state === 'yearly_exams'));
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setState(item.id as AppState)}
            className={cn(
              "flex flex-col items-center gap-1.5 transition-all outline-none",
              isActive ? "text-blue-500 scale-105" : "text-slate-400 hover:text-slate-500"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300",
              isActive ? "bg-blue-50 dark:bg-blue-500/10" : "bg-transparent"
            )}>
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[8px] font-black tracking-wider transition-all duration-300",
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none h-0"
            )}>
              {lang === 'ru' ? item.labelRu : item.labelKy}
            </span>
          </button>
        );
      })}
    </div>
  );
}
