import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALGEBRA_QUESTIONS, GEOMETRY_QUESTIONS, RUSSIAN_QUESTIONS } from './data/questions';
import { KYRGYZ_QUESTIONS } from './data/kyrgyz_questions';
import { TOPICS } from './data/topics';
import { Question, Subject, AppState, Language } from './types';
import { SUBJECTS } from './data/subjects_meta';
import { useProgress } from './hooks/useProgress';
import { useProfile } from './hooks/useProfile';
import { MathText } from './components/MathText';
import { Graph } from './components/Graph';
import { RegistrationScreen } from './components/RegistrationScreen';
import { HomeScreen } from './components/HomeScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { MistakesScreen } from './components/MistakesScreen';
import { FormulasScreen } from './components/FormulasScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';
import { generateAIQuestion } from './services/gemini';
import { cn } from './lib/utils';
import { 
  BookOpen, 
  Trophy, 
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
  Globe,
  Circle,
  CheckCircle,
  ShieldCheck,
  ChevronLeft,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Loader2,
  Brush,
  Lightbulb
} from 'lucide-react';

import { DrawingCanvas } from './components/DrawingCanvas';

interface SavedExamState {
  questions: Question[];
  index: number;
  answers: Record<string, string>;
  timeLeft: number;
  isTimerActive: boolean;
}

function getAnalytics() {
  try {
    return JSON.parse(localStorage.getItem('iga_analytics') || '{"sessions":[],"sessionCount":0}');
  } catch { return { sessions: [], sessionCount: 0 }; }
}

function saveAnalytics(data: any) {
  try { localStorage.setItem('iga_analytics', JSON.stringify(data)); } catch {}
}

