import React from 'react';
import { Subject, Language } from '../types';
import { MathText } from './MathText';
import { ArrowLeft } from 'lucide-react';
import { TOPICS } from '../data/topics';

interface FormulasScreenProps {
  currentSubject: Subject;
  lang: Language;
  onNavigate: (state: string) => void;
}

export function FormulasScreen({ currentSubject, lang, onNavigate }: FormulasScreenProps) {
  const formulas = TOPICS.filter(t => t.subject === currentSubject && t.formula && t.formula.math && t.formula.math.trim() !== '');

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col justify-center">
      <div className="w-full max-w-5xl pb-24 relative flex flex-col mx-auto px-4 md:px-8">
        <header className="px-5 py-4 border-b border-[var(--card-border)] flex items-center bg-[var(--bg-app)]/90 backdrop-blur-md sticky top-0 z-50 transition-colors">
          <button onClick={() => onNavigate('landing')} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div className="font-black text-xl text-[var(--text-main)] ml-4">
            {lang === 'ru' ? 'Формулы' : 'Формулалар'}
          </div>
        </header>
        
        <main className="p-2 md:p-5 space-y-6 w-full">
          {formulas.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] mt-10 font-medium leading-relaxed">
              {lang === 'ru' ? 'Формул пока нет' : 'Формулалар жок'}
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
              {formulas.map(topic => (
                <div key={topic.id} className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-[var(--card-border)] flex flex-col items-start w-full overflow-hidden">
                  <h3 className="font-bold text-lg mb-4 text-[var(--text-main)] leading-tight text-left">
                    {(topic.formula.title && topic.formula.title[lang]) || topic.title[lang]}
                  </h3>
                  <div className="px-5 py-4 bg-[#f8f9fa] border border-[#e3e2e2] rounded-2xl w-full text-left overflow-x-auto text-[17px] text-[#006590] font-medium scrollbar-hide">
                    {topic.formula.math.split('\n').map((line, idx) => (
                      <div key={idx} className="my-1.5 flex justify-start flex-wrap">
                        <MathText text={line} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
