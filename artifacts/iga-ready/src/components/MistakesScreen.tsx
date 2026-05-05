import React, { useState } from 'react';
import { AppState, Language, Question } from '../types';
import { Activity, Graph } from 'lucide-react';
import { MathText } from './MathText';
import { TOPICS } from '../data/topics';

interface MistakesScreenProps {
  mistakes: Question[];
  lang: Language;
  onStartReview: () => void;
  onNavigate: (state: AppState) => void;
}

export function MistakesScreen({ mistakes, lang, onStartReview, onNavigate }: MistakesScreenProps) {
  const [expandedMistake, setExpandedMistake] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex justify-center">
      <div className="w-full max-w-md pb-24 relative flex flex-col pt-8 px-5">
        <div className="mb-6">
          <h1 className="text-3xl font-serif text-[var(--text-main)] mb-2 font-bold">
            {lang === 'ru' ? 'Работа над ошибками' : 'Каталардын үстүндө иштөө'}
          </h1>
          <p className="text-[var(--text-muted)] text-[14px] leading-relaxed pr-4">
            {lang === 'ru' ? 'Разберитесь в темах, которые вызвали затруднения.' : 'Кыйынчылык жараткан темаларды түшүнүп алыңыз.'}
          </p>
        </div>

        <div className="bg-[#1cb0f6] rounded-[1.5rem] p-6 text-white relative overflow-hidden mb-4 shadow-lg shadow-blue-200">
          <div className="absolute -bottom-8 -right-8 opacity-20">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          </div>
          
          <h2 className="text-xl font-black mb-3">
            {lang === 'ru' ? `Всего ошибок: ${mistakes.length}` : `Бардык каталар: ${mistakes.length}`}
          </h2>
          <p className="text-white/90 text-sm font-medium leading-relaxed mb-6">
            {lang === 'ru' 
              ? 'Здесь собраны задачи, в которых вы допустили ошибки. Пройдите их еще раз!' 
              : 'Бул жерде сиз ката кетирген тапшырмалар чогултулган. Аларды дагы бир жолу аткарып көрүңүз!'}
          </p>
          <button 
            disabled={mistakes.length === 0}
            onClick={onStartReview}
            className="bg-white text-[#1cb0f6] px-6 py-3.5 rounded-full font-black text-[12px] uppercase tracking-widest shadow-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {lang === 'ru' ? 'Начать блиц-повтор' : 'Блиц-кайталоону баштоо'}
          </button>
        </div>

        <div className="bg-[#eeeeed] rounded-[1.5rem] p-5 flex flex-col items-center justify-center text-center mb-8 border border-[var(--card-border)]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
            <Activity className="w-6 h-6 text-[#006590]" />
          </div>
          <h3 className="font-bold text-[var(--text-main)] mb-1">{lang === 'ru' ? 'Прогресс' : 'Прогресс'}</h3>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            {lang === 'ru' ? 'Регулярная практика уменьшает количество ошибок' : 'Үзгүлтүксүз практика каталардын санын азайтат'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif font-bold text-[var(--text-main)]">
                {lang === 'ru' ? 'Список ошибок' : 'Каталардын тизмеси'}
              </h2>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">
              {mistakes.length} {lang === 'ru' ? 'задач' : 'тапшырма'}
            </div>
          </div>

          {mistakes.length === 0 ? (
             <div className="text-center text-slate-500 py-8 font-medium">
                {lang === 'ru' ? 'У вас пока нет ошибок. Отличная работа!' : 'Азырынча сизде ката жок. Мыкты иш!'}
             </div>
          ) : (
            mistakes.map((q, index) => {
              const isExpanded = expandedMistake === q.id;
              const topicData = TOPICS.find(t => t.id === q.topic);
              const topicTitle = topicData ? topicData.title[lang] : (typeof q.topic === 'string' ? q.topic.replace(/_/g, ' ') : (lang === 'ru' ? 'Без темы' : 'Тема жок'));
              
              return (
                <div key={q.id} className="bg-white rounded-[1.5rem] p-5 border border-[var(--card-border)] shadow-sm text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                      {lang === 'ru' ? `Тема: ${topicTitle}` : `Тема: ${topicTitle}`}
                    </span>
                    <span className="text-[10px] font-black text-[#ba1a1a] uppercase tracking-wider">
                      {lang === 'ru' ? `Часть ${q.part}` : `Бөлүк ${q.part}`}
                    </span>
                  </div>
                  <div className="text-[var(--text-main)] font-medium text-[15px] mb-6 leading-relaxed">
                     <MathText text={q.text[lang]} />
                  </div>
                  
                  {isExpanded && (
                    <div className="mb-6 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                      <strong className="text-red-700 block mb-1">
                         {lang === 'ru' ? 'Правильный ответ:' : 'Туура жооп:'}
                      </strong>
                      <div className="text-red-900 font-bold mb-3">
                        {q.options ? (
                          <MathText text={(() => {
                            const opt = q.options.find(o => o.id === q.correctAnswer);
                            if (!opt) return q.correctAnswer;
                            return typeof opt.text === 'string' ? opt.text : opt.text[lang];
                          })()} />
                        ) : q.correctAnswer}
                      </div>
                      
                      {(q.solution || q.explanation) && (
                         <div className="mt-3 bg-white/50 p-3 rounded-lg border border-red-50/50">
                           <div className="font-bold text-red-600 mb-2 text-xs uppercase tracking-wider">
                             {lang === 'ru' ? 'Разбор задания:' : 'Тапшырманы талдоо:'}
                           </div>
                           {q.solution ? (
                             <div className="text-red-800 text-xs space-y-2">
                                 {q.solution[lang].map((step, i) => (
                                   <div key={i} className="flex gap-2">
                                     <span className="font-bold shrink-0">{i + 1}.</span>
                                     <MathText text={step} />
                                   </div>
                                 ))}
                             </div>
                           ) : q.explanation ? (
                             <div className="text-red-800 text-[13px] leading-relaxed">
                               <MathText text={q.explanation[lang]} />
                             </div>
                           ) : null}
                         </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                     <button 
                       onClick={() => setExpandedMistake(isExpanded ? null : q.id)} 
                       className="flex-1 py-3 rounded-xl border-2 border-[var(--card-border)] text-blue-600 font-bold text-sm text-center active:scale-95 transition-transform"
                     >
                       {isExpanded ? (lang === 'ru' ? 'Скрыть разбор' : 'Талдоону жашыруу') : (lang === 'ru' ? 'Разбор' : 'Талдоо')}
                     </button>
                     <button onClick={() => { onStartReview(); }} className="flex-1 py-3 rounded-xl bg-[#006590] text-white font-bold text-sm text-center active:scale-95 transition-transform">
                       {lang === 'ru' ? 'Решить снова' : 'Кайра чечүү'}
                     </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
