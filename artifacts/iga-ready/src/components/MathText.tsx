import React from 'react';
import { Subject, AppState, Language } from '../types';
import { Flame, ChevronRight, BookOpen, Layout, GraduationCap, Globe, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile } from '../hooks/useProfile';

import { UserProgress } from '../types';

interface HomeScreenProps {
  profile: UserProfile;
  lang: Language;
  streak: number;
  currentSubject: Subject;
  progress: UserProgress;
  onSelectSubject: (s: Subject) => void;
  onStartExam: (t: AppState) => void;
}

export function HomeScreen({ profile, lang, streak, currentSubject, progress, onSelectSubject, onStartExam }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex justify-center">
      <div className="w-full max-w-md pb-24 relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-50 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--primary)]" />
            <span className="font-black text-xl text-[var(--primary)] text-[#004a6b]">IGA Prep</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#eeeeed] px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="font-bold text-sm">{streak}</span>
            </div>
            <div 
              className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shrink-0 cursor-pointer"
              onClick={() => onStartExam('profile')}
            >
              <img src={profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="px-5 pt-6 relative">
          <h1 className="text-3xl font-serif text-[var(--text-main)] mb-1">
            {lang === 'ru' ? `Привет, ${profile.name}!` : `Салам, ${profile.name}!`} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-[var(--text-muted)] text-[14px]">
            {lang === 'ru' ? 'Твоя учебная вселенная готова.' : 'Сенин окуу ааламың даяр.'}
          </p>

          {/* Sub menu circular layout */}
          <div className="relative w-full max-w-[280px] aspect-square mx-auto mt-6 mb-6 flex items-center justify-center shrink-0">
            {/* Dashed circle */}
            <div className="absolute inset-2 rounded-full border border-dashed border-slate-300" />
            <div className="absolute inset-16 rounded-full border border-dashed border-blue-100" />

            {/* Central Blitz test button */}
            <button 
              onClick={() => onStartExam('exam')}
              className="absolute z-20 w-32 h-32 rounded-full bg-[#1cb0f6] shadow-[0_12px_25px_-5px_rgba(28,176,246,0.5)] flex flex-col items-center justify-center text-white active:scale-95 transition-all outline outline-8 outline-[var(--bg-app)]"
              style={{ background: 'linear-gradient(135deg, #1cb0f6 0%, #0088cc 100%)' }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1.5">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-black text-[9px] uppercase tracking-widest text-center px-4 leading-tight">
                {lang === 'ru' ? 'ПОЛНЫЙ ЭКЗАМЕН' : 'ТОЛУК ЭКЗАМЕН'}
              </span>
            </button>

            {/* Algebra - top left */}
            <button 
              onClick={() => onSelectSubject('algebra')}
              className={cn(
                "absolute top-[2%] left-[2%] rounded-[1.75rem] bg-[#1cb0f6] shadow-md shadow-blue-200 flex flex-col items-center justify-center text-white transition-all transform origin-center",
                currentSubject === 'algebra' ? "w-22 h-22 z-30 scale-105" : "w-16 h-16 opacity-80 scale-95 hover:opacity-100 focus:opacity-100"
              )}
            >
              <Layout className={cn("mb-1", currentSubject === 'algebra' ? "w-5 h-5" : "w-4 h-4")} />
              <span className={cn("font-black uppercase tracking-wide text-center px-1 max-w-full overflow-hidden text-ellipsis", currentSubject === 'algebra' ? "text-[8px]" : "text-[6px]")}>Алгебра</span>
            </button>

            {/* Geometry - top right */}
            <button 
              onClick={() => onSelectSubject('geometry')}
              className={cn(
                "absolute top-[2%] right-[2%] rounded-[1.75rem] bg-[#f18e00] text-white flex flex-col items-center justify-center shadow-md shadow-orange-200 transition-all transform origin-center",
                currentSubject === 'geometry' ? "w-22 h-22 z-30 scale-105" : "w-16 h-16 opacity-80 scale-95 hover:opacity-100 focus:opacity-100"
              )}
            >
              <BookOpen className={cn("mb-1", currentSubject === 'geometry' ? "w-5 h-5" : "w-4 h-4")} />
              <span className={cn("font-black uppercase tracking-wide text-center px-1 max-w-full overflow-hidden text-ellipsis", currentSubject === 'geometry' ? "text-[8px]" : "text-[6px]")}>{lang === 'ru' ? 'Геометрия' : 'Геометрия'}</span>
            </button>

            {/* Russian - bottom left */}
            <button 
              onClick={() => onSelectSubject('russian')}
              className={cn(
                "absolute bottom-[2%] left-[2%] rounded-[1.75rem] bg-[#ba1a1a] flex flex-col items-center justify-center text-white shadow-md shadow-red-200 transition-all transform origin-center",
                currentSubject === 'russian' ? "w-22 h-22 z-30 scale-105" : "w-16 h-16 opacity-80 scale-95 hover:opacity-100 focus:opacity-100"
              )}
            >
               <GraduationCap className={cn("mb-1", currentSubject === 'russian' ? "w-5 h-5" : "w-4 h-4")} />
              <span className={cn("font-black uppercase tracking-wide text-center px-1 max-w-full overflow-hidden text-ellipsis", currentSubject === 'russian' ? "text-[8px]" : "text-[6px]")}>{lang === 'ru' ? 'Русский' : 'Орус тили'}</span>
            </button>

            {/* Kyrgyz - bottom right */}
            <button 
              onClick={() => onSelectSubject('kyrgyz')}
              className={cn(
                "absolute bottom-[2%] right-[2%] rounded-[1.75rem] bg-[#2b6c00] flex flex-col items-center justify-center text-white shadow-md shadow-green-200 transition-all transform origin-center",
                currentSubject === 'kyrgyz' ? "w-22 h-22 z-30 scale-105" : "w-16 h-16 opacity-80 scale-95 hover:opacity-100 focus:opacity-100"
              )}
            >
              <Globe className={cn("mb-1", currentSubject === 'kyrgyz' ? "w-5 h-5" : "w-4 h-4")} />
              <span className={cn("font-black uppercase tracking-wide text-center px-1 max-w-full overflow-hidden text-ellipsis", currentSubject === 'kyrgyz' ? "text-[8px]" : "text-[6px]")}>{lang === 'ru' ? 'Кыргызский' : 'Кыргыз тили'}</span>
            </button>
          </div>
        </div>

        <div className="px-5 mt-4 space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-serif text-[var(--text-main)]">
              {lang === 'ru' ? 'Теория и Учебники' : 'Теория жана окуу китептери'}
            </h2>
            <button onClick={() => onStartExam('topic_list')} className="text-[var(--primary)] text-[10px] font-black tracking-wider uppercase">
              {lang === 'ru' ? 'Все' : 'Баары'}
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar -mx-5 px-5">
            {(currentSubject === 'algebra' || currentSubject === 'geometry') && (
              <>
                <div onClick={() => onStartExam('topic_list')} className="min-w-[260px] cursor-pointer snap-center bg-white rounded-[1.5rem] p-5 shadow-sm border border-[var(--card-border)] flex flex-col active:scale-95 transition-transform">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[var(--primary)] mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 leading-tight text-[var(--text-main)]">
                    {currentSubject === 'algebra' ? (lang === 'ru' ? 'Учебник Алгебры' : 'Алгебра окуу куралы') : (lang === 'ru' ? 'Справочник Геометрии' : 'Геометрия боюнча маалымдама')}
                  </h3>
                  <p className="text-[12px] text-[var(--text-muted)] font-medium mb-5">{lang === 'ru' ? 'Все темы предметы' : 'Предметтин бардык темалары'}</p>
                  <div className="mt-auto flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: `${Math.min(100, (progress.studiedTopics || []).length > 0 ? Math.round(((progress.studiedTopics || []).length / 120) * 100) : 0)}%` }} />
                    </div>
                    <span className="text-[12px] font-bold text-[var(--primary)]">{Math.min(100, (progress.studiedTopics || []).length > 0 ? Math.round(((progress.studiedTopics || []).length / 120) * 100) : 0)}%</span>
                  </div>
                </div>
                
                {currentSubject === 'algebra' && (
                  <div onClick={() => onStartExam('formulas')} className="min-w-[260px] cursor-pointer snap-center bg-white rounded-[1.5rem] p-5 shadow-sm border border-[var(--card-border)] flex flex-col active:scale-95 transition-transform">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#f18e00] mb-4">
                      <Layout className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-1 leading-tight text-[var(--text-main)]">{lang === 'ru' ? 'Формулы' : 'Формулалар'}</h3>
                    <p className="text-[12px] text-[var(--text-muted)] font-medium mb-5">{lang === 'ru' ? 'Основные формулы' : 'Негизги формулалар'}</p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#f18e00] rounded-full" style={{ width: '10%' }} />
                      </div>
                      <span className="text-[12px] font-bold text-[#f18e00]">10%</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {currentSubject === 'russian' && (
              <div onClick={() => onStartExam('topic_list')} className="min-w-[260px] cursor-pointer snap-center bg-white rounded-[1.5rem] p-5 shadow-sm border border-[var(--card-border)] flex flex-col active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 leading-tight text-[var(--text-main)]">{lang === 'ru' ? 'Грамматика' : 'Грамматика'}</h3>
                <p className="text-[12px] text-[var(--text-muted)] font-medium mb-5">{lang === 'ru' ? 'Правила русского языка' : 'Орус тилинин эрежелери'}</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 w-[20%] rounded-full" />
                  </div>
                  <span className="text-[12px] font-bold text-teal-600">20%</span>
                </div>
              </div>
            )}

            {currentSubject === 'kyrgyz' && (
              <div onClick={() => onStartExam('topic_list')} className="min-w-[260px] cursor-pointer snap-center bg-white rounded-[1.5rem] p-5 shadow-sm border border-[var(--card-border)] flex flex-col active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1 leading-tight text-[var(--text-main)]">{lang === 'ru' ? 'Справочник' : 'Окуу куралы'}</h3>
                <p className="text-[12px] text-[var(--text-muted)] font-medium mb-5">{lang === 'ru' ? 'Правила кыргызского языка' : 'Кыргыз тилинин эрежелери'}</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[30%] rounded-full" />
                  </div>
                  <span className="text-[12px] font-bold text-green-600">30%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
