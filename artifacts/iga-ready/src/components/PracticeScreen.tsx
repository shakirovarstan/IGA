import React from 'react';
import { Subject, Language, AppState } from '../types';
import { ChevronRight, Layout, BookOpen, GraduationCap, Globe, Flame, Target, BarChart3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { SUBJECTS } from '../data/subjects_meta';
import { TOPICS } from '../data/topics';

interface PracticeScreenProps {
  lang: Language;
  onSelectSubject: (s: Subject) => void;
  onNavigate: (state: AppState) => void;
  progress: any; // Using any for progress state to easily grab what we need
  mistakesCount: number;
}

export function PracticeScreen({ lang, onSelectSubject, onNavigate, progress, mistakesCount }: PracticeScreenProps) {
  const handleSubjectClick = (subject: Subject) => {
    onSelectSubject(subject);
    onNavigate('drill_selector');
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'algebra': return <Layout className="w-6 h-6" />;
      case 'geometry': return <BookOpen className="w-6 h-6" />;
      case 'russian': return <GraduationCap className="w-6 h-6" />;
      case 'kyrgyz': return <Globe className="w-6 h-6" />;
      default: return <Layout className="w-6 h-6" />;
    }
  };

  const getSubjectPercent = (subjectId: Subject) => {
    const stats = progress.subjectStats?.[subjectId];
    if (!stats || stats.total === 0) return 0;
    return Math.round((stats.correct / stats.total) * 100);
  };

  const subjectRows = SUBJECTS.map(subj => {
    const percent = getSubjectPercent(subj.id);
    return (
      <button key={subj.id} onClick={() => handleSubjectClick(subj.id)} className="w-full bg-white rounded-[1.25rem] p-5 flex items-center gap-4 border border-[var(--card-border)] shadow-sm text-left active:scale-95 transition-transform group">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm transition-transform group-hover:scale-105", subj.color)}>
            {getSubjectIcon(subj.id)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[17px] text-[var(--text-main)] group-hover:text-blue-600 transition-colors">{subj.title[lang]}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black text-slate-400">{percent}%</span>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
             <div className={cn("h-full rounded-full transition-all duration-1000", subj.color)} style={{ width: `${percent}%` }} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1.5 flex justify-between">
            <span>{lang === 'ru' ? 'Подготовка' : 'Даярдык'}</span>
          </div>
        </div>
      </button>
    );
  });

  const topicsCompleted = (progress.studiedTopics || []).length;
  const accuracy = progress.totalQuestions > 0 ? Math.round(((progress.totalQuestions - mistakesCount) / progress.totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex justify-center overflow-auto">
      <div className="w-full max-w-md pb-24 relative flex flex-col pt-8 px-5">
        
        <h1 className="text-[28px] font-serif font-bold text-[var(--text-main)] mb-6 text-center">
          {lang === 'ru' ? 'Тренажер ИГА' : 'ИГА тренажеру'}
        </h1>

        <div className="space-y-4 mb-8">
          {subjectRows}
        </div>

        <div className="bg-white rounded-[2rem] p-6 border border-[var(--card-border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[20px] font-serif">{lang === 'ru' ? 'Достижения' : 'Жетишкендиктер'}</h3>
          </div>
          
          <div className="flex flex-col gap-5">
            {/* Achievement 1: Accuracy */}
            <div className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent", (accuracy > 90 && progress.totalQuestions > 10) ? "bg-blue-50 border-blue-100" : "bg-slate-50/50")}>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", (accuracy > 90 && progress.totalQuestions > 10) ? "bg-white text-blue-500" : "bg-white/50 text-slate-300 grayscale")}>
                <Target className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <div className="font-bold text-[15px] text-[var(--text-main)]">
                    {lang === 'ru' ? 'Безупречность' : 'Катасыздык'}
                  </div>
                  <div className="text-[12px] font-black text-slate-400">
                    {accuracy}%
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium leading-tight">
                  {lang === 'ru' ? 'Поддерживайте точность выше 90%' : 'Тактыкты 90%дан жогору кармаңыз'}
                </div>
              </div>
            </div>

            {/* Achievement 2: Streak */}
            <div className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent", progress.streak >= 7 ? "bg-orange-50 border-orange-100" : "bg-slate-50/50")}>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", progress.streak >= 7 ? "bg-white text-orange-500" : "bg-white/50 text-slate-300 grayscale")}>
                <Flame className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <div className="font-bold text-[15px] text-[var(--text-main)]">
                    {lang === 'ru' ? 'Сила воли' : 'Эрки күчтүү'}
                  </div>
                  <div className="text-[12px] font-black text-slate-400">
                    {progress.streak} / 7
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium leading-tight">
                  {lang === 'ru' ? '7 дней занятий подряд' : '7 күн катары менен окуу'}
                </div>
                <div className="w-full h-1.5 bg-slate-200 mt-2 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (progress.streak / 7) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Achievement 3: Master */}
            <div className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent", topicsCompleted >= 100 ? "bg-purple-50 border-purple-100" : "bg-slate-50/50")}>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", topicsCompleted >= 100 ? "bg-white text-purple-500" : "bg-white/50 text-slate-300 grayscale")}>
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <div className="font-bold text-[15px] text-[var(--text-main)]">
                    {lang === 'ru' ? 'Академик' : 'Академик'}
                  </div>
                  <div className="text-[12px] font-black text-slate-400">
                    {topicsCompleted} / 100
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] font-medium leading-tight">
                  {lang === 'ru' ? 'Изучите все основные темы' : 'Бардык негизги темаларды изилдеңиз'}
                </div>
                <div className="w-full h-1.5 bg-slate-200 mt-2 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (topicsCompleted / 100) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => onNavigate('mistake_review')} className="w-full bg-[#ffdad6] rounded-[1.5rem] p-5 flex items-center gap-4 text-[#ba1a1a] shadow-sm transform transition-transform active:scale-95 group">
          <div className="w-12 h-12 bg-[#ba1a1a] rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </div>
          <div className="flex-1 text-left">
            <div className="font-bold text-[14px]">{lang === 'ru' ? 'Работа над ошибками' : 'Каталардын үстүндө иштөө'}</div>
            <div className="text-[12px] font-medium">{mistakesCount} {lang === 'ru' ? 'нерешенных задач' : 'чечилбеген маселелер'}</div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>
    </div>
  );
}
