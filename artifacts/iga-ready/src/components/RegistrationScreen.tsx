import React, { useState } from 'react';
import { UserProfile } from '../hooks/useProfile';
import { Language } from '../types';
import { CheckCircle2, Users } from 'lucide-react';
import { cn } from '../lib/utils';
// Need a monkey image, but since we don't have it, we use a placeholder or generic icon.
// Let's use some emoji or generic SVG if monkey doesn't exist.

interface RegistrationScreenProps {
  onComplete: (profile: UserProfile) => void;
  lang: Language;
}

export function RegistrationScreen({ onComplete, lang }: RegistrationScreenProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [grade, setGrade] = useState('9 Класс');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+996');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      onComplete({ name, surname, grade, phone: `${countryCode} ${phone}` });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center">
      <div className="w-full max-w-md pt-12 px-6 flex flex-col flex-1">
        <div className="flex justify-center mb-6 relative">
          <div className="w-32 h-32 bg-blue-100 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner relative">
            🐒
            <div className="absolute -bottom-2 -right-2 bg-[#84fb42] w-10 h-10 rounded-full border-4 border-[#faf9f9] flex items-center justify-center shadow-sm">
              <span className="text-green-800 font-bold text-lg">🔥</span>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 bg-white rounded-[20px] p-3 shadow-md max-w-[160px] translate-x-4 -translate-y-4">
            <div className="text-[12px] font-medium leading-tight text-slate-700">
              {lang === 'ru' ? 'Привет! Я твой помощник. Давай начнем подготовку к ИГА вместе!' : 'Салам! Мен сенин жардамчыңмын. ЖМАТка даярданууну чогуу баштайлы!'}
            </div>
            {/* simple speech bubble arrow */}
            <div className="absolute -left-2 top-6 w-4 h-4 bg-white transform rotate-45" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-black text-[var(--primary)] mb-3">
            {lang === 'ru' ? 'Добро пожаловать!' : 'Кош келиңиз!'}
          </h1>
          <p className="text-[var(--text-muted)] text-[15px] font-medium leading-relaxed">
            {lang === 'ru' ? 'Давай создадим твой профиль и начнем путь к успеху!' : 'Кел, профилиңди түзүп, ийгиликке жол баштайлы!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[var(--card-border)] mb-8 flex-1">
          <div className="space-y-4">
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black tracking-wider uppercase text-[var(--primary)] z-10">Имя</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={lang === 'ru' ? "Введите ваше имя" : "Атыңызды киргизиңиз"}
                className="w-full h-14 px-4 rounded-[1.25rem] border-2 border-[var(--card-border)] bg-transparent focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold placeholder:text-slate-300 placeholder:font-normal"
                required
              />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-black tracking-wider uppercase text-[var(--text-muted)] z-10">Фамилия</label>
              <input
                type="text"
                value={surname}
                onChange={e => setSurname(e.target.value)}
                placeholder={lang === 'ru' ? "Введите вашу фамилию" : "Фамилияңызды киргизиңиз"}
                className="w-full h-14 px-4 rounded-[1.25rem] border-2 border-[var(--card-border)] bg-transparent focus:border-[var(--primary)] outline-none text-[var(--text-main)] font-semibold placeholder:text-slate-300 placeholder:font-normal"
              />

          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-wider">Прогресс</span>
              <span className="text-[10px] uppercase font-black text-[var(--primary)] tracking-wider">Шаг 1 </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
              <div className="h-full bg-[var(--primary)] w-1/3 rounded-full" />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#1cb0f6] hover:bg-blue-400 text-white font-bold text-lg py-4 rounded-[80px] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {lang === 'ru' ? 'Начать ' : 'Баштоо '}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
            
            <p className="text-[10px] text-center text-[var(--text-muted)] font-medium mt-6 px-4">
              Нажимая «Начать», вы соглашаетесь с условиями обслуживания и политикой конфиденциальности.
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
