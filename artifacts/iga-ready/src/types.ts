export type Subject = 'algebra' | 'geometry' | 'russian' | 'history';

export type Topic = string;

export interface Option {
  id: string;
  text: string | { ru: string; ky: string };
}

export interface Hint {
  ru: string;
  ky: string;
}

export interface Question {
  id: string;
  subject: Subject;
  part: 1 | 2 | 3;
  topic: Topic;
  text: {
    ru: string;
    ky: string;
  };
  options?: Option[]; // Part 1 only
  correctAnswer: string;
  hints?: Hint[]; // Part 3 only
  solution?: {
    ru: string[];
    ky: string[];
  };
  explanation?: {
    ru: string;
    ky: string;
  };
  graph?: {
    type: 'travel' | 'bar';
    data: any;
  };
  image?: string;
}

export interface TopicStats {
  correct: number;
  total: number;
}

export interface TopicExplanation {
  id: string;
  subject: Subject;
  title: { ru: string; ky: string };
  whatIsIt: { ru: string; ky: string };
  formula: {
    title: { ru: string; ky: string };
    math: string;
  };
  example: {
    problem: { ru: string; ky: string };
    steps: { step: string; math: string }[];
    answer: string;
  };
  commonMistakes: { ru: string[]; ky: string[] };
}

export interface UserProgress {
  streak: number;
  lastActive: string | null;
  totalQuestions: number;
  topicStats: Record<string, TopicStats>;
  mistakes: string[]; // Question IDs
  studiedTopics: string[]; // Topic IDs
}
