export interface Question {
  questionNumber: number;
  question: string;
  options: string[];
  correctAnswerLetter: string; // 'A', 'B', 'C', or 'D'
  explanation: string;
}

export interface QuizResponse {
  isError: boolean;
  errorMessage?: string;
  sport: string;
  difficulty: string;
  questions: Question[];
  rawSocialMediaText: string;
  localFacts?: string[];
  localRules?: string[];
  searchQueries?: string[];
  sources?: { title: string; uri: string }[];
  isThemedPack?: boolean;
  themeTitle?: string;
  isFallback?: boolean;
  fallbackNotice?: string;
  provider?: string;
}

export interface QuizHistoryItem {
  id: string;
  timestamp: string;
  sport: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeElapsed: number;
  isThemedPack?: boolean;
  themeTitle?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarEmoji: string;
  avatarColor: string; // Tailwind class
  preferredSport: string;
  createdAt: string;
  unlockedBadges: string[]; // Badge IDs
  streakCount?: number;
  lastQuizDate?: string; // YYYY-MM-DD format
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji
  color: string; // Tailwind bg/text classes
  requirement: string;
}

export interface ThemePack {
  id: string;
  title: string;
  description: string;
  icon: string;
  sport: string; // Associated sport
  focus: string; // Guide context
  difficulty: "Easy" | "Medium" | "Hard";
}
