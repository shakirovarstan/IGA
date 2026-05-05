
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { YEARLY_EXAMS, YearlyExam } from '../data/questions_math_2023';
import { Language } from '../types';
import { MathText } from './MathText';
import { Trophy, ArrowLeft, Calendar, Book, ArrowRight, CheckCircle2, XCircle, Info, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface ExamBankScreenProps {
  lang: Language;
  onComplete: (xp: number) => void;
}

type ViewMode = 'selector' | 'testing' | 'results';

export function ExamBankScreen({ lang, onComplete }: ExamBankScreenProps) {
  const [mode, setMode] = useState<ViewMode>('selector');
  const [selectedExam, setSelectedExam] = useState<YearlyExam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const startExam = (exam: YearlyExam) => {
    setSelectedExam(exam);
    setMode('testing');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
  };

  const handleAnswer = (questionId: number, answerId: string) => {
    if (showExplanation) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: answerId }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!selectedExam) return;
    if (currentQuestionIndex < selectedExam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setMode('results');
      const score = calculateScore();
      onComplete(score * 10);
    }
  };

  const calculateScore = () => {
    if (!selectedExam) return 0;
    return selectedExam.questions.reduce((acc, q) => {
      return acc + (userAnswers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
  };

  if (mode === 'selector') {
    return (
      <div className="pb-24 pt-12 px-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
            {lang === 'ru' ? 'Официальные задания' : 'Расмий тапшырмалар'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
            {lang === 'ru' ? 'Подготовка по реальным вариантам прошлых лет' : 'Өткөн жылдардагы реалдуу варианттар'}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {YEARLY_EXAMS.map((exam, idx) => (
            <motion.button
              key={`${exam.subjectKey}-${exam.year}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => startExam(exam)}
              className="w-full bg-white dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-6 text-left group transition-all hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className={cn(
                "w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform shadow-inner shrink-0",
                idx % 2 === 0 ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
              )}>
                {exam.subjectKey === 'math' ? '📐' : '📚'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                    {exam.year} {lang === 'ru' ? 'ГОД' : 'ЖЫЛ'}
                  </span>
                </div>
                <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight leading-tight">
                  {exam.subject === 'Алгебра' || exam.subject === 'Алгебра (Часть 2)' || exam.subjectKey === 'math' ? (lang === 'ru' ? 'Математика' : 'Математика') : exam.subject}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-6 rounded-[2rem] border-2 border-yellow-100 dark:border-yellow-900/20 flex gap-5">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-1">
              {lang === 'ru' ? 'Реальные варианты' : 'Реалдуу варианттар'}
            </p>
            <p className="text-xs text-yellow-700/70 dark:text-yellow-200/60 leading-relaxed font-medium">
              {lang === 'ru' 
                ? 'Пройдите эти тесты, чтобы понять структуру реального экзамена ИГА и оценить свои силы.' 
                : 'ИГАнын реалдуу экзаменинин түзүлүшүн түшүнүү жана өз күчүңүздү баалоо үчүн бул тесттерди аткарыңыз.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'testing' && selectedExam) {
    const q = selectedExam.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedExam.questions.length) * 100;
    const userChoice = userAnswers[selectedExam.questions[currentQuestionIndex].id];

    return (
      <div className="flex flex-col bg-[var(--bg-app)] min-h-[100dvh] relative">
        <header className="px-6 py-4 border-b border-[var(--card-border)] flex items-center justify-between sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-50 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMode('selector')} 
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            {currentQuestionIndex > 0 && (
              <button 
                onClick={() => {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setShowExplanation(userAnswers[selectedExam.questions[currentQuestionIndex - 1].id] !== undefined);
                }} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
              >
                {lang === 'ru' ? 'Назад' : 'Артка'}
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {currentQuestionIndex + 1} / {selectedExam.questions.length}
            </span>
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-blue-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-right tabular-nums text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest min-w-[60px]">
            {selectedExam.year}
          </div>
        </header>

        <main className="w-full max-w-2xl mx-auto flex-1 flex flex-col overflow-y-auto p-10 space-y-10 pb-40">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] border-2 border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
               <div className="relative z-10 text-slate-800 dark:text-white text-2xl font-bold leading-relaxed">
                 <MathText text={q.text[lang]} />
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {q.options.map((opt) => {
                 const isSelected = userChoice === opt.id;
                 const isCorrect = opt.id === q.correctAnswer;
                 const showResult = showExplanation;

                 let btnStyle: React.CSSProperties = {};
                 if (showResult) {
                   if (isCorrect) {
                     btnStyle = { backgroundColor: 'var(--correct-bg)', borderColor: 'var(--correct-text)', color: 'var(--correct-text)' };
                   } else if (isSelected) {
                     btnStyle = { backgroundColor: 'var(--wrong-bg)', borderColor: 'var(--wrong-text)', color: 'var(--wrong-text)' };
                   } else {
                     btnStyle = { opacity: 0.4, borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)' };
                   }
                 } else if (isSelected) {
                   btnStyle = { backgroundColor: 'var(--selected-bg)', borderColor: 'var(--selected-text)', color: 'var(--selected-text)' };
                 } else {
                   btnStyle = { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-main)' };
                 }

                 return (
                   <button
                     key={opt.id}
                     disabled={showResult}
                     onClick={() => handleAnswer(q.id, opt.id)}
                     className="w-full p-5 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden"
                     style={btnStyle}
                   >
                     <div className="flex items-center gap-5 relative z-10 w-full">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest transition-all",
                         !showResult && !isSelected && "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-blue-500 group-hover:text-white",
                         (showResult && isCorrect) || isSelected ? "bg-white/25 text-current shadow-sm" : "bg-slate-100 dark:bg-slate-700 text-slate-400"
                       )}>
                         {opt.id}
                       </div>
                       <div className="font-bold text-xl">
                         <MathText text={opt.text[lang]} />
                       </div>
                     </div>
                     {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0 ml-2" />}
                     {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 shrink-0 ml-2" />}
                   </button>
                 );
               })}
            </div>

            {!showExplanation && (
              <button
                onClick={() => {
                  setShowExplanation(true);
                }}
                className="w-full py-5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:border-slate-300 hover:text-slate-500 transition-all active:scale-95"
              >
                {lang === 'ru' ? 'Пропустить задание' : 'Тапшырманы калтыруу'}
              </button>
            )}

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className={cn(
                    "p-8 rounded-[2.5rem] border-2",
                    userAnswers[q.id] === q.correctAnswer 
                      ? "bg-green-50/30 border-green-100 text-green-800" 
                      : "bg-red-50/30 border-red-100 text-red-800"
                  )}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-white",
                        userAnswers[q.id] === q.correctAnswer ? "bg-green-500" : "bg-red-500"
                      )}>
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-xs uppercase tracking-[0.2em] opacity-80">
                        {lang === 'ru' ? 'Разбор ответа' : 'Жоопту талдоо'}
                      </h4>
                    </div>
                    <div className="text-[16px] font-medium leading-relaxed">
                      <MathText text={q.explanation[lang]} />
                    </div>
                  </div>
                  
                  <button
                    onClick={nextQuestion}
                    className="w-full neon-gradient text-white font-black py-6 rounded-[2rem] shadow-xl shadow-blue-200 dark:shadow-none hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    {currentQuestionIndex < selectedExam.questions.length - 1 
                      ? (lang === 'ru' ? 'Продолжить' : 'Улантуу') 
                      : (lang === 'ru' ? 'Посмотреть результат' : 'Жыйынтыкты көрүү')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    );
  }

  if (mode === 'results' && selectedExam) {
    const score = calculateScore();
    const percentage = Math.round((score / selectedExam.questions.length) * 100);
    const xpGained = score * 10;

    const getResultMessage = () => {
      if (percentage === 100) return lang === 'ru' ? 'Великолепно!' : 'Азаматсыз!';
      if (percentage >= 80) return lang === 'ru' ? 'Отличный результат!' : 'Эң жакшы жыйынтык!';
      if (percentage >= 50) return lang === 'ru' ? 'Хорошая работа!' : 'Жакшы иш!';
      return lang === 'ru' ? 'Нужно еще повторить' : 'Дагы бир жолу кайталаңыз';
    };

    return (
      <div className="pb-24 pt-12 max-w-2xl mx-auto text-center px-8 flex flex-col items-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative mb-10"
        >
          {percentage >= 50 ? (
            <div className="w-48 h-48 bg-yellow-400 rounded-[4rem] flex items-center justify-center shadow-[0_20px_50px_rgba(250,204,21,0.4)] relative z-10">
              <Trophy className="w-24 h-24 text-white" />
            </div>
          ) : (
            <div className="w-48 h-48 bg-slate-200 rounded-[4rem] flex items-center justify-center shadow-[0_20px_50px_rgba(203,213,225,0.4)] relative z-10">
              <Book className="w-24 h-24 text-slate-400" />
            </div>
          )}
          {percentage >= 50 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-yellow-200/50 rounded-full blur-3xl" />}
        </motion.div>
        
        <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-3 uppercase tracking-tight">
          {getResultMessage()}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-12 font-medium text-lg leading-relaxed">
          {lang === 'ru' 
            ? `Вы завершили вариант за ${selectedExam.year} год` 
            : `Сиз ${selectedExam.year}-жылдын вариантын аяктадыңыз`}
        </p>

        <div className="grid grid-cols-2 gap-6 w-full mb-12">
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
              <span className={cn(
                "block text-4xl font-black tabular-nums mb-1",
                percentage >= 80 ? "text-green-500" : percentage >= 50 ? "text-blue-500" : "text-orange-500"
              )}>
                {score}/{selectedExam.questions.length}
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                {lang === 'ru' ? 'Верно' : 'Туура'}
              </span>
           </div>
           <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="block text-4xl font-black text-slate-800 dark:text-white mb-1 tabular-nums">
                +{xpGained} XP
              </span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                {lang === 'ru' ? 'Получено' : 'Алынды'}
              </span>
           </div>
        </div>

        <button
          onClick={() => setMode('selector')}
          className="w-full neon-gradient text-white font-black py-7 rounded-[2.5rem] shadow-2xl shadow-blue-200 active:translate-y-1 transition-all text-xl uppercase tracking-widest"
        >
          {lang === 'ru' ? 'Вернуться в библиотеку' : 'Китепканага кайтуу'}
        </button>
      </div>
    );
  }

  return null;
}
