import { useState, useEffect } from 'react';
import { UserProgress, Topic } from '../types';

const STORAGE_KEY = 'iga_ready_progress';

const INITIAL_PROGRESS: UserProgress = {
  topicStats: {} as any,
  streak: 0,
  lastActive: null,
  totalQuestions: 0,
  mistakes: [],
  studiedTopics: []
};

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : INITIAL_PROGRESS;
    // Ensure studiedTopics exists for older saves
    return { ...INITIAL_PROGRESS, ...parsed };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const markTopicAsStudied = (topicId: string) => {
    setProgress(prev => ({
      ...prev,
      studiedTopics: Array.from(new Set([...prev.studiedTopics, topicId]))
    }));
  };

  const updateProgress = (topic: Topic, isCorrect: boolean, questionId: string) => {
    setProgress(prev => {
      const newStats = { ...prev.topicStats };
      if (!newStats[topic]) {
        newStats[topic] = { correct: 0, total: 0 };
      }
      newStats[topic].total += 1;
      if (isCorrect) {
        newStats[topic].correct += 1;
      }

      const newMistakes = isCorrect 
        ? prev.mistakes.filter(id => id !== questionId)
        : Array.from(new Set([...prev.mistakes, questionId]));

      // Check if topic is mastered (>80% accuracy after at least 3 questions)
      // This is implicit in the UI but could be tracked here if needed.

      // Streak logic
      const today = new Date().toISOString().split('T')[0];
      let newStreak = prev.streak;
      if (prev.lastActive !== today) {
        if (prev.lastActive === getYesterday()) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      return {
        ...prev,
        topicStats: newStats,
        totalQuestions: prev.totalQuestions + 1,
        mistakes: newMistakes,
        lastActive: today,
        streak: newStreak
      };
    });
  };

  return { progress, updateProgress, markTopicAsStudied };
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
