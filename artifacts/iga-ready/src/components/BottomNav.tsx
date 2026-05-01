import { cn } from '../lib/utils';
import { LayoutGrid, BookOpen, AlertTriangle, User } from 'lucide-react';
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
    { id: 'mistake_review', icon: AlertTriangle, labelRu: 'Ошибки', labelKy: 'Каталар' },
    { id: 'profile', icon: User, labelRu: 'Профиль', labelKy: 'Профиль' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[var(--card-border)] flex items-end justify-around px-2 py-3 pb-6 z-50">
      {navItems.map((item) => {
        const isActive = state === item.id || (item.id === 'practice' && (state === 'drill_selector' || state === 'topic_list')) || (item.id === 'landing' && state === 'landing');
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setState(item.id as AppState)}
            className={cn(
              "flex flex-col items-center gap-1 w-16 transition-all",
              isActive ? "text-[var(--primary)]" : "text-slate-400"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-[var(--primary)] text-[var(--primary)]")} strokeWidth={isActive ? 2 : 1.5} />
            <span className={cn("text-[10px] uppercase tracking-wider font-bold", isActive && "text-[var(--primary)]")}>
              {lang === 'ru' ? item.labelRu : item.labelKy}
            </span>
            {isActive && <div className="w-6 h-1 bg-[var(--primary)] rounded-full mt-0.5" />}
          </button>
        );
      })}
    </div>
  );
}