export default function App() {
  const { profile, saveProfile, clearProfile } = useProfile();
  const [darkMode, setDarkMode]       = useState(false);
  const [state, setState]             = useState<AppState>(profile ? 'landing' : 'registration');
  const [lang, setLang]               = useState<Language>('ru');
  const [currentSubject, setCurrentSubject] = useState<Subject>('algebra');
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [answers, setAnswers]             = useState<Record<string, string>>({});
  const [showSolution, setShowSolution]   = useState(false);
  const [timeLeft, setTimeLeft]           = useState(2400);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentTopicId, setCurrentTopicId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [hintIndex, setHintIndex]         = useState(0);
  const [shortAnswer, setShortAnswer]     = useState('');
  const [savedExamState, setSavedExamState] = useState<SavedExamState | null>(null);
  const [topicCameFrom, setTopicCameFrom] = useState<AppState>('topic_list');
  const [examDisplayLang, setExamDisplayLang] = useState<Language>('ru');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [drillMode, setDrillMode] = useState<string | null>(null);
  const [isPaintActive, setIsPaintActive] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  // Admin panel
  const [adminUnlocked, setAdminUnlocked] = useState(() => localStorage.getItem('iga_admin') === '1');
  const logoClickCount   = useRef(0);
  const logoClickTimer   = useRef<any>(null);
  const pageViewFired    = useRef(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [visitorId] = useState<string>(() => {
    let id = localStorage.getItem('iga_visitor_id');
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('iga_visitor_id', id); }
    return id;
  });
  const [sessionId] = useState<string>(() => {
    let id = sessionStorage.getItem('iga_session_id');
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem('iga_session_id', id); }
    return id;
  });
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [globalStatsLoading, setGlobalStatsLoading] = useState(false);

  const { progress, updateProgress, markTopicAsStudied } = useProgress();

  const trackEvent = (eventType: string, extra: { subject?: string; is_correct?: boolean; topic?: string } = {}) => {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, visitor_id: visitorId, session_id: sessionId, ...extra }),
    }).catch(() => {});
  };

  const handleGenerateAI = async () => {
    if (!currentTopicId) return;
    setIsGeneratingAI(true);
    try {
      const topicData = TOPICS.find(t => t.id === currentTopicId);
      const q = await generateAIQuestion(currentSubject, topicData?.title[lang] || currentTopicId, lang);
      
      // Map back to current topic ID to ensure it stays in the drill
      q.topic = currentTopicId;
      
      setCurrentQuestions([q]);
      setCurrentIndex(0);
      setAnswers({});
      setShowSolution(false);
      setState('exam');
    } catch (error) {
      alert(lang === 'ru' ? 'Ошибка генерации. Проверьте API ключ.' : 'Генерация катасы. API ачкычын текшериңиз.');
    } finally {
      setIsGeneratingAI(false);
    }
  };
  const fetchGlobalStats = async () => {
    setGlobalStatsLoading(true);
    try {
      const res = await fetch('/api/analytics/stats', { headers: { 'x-admin-secret': 'iga2025' } });
      if (res.ok) setGlobalStats(await res.json());
    } catch {}
    setGlobalStatsLoading(false);
  };

  // Track session analytics — guard prevents React StrictMode double-fire
  useEffect(() => {
    if (pageViewFired.current) return;
    pageViewFired.current = true;
    const data = getAnalytics();
    data.sessionCount = (data.sessionCount || 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    data.sessions = [...(data.sessions || []).slice(-99), { date: today, questions: 0 }];
    saveAnalytics(data);
    trackEvent('page_view');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (state === 'admin') fetchGlobalStats();
  }, [state]);

  // Heartbeat every 60 s — keeps "online now" accurate
  useEffect(() => {
    const sendHeartbeat = () => {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: visitorId, session_id: sessionId }),
      }).catch(() => {});
    };
    sendHeartbeat();
    const id = setInterval(sendHeartbeat, 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-refresh admin stats every 30 s while panel is open
  useEffect(() => {
    if (state !== 'admin') return;
    const id = setInterval(fetchGlobalStats, 30_000);
    return () => clearInterval(id);
  }, [state]);

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

  const handleLogoClick = () => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 2500);
    if (logoClickCount.current >= 7) {
      logoClickCount.current = 0;
      setShowAdminPrompt(true);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'iga2025') {
      setAdminUnlocked(true);
      localStorage.setItem('iga_admin', '1');
      setShowAdminPrompt(false);
      setState('admin');
    } else {
      setAdminPassword('');
    }
  };

  const getQuestionsForSubject = (subject: Subject): Question[] => {
    if (subject === 'algebra')  return ALGEBRA_QUESTIONS;
    if (subject === 'geometry') return GEOMETRY_QUESTIONS;
    if (subject === 'russian')  return RUSSIAN_QUESTIONS;
    if (subject === 'kyrgyz')   return KYRGYZ_QUESTIONS;
    return [];
  };

  const getMistakeQuestions = (): Question[] => {
    const allQs = getQuestionsForSubject(currentSubject);
    return progress.mistakes.map(id => allQs.find(q => q.id === id)).filter(Boolean) as Question[];
  };

  const startExam = (mode: AppState, topic?: string) => {
    setDrillMode(topic || null);
    const allQuestions = getQuestionsForSubject(currentSubject);
    let filtered = [...allQuestions];

    if (mode === 'drill_selector' && topic) {
      filtered = filtered.filter(q => q.topic === topic);
      filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, 8);
    } else if (mode === 'mistake_review') {
      filtered = filtered.filter(q => progress.mistakes.includes(q.id));
    } else {
      if (currentSubject === 'russian' || currentSubject === 'kyrgyz') {
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
    setSavedExamState(null);
    setExamDisplayLang(currentSubject === 'kyrgyz' ? 'ky' : lang);

    if (mode === 'exam') {
      // Set to 30 minutes for the full exam
      const time = 1800; // 30 minutes
      setTimeLeft(time);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  };

  const handleAnswer = (optionId: string) => {
    if (showSolution) return;
    const question = currentQuestions[currentIndex];
    const isCorrect = optionId === question.correctAnswer;
    setAnswers(prev => ({ ...prev, [question.id]: optionId }));
    setShowSolution(true);
    updateProgress(question.topic, question.subject, isCorrect, question.id);
    if (isCorrect && currentTopicId === question.topic) {
      const stats = progress.topicStats[question.topic] || { correct: 0, total: 0 };
      if (stats.correct + 1 >= 3) markTopicAsStudied(question.topic);
    }
    // Track analytics (local + global)
    const data = getAnalytics();
    if (data.sessions.length > 0) {
      data.sessions[data.sessions.length - 1].questions = 
        (data.sessions[data.sessions.length - 1].questions || 0) + 1;
      saveAnalytics(data);
    }
    trackEvent('question_answered', { subject: currentSubject, is_correct: isCorrect, topic: question.topic });
  };

  const handleShortSubmit = () => {
    if (showSolution) return;
    const question = currentQuestions[currentIndex];
    const isCorrect = shortAnswer.trim() === question.correctAnswer;
    setAnswers(prev => ({ ...prev, [question.id]: shortAnswer }));
    setShowSolution(true);
    updateProgress(question.topic, question.subject, isCorrect, question.id);
    trackEvent('question_answered', { subject: currentSubject, is_correct: isCorrect, topic: question.topic });
  };

  const handleSelfGrade = (grade: 'full' | 'partial' | 'none') => {
    const question = currentQuestions[currentIndex];
    const isCorrect = grade === 'full';
    setAnswers(prev => ({ ...prev, [question.id]: grade }));
    setShowSolution(true);
    updateProgress(question.topic, question.subject, isCorrect, question.id);
    trackEvent('question_answered', { subject: currentSubject, is_correct: isCorrect, topic: question.topic });
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowSolution(false);
      setShortAnswer('');
      setHintIndex(0);
    } else {
      if (drillMode) {
        startExam('drill_selector', drillMode);
      } else {
        setState('results');
        setIsTimerActive(false);
      }
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = currentQuestions[prevIdx];
      const wasAnswered = prevQ && answers[prevQ.id] !== undefined;
      setShowSolution(wasAnswered);
      setShortAnswer(wasAnswered && prevQ ? (answers[prevQ.id] || '') : '');
      setHintIndex(0);
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

  const goToLearnTopic = (topicId: string) => {
    setSavedExamState({
      questions: currentQuestions,
      index: currentIndex,
      answers: { ...answers },
      timeLeft,
      isTimerActive,
    });
    setIsTimerActive(false);
    setTopicCameFrom(state);
    setCurrentTopicId(topicId);
    setState('learn_topic');
  };

  const returnFromLearnTopic = () => {
    if (savedExamState) {
      setCurrentQuestions(savedExamState.questions);
      setCurrentIndex(savedExamState.index);
      setAnswers(savedExamState.answers);
      setTimeLeft(savedExamState.timeLeft);
      setIsTimerActive(savedExamState.isTimerActive);
      setShowSolution(savedExamState.answers[savedExamState.questions[savedExamState.index]?.id] !== undefined);
      setSavedExamState(null);
      setState(topicCameFrom === 'exam' ? 'exam' : 'drill_selector');
    } else {
      setState('topic_list');
    }
  };

  const renderLanding = () => {
    const subj = SUBJECTS.find(s => s.id === currentSubject)!;
    const studiedCount = (progress.studiedTopics || []).filter(id => TOPICS.find(t => t.id === id)?.subject === currentSubject).length;
    const totalTopics = TOPICS.filter(t => t.subject === currentSubject).length;
    const progressPct = totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex justify-center">
        <div className="w-full max-w-md bg-[var(--bg-app)] min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
          {showAdminPrompt && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={() => setShowAdminPrompt(false)}>
              <div className="bg-[var(--card-bg)] rounded-[2rem] p-8 w-full max-w-xs space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                  <h3 className="font-black text-[var(--text-main)] text-lg">{lang === 'ru' ? 'Панель администратора' : 'Администратор панели'}</h3>
                </div>
                <input
                  autoFocus
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  placeholder={lang === 'ru' ? 'Пароль...' : 'Сырсөз...'}
                  className="w-full p-4 rounded-[1.5rem] border-2 border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--input-text)] outline-none focus:border-blue-500 font-bold"
                />
                <button onClick={handleAdminLogin} className="w-full neon-gradient text-white py-4 rounded-[1.5rem] font-black">
                  {lang === 'ru' ? 'Войти' : 'Кирүү'}
                </button>
              </div>
            </div>
          )}

          <div className="hero-gradient px-5 pt-12 pb-6 relative overflow-hidden rounded-b-[2rem] shadow-sm">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 left-5 w-24 h-24 rounded-full bg-white/10 blur-xl" />

            <div className="flex items-center justify-between relative z-10">
              <button onClick={handleLogoClick} className="flex items-center gap-2 active:opacity-80">
                <div className="bg-white/20 p-1.5 rounded-lg shadow-sm">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/95 text-[11px] font-black uppercase tracking-widest">IGA-Ready</span>
              </button>
              
              <div className="flex gap-2 items-center">
                <div className="flex bg-white/15 p-1 rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => setLang('ru')} className={cn("px-2.5 py-1 text-xs font-black rounded-lg transition-all", lang === 'ru' ? "bg-white text-blue-700 shadow-sm" : "text-white/80")}>RU</button>
                  <button onClick={() => setLang('ky')} className={cn("px-2.5 py-1 text-xs font-black rounded-lg transition-all", lang === 'ky' ? "bg-white text-blue-700 shadow-sm" : "text-white/80")}>KY</button>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-white/15 text-white shadow-sm">
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                {adminUnlocked && (
                  <button onClick={() => setState('admin')} className="p-2 rounded-xl bg-white/15 text-white shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 mb-6 relative z-10">
              <h1 className="text-white font-black text-3xl leading-none tracking-tight">
                {lang === 'ru' ? 'Подготовка к ИГА' : 'ЖМАТка даярдык'}
              </h1>
              <p className="text-white/80 text-sm mt-2 font-medium">
                {lang === 'ru' ? 'Кыргызстан, 9 класс' : 'Кыргызстан, 9-класс'}
              </p>
            </div>

            <div className="flex gap-3 relative z-10">
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-[1.25rem] p-3.5 flex items-center gap-3 shadow-lg shadow-blue-900/20 dark:shadow-none">
                <div className="bg-orange-100 dark:bg-orange-500/20 p-2.5 rounded-xl">
                  <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400 animate-pulse-soft" />
                </div>
                <div>
                  <div className="text-slate-800 dark:text-white font-black text-xl leading-none">{progress.streak}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mt-1">{lang === 'ru' ? 'Дней подряд' : 'Күн катары'}</div>
                </div>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-800 rounded-[1.25rem] p-3.5 flex items-center gap-3 shadow-lg shadow-blue-900/20 dark:shadow-none">
                <div className="bg-yellow-100 dark:bg-yellow-500/20 p-2.5 rounded-xl">
                  <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <div className="text-slate-800 dark:text-white font-black text-xl leading-none">{progress.totalQuestions}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide mt-1">{lang === 'ru' ? 'Решено' : 'Чечилди'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <h2 className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.1em]">
                {lang === 'ru' ? 'Предмет' : 'Предмет'}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map((s) => {
                  const sStudied = (progress.studiedTopics || []).filter(id => TOPICS.find(t => t.id === id)?.subject === s.id).length;
                  const sTotal = TOPICS.filter(t => t.subject === s.id).length;
                  const sActive = currentSubject === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSubject(s.id)}
                      className={cn(
                        "relative rounded-[1.5rem] p-4 text-left transition-all overflow-hidden flex flex-col",
                        sActive ? "ring-[3px] ring-offset-2 ring-offset-[var(--bg-app)] ring-blue-500" : "opacity-80 hover:opacity-100 active:scale-95"
                      )}
                      style={{ background: s.gradient }}
                    >
                      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-xl shadow-sm backdrop-blur-sm">
                        {s.id === 'kyrgyz'
                          ? <Globe className="w-5 h-5 text-white" />
                          : s.emoji}
                      </div>
                      <div className="text-white font-bold text-[13px] leading-tight line-clamp-2 h-8">{s.title[lang]}</div>
                      <div className="flex items-center gap-2 mt-auto pt-3">
                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: `${sTotal > 0 ? Math.round(sStudied / sTotal * 100) : 0}%` }} />
                        </div>
                        <span className="text-white/90 text-[10px] font-bold">{sStudied}/{sTotal}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={() => startExam('exam')}
              className="w-full neon-gradient text-white px-5 py-5 rounded-[1.5rem] flex items-center justify-between group transition-all neon-glow active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[17px] leading-tight mb-1">{lang === 'ru' ? 'Полный экзамен' : 'Толук сынак'}</div>
                  <div className="text-white/80 text-[11px] font-bold uppercase tracking-wider">
                    {(currentSubject === 'russian' || currentSubject === 'kyrgyz')
                      ? (lang === 'ru' ? '30 ВОПРОСОВ • 60 МИНУТ' : '30 СУРОО • 60 МҮНӨТ')
                      : (lang === 'ru' ? '25 ВОПРОСОВ • 40 МИНУТ' : '25 СУРОО • 40 МҮНӨТ')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="grid grid-cols-1 gap-3 pb-8">
              <button 
                onClick={() => setState('drill_selector')}
                className="glass-card card-shadow rounded-[1.25rem] p-4 flex items-center gap-4 active:scale-95 transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-[var(--text-main)] text-[15px] leading-tight mb-1">{lang === 'ru' ? 'Тренировка по темам' : 'Темалар боюнча машыгуу'}</div>
                  <div className="text-[12px] text-[var(--text-muted)] font-medium leading-none">{lang === 'ru' ? 'Отработай слабые места' : 'Алсыз жактарды бекемдө'}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>

              <button 
                onClick={() => startExam('mistake_review')}
                className="glass-card card-shadow rounded-[1.25rem] p-4 flex items-center gap-4 active:scale-95 transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-[var(--text-main)] text-[15px] leading-tight mb-1">{lang === 'ru' ? 'Работа над ошибками' : 'Каталар менен иштөө'}</div>
                  <div className="text-[12px] text-[var(--text-muted)] font-medium leading-none">
                    {getMistakeQuestions().length} {lang === 'ru' ? 'вопросов требуют повтора' : 'суроо кайталоону керек'}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>

              <button 
                onClick={() => setState('topic_list')}
                className="glass-card card-shadow rounded-[1.25rem] p-4 flex items-center gap-4 active:scale-95 transition-all hover:-translate-y-0.5 group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-[var(--text-main)] text-[15px] leading-tight mb-1">{lang === 'ru' ? 'Учебник по темам' : 'Окуу куралы'}</div>
                  <div className="text-[12px] text-[var(--text-muted)] font-medium leading-none">
                    {studiedCount}/{totalTopics} {lang === 'ru' ? 'тем изучено' : 'тема изилденди'}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors" />
              </button>
            </div>
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
      <div className={cn(
        "flex flex-col bg-[var(--bg-app)] relative",
        isPaintActive ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
      )}>
        <header className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-50 shrink-0">
          <button onClick={() => setState(drillMode ? 'drill_selector' : 'landing')} className="p-2 -ml-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
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

          <div className="flex items-center gap-2">
            {currentSubject === 'kyrgyz' && (
              <button
                onClick={() => setExamDisplayLang(examDisplayLang === 'ky' ? 'ru' : 'ky')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all"
                style={examDisplayLang === 'ky'
                  ? { background: 'linear-gradient(135deg,#16a34a,#86efac)', color: 'white', borderColor: 'transparent' }
                  : { backgroundColor: 'var(--card-bg)', borderColor: '#16a34a', color: '#16a34a' }
                }
              >
                <Globe className="w-3.5 h-3.5" />
                {examDisplayLang === 'ky' ? 'RU' : 'KY'}
              </button>
            )}
            {isTimerActive ? (
              <div className={cn(
                "font-mono font-black px-3 py-1.5 rounded-xl text-sm border", 
                timeLeft < 300 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse" 
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700"
              )}>
                {formatTime(timeLeft)}
              </div>
            ) : <div className="w-14" />}
          </div>
        </header>

        <main className={cn(
          "w-full max-w-2xl mx-auto flex-1 flex flex-col",
          !isPaintActive && "overflow-y-auto p-6 space-y-8 pb-32"
        )}>
          <div className={cn(
            isPaintActive ? "overflow-y-auto shrink-0 max-h-[25vh] p-6 space-y-8 pb-4 scrollbar-thin border-b border-slate-100 dark:border-slate-800" : ""
          )}>
            <div className="text-xl font-bold text-[var(--text-main)] leading-relaxed">
              <MathText text={question.text[examDisplayLang]} />
            </div>

          {question.graph && (
            <Graph type={question.graph.type} data={question.graph.data} lang={lang} />
          )}

          <div className="relative">
            {question.part === 1 && question.options && question.options.length > 0 && (
              <div className="grid grid-cols-1 gap-4 mt-4">
                {question.options?.map((opt) => {
                  const isSelected = userChoice === opt.id;
                  const isCorrect = opt.id === question.correctAnswer;
                  
                  let btnStyle: React.CSSProperties = {};
                  const btnClass = "w-full p-5 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden";
                  
                  if (showSolution) {
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
                          <MathText text={typeof opt.text === 'string' ? opt.text : opt.text[examDisplayLang]} />
                        </div>
                      </div>
                      {showSolution && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0 ml-2" />}
                      {showSolution && isSelected && !isCorrect && <XCircle className="w-6 h-6 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}

            {(question.part === 2 || (question.part === 1 && (!question.options || question.options.length === 0)) || (question.part === 3 && question.correctAnswer)) && (
              <div className="space-y-4 mt-4">
                <input 
                  type="text"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  disabled={showSolution}
                  placeholder={lang === 'ru' ? 'Введите ответ...' : 'Жооп жазыңыз...'}
                  className="w-full p-5 rounded-[2rem] border-2 border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--input-text)] focus:border-blue-500 outline-none font-bold text-xl transition-all relative z-10"
                />
                {!showSolution && (
                  <button 
                    onClick={handleShortSubmit}
                    className="w-full text-white py-5 rounded-[1.5rem] font-black shadow-lg active:scale-95 transition-transform relative z-10"
                    style={{ background: subj.gradient }}
                  >
                    {lang === 'ru' ? 'Ответить' : 'Жооп берүү'}
                  </button>
                )}
                {showSolution && question.correctAnswer && (
                  <div 
                    className="p-6 rounded-[2rem] font-black text-center relative z-10"
                    style={{
                      backgroundColor: shortAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase() ? 'var(--correct-bg)' : 'var(--wrong-bg)',
                      color: shortAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase() ? 'var(--correct-text)' : 'var(--wrong-text)'
                    }}
                  >
                    {shortAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase() 
                      ? (lang === 'ru' ? 'Правильно!' : 'Туура!') 
                      : (lang === 'ru' ? `Ошибка! Правильный ответ: ${question.correctAnswer}` : `Ката! Туура жообу: ${question.correctAnswer}`)}
                  </div>
                )}
              </div>
            )}
          </div>

          {question.part === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                {question.hints?.slice(0, hintIndex).map((hint, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-300 text-sm font-medium flex items-start"
                  >
                    <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mr-4 mt-0.5 shrink-0">
                      {i + 1}
                    </span>
                    <MathText text={hint[examDisplayLang]} />
                  </motion.div>
                ))}
              </div>

              {!showSolution && (
                <div className="flex flex-col space-y-4">
                  {hintIndex < (question.hints?.length || 0) && (
                    <button 
                      onClick={() => setHintIndex(prev => prev + 1)}
                      className="w-full bg-[var(--card-bg)] border-2 border-blue-500 text-blue-600 dark:text-blue-400 py-5 rounded-[2rem] font-black"
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
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center mb-2">
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
                  <h3 className="font-black text-[var(--text-main)] uppercase tracking-wider text-sm">
                    {lang === 'ru' ? 'Разбор решения' : 'Чыгарылышын талдоо'}
                  </h3>
                </div>
                <div className="space-y-6 font-medium leading-relaxed text-[var(--text-main)]">
                  {question.solution ? (
                    question.solution[examDisplayLang].map((step, i) => (
                      <div key={i} className="flex space-x-5">
                        <span className="text-blue-500 dark:text-blue-400 font-black text-xl shrink-0">{i + 1}.</span>
                        <div className="pt-0.5">
                          <MathText text={step} />
                        </div>
                      </div>
                    ))
                  ) : question.explanation ? (
                    <div className="text-lg">
                      <MathText text={question.explanation[examDisplayLang]} />
                    </div>
                  ) : null}
                </div>
                
                {TOPICS.find(t => t.id === question.topic) && (
                  <button 
                    onClick={() => goToLearnTopic(question.topic)}
                    className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-5 rounded-[2rem] font-black flex items-center justify-center border border-blue-100 dark:border-blue-900/50"
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    {lang === 'ru' 
                      ? `Изучить: ${TOPICS.find(t => t.id === question.topic)?.title.ru}` 
                      : `Изилдөө: ${TOPICS.find(t => t.id === question.topic)?.title.ky}`}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          {isPaintActive && (
            <div className="flex-1 min-h-0 relative mt-2 mb-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
              <DrawingCanvas />
            </div>
          )}
        </main>

        <footer className="px-5 py-4 border-t border-[var(--card-border)] bg-[var(--bg-app)]/90 backdrop-blur-md sticky bottom-0 z-50">
          {!showSolution ? (
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  onClick={prevQuestion}
                  className="p-4 rounded-[1.5rem] border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setIsPaintActive(!isPaintActive)}
                className={cn(
                  "p-4 rounded-[1.5rem] border-2 transition-colors",
                  isPaintActive ? "bg-blue-100 border-blue-200 text-blue-600" : "border-[var(--card-border)] bg-[var(--card-bg)] text-slate-400 hover:text-[var(--text-main)]"
                )}
              >
                <Brush className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowHintModal(true)}
                className="p-4 rounded-[1.5rem] border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-yellow-500 hover:bg-yellow-50 transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
              </button>

              <button 
                onClick={skipQuestion}
                className="flex-1 py-3.5 text-[var(--text-muted)] font-black uppercase tracking-widest text-xs hover:text-[var(--text-main)] transition-colors text-right"
              >
                {lang === 'ru' ? 'Пропустить →' : 'Өткөрүп жиберүү →'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  onClick={prevQuestion}
                  className="p-4 rounded-[1.5rem] border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={() => setIsPaintActive(!isPaintActive)}
                className={cn(
                  "p-4 rounded-[1.5rem] border-2 transition-colors",
                  isPaintActive ? "bg-blue-100 border-blue-200 text-blue-600" : "border-[var(--card-border)] bg-[var(--card-bg)] text-slate-400 hover:text-[var(--text-main)]"
                )}
              >
                <Brush className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowHintModal(true)}
                className="p-4 rounded-[1.5rem] border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-yellow-500 hover:bg-yellow-50 transition-colors"
              >
                <Lightbulb className="w-5 h-5" />
              </button>

              <button 
                onClick={nextQuestion}
                className="flex-1 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center transition-all active:scale-95 shadow-lg"
                style={{ background: subj.gradient }}
              >
                {isGeneratingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    {currentIndex === currentQuestions.length - 1 
                      ? (drillMode ? (lang === 'ru' ? 'Решить еще' : 'Дагы чыгаруу') : (lang === 'ru' ? 'Завершить' : 'Аяктоо')) 
                      : (lang === 'ru' ? 'Далее' : 'Кийинки')}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </footer>
        
        {/* Hint Modal */}
        <AnimatePresence>
          {showHintModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowHintModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4 text-yellow-500">
                  <Lightbulb className="w-6 h-6" />
                  <h3 className="font-bold text-lg text-[var(--text-main)]">
                    {lang === 'ru' ? 'Подсказка' : 'Кеңеш'}
                  </h3>
                </div>
                <div className="text-[var(--text-main)] font-medium leading-relaxed mb-6">
                  {question.hints && question.hints.length > 0 ? (
                    <MathText text={question.hints[0][examDisplayLang]} />
                  ) : question.explanation ? (
                    <MathText text={question.explanation[examDisplayLang]} />
                  ) : (
                    <p>{lang === 'ru' ? 'К сожалению, к этой задаче нет подсказки. Попробуйте найти ответ в учебнике!' : 'Кечиресиз, бул маселе боюнча кеңеш жок. Жообун окуу китебинен издеп көрүңүз!'}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowHintModal(false)}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-[var(--text-main)] font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {lang === 'ru' ? 'Понятно' : 'Түшүнүктүү'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderResults = () => {
    const allQ = getQuestionsForSubject(currentSubject);
    const score = Object.entries(answers).filter(([id, ans]) => {
      const q = allQ.find(q => q.id === id);
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
          <h2 className="text-3xl font-black text-[var(--text-main)]">{lang === 'ru' ? 'Ваш результат' : 'Сиздин жыйынтыгыңыз'}</h2>
          
          <div className="relative inline-flex items-center justify-center">
            <div className="w-52 h-52 rounded-full border-8 border-slate-100 dark:border-slate-800 flex items-center justify-center relative z-10">
              <div className="flex flex-col items-center justify-center">
                <div className={cn("text-8xl font-black leading-[1]", grade.c)}>{grade.l}</div>
                <div className="text-[12px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mt-2">
                  {lang === 'ru' ? 'Оценка' : 'Баа'}
                </div>
              </div>
            </div>
            <svg className="absolute inset-0 w-52 h-52 -rotate-90 z-20 pointer-events-none">
              <circle cx="104" cy="104" r="96" fill="none" stroke="url(#neonGradient)" strokeWidth="8"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - percentage / 100)}
                strokeLinecap="round" className="transition-all duration-1000 ease-out"
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
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {lang === 'ru' ? 'Процент' : 'Пайыз'}
            </div>
          </div>
          <div className="glass-card p-5 rounded-[2rem] text-center space-y-1">
            <div className="text-2xl font-black text-[var(--text-main)]">{score}/{total}</div>
            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
              {lang === 'ru' ? 'Баллы' : 'Баллдар'}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
          <h3 className="font-black text-[var(--text-main)] uppercase tracking-wider text-xs px-1">{lang === 'ru' ? 'Анализ по темам' : 'Темалар боюнча анализ'}</h3>
          <div className="space-y-6">
            {Array.from(new Set(currentQuestions.map(q => q.topic))).map(topic => {
              const topicQuestions = currentQuestions.filter(q => q.topic === topic);
              const topicCorrect = topicQuestions.filter(q => answers[q.id] === q.correctAnswer).length;
              const topicPercent = Math.round((topicCorrect / topicQuestions.length) * 100);
              const topicData = TOPICS.find(t => t.id === topic);
              
              return (
                <div key={topic} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-[var(--text-muted)] truncate max-w-[160px]">
                      {topicData?.title[lang] || topic}
                    </span>
                    <span className={cn(topicPercent >= 70 ? "text-green-600 dark:text-green-400" : topicPercent >= 40 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400")}>
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
          {drillMode && (
            <button 
              onClick={handleGenerateAI}
              disabled={isGeneratingAI}
              className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl shadow-indigo-500/20 active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
            >
              {isGeneratingAI ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Sparkles className="w-6 h-6 mr-3" />}
              {lang === 'ru' ? 'Сгенерировать еще задания ИИ' : 'ИИ менен дагы суроо түзүү'}
            </button>
          )}

          <button 
            onClick={() => setState('landing')}
            className="w-full neon-gradient text-white py-6 rounded-[2rem] font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center"
          >
            <Layout className="w-6 h-6 mr-3" />
            {lang === 'ru' ? 'В главное меню' : 'Башкы менюга'}
          </button>
          
          <button 
            onClick={() => startExam('exam')}
            className="w-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] text-[var(--text-main)] py-6 rounded-[2rem] font-black active:scale-95 transition-transform flex items-center justify-center"
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
      <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
        <header className="p-4 border-b border-[var(--card-border)] flex items-center sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-10">
          <button onClick={() => setState('landing')} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h2 className="ml-4 font-black text-lg text-[var(--text-main)]">{lang === 'ru' ? 'Учебник' : 'Окуу куралы'}</h2>
        </header>

        <main className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text"
              placeholder={lang === 'ru' ? 'Поиск темы...' : 'Теманы издөө...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--card-border)] pl-14 pr-6 py-5 rounded-[2rem] outline-none focus:border-blue-500 transition-all font-bold text-[var(--input-text)] shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredTopics.map(topic => {
              const isStudied = (progress.studiedTopics || []).includes(topic.id);
              const stats = progress.topicStats[topic.id] || { correct: 0, total: 0 };
              const isMastered = stats.total >= 3 && (stats.correct / stats.total) >= 0.8;

              return (
                <button 
                  key={topic.id}
                  onClick={() => {
                    setTopicCameFrom('topic_list');
                    setSavedExamState(null);
                    setCurrentTopicId(topic.id);
                    setState('learn_topic');
                  }}
                  className="glass-card p-6 rounded-[2rem] flex items-center justify-between hover:border-blue-400/50 transition-all group"
                >
                  <div className="flex items-center space-x-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      isMastered ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                      isStudied ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : 
                      "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}>
                      {isMastered ? <Trophy className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div className="text-left">
                      <div className="font-black text-[var(--text-main)] text-base leading-tight">{topic.title[lang]}</div>
                      <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">
                        {isMastered ? (lang === 'ru' ? 'Освоено' : 'Өздөштүрүлдү') : 
                         isStudied ? (lang === 'ru' ? 'Изучено' : 'Изилденди') : 
                         (lang === 'ru' ? 'Не изучено' : 'Изилденген жок')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
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

    const cameFromExam = savedExamState !== null;

    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
        <header className="p-4 border-b border-[var(--card-border)] flex items-center sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-10">
          <button onClick={returnFromLearnTopic} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div className="ml-4 flex-1 min-w-0">
            <h2 className="font-black text-lg truncate text-[var(--text-main)]">{topic.title[lang]}</h2>
            {cameFromExam && (
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                {lang === 'ru' ? '← Вернуться в экзамен' : '← Сынакка кайтуу'}
              </p>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 space-y-10 overflow-y-auto pb-36">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">
              {lang === 'ru' ? 'Что это такое?' : 'Бул эмне?'}
            </h3>
            <div className="text-lg font-semibold text-[var(--text-main)] leading-relaxed">
              <MathText text={topic.whatIsIt[lang]} />
            </div>
          </section>

          {topic.formula && topic.formula.math && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">
                {topic.formula.title[lang]}
              </h3>
              <div className={cn(
                "neon-gradient rounded-[2.5rem] shadow-2xl shadow-blue-500/20 relative overflow-hidden",
                topic.subject === 'kyrgyz' ? "p-6" : "p-10 text-center"
              )}>
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className={cn(
                  "relative text-white font-black space-y-1.5",
                  topic.subject === 'kyrgyz' ? "text-base text-left" : "text-3xl"
                )}>
                  {topic.formula.math.split('\n').map((line, i) => (
                    <div key={i}><MathText text={line} /></div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {topic.example && topic.example.problem[lang] && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">
                {lang === 'ru' ? 'Разбор примера' : 'Мисалдын талдоосу'}
              </h3>
              <div className="glass-card rounded-[2.5rem] p-8 space-y-8">
                <div className="space-y-8">
                  <div className="text-xl font-black text-[var(--text-main)]">
                    <MathText text={topic.example.problem[lang]} />
                  </div>
                  {topic.example.steps.map((step, i) => (
                    <div key={i} className="space-y-2">
                      <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        <MathText text={step.step} />
                      </div>
                      <div className={cn(
                        "font-black text-[var(--text-main)]",
                        topic.subject === 'kyrgyz' ? "text-lg" : "text-2xl"
                      )}>
                        {step.math.split('\n').map((line, j) => (
                          <div key={j}><MathText text={line} /></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-[var(--card-border)]">
                  <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">
                    {lang === 'ru' ? 'Ответ' : 'Жообу'}
                  </div>
                  <div className="text-3xl font-black text-[var(--text-main)]">
                    <MathText text={topic.example.answer} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {topic.commonMistakes && topic.commonMistakes[lang] && topic.commonMistakes[lang].length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1">
                {lang === 'ru' ? 'Частые ошибки' : 'Көп кездешкен каталар'}
              </h3>
              <div className="space-y-3">
                {topic.commonMistakes[lang].map((mistake, i) => (
                  <div key={i} className="flex items-start space-x-4 p-5 rounded-[2rem]" style={{ background: darkMode ? 'rgba(153,27,27,0.15)' : '#ffffff', borderLeft: '4px solid #ef4444', border: darkMode ? '1px solid rgba(153,27,27,0.4)' : '1px solid #fecaca', borderLeftWidth: '4px', borderLeftColor: '#ef4444' }}>
                    <XCircle className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm font-semibold leading-relaxed" style={{ color: darkMode ? '#fca5a5' : '#111827' }}>
                      <MathText text={mistake} />
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="p-6 border-t border-[var(--card-border)] bg-[var(--bg-app)]/90 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-2xl mx-auto z-20 space-y-3">
          {cameFromExam && (
            <button
              onClick={returnFromLearnTopic}
              className="w-full bg-[var(--card-bg)] border-2 border-[var(--card-border)] text-[var(--text-main)] py-4 rounded-[1.5rem] font-black flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              {lang === 'ru' ? 'Вернуться в экзамен' : 'Сынакка кайтуу'}
            </button>
          )}
          <button 
            onClick={() => {
              markTopicAsStudied(topic.id);
              setSavedExamState(null);
              startExam('drill_selector', topic.id);
            }}
            className="w-full neon-gradient text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-transform flex items-center justify-center"
          >
            {lang === 'ru' ? 'Практика по теме' : 'Тема боюнча машыгуу'}
            <ChevronRight className="w-6 h-6 ml-3" />
          </button>
        </footer>
      </div>
    );
  };

  const renderDrillSelector = () => {
    const allQuestions = getQuestionsForSubject(currentSubject);
    const topics = Array.from(new Set(allQuestions.map(q => q.topic))).filter(Boolean) as string[];
    
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
        <header className="p-4 border-b border-[var(--card-border)] flex items-center sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-10">
          <button onClick={() => setState('practice')} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <h2 className="ml-4 font-black text-lg text-[var(--text-main)]">{lang === 'ru' ? 'Задания' : 'Тапшырмалар'}</h2>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {topics.map(topic => {
              const stats = progress.topicStats[topic] || { correct: 0, total: 0 };
              const percent = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const topicData = TOPICS.find(t => t.id === topic);
              const isStudied = (progress.studiedTopics || []).includes(topic);
              const isMastered = stats.total >= 3 && (stats.correct / stats.total) >= 0.8;

              return (
                <button 
                  key={topic || 'unknown'}
                  onClick={() => startExam('drill_selector', topic)}
                  className="glass-card p-6 rounded-[2rem] flex items-center justify-between hover:border-blue-400/50 transition-all group"
                >
                  <div className="flex items-center space-x-5">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                      isMastered ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                      isStudied ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : 
                      "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    )}>
                      {isMastered ? <BookOpen className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                    </div>
                    <div className="text-left font-black text-[var(--text-main)] text-[15px] leading-tight pr-4">
                      {topicData?.title[lang] || (typeof topic === 'string' ? topic.replace(/_/g, ' ') : 'Unknown')}
                    </div>
                  </div>
                  {stats.total > 0 && (
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-black text-[var(--primary)] uppercase tracking-wider">
                        {percent}%
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-bold">
                        {stats.correct}/{stats.total}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  };

  const renderAdminPanel = () => {
    const gs = globalStats;
    const dailySessions = gs?.daily_sessions ? Object.entries(gs.daily_sessions) : [];
    const maxSessions = Math.max(...dailySessions.map(([, v]) => v as number), 1);

    const globalSubjects: Record<string, { total: number; correct: number }> = {};
    if (gs?.subject_stats) {
      for (const s of gs.subject_stats) {
        globalSubjects[s.subject] = { total: Number(s.total), correct: Number(s.correct) };
      }
    }

    const statCards = [
      { icon: <Circle className="w-5 h-5 text-green-500" />, value: gs ? gs.online : '…', label: lang === 'ru' ? 'Онлайн сейчас' : 'Азыр онлайн', bg: 'bg-green-500/10', accent: 'text-green-500' },
      { icon: <Users className="w-5 h-5 text-blue-500" />, value: gs ? gs.total_visitors : '…', label: lang === 'ru' ? 'Уникальных устройств' : 'Уникалдуу түзмөктөр', bg: 'bg-blue-500/10', accent: 'text-blue-500' },
      { icon: <TrendingUp className="w-5 h-5 text-violet-500" />, value: gs ? gs.today_sessions : '…', label: lang === 'ru' ? 'Сессий сегодня' : 'Бүгүн сессия', bg: 'bg-violet-500/10', accent: 'text-violet-500' },
      { icon: <Target className="w-5 h-5 text-orange-500" />, value: gs ? gs.today_questions : '…', label: lang === 'ru' ? 'Вопросов сегодня' : 'Бүгүн суроолор', bg: 'bg-orange-500/10', accent: 'text-orange-500' },
      { icon: <BarChart3 className="w-5 h-5 text-emerald-500" />, value: gs ? gs.total_sessions : '…', label: lang === 'ru' ? 'Сессий всего' : 'Жалпы сессия', bg: 'bg-emerald-500/10', accent: 'text-emerald-500' },
      { icon: <CheckCircle className="w-5 h-5 text-teal-500" />, value: gs ? gs.total_questions : '…', label: lang === 'ru' ? 'Вопросов всего' : 'Жалпы суроолор', bg: 'bg-teal-500/10', accent: 'text-teal-500' },
    ];

    const subjectRows = [
      { id: 'algebra',  label: lang === 'ru' ? 'Алгебра' : 'Алгебра',             color: 'bg-blue-500',   data: globalSubjects['algebra'] },
      { id: 'geometry', label: lang === 'ru' ? 'Геометрия' : 'Геометрия',         color: 'bg-violet-500', data: globalSubjects['geometry'] },
      { id: 'russian',  label: lang === 'ru' ? 'Русский язык' : 'Орус тили',      color: 'bg-teal-500',   data: globalSubjects['russian'] },
      { id: 'kyrgyz',   label: lang === 'ru' ? 'Кыргызский язык' : 'Кыргыз тили', color: 'bg-green-500',  data: globalSubjects['kyrgyz'] },
    ];
    const totalAnswered = subjectRows.reduce((s, r) => s + (r.data?.total || 0), 0) || 1;

    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
        <header className="p-4 border-b border-[var(--card-border)] flex items-center sticky top-0 bg-[var(--bg-app)]/90 backdrop-blur-md z-10">
          <button onClick={() => setState('landing')} className="p-2 -ml-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ArrowLeft className="w-7 h-7" />
          </button>
          <div className="ml-4">
            <h2 className="font-black text-lg text-[var(--text-main)]">
              {lang === 'ru' ? 'Аналитика' : 'Аналитика'}
            </h2>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
              {lang === 'ru' ? 'Все пользователи · Реальное время' : 'Бардык колдонуучулар · Нака убакыт'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {globalStatsLoading && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            <button onClick={fetchGlobalStats} className="p-2 text-[var(--text-muted)] hover:text-blue-500 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
        </header>

        <main className="p-6 space-y-6 pb-10">
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((item, i) => (
              <div key={i} className="glass-card p-4 rounded-[2rem] space-y-2">
                <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center", item.bg)}>
                  {item.icon}
                </div>
                <div className={cn("text-2xl font-black", item.accent)}>{item.value}</div>
                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-tight">{item.label}</div>
              </div>
            ))}
          </div>

          {dailySessions.length > 0 && (
            <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
              <h3 className="font-black text-[var(--text-main)] text-xs uppercase tracking-widest">
                {lang === 'ru' ? 'Сессии за 7 дней' : '7 күн сессия'}
              </h3>
              <div className="flex items-end gap-2 h-24">
                {dailySessions.map(([date, count], i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full neon-gradient rounded-t-lg transition-all"
                      style={{ height: `${Math.max(((count as number) / maxSessions) * 80, (count as number) > 0 ? 8 : 0)}px` }}
                    />
                    <span className="text-[9px] font-black text-[var(--text-muted)]">{date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6 rounded-[2.5rem] space-y-4">
            <h3 className="font-black text-[var(--text-main)] text-xs uppercase tracking-widest">
              {lang === 'ru' ? 'По предметам (все пользователи)' : 'Предметтер боюнча (бардык)'}
            </h3>
            {subjectRows.map((s) => {
              const total = s.data?.total || 0;
              const correct = s.data?.correct || 0;
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
              return (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-bold text-[var(--text-main)]">{s.label}</span>
                    <span className="text-sm font-black text-[var(--text-muted)]">{total} {lang === 'ru' ? 'отв.' : 'жооп'} · {pct}% ✓</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", s.color)} style={{ width: `${(total / totalAnswered) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card p-6 rounded-[2.5rem] space-y-3">
            <h3 className="font-black text-[var(--text-main)] text-xs uppercase tracking-widest">
              {lang === 'ru' ? 'Мой прогресс' : 'Менин илгерилешим'}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[var(--text-main)]">{lang === 'ru' ? 'Серия дней' : 'Күн катары'}</span>
                <span className="font-black text-orange-500">{progress.streak} {lang === 'ru' ? 'дн.' : 'күн'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[var(--text-main)]">{lang === 'ru' ? 'Ошибок в базе' : 'Каталар'}</span>
                <span className="font-black text-red-500">{progress.mistakes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-bold text-[var(--text-main)]">{lang === 'ru' ? 'Тем изучено' : 'Тема изилденди'}</span>
                <span className="font-black text-green-500">{(progress.studiedTopics || []).length}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-300 selection:bg-blue-100 dark:selection:bg-blue-900/30", darkMode ? "dark bg-slate-900" : "bg-[var(--bg-app)]")}>
      <div className="max-w-2xl mx-auto min-h-screen flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex-1 flex flex-col"
          >
            {state === 'registration' && (
              <RegistrationScreen 
                lang={lang} 
                onComplete={(p) => {
                  saveProfile(p);
                  setState('landing');
                }} 
              />
            )}
            {state === 'landing'        && profile && <HomeScreen profile={profile} lang={lang} streak={progress.streak} progress={progress} currentSubject={currentSubject} onSelectSubject={setCurrentSubject} onStartExam={(mode) => mode === 'exam' ? startExam('exam') : setState(mode)} />}
            {state === 'practice'       && <PracticeScreen lang={lang} onSelectSubject={setCurrentSubject} onNavigate={setState} progress={progress} mistakesCount={getMistakeQuestions().length} />}
            {state === 'mistake_review' && <MistakesScreen mistakes={getMistakeQuestions()} lang={lang} onStartReview={() => startExam('mistake_review')} onNavigate={setState} />}
            {state === 'profile'        && profile && <ProfileScreen profile={profile} lang={lang} progress={progress} onUpdateProfile={saveProfile} onLogout={() => { clearProfile(); setState('registration'); }} setLang={setLang} />}
            {state === 'exam'           && renderExam()}
            {state === 'results'        && renderResults()}
            {state === 'drill_selector' && renderDrillSelector()}
            {state === 'topic_list'     && renderTopicList()}
            {state === 'learn_topic'    && renderTopicExplanation()}
            {state === 'formulas'       && <FormulasScreen currentSubject={currentSubject} lang={lang} onNavigate={setState} />}
            {state === 'admin'          && renderAdminPanel()}
          </motion.div>
        </AnimatePresence>
        
        {/* Bottom Navigation */}
        {profile && state !== 'exam' && state !== 'results' && state !== 'learn_topic' && state !== 'registration' && state !== 'admin' && (
          <BottomNav state={state} setState={setState} lang={lang} />
        )}
      </div>
    </div>
  );
}
