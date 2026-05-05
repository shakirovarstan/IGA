
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { YEARLY_EXAMS, YearlyExam } from '../data/questions_math_2023';
import { Language } from '../types';
import { MathText } from './MathText';
import { Trophy, ArrowLeft, Calendar, Book, ArrowRight, CheckCircle2, XCircle, Info, ChevronLeft, Brush } from 'lucide-react';
import { cn } from '../lib/utils';
import { DrawingCanvas } from './DrawingCanvas';

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
  const [isPaintActive, setIsPaintActive] = useState(false);

  const startExam = (exam: YearlyExam) => {
    setSelectedExam(exam);
    setMode('testing');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowExplanation(false);
    setIsPaintActive(false);
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
    const mathExams = YEARLY_EXAMS.filter(e => e.subjectKey === 'math');
    const otherExams = YEARLY_EXAMS.filter(e => e.subjectKey !== 'math');

    return (
      <div className="pb-24 pt-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">
            {lang === 'ru' ? 'Официальные задания' : 'Расмий тапшырмалар'}
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            {lang === 'ru' ? 'Подготовка по реальным вариантам прошлых лет' : 'Өткөн жылдардагы реалдуу варианттар'}
          </p>
        </header>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {mathExams.map((exam, idx) => (
              <motion.button
                key={`${exam.subjectKey}-${exam.year}-${idx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startExam(exam)}
                className="w-full bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center gap-3 text-center group transition-all hover:border-blue-500 active:bg-slate-50"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  📐
                </div>
                <div>
                  <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black rounded-full uppercase tracking-widest mb-1 mx-auto w-fit">
                    {exam.year}
                  </div>
                  <h3 className="font-black text-slate-800 text-sm tracking-tight leading-tight px-1">
                    {exam.subject}
                  </h3>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {otherExams.map((exam, idx) => (
              <motion.button
                key={`${exam.subjectKey}-${exam.year}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startExam(exam)}
                className="w-full bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 text-left group transition-all hover:border-emerald-500 active:bg-slate-50"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl group-hover:rotate-6 transition-transform shrink-0">
                  📚
                </div>
                <div className="flex-1">
                  <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black rounded-full uppercase tracking-widest mb-1 w-fit">
                    {exam.year}
                  </div>
                  <h3 className="font-black text-slate-800 text-base tracking-tight leading-none">
                    {exam.subject}
                  </h3>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-[2rem] border border-yellow-100 flex gap-4">
          <Info className="w-5 h-5 text-yellow-500 shrink-0" />
          <p className="text-xs text-yellow-700 leading-relaxed font-medium">
            {lang === 'ru' 
              ? 'Пройдите эти тесты, чтобы оценить свои силы перед реальным экзаменом ИГА.' 
              : 'ИГАнын реалдуу экзамени алдында өз күчүңүздү баалоо үчүн бул тесттерди аткарыңыз.'}
          </p>
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
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            {currentQuestionIndex > 0 && (
              <button 
                onClick={() => {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setShowExplanation(userAnswers[selectedExam.questions[currentQuestionIndex - 1].id] !== undefined);
                }} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
              >
                {lang === 'ru' ? 'Назад' : 'Артка'}
              </button>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {currentQuestionIndex + 1} / {selectedExam.questions.length}
            </span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full transition-all duration-500 ease-out bg-blue-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedExam.subjectKey === 'math' && (
              <button
                onClick={() => setIsPaintActive(!isPaintActive)}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isPaintActive ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"
                )}
              >
                <Brush className="w-5 h-5" />
              </button>
            )}
            <div className="text-right tabular-nums text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {selectedExam.year}
            </div>
          </div>
        </header>

        <main className={cn(
          "w-full max-w-2xl mx-auto flex-1 flex flex-col",
          !isPaintActive && "overflow-y-auto p-10 space-y-10 pb-40"
        )}>
          <div className={cn(
            isPaintActive ? "overflow-y-auto shrink-0 max-h-[30vh] p-10 space-y-10 pb-4 border-b border-slate-100 shadow-sm" : ""
          )}>
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-10"
            >
              <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
                 <div className="relative z-10 text-slate-800 text-2xl font-bold leading-relaxed">
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
                       className="w-full p-5 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden text-lg"
                       style={btnStyle}
                     >
                       <div className="flex items-center gap-5 relative z-10 w-full">
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest transition-all",
                           !showResult && !isSelected && "bg-slate-100 text-slate-400 group-hover:bg-blue-500 group-hover:text-white",
                           (showResult && isCorrect) || isSelected ? "bg-white/25 text-current shadow-sm" : "bg-slate-100 text-slate-400"
                         )}>
                           {opt.id}
                         </div>
                         <div className="font-bold">
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
                  className="w-full py-5 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:border-slate-300 hover:text-slate-500 transition-all active:scale-95"
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
                      className="w-full neon-gradient text-white font-black py-6 rounded-[2rem] shadow-xl shadow-blue-200 hover:translate-y-[-2px] active:translate-y-[0px] active:scale-[0.98] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
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
          </div>

          {isPaintActive && (
            <div className="flex-1 min-h-0 relative mt-4 mb-4 bg-white border-2 border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
              <DrawingCanvas />
            </div>
          )}
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
        
        <h2 className="text-4xl font-black text-slate-800 mb-3 uppercase tracking-tight">
          {getResultMessage()}
        </h2>
        <p className="text-slate-500 mb-12 font-medium text-lg leading-relaxed">
          {lang === 'ru' 
            ? `Вы завершили вариант за ${selectedExam.year} год` 
            : `Сиз ${selectedExam.year}-жылдын вариантын аяктадыңыз`}
        </p>

        <div className="grid grid-cols-2 gap-6 w-full mb-12">
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
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
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm transition-transform hover:scale-[1.02]">
              <span className="block text-4xl font-black text-slate-800 mb-1 tabular-nums">
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
