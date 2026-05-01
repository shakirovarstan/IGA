import { useState, useEffect } from 'react';
import { UserProgress } from '../types';

const STORAGE_KEY = 'iga_user_progress';

const INITIAL_PROGRESS: UserProgress = {
  streak: 0,
  lastActive: null,
  totalQuestions: 0,
  topicStats: {},
  subjectStats: {},
  mistakes: [],
  studiedTopics: []
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed) {
         if (!parsed.subjectStats) parsed.subjectStats = {};
         if (!parsed.studiedTopics) parsed.studiedTopics = [];
         return parsed;
      }
      return INITIAL_PROGRESS;
    } catch {
      return INITIAL_PROGRESS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (topicId: string, subjectId: string, isCorrect: boolean, questionId: string) => {
    setProgress(prev => {
      const newStats = { ...(prev.topicStats[topicId] || { correct: 0, total: 0 }) };
      newStats.total += 1;
      if (isCorrect) newStats.correct += 1;

      const newSubjectStats = { ...(prev.subjectStats?.[subjectId] || { correct: 0, total: 0 }) };
      newSubjectStats.total += 1;
      if (isCorrect) newSubjectStats.correct += 1;

      const newMistakes = isCorrect 
        ? prev.mistakes.filter(id => id !== questionId)
        : prev.mistakes.includes(questionId) ? prev.mistakes : [...prev.mistakes, questionId];

      // Update streak
      const today = new Date().toDateString();
      let newStreak = prev.streak;
      if (prev.lastActive !== today) {
        if (prev.lastActive === new Date(Date.now() - 86400000).toDateString()) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        totalQuestions: prev.totalQuestions + 1,
        topicStats: { ...prev.topicStats, [topicId]: newStats },
        subjectStats: { ...prev.subjectStats, [subjectId]: newSubjectStats },
        mistakes: newMistakes,
        streak: newStreak,
        lastActive: today
      };
    });
  };

  const markTopicAsStudied = (topicId: string) => {
    setProgress(prev => ({
      ...prev,
      studiedTopics: prev.studiedTopics.includes(topicId) 
        ? prev.studiedTopics 
        : [...prev.studiedTopics, topicId]
    }));
  };

  return { progress, updateProgress, markTopicAsStudied };
}
