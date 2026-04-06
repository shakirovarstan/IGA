import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALGEBRA_QUESTIONS, GEOMETRY_QUESTIONS, RUSSIAN_QUESTIONS, HISTORY_QUESTIONS } from './data/questions';
import { TOPICS } from './data/topics';
import { Question, Subject, Topic, TopicExplanation } from './types';
import { useProgress } from './hooks/useProgress';
import { MathText } from './components/MathText';
import { Graph } from './components/Graph';
import { cn } from './lib/utils';
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  BarChart3,
  Flame,
  Layout,
  Search,
  GraduationCap,
  Sun,
  Moon,
  Rocket,
  Circle,
  CheckCircle
} from 'lucide-react';

type AppState = 'landing' | 'exam' | 'results' | 'drill_selector' | 'mistake_review' | 'topic_list' | 'learn_topic';
type Language = 'ru' | 'ky';

const SUBJECTS: { id: Subject; title: { ru: string; ky: string }; icon: any; color: string; gradient: string; emoji: string }[] = [
  { id: 'algebra', title: { ru: 'Алгебра', ky: 'Алгебра' }, icon: Layout, color: 'bg-blue-600', gradient: 'linear-gradient(135deg, #4361ee, #4cc9f0)', emoji: '📐' },
  { id: 'geometry', title: { ru: 'Геометрия', ky: 'Геометрия' }, icon: BookOpen, color: 'bg-violet-600', gradient: 'linear-gradient(135deg, #7209b7, #f72585)', emoji: '📏' },
  { id: 'russian', title: { ru: 'Русский язык', ky: 'Орус тили' }, icon: GraduationCap, color: 'bg-teal-600', gradient: 'linear-gradient(135deg, #06b6d4, #059669)', emoji: '📖' },
  { id: 'history', title: { ru: 'История Кыргызстана', ky: 'Кыргызстан тарыхы' }, icon: Trophy, color: 'bg-amber-600', gradient: 'linear-gradient(135deg, #f77f00, #e63946)', emoji: '🏔️' },
];

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [state, setState] = useState<AppState>('landing');
  const [lang, setLang] = useState<Language>('ru');
  const [currentSubject, setCurrentSubject] = useState<Subject>('algebra');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { progress, updateProgress, markTopicAsStudied } = useProgress();

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setState('results');
      setIsTimerActive(false);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startExam = (mode: AppState, topic?: Topic) => {
    let allQuestions: Question[] = [];
    if (currentSubject === 'algebra') allQuestions = ALGEBRA_QUESTIONS;
    if (currentSubject === 'geometry') allQuestions = GEOMETRY_QUESTIONS;
    if (currentSubject === 'russian') allQuestions = RUSSIAN_QUESTIONS;
    if (currentSubject === 'history') allQuestions = HISTORY_QUESTIONS;
    
    let filtered = [...allQuestions];
    
    if (mode === 'drill_selector' && topic) {
      filtered = filtered.filter(q => q.topic === topic);
      if (topic === currentTopicId) {
        filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 5);
      }
    } else if (mode === 'mistake_review') {
      filtered = filtered.filter(q => progress.mistakes.includes(q.id));
    } else {
      // Full practice: 20 P1, 2 P2, 3 P3 (for Math)
      // For History/Russian: maybe different structure
      if (currentSubject === 'history' || currentSubject === 'russian') {
        filtered = allQuestions.filter(q => q.part === 1).sort(() => 0.5 - Math.random()).slice(0, 30);
      } else {
        const p1 = allQuestions.filter(q => q.part === 1).sort(() => 0.5 - Math.random()).slice(0, 20);
        const p2 = allQuestions.filter(q => q.part === 2).sort(() => 0.5 - Math.random()).slice(0, 2);
        const p3 = allQuestions.filter(q => q.part === 3).sort(() => 0.5 - Math.random()).slice(0, 3);
        filtered = [...p1, ...p2, ...p3];
      }
    }

    if (filtered.length === 0) {
      alert(lang === 'ru' ? 'Нет доступных вопросов' : 'Суроолор жок');
      return;
    }

    setCurrentQuestions(filtered);
    setCurrentIndex(0);
    setAnswers({});
    setShowSolution(false);
    setState('exam');
    setHintIndex(0);
    
    if (mode === 'exam') {
      const time = (currentSubject === 'history' || currentSubject === 'russian') ? 3600 : 2400;
      setTimeLeft(time);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  };

  const [hintIndex, setHintIndex] = useState(0);
  const [shortAnswer, setShortAnswer] = useState('');

  const handleAnswer = (optionId: string) => {
    if (showSolution) return;
    
    const question = currentQuestions[currentIndex];
    const isCorrect = optionId === question.correctAnswer;
    
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
    setShowSolution(true);
    updateProgress(question.topic, isCorrect, question.id);
    if (isCorrect && currentTopicId === question.topic) {
      const stats = progress.topicStats[question.topic] || { correct: 0, total: 0 };
      if (stats.correct + 1 >= 3) {
        markTopicAsStudied(question.topic);
      }
    }
  };

  const handleShortSubmit = () => {
    if (showSolution) return;
    const question = currentQuestions[currentIndex];
    const isCorrect = shortAnswer.trim() === question.correctAnswer;
    setAnswers(prev => ({ ...prev, [question.id]: shortAnswer }));
    setShowSolution(true);
    updateProgress(question.topic, isCorrect, question.id);
    if (isCorrect && currentTopicId === question.topic) {
      const stats = progress.topicStats[question.topic] || { correct: 0, total: 0 };
      if (stats.correct + 1 >= 3) {
        markTopicAsStudied(question.topic);
      }
    }
  };

  const handleSelfGrade = (grade: 'full' | 'partial' | 'none') => {
    const question = currentQuestions[currentIndex];
    const isCorrect = grade === 'full';
    setAnswers(prev => ({ ...prev, [question.id]: grade }));
    setShowSolution(true);
    updateProgress(question.topic, isCorrect, question.id);
    if (isCorrect && currentTopicId === question.topic) {
      const stats = progress.topicStats[question.topic] || { correct: 0, total: 0 };
      if (stats.correct + 1 >= 3) {
        markTopicAsStudied(question.topic);
      }
    }
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowSolution(false);
      setShortAnswer('');
      setHintIndex(0);
    } else {
      setState('results');
      setIsTimerActive(false);
    }
  };

  const skipQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowSolution(false);
      setShortAnswer('');
      setHintIndex(0);
    }
  };

  const renderLanding = () => {
    const subj = SUBJECTS.find(s => s.id === currentSubject)!;
    const studiedCount = progress.studiedTopics.filter(id => TOPICS.find(t => t.id === id)?.subject === currentSubject).length;
    const totalTopics = TOPICS.filter(t => t.subject === currentSubject).length;
    const progressPct = totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
        {/* Hero header */}
        <div className="hero-gradient px-5 pt-12 pb-8 relative overflow-hidden">
          {/* decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-0 left-5 w-24 h-24 rounded-full bg-white/10 blur-xl" />

          <div className="flex items-start justify-between mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80 text-xs font-black uppercase tracking-widest">IGA-Ready</span>
              </div>
              <h1 className="text-white font-black text-2xl leading-tight">
                {lang === 'ru' ? 'Подготовка к ИГА' : 'ЖМАТка даярдык'}
              </h1>
              <p className="text-white/60 text-xs mt-1 font-medium">
                {lang === 'ru' ? 'Кыргызстан, 9 класс' : 'Кыргызстан, 9-класс'}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex bg-white/15 p-0.5 rounded-xl overflow-hidden">
                <button onClick={() => setLang('ru')} className={cn("px-3 py-1.5 text-xs font-black rounded-lg transition-all", lang === 'ru' ? "bg-white text-blue-700" : "text-white/80")}>RU</button>
                <button onClick={() => setLang('ky')} className={cn("px-3 py-1.5 text-xs font-black rounded-lg transition-all", lang === 'ky' ? "bg-white text-blue-700" : "text-white/80")}>KY</button>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white/15 text-white">
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 relative z-10">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
              <div className="bg-orange-400/30 p-2 rounded-xl">
                <Flame className="w-5 h-5 text-orange-200 animate-pulse-soft" />
              </div>
              <div>
                <div className="text-white font-black text-xl leading-none">{progress.streak}</div>
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-wide">{lang === 'ru' ? 'Дней подряд' : 'Күн катары'}</div>
              </div>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
              <div className="bg-yellow-400/30 p-2 rounded-xl">
                <Trophy className="w-5 h-5 text-yellow-200" />
              </div>
              <div>
                <div className="text-white font-black text-xl leading-none">{progress.totalQuestions}</div>
                <div className="text-white/60 text-[10px] font-bold uppercase tracking-wide">{lang === 'ru' ? 'Решено' : 'Чечилди'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 py-6 space-y-6">
          {/* Subject selector */}
          <div className="space-y-3">
            <h2 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.18em]">
              {lang === 'ru' ? 'Предмет' : 'Предмет'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {SUBJECTS.map((s) => {
                const sStudied = progress.studiedTopics.filter(id => TOPICS.find(t => t.id === id)?.subject === s.id).length;
                const sTotal = TOPICS.filter(t => t.subject === s.id).length;
                const sActive = currentSubject === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSubject(s.id)}
                    className={cn(
                      "relative rounded-[1.5rem] p-4 text-left transition-all overflow-hidden",
                      sActive ? "ring-[3px] ring-offset-2 ring-offset-[var(--bg-app)]" : "opacity-75 hover:opacity-90 active:scale-95"
                    )}
                    style={{
                      background: s.gradient,
                      ringColor: s.id === 'algebra' ? '#4361ee' : s.id === 'geometry' ? '#7209b7' : s.id === 'russian' ? '#06b6d4' : '#f77f00'
                    }}
                  >
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="text-2xl mb-2">{s.emoji}</div>
                    <div className="text-white font-black text-sm leading-tight">{s.title[lang]}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80 rounded-full" style={{ width: `${sTotal > 0 ? Math.round(sStudied / sTotal * 100) : 0}%` }} />
                      </div>
                      <span className="text-white/70 text-[10px] font-black">{sStudied}/{sTotal}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active subject info */}
          <div className="glass-card rounded-[1.5rem] p-4 card-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: subj.gradient }}>
              {subj.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-[var(--text-main)] text-sm">{subj.title[lang]}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: subj.gradient }} />
                </div>
                <span className="text-[10px] font-black text-[var(--text-muted)]">{progressPct}%</span>
              </div>
            </div>
          </div>

          {/* Main action — Full Exam */}
          <button 
            onClick={() => startExam('exam')}
            className="w-full neon-gradient text-white px-6 py-5 rounded-[1.5rem] flex items-center justify-between group transition-all neon-glow active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-black text-lg leading-none">{lang === 'ru' ? 'Полный экзамен' : 'Толук сынак'}</div>
                <div className="text-white/70 text-[11px] font-bold mt-1 uppercase tracking-wider">{lang === 'ru' ? '20 вопросов • 40 минут' : '20 суроо • 40 мүнөт'}</div>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary actions */}
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setState('drill_selector')}
              className="glass-card card-shadow rounded-[1.5rem] p-4 flex items-center gap-4 active:scale-95 transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-[var(--text-main)] text-sm">{lang === 'ru' ? 'Тренировка по темам' : 'Темалар боюнча машыгуу'}</div>
                <div className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">{lang === 'ru' ? 'Отработай слабые места' : 'Алсыз жактарды бекемдө'}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            <button 
              onClick={() => startExam('mistake_review')}
              className="glass-card card-shadow rounded-[1.5rem] p-4 flex items-center gap-4 active:scale-95 transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-[var(--text-main)] text-sm">{lang === 'ru' ? 'Работа над ошибками' : 'Каталар менен иштөө'}</div>
                <div className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">
                  {progress.mistakes.length} {lang === 'ru' ? 'вопросов требуют повтора' : 'суроо кайталоону керек'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            <button 
              onClick={() => setState('topic_list')}
              className="glass-card card-shadow rounded-[1.5rem] p-4 flex items-center gap-4 active:scale-95 transition-all hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-[var(--text-main)] text-sm">{lang === 'ru' ? 'Учебник по темам' : 'Окуу куралы'}</div>
                <div className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">
                  {studiedCount}/{totalTopics} {lang === 'ru' ? 'тем изучено' : 'тема изилденди'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderExam = () => {
    const question = currentQuestions[currentIndex];
    const userChoice = answers[question.id];
    const subj = SUBJECTS.find(s => s.id === currentSubject)!;

    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
        <header className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-10">
          <button onClick={() => setState('landing')} className="p-2 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {currentIndex + 1} / {currentQuestions.length}
            </span>
            <div className="w-36 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%`, background: subj.gradient }}
              />
            </div>
          </div>

          {isTimerActive ? (
            <div className={cn(
              "font-mono font-black px-3 py-1.5 rounded-xl text-sm", 
              timeLeft < 300 
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse" 
                : "bg-slate-100 dark:bg-slate-800 text-[var(--text-main)]"
            )}>
              {formatTime(timeLeft)}
            </div>
          ) : <div className="w-14" />}
        </header>

        <main className="flex-1 p-6 space-y-8 overflow-y-auto">
          <div className="text-xl font-bold text-[var(--text-main)] leading-relaxed">
            <MathText text={question.text[lang]} />
          </div>

          {question.graph && (
            <Graph type={question.graph.type} data={question.graph.data} lang={lang} />
          )}

          {question.part === 1 && (
            <div className="grid grid-cols-1 gap-4">
              {question.options?.map((opt) => {
                const isSelected = userChoice === opt.id;
                const isCorrect = opt.id === question.correctAnswer;
                
                let btnStyle = {};
                let btnClass = "w-full p-5 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden";
                
                if (showSolution) {
                  if (isCorrect) {
                    btnStyle = { backgroundColor: 'var(--correct-bg)', borderColor: 'var(--correct-text)', color: 'var(--correct-text)' };
                  } else if (isSelected) {
                    btnStyle = { backgroundColor: 'var(--wrong-bg)', borderColor: 'var(--wrong-text)', color: 'var(--wrong-text)' };
                  } else {
                    btnStyle = { opacity: 0.5, borderColor: 'var(--card-border)' };
                  }
                } else if (isSelected) {
                  btnStyle = { backgroundColor: 'var(--selected-bg)', borderColor: 'var(--selected-text)', color: 'var(--selected-text)' };
                } else {
                  btnStyle = { backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' };
                }

                return (
                  <button 
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    disabled={showSolution}
                    className={btnClass}
                    style={btnStyle}
                  >
                    <div className="flex items-center relative z-10 w-full">
                      <div className="mr-4 shrink-0">
                        {isSelected ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6 opacity-30" />
                        )}
                      </div>
                      <div className={cn(
                        "font-bold text-lg flex-1",
                        showSolution && isSelected && !isCorrect && "line-through opacity-60"
                      )}>
                        <MathText text={typeof opt.text === 'string' ? opt.text : opt.text[lang]} />
                      </div>
                    </div>
                    {showSolution && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0 ml-2" />}
                    {showSolution && isSelected && !isCorrect && <XCircle className="w-6 h-6 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          )}

          {question.part === 2 && (
            <div className="space-y-4">
              <input 
                type="text"
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                disabled={showSolution}
                placeholder={lang === 'ru' ? 'Введите число...' : 'Санды жазыңыз...'}
                className="w-full p-5 rounded-[2rem] border-2 border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:border-blue-500 outline-none font-bold text-xl transition-all"
              />
              {!showSolution && (
                <button 
                  onClick={handleShortSubmit}
                  className="w-full text-white py-5 rounded-[1.5rem] font-black shadow-lg active:scale-95 transition-transform"
                  style={{ background: subj.gradient }}
                >
                  {lang === 'ru' ? 'Ответить' : 'Жооп берүү'}
                </button>
              )}
              {showSolution && (
                <div 
                  className="p-6 rounded-[2rem] font-black text-center"
                  style={{
                    backgroundColor: shortAnswer.trim() === question.correctAnswer ? 'var(--correct-bg)' : 'var(--wrong-bg)',
                    color: shortAnswer.trim() === question.correctAnswer ? 'var(--correct-text)' : 'var(--wrong-text)'
                  }}
                >
                  {shortAnswer.trim() === question.correctAnswer 
                    ? (lang === 'ru' ? 'Правильно!' : 'Туура!') 
                    : (lang === 'ru' ? `Ошибка! Правильный ответ: ${question.correctAnswer}` : `Ката! Туура жообу: ${question.correctAnswer}`)}
                </div>
              )}
            </div>
          )}

          {question.part === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                {question.hints?.slice(0, hintIndex).map((hint, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-sm font-medium flex items-start"
                  >
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mr-4 mt-0.5 shrink-0">
                      {i + 1}
                    </span>
                    <MathText text={hint[lang]} />
                  </motion.div>
                ))}
              </div>

              {!showSolution && (
                <div className="flex flex-col space-y-4">
                  {hintIndex < (question.hints?.length || 0) && (
                    <button 
                      onClick={() => setHintIndex(prev => prev + 1)}
                      className="w-full bg-white dark:bg-slate-800 border-2 border-blue-500 text-blue-600 dark:text-blue-400 py-5 rounded-[2rem] font-black"
                    >
                      {lang === 'ru' ? 'Показать подсказку' : 'Кеңеш көрсөтүү'}
                    </button>
                  )}
                  <button 
                    onClick={() => setShowSolution(true)}
                    className="w-full neon-gradient text-white py-5 rounded-[2rem] font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-transform"
                  >
                    {lang === 'ru' ? 'Показать полное решение' : 'Толук чыгарылышын көрсөтүү'}
                  </button>
                </div>
              )}

              {showSolution && (
                <div className="grid grid-cols-1 gap-3">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-2">
                    {lang === 'ru' ? 'Как вы справились?' : 'Кантип аткардыңыз?'}
                  </p>
                  <button onClick={() => handleSelfGrade('full')} className="bg-green-600 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform">
                    {lang === 'ru' ? 'Полностью решил' : 'Толук чыгардым'}
                  </button>
                  <button onClick={() => handleSelfGrade('partial')} className="bg-amber-500 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform">
                    {lang === 'ru' ? 'Частично' : 'Жарым-жартылай'}
                  </button>
                  <button onClick={() => handleSelfGrade('none')} className="bg-red-500 text-white py-4 rounded-2xl font-black active:scale-95 transition-transform">
                    {lang === 'ru' ? 'Не получилось' : 'Чыгара алган жокмун'}
                  </button>
                </div>
              )}
            </div>
          )}

          <AnimatePresence>
            {showSolution && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-[2.5rem] p-8 space-y-6"
              >
                <div className="flex items-center space-x-4">
                  <div className="neon-gradient p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">
                    {lang === 'ru' ? 'Разбор решения' : 'Чыгарылышын талдоо'}
                  </h3>
                </div>
                <div className="space-y-6 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {question.solution ? (
                    question.solution[lang].map((step, i) => (
                      <div key={i} className="flex space-x-5">
                        <span className="text-blue-500 dark:text-blue-400 font-black text-xl">{i + 1}.</span>
                        <div className="pt-0.5">
                          <MathText text={step} />
                        </div>
                      </div>
                    ))
                  ) : question.explanation ? (
                    <div className="text-lg">
                      <MathText text={question.explanation[lang]} />
                    </div>
                  ) : null}
                </div>
                
                {TOPICS.find(t => t.id === question.topic) && (
                  <button 
                    onClick={() => {
                      setCurrentTopicId(question.topic);
                      setState('learn_topic');
                    }}
                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-5 rounded-[2rem] font-black flex items-center justify-center border border-blue-100 dark:border-blue-900/50"
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    {lang === 'ru' ? `Изучить: ${TOPICS.find(t => t.id === question.topic)?.title.ru}` : `Изилдөө: ${TOPICS.find(t => t.id === question.topic)?.title.ky}`}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="px-5 py-4 border-t border-[var(--card-border)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky bottom-0">
          {!showSolution ? (
            <button 
              onClick={skipQuestion}
              className="w-full py-3.5 text-[var(--text-muted)] font-black uppercase tracking-widest text-xs hover:text-[var(--text-main)] transition-colors"
            >
              {lang === 'ru' ? 'Пропустить →' : 'Өткөрүп жиберүү →'}
            </button>
          ) : (
            <button 
              onClick={nextQuestion}
              className="w-full text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center transition-all active:scale-95 shadow-lg"
              style={{ background: subj.gradient }}
            >
              {currentIndex === currentQuestions.length - 1 
                ? (lang === 'ru' ? 'Завершить' : 'Аяктоо') 
                : (lang === 'ru' ? 'Далее' : 'Кийинки')}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </footer>
      </div>
    );
  };

  const renderResults = () => {
    const score = Object.entries(answers).filter(([id, ans]) => {
      let allQuestions: Question[] = [];
      if (currentSubject === 'algebra') allQuestions = ALGEBRA_QUESTIONS;
      if (currentSubject === 'geometry') allQuestions = GEOMETRY_QUESTIONS;
      if (currentSubject === 'russian') allQuestions = RUSSIAN_QUESTIONS;
      if (currentSubject === 'history') allQuestions = HISTORY_QUESTIONS;
      const q = allQuestions.find(q => q.id === id);
      return q?.correctAnswer === ans;
    }).length;

    const total = currentQuestions.length;
    const percentage = Math.round((score / total) * 100);

    const getGrade = (p: number) => {
      if (p >= 85) return { l: '5', c: 'text-green-500', bg: 'bg-green-500/10' };
      if (p >= 65) return { l: '4', c: 'text-blue-500', bg: 'bg-blue-500/10' };
      if (p >= 45) return { l: '3', c: 'text-yellow-500', bg: 'bg-yellow-500/10' };
      return { l: '2', c: 'text-red-500', bg: 'bg-red-500/10' };
    };

    const grade = getGrade(percentage);

    return (
      <div className="p-6 space-y-8 flex-1 flex flex-col">
        <header className="text-center space-y-6 pt-8">
          <h2 className="text-3xl font-black dark:text-white">{lang === 'ru' ? 'Ваш результат' : 'Сиздин жыйынтыгыңыз'}</h2>
          
          <div className="relative inline-flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center relative z-10">
              <div className="text-center">
                <div className={cn("text-6xl font-black", grade.c)}>{grade.l}</div>
                <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
                  {lang === 'ru' ? 'Оценка' : 'Баа'}
                </div>
              </div>
            </div>
            <svg className="absolute inset-0 w-48 h-48 -rotate-90 z-20 pointer-events-none">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="url(#neonGradient)"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="100%" stopColor="#9d50bb" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-[2rem] text-center space-y-1">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{percentage}%</div>
            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              {lang === 'ru' ? 'Процент' : 'Пайыз'}
            </div>
          </div>
          <div className="glass-card p-5 rounded-[2rem] text-center space-y-1">
            <div className="text-2xl font-black text-black dark:text-white">{score}/{total}</div>
            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              {lang === 'ru' ? 'Баллы' : 'Баллдар'}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
          <h3 className="font-black text-black dark:text-white uppercase tracking-wider text-xs px-1">{lang === 'ru' ? 'Анализ по темам' : 'Темалар боюнча анализ'}</h3>
          <div className="space-y-6">
            {Array.from(new Set(currentQuestions.map(q => q.topic))).map(topic => {
              const topicQuestions = currentQuestions.filter(q => q.topic === topic);
              const topicCorrect = topicQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
              const topicPercent = Math.round((topicCorrect / topicQuestions.length) * 100);
              const topicData = TOPICS.find(t => t.id === topic);
              
              return (
                <div key={topic} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                      {topicData?.title[lang] || topic}
                    </span>
                    <span className={cn(topicPercent >= 70 ? "text-green-600" : topicPercent >= 40 ? "text-yellow-600" : "text-red-600")}>
                      {topicCorrect}/{topicQuestions.length}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000 ease-out", topicPercent >= 70 ? "bg-green-500" : topicPercent >= 40 ? "bg-yellow-500" : "bg-red-500")}
                      style={{ width: `${topicPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 mt-auto">
          <button 
            onClick={() => setState('landing')}
            className="w-full neon-gradient text-white py-6 rounded-[2rem] font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center"
          >
            <Layout className="w-6 h-6 mr-3" />
            {lang === 'ru' ? 'В главное меню' : 'Башкы менюга'}
          </button>
          
          <button 
            onClick={() => startExam('exam')}
            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-black dark:text-white py-6 rounded-[2rem] font-black active:scale-95 transition-transform flex items-center justify-center"
          >
            <RotateCcw className="w-6 h-6 mr-3" />
            {lang === 'ru' ? 'Повторить экзамен' : 'Сынакты кайталоо'}
          </button>
        </div>
      </div>
    );
  };

  const renderTopicList = () => {
    const filteredTopics = TOPICS.filter(t => 
      t.subject === currentSubject &&
      t.title[lang].toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <button onClick={() => setState('landing')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h2 className="ml-4 font-black text-lg dark:text-white">{lang === 'ru' ? 'Учебник' : 'Окуу куралы'}</h2>
        </header>

        <main className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder={lang === 'ru' ? 'Поиск темы...' : 'Теманы издөө...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 pl-14 pr-6 py-5 rounded-[2rem] outline-none focus:border-blue-500 transition-all font-bold dark:text-white shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredTopics.map(topic => {
              const isStudied = progress.studiedTopics.includes(topic.id);
              const stats = progress.topicStats[topic.id] || { correct: 0, total: 0 };
              const isMastered = stats.total >= 3 && (stats.correct / stats.total) >= 0.8;

              return (
                <button 
                  key={topic.id}
                  onClick={() => {
                    setCurrentTopicId(topic.id);
                    setState('learn_topic');
                  }}
                  className="glass-card p-6 rounded-[2rem] flex items-center justify-between hover:border-blue-400/50 transition-all group"
                >
                  <div className="flex items-center space-x-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      isMastered ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" :
                      isStudied ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : 
                      "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {isMastered ? <Trophy className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-black dark:text-white text-lg leading-tight">{topic.title[lang]}</div>
                      <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
                        {isMastered ? (lang === 'ru' ? 'Освоено' : 'Өздөштүрүлдү') : 
                         isStudied ? (lang === 'ru' ? 'Изучено' : 'Изилденди') : 
                         (lang === 'ru' ? 'Не изучено' : 'Изилденген жок')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  const renderTopicExplanation = () => {
    const topic = TOPICS.find(t => t.id === currentTopicId);
    if (!topic) return null;

    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <button onClick={() => setState('topic_list')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h2 className="ml-4 font-black text-lg truncate dark:text-white">{topic.title[lang]}</h2>
        </header>

        <main className="flex-1 p-6 space-y-10 overflow-y-auto pb-32">
          {/* Section 1: WHAT IS IT */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] px-1">
              {lang === 'ru' ? 'Что это такое?' : 'Бул эмне?'}
            </h3>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
              <MathText text={topic.whatIsIt[lang]} />
            </div>
          </section>

          {/* Section 2: THE FORMULA */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] px-1">
              {topic.formula.title[lang]}
            </h3>
            <div className="neon-gradient p-10 rounded-[2.5rem] shadow-2xl shadow-blue-500/20 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
              <div className="relative text-white text-3xl font-black">
                <MathText text={topic.formula.math} />
              </div>
            </div>
          </section>

          {/* Section 3: WORKED EXAMPLE */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] px-1">
              {lang === 'ru' ? 'Разбор примера' : 'Мисалдын талдоосу'}
            </h3>
            <div className="glass-card rounded-[2.5rem] p-8 space-y-8">
              <div className="space-y-8">
                <div className="text-xl font-black text-black dark:text-white">
                  <MathText text={topic.example.problem[lang]} />
                </div>
                {topic.example.steps.map((step, i) => (
                  <div key={i} className="space-y-3">
                    <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{step.step}</div>
                    <div className="text-2xl font-black text-black dark:text-white">
                      <MathText text={step.math} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                  {lang === 'ru' ? 'Ответ' : 'Жообу'}
                </div>
                <div className="text-3xl font-black text-black dark:text-white">
                  <MathText text={topic.example.answer} />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: COMMON MISTAKES */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] px-1">
              {lang === 'ru' ? 'Частые ошибки' : 'Көп кездешкен каталар'}
            </h3>
            <div className="space-y-3">
              {topic.commonMistakes[lang].map((mistake, i) => (
                <div key={i} className="flex items-start space-x-4 bg-red-50 dark:bg-red-900/20 p-5 rounded-[2rem] border border-red-100 dark:border-red-900/50">
                  <XCircle className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm font-bold text-red-800 dark:text-red-300 leading-relaxed">{mistake}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20">
          <button 
            onClick={() => {
              markTopicAsStudied(topic.id);
              startExam('drill_selector', topic.id);
            }}
            className="w-full neon-gradient text-white py-6 rounded-[2rem] font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center"
          >
            {lang === 'ru' ? 'Практика по теме' : 'Тема боюнча машыгуу'}
            <ChevronRight className="w-6 h-6 ml-3" />
          </button>
        </footer>
      </div>
    );
  };

  const renderDrillSelector = () => {
    let allQuestions: Question[] = [];
    if (currentSubject === 'algebra') allQuestions = ALGEBRA_QUESTIONS;
    if (currentSubject === 'geometry') allQuestions = GEOMETRY_QUESTIONS;
    if (currentSubject === 'russian') allQuestions = RUSSIAN_QUESTIONS;
    if (currentSubject === 'history') allQuestions = HISTORY_QUESTIONS;
    const topics = Array.from(new Set(allQuestions.map(q => q.topic)));
    
    return (
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
          <button onClick={() => setState('landing')} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h2 className="ml-4 font-black text-lg dark:text-white">{lang === 'ru' ? 'Выбор темы' : 'Теманы тандоо'}</h2>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {topics.map(topic => {
              const stats = progress.topicStats[topic] || { correct: 0, total: 0 };
              const percent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const topicData = TOPICS.find(t => t.id === topic);

              return (
                <div 
                  key={topic}
                  className="glass-card p-6 rounded-[2.5rem] flex flex-col space-y-6 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left space-y-2">
                      <div className="font-black text-black dark:text-white text-lg leading-tight">
                        {topicData?.title[lang] || topic.replace(/_/g, ' ')}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full neon-gradient" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{percent}%</span>
                      </div>
                    </div>
                    {topicData && (
                      <button 
                        onClick={() => {
                          setCurrentTopicId(topic);
                          setState('learn_topic');
                        }}
                        className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-2xl text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                      >
                        <BookOpen className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => startExam('drill_selector', topic)}
                    className="w-full neon-gradient text-white py-5 rounded-[2rem] font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center"
                  >
                    {lang === 'ru' ? 'Начать тренировку' : 'Машыгууну баштоо'}
                    <ChevronRight className="w-5 h-5 ml-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-300 selection:bg-blue-100 dark:selection:bg-blue-900/30", darkMode ? "dark bg-slate-900" : "bg-slate-50")}>
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {state === 'landing' && renderLanding()}
            {state === 'exam' && renderExam()}
            {state === 'results' && renderResults()}
            {state === 'drill_selector' && renderDrillSelector()}
            {state === 'mistake_review' && renderExam()}
            {state === 'topic_list' && renderTopicList()}
            {state === 'learn_topic' && renderTopicExplanation()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
