/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Play,
  RefreshCw,
  Check,
  X,
  Award,
  BookOpen,
  Search,
  Database,
  Copy,
  ExternalLink,
  Timer,
  ChevronRight,
  AlertCircle,
  Share2,
  Flame,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  User,
  LogOut,
  Sparkles,
  Users,
  Grid,
  Calendar,
  Twitter,
  Facebook,
  Link,
  Lock,
  Compass,
  FileText
} from "lucide-react";
import { Question, QuizResponse, QuizHistoryItem, UserProfile, ThemePack, Badge } from "./types";

// Standard supported sports
const SPORTS = [
  { id: "cricket", name: "Cricket", emoji: "🏏", description: "Test match history, pitch details, and legendary averages." },
  { id: "football", name: "Football (Soccer)", emoji: "⚽", description: "FIFA World Cup milestones, rules, and goal records." },
  { id: "basketball", name: "Basketball", emoji: "🏀", description: "NBA championships, James Naismith origins, and records." },
  { id: "tennis", name: "Tennis", emoji: "🎾", description: "Grand Slam records, King of Clay achievements, and rules." },
  { id: "badminton", name: "Badminton", emoji: "🏸", description: "Waist-level serves, 21-point rules, and legendary ranks." },
  { id: "hockey", name: "Hockey", emoji: "🏑", description: "Field & Ice hockey statistics, legendary stars, and circles." },
  { id: "formula1", name: "Formula 1", emoji: "🏎️", description: "Silverstone origins, tyre compound rules, and team titles." },
  { id: "volleyball", name: "Volleyball", emoji: "🏐", description: "William G. Morgan origins, three-touch rules, and rally scores." }
];

// Curated theme packs
const THEMED_PACKS: ThemePack[] = [
  {
    id: "world-cup-classics",
    title: "World Cup Classics",
    description: "Legendary matches, iconic goals, historic champions, and record scorers across FIFA World Cup history.",
    icon: "🏆",
    sport: "football",
    focus: "FIFA World Cup legendary matches, winners, iconic goals, and cup history statistics",
    difficulty: "Medium"
  },
  {
    id: "legends-of-the-game",
    title: "Legends of the Game",
    description: "Sovereign reigns of Michael Jordan, Roger Federer, Serena Williams, LeBron James, and Sachin Tendulkar.",
    icon: "👑",
    sport: "basketball",
    focus: "Career milestones, records, championships, and achievements of Roger Federer, Serena Williams, LeBron James, and Sachin Tendulkar",
    difficulty: "Hard"
  },
  {
    id: "premier-league-deep-dive",
    title: "Premier League Deep Dive",
    description: "Arsenal's Invincibles, historic Manchester United reigns, Manchester City trebles, and legendary managers.",
    icon: "🦁",
    sport: "football",
    focus: "English Premier League title winners, legendary seasons, record goal scorers, and famous managers",
    difficulty: "Hard"
  },
  {
    id: "olympic-glory",
    title: "Olympic Glory",
    description: "Usain Bolt's lightning runs, Michael Phelps' gold medal records, and unforgettable moments in Track & Field.",
    icon: "🥇",
    sport: "volleyball",
    focus: "Olympic Games track and field records, historic gold medals, legendary Olympians, and memorable ceremonies",
    difficulty: "Medium"
  },
  {
    id: "ashes-cricket-crucible",
    title: "Ashes Cricket Crucible",
    description: "The century-old rivalry, remarkable wickets, historic centuries, and legendary battles of England vs Australia.",
    icon: "🏏",
    sport: "cricket",
    focus: "Ashes cricket test match history, remarkable wickets, legendary centuries, and historic matches",
    difficulty: "Hard"
  }
];

const DIFFICULTIES = [
  { id: "Easy", name: "Easy", description: "Perfect for beginners. Famous stars, basic rules, and popular events.", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "Medium", name: "Medium", description: "Moderate test of knowledge. League champions, player milestones, and records.", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "Hard", name: "Hard", description: "Strict challenge for experts. Rare historic statistics, technical rules, and precise dates.", color: "text-rose-700 bg-rose-50 border-rose-200" }
];

// Available badges
const BADGES: Badge[] = [
  {
    id: "first-victory",
    title: "First Victory",
    description: "Completed any quiz with 50% score or more.",
    icon: "🎯",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800",
    requirement: "Score at least 50% in any quiz"
  },
  {
    id: "perfect-strike",
    title: "Perfect Strike",
    description: "Scored 100% on any sports quiz.",
    icon: "⚡",
    color: "bg-amber-50 border-amber-200 text-amber-800",
    requirement: "Get 100% score"
  },
  {
    id: "trivia-prodigy",
    title: "Trivia Prodigy",
    description: "Successfully completed any 'Hard' quiz.",
    icon: "🧠",
    color: "bg-rose-50 border-rose-200 text-rose-800",
    requirement: "Complete a quiz on Hard difficulty"
  },
  {
    id: "speedrunner",
    title: "Speedrunner",
    description: "Completed a quiz with 80%+ accuracy in under 45 seconds.",
    icon: "⏱️",
    color: "bg-blue-50 border-blue-200 text-blue-800",
    requirement: "Finish in under 45s with 80%+ score"
  },
  {
    id: "globetrotter",
    title: "Globetrotter",
    description: "Completed quizzes across at least 3 distinct sports.",
    icon: "🌍",
    color: "bg-indigo-50 border-indigo-200 text-indigo-800",
    requirement: "Complete quizzes in 3 different sports"
  },
  {
    id: "theme-master",
    title: "Theme Master",
    description: "Completed a Curated Themed Quiz Pack.",
    icon: "📦",
    color: "bg-violet-50 border-violet-200 text-violet-800",
    requirement: "Complete a themed quiz pack"
  },
  {
    id: "consistent-athlete",
    title: "Consistent Athlete",
    description: "Achieved a 7-day daily quiz completion streak.",
    icon: "🔥",
    color: "bg-amber-100 border-amber-300 text-amber-900 font-bold",
    requirement: "Achieve a 7-day quiz streak"
  },
  {
    id: "relentless-athlete",
    title: "Relentless Athlete",
    description: "Accumulated 5 or more completed quizzes.",
    icon: "🔥",
    color: "bg-orange-50 border-orange-200 text-orange-800",
    requirement: "Complete 5 quizzes"
  },
  {
    id: "grounding-scholar",
    title: "Grounded Scholar",
    description: "Opened both local database and web search tabs in sources.",
    icon: "📖",
    color: "bg-stone-100 border-stone-250 text-stone-800",
    requirement: "Toggle and inspect both verification source tabs"
  }
];

const AGENT_STATUSES = [
  "Initializing Sports Quiz Agent...",
  "Querying Local Vector Database (Simulated ChromaDB)...",
  "Retrieving verified rules and historical records...",
  "Triggering Live Google Search Grounding for recent updates...",
  "Fetching up-to-date player rankings & champion statuses...",
  "Merging vector store facts and live search data...",
  "Drafting unique, non-hallucinated multiple choice questions...",
  "Performing factual verification against retrieved knowledge...",
  "Formatting social-media ready copy block...",
  "Finalizing response..."
];

const AVATAR_EMOJIS = ["🦁", "🐯", "🦅", "🦊", "🥋", "⚽", "🏀", "🎾", "🏎️", "🏌️", "🏹", "🏆"];
const ACCENT_COLORS = [
  { id: "orange", label: "Sunset Orange", border: "border-orange-200", bg: "bg-orange-500", text: "text-orange-600", lightBg: "bg-orange-50" },
  { id: "emerald", label: "Sporty Green", border: "border-emerald-200", bg: "bg-emerald-500", text: "text-emerald-600", lightBg: "bg-emerald-50" },
  { id: "indigo", label: "Classic Navy", border: "border-indigo-200", bg: "bg-indigo-500", text: "text-indigo-600", lightBg: "bg-indigo-50" },
  { id: "rose", label: "Deep Rose", border: "border-rose-200", bg: "bg-rose-500", text: "text-rose-600", lightBg: "bg-rose-50" },
  { id: "slate", label: "Minimalist Ink", border: "border-slate-300", bg: "bg-slate-900", text: "text-slate-800", lightBg: "bg-slate-100" }
];

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<"quiz" | "profile" | "leaderboard">("quiz");

  // User profiles & auth states
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [showSignup, setShowSignup] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🦁");
  const [selectedAccent, setSelectedAccent] = useState("orange");
  const [preferredSportInput, setPreferredSportInput] = useState("football");

  // Config states
  const [selectedSport, setSelectedSport] = useState("cricket");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [quizMode, setQuizMode] = useState<"standard" | "themed">("standard");
  const [selectedThemedPackId, setSelectedThemedPackId] = useState("world-cup-classics");

  // Fetch / loading states
  const [loading, setLoading] = useState(false);
  const [agentStatusIndex, setAgentStatusIndex] = useState(0);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gameplay states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"chroma" | "search">("chroma");

  // Achievements/Badges state
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);
  const [hasOpenedChroma, setHasOpenedChroma] = useState(false);
  const [hasOpenedSearch, setHasOpenedSearch] = useState(false);

  // Search query for quiz history
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load and initialize profile data from localStorage
  useEffect(() => {
    const savedProfiles = localStorage.getItem("sports_quiz_profiles");
    const activeId = localStorage.getItem("sports_quiz_active_id");

    if (savedProfiles) {
      try {
        const parsed = JSON.parse(savedProfiles) as UserProfile[];
        setProfiles(parsed);
        if (parsed.length > 0) {
          if (activeId && parsed.some(p => p.id === activeId)) {
            setActiveProfileId(activeId);
          } else {
            setActiveProfileId(parsed[0].id);
            localStorage.setItem("sports_quiz_active_id", parsed[0].id);
          }
        } else {
          setShowSignup(true);
        }
      } catch (e) {
        console.error("Failed to parse profiles:", e);
      }
    } else {
      // Seed an initial Guest profile for smooth out-of-the-box usage
      const guestProfile: UserProfile = {
        id: "guest-id-123",
        username: "ChampionGamer",
        avatarEmoji: "🏆",
        avatarColor: "orange",
        preferredSport: "football",
        createdAt: new Date().toLocaleDateString("en-US"),
        unlockedBadges: []
      };
      setProfiles([guestProfile]);
      setActiveProfileId(guestProfile.id);
      localStorage.setItem("sports_quiz_profiles", JSON.stringify([guestProfile]));
      localStorage.setItem("sports_quiz_active_id", guestProfile.id);
    }
  }, []);

  // Update status message interval when loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setAgentStatusIndex(0);
      interval = setInterval(() => {
        setAgentStatusIndex((prev) => (prev < AGENT_STATUSES.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Timer effect for quiz
  useEffect(() => {
    if (gameStarted && !gameCompleted && !loading) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameCompleted, loading]);

  // Current active profile
  const currentProfile = profiles.find(p => p.id === activeProfileId);

  // Active profile's history
  const activeProfileHistory = currentProfile 
    ? (JSON.parse(localStorage.getItem(`history_${currentProfile.id}`) || "[]") as QuizHistoryItem[])
    : [];

  // Signup profile creation handler
  const handleCreateProfile = () => {
    if (!usernameInput.trim()) return;

    const newProfile: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      username: usernameInput.trim(),
      avatarEmoji: selectedEmoji,
      avatarColor: selectedAccent,
      preferredSport: preferredSportInput,
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      unlockedBadges: []
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setActiveProfileId(newProfile.id);
    localStorage.setItem("sports_quiz_profiles", JSON.stringify(updated));
    localStorage.setItem("sports_quiz_active_id", newProfile.id);

    // Reset fields
    setUsernameInput("");
    setShowSignup(false);
  };

  // Switch profile handler
  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem("sports_quiz_active_id", id);
    // Clear active states
    setQuiz(null);
    setGameStarted(false);
    setGameCompleted(false);
  };

  // Delete profile helper
  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem("sports_quiz_profiles", JSON.stringify(updated));
    localStorage.removeItem(`history_${id}`);
    
    if (updated.length > 0) {
      setActiveProfileId(updated[0].id);
      localStorage.setItem("sports_quiz_active_id", updated[0].id);
    } else {
      setActiveProfileId("");
      localStorage.removeItem("sports_quiz_active_id");
      setShowSignup(true);
    }
  };

  // Generate quiz handler
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuiz(null);
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setScore(0);
    setTimeElapsed(0);
    setNewlyUnlockedBadges([]);
    setHasOpenedChroma(false);
    setHasOpenedSearch(false);

    try {
      let body: any = {};
      if (quizMode === "standard") {
        body = {
          sport: selectedSport,
          difficulty: selectedDifficulty,
          isThemedPack: false
        };
      } else {
        const pack = THEMED_PACKS.find(p => p.id === selectedThemedPackId)!;
        body = {
          sport: pack.sport,
          difficulty: pack.difficulty,
          isThemedPack: true,
          themeTitle: pack.title,
          themeDescription: pack.description,
          themeFocus: pack.focus
        };
      }

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data: QuizResponse = await response.json();

      if (data.isError) {
        throw new Error(data.errorMessage || "Retrieval context was insufficient.");
      }

      // Add custom link back to social copy block so it meets requirement
      const linkBack = window.location.origin;
      data.rawSocialMediaText += `\n\nTake this Grounded AI Sports Quiz here: ${linkBack}`;

      setQuiz(data);
      setGameStarted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Option select handler
  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(option);
  };

  // Submit/Check answer handler
  const handleCheckAnswer = () => {
    if (!selectedOption || !quiz) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = selectedOption.trim().startsWith(currentQuestion.correctAnswerLetter);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setIsAnswerRevealed(true);
  };

  // Next question handler
  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerRevealed(false);
    } else {
      // Complete game
      setGameCompleted(true);
      saveGameAndEvaluateBadges();
    }
  };

  // Save game state and check for unlocked badges
  const saveGameAndEvaluateBadges = () => {
    if (!quiz || !currentProfile) return;

    const finalScore = score + (selectedOption?.trim().startsWith(quiz.questions[currentQuestionIndex].correctAnswerLetter) ? 1 : 0);
    const accuracy = (finalScore / quiz.questions.length) * 100;

    // Save game to history
    const historyItem: QuizHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      sport: quiz.sport,
      difficulty: quiz.difficulty,
      score: finalScore,
      totalQuestions: quiz.questions.length,
      timeElapsed: timeElapsed,
      isThemedPack: quiz.isThemedPack,
      themeTitle: quiz.themeTitle || undefined
    };

    const newHistory = [historyItem, ...activeProfileHistory];
    localStorage.setItem(`history_${currentProfile.id}`, JSON.stringify(newHistory));

    // Daily Streak Logic
    const todayStr = new Date().toLocaleDateString("sv-SE"); // local YYYY-MM-DD
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(todayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toLocaleDateString("sv-SE");

    let updatedStreak = currentProfile.streakCount || 0;
    let updatedLastQuizDate = currentProfile.lastQuizDate || "";

    if (!updatedLastQuizDate) {
      // First quiz ever completed
      updatedStreak = 1;
      updatedLastQuizDate = todayStr;
    } else if (updatedLastQuizDate === todayStr) {
      // Already completed a quiz today, streak count stays unchanged
    } else if (updatedLastQuizDate === yesterdayStr) {
      // Completed yesterday, increment streak
      updatedStreak += 1;
      updatedLastQuizDate = todayStr;
    } else {
      // Broken streak, reset to 1
      updatedStreak = 1;
      updatedLastQuizDate = todayStr;
    }

    // Evaluate newly unlocked achievements
    const currentUnlocked = [...currentProfile.unlockedBadges];
    const newlyUnlocked: Badge[] = [];

    // 1. First Victory Badge
    if (!currentUnlocked.includes("first-victory") && accuracy >= 50) {
      currentUnlocked.push("first-victory");
      newlyUnlocked.push(BADGES.find(b => b.id === "first-victory")!);
    }

    // 2. Perfect Strike Badge
    if (!currentUnlocked.includes("perfect-strike") && accuracy === 100) {
      currentUnlocked.push("perfect-strike");
      newlyUnlocked.push(BADGES.find(b => b.id === "perfect-strike")!);
    }

    // 3. Trivia Prodigy
    if (!currentUnlocked.includes("trivia-prodigy") && quiz.difficulty === "Hard") {
      currentUnlocked.push("trivia-prodigy");
      newlyUnlocked.push(BADGES.find(b => b.id === "trivia-prodigy")!);
    }

    // 4. Speedrunner
    if (!currentUnlocked.includes("speedrunner") && accuracy >= 80 && timeElapsed <= 45) {
      currentUnlocked.push("speedrunner");
      newlyUnlocked.push(BADGES.find(b => b.id === "speedrunner")!);
    }

    // 5. Globetrotter (3 different sports)
    const uniqueSports = new Set(newHistory.map(h => h.sport.toLowerCase()));
    if (!currentUnlocked.includes("globetrotter") && uniqueSports.size >= 3) {
      currentUnlocked.push("globetrotter");
      newlyUnlocked.push(BADGES.find(b => b.id === "globetrotter")!);
    }

    // 6. Theme Master
    if (!currentUnlocked.includes("theme-master") && quiz.isThemedPack) {
      currentUnlocked.push("theme-master");
      newlyUnlocked.push(BADGES.find(b => b.id === "theme-master")!);
    }

    // 6b. Consistent Athlete Badge (7-day streak)
    if (!currentUnlocked.includes("consistent-athlete") && updatedStreak >= 7) {
      currentUnlocked.push("consistent-athlete");
      newlyUnlocked.push(BADGES.find(b => b.id === "consistent-athlete")!);
    }

    // 7. Relentless Athlete
    if (!currentUnlocked.includes("relentless-athlete") && newHistory.length >= 5) {
      currentUnlocked.push("relentless-athlete");
      newlyUnlocked.push(BADGES.find(b => b.id === "relentless-athlete")!);
    }

    // Always update profile fields (streakCount, lastQuizDate, unlockedBadges) and save
    const updatedProfiles = profiles.map(p => {
      if (p.id === currentProfile.id) {
        return {
          ...p,
          unlockedBadges: currentUnlocked,
          streakCount: updatedStreak,
          lastQuizDate: updatedLastQuizDate
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    localStorage.setItem("sports_quiz_profiles", JSON.stringify(updatedProfiles));

    if (newlyUnlocked.length > 0) {
      setNewlyUnlockedBadges(newlyUnlocked);
    }
  };

  // Inspect source trigger to evaluate "Grounded Scholar" Badge
  const handleTabInspect = (tab: "chroma" | "search") => {
    setActiveTab(tab);
    if (tab === "chroma") setHasOpenedChroma(true);
    if (tab === "search") setHasOpenedSearch(true);

    // If both tabs have been inspected, unlock "grounding-scholar" badge!
    if (currentProfile && (hasOpenedChroma || tab === "chroma") && (hasOpenedSearch || tab === "search")) {
      const currentUnlocked = [...currentProfile.unlockedBadges];
      if (!currentUnlocked.includes("grounding-scholar")) {
        currentUnlocked.push("grounding-scholar");
        const updatedProfiles = profiles.map(p => {
          if (p.id === currentProfile.id) {
            return { ...p, unlockedBadges: currentUnlocked };
          }
          return p;
        });
        setProfiles(updatedProfiles);
        localStorage.setItem("sports_quiz_profiles", JSON.stringify(updatedProfiles));
        
        // Also show alert or push into newly unlocked so user sees it in result
        if (gameCompleted) {
          setNewlyUnlockedBadges(prev => [...prev, BADGES.find(b => b.id === "grounding-scholar")!]);
        }
      }
    }
  };

  // Copy helper
  const copyToClipboard = () => {
    if (!quiz) return;
    navigator.clipboard.writeText(quiz.rawSocialMediaText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const copyAppUrl = () => {
    const appUrl = window.location.href;
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Accent color mapping helpers
  const getAccentClass = (colorId?: string) => {
    const found = ACCENT_COLORS.find(c => c.id === colorId);
    return found || ACCENT_COLORS[0];
  };

  const activeAccent = getAccentClass(currentProfile?.avatarColor);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 pb-16">
      
      {/* MINIMALIST PREMIUM NAV HEADER */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${activeAccent.bg} text-white flex items-center justify-center shadow-xs`}>
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-display tracking-tight text-stone-950">
                  AI Sports Quiz Agent
                </h1>
                <span className="text-[10px] bg-stone-100 border border-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-mono font-medium">
                  v3.5
                </span>
              </div>
              <p className="text-[11px] text-stone-500 leading-none mt-0.5">
                Fact-Grounded Dynamic Sports Quizzes & Social Export
              </p>
            </div>
          </div>

          {/* Minimalist Profile & Navigation Tabs */}
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                id="tab-quiz"
                onClick={() => { setActiveView("quiz"); }}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition-all ${
                  activeView === "quiz" ? "bg-white text-stone-950 shadow-xs font-semibold" : "text-stone-500 hover:text-stone-950"
                }`}
              >
                Assemble Quiz
              </button>
              <button
                id="tab-profile"
                onClick={() => { setActiveView("profile"); }}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition-all ${
                  activeView === "profile" ? "bg-white text-stone-950 shadow-xs font-semibold" : "text-stone-500 hover:text-stone-950"
                }`}
              >
                My Profile
              </button>
              <button
                id="tab-leaderboard"
                onClick={() => { setActiveView("leaderboard"); }}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-md transition-all ${
                  activeView === "leaderboard" ? "bg-white text-stone-950 shadow-xs font-semibold" : "text-stone-500 hover:text-stone-950"
                }`}
              >
                Profiles List
              </button>
            </nav>

            {/* Quick Profile switcher dropdown */}
            {currentProfile && (
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 pl-2 pr-3 py-1 rounded-xl shadow-2xs">
                <span className="text-base leading-none">{currentProfile.avatarEmoji}</span>
                <div className="text-left leading-none max-w-[90px] truncate">
                  <p className="text-[10px] font-mono text-stone-400">ACTIVE</p>
                  <p className="text-xs font-bold text-stone-950 truncate mt-0.5">{currentProfile.username}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main app body */}
      <main className="max-w-6xl mx-auto px-6 mt-8">
        
        {/* SIGNUP MODAL / POPUP OVERLAY */}
        {showSignup && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl border border-stone-200 p-6 max-w-md w-full shadow-lg"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold font-display text-stone-950">
                  Create Athlete Profile
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Save your historical sports runs, badges, and accurate stats.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Username */}
                <div>
                  <label className="text-[10px] font-bold text-stone-500 font-mono uppercase block mb-1">
                    Athlete Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter athlete tag..."
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.slice(0, 15))}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-sm focus:outline-none focus:border-stone-400"
                  />
                </div>

                {/* Avatar Emojis */}
                <div>
                  <label className="text-[10px] font-bold text-stone-500 font-mono uppercase block mb-1.5">
                    Choose Mascot Avatar
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {AVATAR_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`text-xl p-1.5 rounded-lg border transition-all ${
                          selectedEmoji === emoji ? "border-stone-950 bg-stone-100 scale-110" : "border-stone-200 hover:bg-stone-50"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="text-[10px] font-bold text-stone-500 font-mono uppercase block mb-1.5">
                    Choose Accent Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setSelectedAccent(color.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all ${
                          selectedAccent === color.id ? "border-stone-900 bg-stone-50 ring-1 ring-stone-950" : "border-stone-250 hover:bg-stone-50"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${color.bg}`} />
                        <span>{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Sport */}
                <div>
                  <label className="text-[10px] font-bold text-stone-500 font-mono uppercase block mb-1">
                    Favorite Sport
                  </label>
                  <select
                    value={preferredSportInput}
                    onChange={(e) => setPreferredSportInput(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs focus:outline-none focus:border-stone-400"
                  >
                    {SPORTS.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Complete Button */}
                <button
                  disabled={!usernameInput.trim()}
                  onClick={handleCreateProfile}
                  className="w-full bg-stone-950 text-white rounded-xl py-3 text-xs font-semibold hover:bg-stone-850 disabled:bg-stone-200 disabled:text-stone-400 transition-all shadow-md mt-2 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Athlete Profile
                </button>

                {profiles.length > 0 && (
                  <button
                    onClick={() => setShowSignup(false)}
                    className="w-full text-center text-xs text-stone-500 hover:text-stone-900 py-1 transition-all"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* 1. QUIZ VIEW */}
        {activeView === "quiz" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main interactive column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* ASSEMBLE NEW QUIZ SETUP CARD */}
              {!gameStarted && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8"
                >
                  <div className="mb-6 pb-5 border-b border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 font-mono uppercase tracking-widest">
                      Dynamic Assembler
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-1">
                      Configure Sports Grounding
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Quizzes are cross-referenced with simulated vector storage and live web updates using Gemini Grounding.
                    </p>

                    {/* Mode selector tab */}
                    <div className="flex bg-stone-100 p-0.5 rounded-lg border border-stone-200 mt-4 max-w-sm">
                      <button
                        onClick={() => setQuizMode("standard")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                          quizMode === "standard" ? "bg-white text-stone-950 shadow-2xs font-semibold" : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        Standard Sports
                      </button>
                      <button
                        onClick={() => setQuizMode("themed")}
                        className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                          quizMode === "themed" ? "bg-white text-stone-950 shadow-2xs font-semibold" : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        Themed Packs
                      </button>
                    </div>
                  </div>

                  {/* Mode content - Standard */}
                  {quizMode === "standard" && (
                    <div className="flex flex-col gap-6">
                      {/* Sport picker */}
                      <div>
                        <h3 className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider mb-3">
                          1. Choose Sport Database
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {SPORTS.map((sport) => (
                            <button
                              key={sport.id}
                              onClick={() => setSelectedSport(sport.id)}
                              className={`p-3 rounded-xl border text-left transition-all relative ${
                                selectedSport === sport.id
                                  ? `border-stone-950 bg-stone-50 ring-1 ring-stone-950`
                                  : "border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              <span className="text-xl">{sport.emoji}</span>
                              <h4 className="font-semibold text-xs text-stone-900 mt-1.5">{sport.name}</h4>
                              <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">{sport.description}</p>
                              {selectedSport === sport.id && (
                                <span className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full ${activeAccent.bg} text-white flex items-center justify-center p-0.5 text-[8px]`}>
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Difficulty picker */}
                      <div>
                        <h3 className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider mb-3">
                          2. Set Challenge Level
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {DIFFICULTIES.map((diff) => (
                            <button
                              key={diff.id}
                              onClick={() => setSelectedDifficulty(diff.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                selectedDifficulty === diff.id
                                  ? `border-stone-950 bg-stone-50 ring-1 ring-stone-950`
                                  : "border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${diff.color}`}>
                                  {diff.name}
                                </span>
                                {selectedDifficulty === diff.id && (
                                  <span className={`w-3.5 h-3.5 rounded-full ${activeAccent.bg} text-white flex items-center justify-center p-0.5`}>
                                    <Check className="w-2.5 h-2.5" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-500 mt-1.5 leading-tight">{diff.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode content - Themed */}
                  {quizMode === "themed" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h3 className="text-xs font-bold text-stone-400 font-mono uppercase tracking-wider mb-3">
                          Select Curated Theme Quiz Pack
                        </h3>
                        <div className="flex flex-col gap-3">
                          {THEMED_PACKS.map((pack) => (
                            <button
                              key={pack.id}
                              onClick={() => setSelectedThemedPackId(pack.id)}
                              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 relative ${
                                selectedThemedPackId === pack.id
                                  ? `border-stone-950 bg-stone-50 ring-1 ring-stone-950`
                                  : "border-stone-200 hover:bg-stone-50"
                              }`}
                            >
                              <span className="text-2xl p-2 bg-stone-100 rounded-lg shrink-0">{pack.icon}</span>
                              <div className="pr-6">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs text-stone-950">{pack.title}</h4>
                                  <span className="text-[9px] font-mono border border-stone-200 px-1 py-0.2 rounded bg-white text-stone-600 uppercase">
                                    {pack.difficulty} Challenge
                                  </span>
                                </div>
                                <p className="text-[11px] text-stone-500 mt-1 leading-normal">{pack.description}</p>
                              </div>
                              {selectedThemedPackId === pack.id && (
                                <span className={`absolute top-4 right-4 w-4 h-4 rounded-full ${activeAccent.bg} text-white flex items-center justify-center p-0.5`}>
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Errors */}
                  {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mt-5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <h4 className="font-bold">Generation Failed</h4>
                        <p className="text-stone-600 mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Run / generate button */}
                  <div className="flex justify-between items-center gap-4 mt-8 pt-5 border-t border-stone-100">
                    <div className="text-left">
                      <p className="text-[10px] text-stone-400 font-mono">GROUNDING AGENT</p>
                      <p className="text-xs font-semibold text-stone-700">
                        Using standard Google Search and Chroma DB
                      </p>
                    </div>

                    <button
                      id="generate-quiz-btn"
                      onClick={handleGenerateQuiz}
                      className="bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Compile Grounded Quiz
                    </button>
                  </div>
                </motion.div>
              )}

              {/* DYNAMIC PIPELINE LOADING LOADER */}
              {loading && (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
                  {/* Circle animation */}
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-stone-100 rounded-full" />
                    <div className="absolute inset-0 border-2 border-t-stone-900 border-r-stone-900 rounded-full animate-spin" />
                    <Compass className="w-5 h-5 text-stone-700 animate-pulse" />
                  </div>

                  <div className="text-center mt-6">
                    <h3 className="font-bold font-display text-sm text-stone-950">
                      Assembling sports grounding context...
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                      PIPELINE EXECUTION RUNNING
                    </p>
                  </div>

                  {/* Status pipeline monitor */}
                  <div className="w-full max-w-sm bg-stone-50 border border-stone-200 rounded-xl p-3.5 mt-8 text-left">
                    <div className="flex justify-between text-[9px] font-mono text-stone-400 font-bold uppercase mb-2">
                      <span>Verification Steps</span>
                      <span>{agentStatusIndex + 1} / {AGENT_STATUSES.length}</span>
                    </div>

                    <div className="h-1 bg-stone-200 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-stone-950 transition-all duration-300"
                        style={{ width: `${((agentStatusIndex + 1) / AGENT_STATUSES.length) * 100}%` }}
                      />
                    </div>

                    <p className="text-[11px] font-medium font-mono text-stone-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                      {AGENT_STATUSES[agentStatusIndex]}
                    </p>
                  </div>
                </div>
              )}

              {/* ACTIVE INTERACTIVE QUIZ PLAYBACK */}
              {gameStarted && quiz && !gameCompleted && !loading && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                >
                  {/* Top game stats panel */}
                  <div className="border-b border-stone-100 bg-stone-50 px-6 py-4.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {quizMode === "standard" 
                          ? (SPORTS.find(s => s.id === selectedSport)?.emoji || "🏆")
                          : (THEMED_PACKS.find(p => p.id === selectedThemedPackId)?.icon || "🏆")
                        }
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-stone-950">
                          {quizMode === "standard" ? `${quiz.sport} Quiz` : quiz.themeTitle}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-mono uppercase font-bold mt-0.5 flex items-center gap-1.5">
                          <span>{quiz.difficulty} Difficulty</span>
                          {quiz.provider && (
                            <>
                              <span className="text-stone-300">•</span>
                              <span className="text-[9.5px] bg-stone-200/60 text-stone-600 px-1.5 py-0.5 rounded font-mono font-bold">
                                {quiz.provider}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
                        <Timer className="w-3.5 h-3.5 text-stone-400" />
                        <span className="text-[11px] font-bold font-mono text-stone-700">
                          {formatTime(timeElapsed)}
                        </span>
                      </div>

                      <div className="text-[10px] font-bold font-mono bg-stone-200/80 text-stone-800 px-2 py-1 rounded-lg">
                        Q: {currentQuestionIndex + 1}/{quiz.questions.length}
                      </div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="h-0.5 bg-stone-100 w-full">
                    <div
                      className="h-full bg-stone-900 transition-all duration-300"
                      style={{ width: `${(currentQuestionIndex / quiz.questions.length) * 100}%` }}
                    />
                  </div>

                  {quiz.isFallback && (
                    <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-[10.5px] text-amber-800 leading-snug">
                      <Flame className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                      <span>
                        <strong className="font-bold">Offline Fallback:</strong> {quiz.fallbackNotice || "High-Fidelity local database fallback active."}
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8 flex flex-col gap-6">
                    {/* The Question Text */}
                    <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl">
                      <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block mb-1">
                        Question {quiz.questions[currentQuestionIndex].questionNumber}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-stone-950 leading-relaxed">
                        {quiz.questions[currentQuestionIndex].question}
                      </h3>
                    </div>

                    {/* Multiple Choice Options */}
                    <div className="flex flex-col gap-2.5">
                      {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                        const letter = option.trim().charAt(0);
                        const isSelected = selectedOption === option;
                        const isCorrectAnswer = option.trim().startsWith(quiz.questions[currentQuestionIndex].correctAnswerLetter);

                        let btnStyle = "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300";
                        let keyStyle = "bg-stone-100 text-stone-500 border-stone-200";

                        if (isAnswerRevealed) {
                          if (isCorrectAnswer) {
                            btnStyle = "border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium";
                            keyStyle = "bg-emerald-500 text-white border-emerald-600";
                          } else if (isSelected) {
                            btnStyle = "border-rose-500 bg-rose-50/50 text-rose-950 font-medium";
                            keyStyle = "bg-rose-500 text-white border-rose-600";
                          } else {
                            btnStyle = "border-stone-100 bg-white text-stone-400 opacity-60";
                            keyStyle = "bg-stone-50 text-stone-300 border-stone-100";
                          }
                        } else if (isSelected) {
                          btnStyle = "border-stone-950 bg-stone-50 ring-1 ring-stone-950";
                          keyStyle = "bg-stone-950 text-white border-stone-950";
                        }

                        return (
                          <button
                            key={idx}
                            id={`option-btn-${letter}`}
                            onClick={() => handleOptionSelect(option)}
                            disabled={isAnswerRevealed}
                            className={`flex items-center gap-3.5 p-3.5 rounded-xl border text-left text-xs transition-all duration-150 relative ${btnStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-md border flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${keyStyle}`}>
                              {letter}
                            </span>
                            <span className="pr-6 font-medium leading-normal">{option.substring(3).trim() || option}</span>

                            {isAnswerRevealed && isCorrectAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-4 shrink-0" />
                            )}
                            {isAnswerRevealed && isSelected && !isCorrectAnswer && (
                              <XCircle className="w-4 h-4 text-rose-600 absolute right-4 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanatory Grounds Panel (Appears once answered) */}
                    <AnimatePresence>
                      {isAnswerRevealed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden mt-1"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <Database className="w-3.5 h-3.5 text-stone-500" />
                              <span className="text-[10px] font-mono font-bold text-stone-500 uppercase tracking-widest">
                                Fact Grounding Explanation
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed">
                              {quiz.questions[currentQuestionIndex].explanation}
                            </p>

                            <div className="mt-3.5 pt-3 border-t border-stone-200 flex flex-wrap items-center gap-2">
                              <span className="text-[9px] bg-stone-200 text-stone-600 font-semibold px-1.5 py-0.2 rounded font-mono">
                                GROUNDED SOURCE
                              </span>
                              <span className="text-[10px] text-stone-500 leading-none">
                                Cross-verified in live web index and offline local repository.
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom controls */}
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
                      {!isAnswerRevealed ? (
                        <button
                          onClick={handleCheckAnswer}
                          disabled={!selectedOption}
                          className={`text-xs font-semibold px-5 py-2.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all ${
                            selectedOption
                              ? "bg-stone-950 text-white hover:bg-stone-850"
                              : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none"
                          }`}
                        >
                          Check Answer
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          id="next-question-btn"
                          onClick={handleNextQuestion}
                          className="bg-stone-950 hover:bg-stone-850 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                        >
                          {currentQuestionIndex < quiz.questions.length - 1 ? "Next Question" : "Complete Quiz"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QUIZ COMPLETED SUMMARY SCOREBOARD */}
              {gameCompleted && quiz && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-900 mb-4 animate-bounce">
                    <Trophy className="w-6 h-6 text-stone-900" />
                  </div>

                  <h2 className="text-xl font-bold font-display text-stone-950">
                    Quiz Run Completed
                  </h2>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    Grounded Performance Scorecard
                  </p>

                  {/* Visual progress circles / stats */}
                  <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-6">
                    <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl flex flex-col items-center">
                      <span className="text-2xl font-black font-mono text-stone-950">
                        {score}/{quiz.questions.length}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mt-1">
                        Final Score
                      </span>
                    </div>

                    <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl flex flex-col items-center">
                      <span className="text-2xl font-black font-mono text-stone-950">
                        {formatTime(timeElapsed)}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest mt-1">
                        Time Elapsed
                      </span>
                    </div>
                  </div>

                  {/* Badge unblocked section */}
                  {newlyUnlockedBadges.length > 0 && (
                    <div className="w-full max-w-sm mt-5 bg-emerald-50/70 border border-emerald-200 text-emerald-950 rounded-xl p-4 text-left">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs font-mono uppercase mb-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Achievements Unlocked!
                      </div>
                      <div className="flex flex-col gap-2">
                        {newlyUnlockedBadges.map(badge => (
                          <div key={badge.id} className="flex gap-2.5 items-start">
                            <span className="text-xl shrink-0 mt-0.5">{badge.icon}</span>
                            <div>
                              <h5 className="font-bold text-xs text-stone-900">{badge.title}</h5>
                              <p className="text-[10px] text-stone-500">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback summary paragraph */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 max-w-sm w-full text-xs mt-4 text-stone-600 leading-normal text-left flex gap-3">
                    <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <div>
                      {score === quiz.questions.length ? (
                        <span>Perfect score! You truly understand the fine nuances and historical timelines of this sport. Perfect accuracy achieved.</span>
                      ) : score >= quiz.questions.length / 2 ? (
                        <span>Excellent result. Strong athlete level knowledge. Leverage the Grounded Sources panel below to master remaining details!</span>
                      ) : (
                        <span>Good attempt. Great learning run. Dive into the Grounded Sources panel below to review facts.</span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-8 pt-5 border-t border-stone-100">
                    <button
                      onClick={handleGenerateQuiz}
                      className="flex-1 bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                      Regenerate Quiz
                    </button>
                    <button
                      onClick={() => {
                        setGameStarted(false);
                        setGameCompleted(false);
                        setQuiz(null);
                      }}
                      className="flex-1 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-semibold py-3 rounded-xl transition-all"
                    >
                      New Topic Config
                    </button>
                  </div>
                </motion.div>
              )}

              {/* FACTUAL VERIFICATION SOURCES INSPECTOR */}
              {quiz && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                >
                  <div className="border-b border-stone-200 bg-stone-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-stone-400" />
                      <h4 className="font-bold text-xs text-stone-950 font-display">
                        Factual Grounding verification
                      </h4>
                    </div>

                    {/* Sources toggle tabs */}
                    <div className="flex bg-stone-200/60 p-0.5 rounded-lg border border-stone-200 self-start">
                      <button
                        onClick={() => handleTabInspect("chroma")}
                        className={`text-[9px] font-bold font-mono px-3 py-1 rounded-md transition-all uppercase ${
                          activeTab === "chroma" ? "bg-white text-stone-950 shadow-2xs font-bold" : "text-stone-500 hover:text-stone-950"
                        }`}
                      >
                        Chroma DB (Local)
                      </button>
                      <button
                        onClick={() => handleTabInspect("search")}
                        className={`text-[9px] font-bold font-mono px-3 py-1 rounded-md transition-all uppercase ${
                          activeTab === "search" ? "bg-white text-stone-950 shadow-2xs font-bold" : "text-stone-500 hover:text-stone-950"
                        }`}
                      >
                        Web Search (Live)
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === "chroma" && (
                      <div className="flex flex-col gap-4">
                        <p className="text-[11px] text-stone-500 leading-normal">
                          Retrieved verified historical database indices corresponding to sport of <strong>{quiz.sport}</strong>:
                        </p>

                        {quiz.localFacts && quiz.localFacts.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {quiz.localFacts.map((fact, idx) => (
                              <div key={idx} className="bg-stone-50 border border-stone-150 p-3 rounded-xl flex gap-2.5">
                                <span className={`text-[10px] bg-stone-150 text-stone-700 w-5 h-5 rounded-md flex items-center justify-center font-mono font-bold shrink-0 mt-0.5`}>
                                  {idx + 1}
                                </span>
                                <p className="text-[11px] text-stone-600 leading-relaxed">{fact}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-stone-400 italic">No historical facts available in local schema database.</p>
                        )}

                        {quiz.localRules && quiz.localRules.length > 0 && (
                          <div className="mt-2.5">
                            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block mb-1.5">
                              Standard Codified Rules
                            </span>
                            <ul className="list-disc list-inside text-[11px] text-stone-600 flex flex-col gap-1 pl-1">
                              {quiz.localRules.map((rule, idx) => (
                                <li key={idx} className="leading-relaxed">{rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "search" && (
                      <div className="flex flex-col gap-4">
                        {/* Search queries executed */}
                        {quiz.searchQueries && quiz.searchQueries.length > 0 && (
                          <div>
                            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block mb-2">
                              Executed Google Search Grounding Queries
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {quiz.searchQueries.map((query, idx) => (
                                <span key={idx} className="text-[10px] bg-stone-100 border border-stone-200 text-stone-600 px-2.5 py-0.5 rounded-md font-mono">
                                  "{query}"
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Citations */}
                        <div>
                          <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block mb-2">
                            Grounding Citation Logs
                          </span>

                          {quiz.sources && quiz.sources.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                              {quiz.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-stone-50 hover:bg-stone-100 border border-stone-150 p-3 rounded-xl flex items-center justify-between transition-all group"
                                >
                                  <div className="min-w-0 pr-2">
                                    <h5 className="font-semibold text-xs text-stone-900 truncate group-hover:text-stone-950">
                                      {source.title}
                                    </h5>
                                    <p className="text-[9px] text-stone-400 font-mono truncate mt-0.5">
                                      {source.uri}
                                    </p>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 shrink-0 transition-colors" />
                                </a>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-250 p-3 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span>Quiz relied heavily on historical database schema archives. No external web queries were dynamically compiled.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </div>

            {/* Right column: Social Sharing & Local score history */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* SOCIAL SHARING HUB */}
              {quiz && !loading && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                >
                  <div className="bg-stone-900 text-white p-5">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-xs font-display">Social Sharing Hub</h4>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 leading-normal">
                      Share your accuracy score, badges, and trivia achievements to social networks. Includes links back to this app!
                    </p>
                  </div>

                  <div className="p-4 flex flex-col gap-4">
                    {/* Visual share mockup card representing the achievement */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 relative overflow-hidden flex flex-col gap-3">
                      <div className="absolute right-3 top-3 opacity-10">
                        <Trophy className="w-16 h-16" />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{currentProfile?.avatarEmoji || "🦁"}</span>
                        <div>
                          <p className="text-[10px] font-bold text-stone-900">{currentProfile?.username || "Athlete"}</p>
                          <p className="text-[8px] font-mono text-stone-400 uppercase">Sports Trivia Champion</p>
                        </div>
                      </div>

                      <div className="border-t border-b border-stone-200/50 py-2.5">
                        <p className="text-xs font-bold text-stone-900 leading-tight">
                          🏆 Just scored {score}/{quiz.questions.length} on the {quiz.isThemedPack ? quiz.themeTitle : `${quiz.sport}`} Grounded Sports Quiz!
                        </p>
                        <p className="text-[10px] text-stone-500 mt-1">
                          Completed on {quiz.difficulty} difficulty in {formatTime(timeElapsed)}.
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
                        <span>Grounded Sports AI v3.5</span>
                        <span className="text-stone-700 underline font-semibold">Join the trivia</span>
                      </div>
                    </div>

                    {/* Quick copy direct copy block */}
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 bg-stone-900 hover:bg-stone-850 text-white font-semibold text-[11px] py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedText ? "Post Copied!" : "Copy Post Text"}
                      </button>
                      <button
                        onClick={copyAppUrl}
                        className="bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-semibold text-[11px] px-3.5 rounded-lg flex items-center gap-1.5 transition-all"
                        title="Copy App URL Link"
                      >
                        <Link className="w-3.5 h-3.5" />
                        {copiedLink ? "Copied Link!" : "Copy Link"}
                      </button>
                    </div>

                    {/* Direct Social links */}
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                          `🏆 Just scored ${score}/${quiz.questions.length} on the dynamic Grounded ${
                            quiz.isThemedPack ? quiz.themeTitle : quiz.sport
                          } Sports Quiz!\n\nCan you beat my high score? Take the challenge now:\n${window.location.href}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-stone-50 hover:bg-stone-100 border border-stone-200 p-2.5 rounded-xl text-center text-[10px] font-bold text-stone-700 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Twitter className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        Share on X
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-stone-50 hover:bg-stone-100 border border-stone-200 p-2.5 rounded-xl text-center text-[10px] font-bold text-stone-700 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        Facebook
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* QUICK HISTORICAL RUNS PREVIEW */}
              <div className="bg-white rounded-2xl border border-stone-200 p-4.5">
                <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-widest block mb-3.5">
                  Your Recent Quiz Runs
                </span>

                {activeProfileHistory.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {activeProfileHistory.slice(0, 4).map((item) => {
                      const pct = Math.round((item.score / item.totalQuestions) * 100);
                      return (
                        <div key={item.id} className="bg-stone-50 border border-stone-150 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <h5 className="font-bold text-stone-900 truncate">
                              {item.isThemedPack ? item.themeTitle : item.sport.charAt(0).toUpperCase() + item.sport.slice(1)}
                            </h5>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                              {item.timestamp} • {formatTime(item.timeElapsed)}
                            </p>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="font-mono font-bold text-stone-950">
                              {item.score}/{item.totalQuestions}
                            </span>
                            <span className={`text-[8px] font-bold font-mono px-1 rounded-sm mt-0.5 ${
                              pct >= 80 ? "text-emerald-700 bg-emerald-50" : pct >= 50 ? "text-amber-700 bg-amber-50" : "text-stone-500 bg-stone-100"
                            }`}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Award className="w-6 h-6 text-stone-300 stroke-1 mx-auto" />
                    <p className="text-[11px] text-stone-500 mt-1.5 font-medium">No quiz runs yet.</p>
                    <p className="text-[10px] text-stone-400 leading-normal mt-0.5 max-w-[170px] mx-auto">
                      Generate and complete your first quiz to log high scores!
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 2. PROFILE DASHBOARD VIEW */}
        {activeView === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left side: Profile summary card & visual stats */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {currentProfile ? (
                <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                  {/* Top Header Card */}
                  <div className={`p-6 text-left ${activeAccent.lightBg} border-b border-stone-200 relative`}>
                    <div className="absolute right-4 top-4">
                      <button
                        onClick={() => setShowSignup(true)}
                        className="text-[10px] font-bold bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 px-2.5 py-1 rounded-lg shadow-2xs transition-all uppercase font-mono"
                      >
                        Edit Profile
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-4xl bg-white w-14 h-14 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-center shrink-0">
                        {currentProfile.avatarEmoji}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-stone-950 truncate">
                          {currentProfile.username}
                        </h3>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5 uppercase font-semibold">
                          Mascot: {activeAccent.label}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-1">
                          Joined: {currentProfile.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile stats breakdown */}
                  <div className="p-5 flex flex-col gap-4">
                    {/* Daily Streak Highlight Banner */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center relative overflow-hidden">
                      <div className="absolute -right-2 -bottom-2 opacity-15 rotate-12">
                        <Flame className="w-16 h-16 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[10px] text-amber-800 font-mono font-bold uppercase tracking-wide flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                          Active Daily Streak
                        </p>
                        <h4 className="text-2xl font-black font-mono text-stone-950 mt-1 flex items-baseline gap-1">
                          {currentProfile.streakCount || 0}
                          <span className="text-xs font-semibold text-amber-800">
                            {(currentProfile.streakCount || 0) === 1 ? "day" : "days"}
                          </span>
                        </h4>
                        <p className="text-[10px] text-amber-700 mt-1 leading-normal">
                          {(currentProfile.streakCount || 0) > 0
                            ? "Awesome! Keep your streak alive tomorrow."
                            : "Complete a quiz today to start your streak!"}
                        </p>
                      </div>
                      <div className="shrink-0 bg-white/70 border border-amber-200 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-2xs">
                        🔥
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block mt-1">
                      Athlete Metric Overview
                    </span>

                    {/* Total stats counters */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
                        <p className="text-[10px] text-stone-400 font-mono font-semibold uppercase">Completed Runs</p>
                        <p className="text-xl font-black font-mono text-stone-900 mt-1">{activeProfileHistory.length}</p>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
                        <p className="text-[10px] text-stone-400 font-mono font-semibold uppercase">Avg Accuracy</p>
                        <p className="text-xl font-black font-mono text-stone-900 mt-1">
                          {activeProfileHistory.length > 0 
                            ? `${Math.round(
                                (activeProfileHistory.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / activeProfileHistory.length) * 100
                              )}%`
                            : "0%"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
                        <p className="text-[10px] text-stone-400 font-mono font-semibold uppercase">Total Correct</p>
                        <p className="text-xl font-black font-mono text-stone-900 mt-1">
                          {activeProfileHistory.reduce((acc, curr) => acc + curr.score, 0)} pts
                        </p>
                      </div>

                      <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl">
                        <p className="text-[10px] text-stone-400 font-mono font-semibold uppercase">Total Time</p>
                        <p className="text-xl font-black font-mono text-stone-900 mt-1">
                          {formatTime(activeProfileHistory.reduce((acc, curr) => acc + curr.timeElapsed, 0))}
                        </p>
                      </div>
                    </div>

                    {/* Favorite Sport Stat */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-stone-400 font-mono font-semibold uppercase">Favorite Database</p>
                        <p className="text-xs font-bold text-stone-800 mt-0.5">
                          {currentProfile.preferredSport.charAt(0).toUpperCase() + currentProfile.preferredSport.slice(1)}
                        </p>
                      </div>
                      <span className="text-2xl">
                        {SPORTS.find(s => s.id === currentProfile.preferredSport)?.emoji || "⚽"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteProfile(currentProfile.id)}
                      className="text-[10px] font-bold text-red-600 hover:text-red-800 transition-colors uppercase font-mono py-1.5 self-center"
                    >
                      Delete Athlete Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center">
                  <p className="text-xs text-stone-500">Please choose or configure an active profile.</p>
                </div>
              )}

            </div>

            {/* Right side: Badge drawer cabinet & comprehensive history */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* ACCUMULATED BADGES BLOCK */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <div className="mb-4 pb-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-stone-950 font-display flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-stone-700" />
                      Locked & Unlocked Badges
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Unlocking badges triggers real-time performance milestones during quiz runs.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md border border-stone-200">
                    Unlocked: {currentProfile?.unlockedBadges.length || 0} / {BADGES.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {BADGES.map((badge) => {
                    const isUnlocked = currentProfile?.unlockedBadges.includes(badge.id);
                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-xl border flex gap-3.5 transition-all ${
                          isUnlocked 
                            ? `${badge.color} ring-1 ring-stone-950/5` 
                            : "bg-stone-50/50 border-stone-150 text-stone-400 opacity-60"
                        }`}
                      >
                        <span className={`text-2xl p-1.5 rounded-lg shrink-0 ${isUnlocked ? "bg-white/90 shadow-2xs" : "bg-stone-100 filter grayscale"}`}>
                          {badge.icon}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-stone-900">{badge.title}</h4>
                            {!isUnlocked && <Lock className="w-2.5 h-2.5 text-stone-400 shrink-0" />}
                          </div>
                          <p className={`text-[10px] mt-0.5 leading-normal ${isUnlocked ? "text-stone-700" : "text-stone-400"}`}>
                            {badge.description}
                          </p>
                          <span className={`text-[9px] font-mono mt-1.5 block ${isUnlocked ? "text-stone-500" : "text-stone-400 italic"}`}>
                            Requirement: {badge.requirement}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPREHENSIVE PERSONAL HISTORY LOG */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest block mb-4">
                  All Logged Quiz Runs
                </span>

                {activeProfileHistory.length > 0 && (
                  <div className="relative mb-5">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search history by sport or theme title..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 pl-9.5 pr-8 py-2.5 rounded-xl text-xs font-medium placeholder-stone-450 focus:outline-none focus:border-stone-400 focus:bg-white transition-all shadow-2xs text-stone-900"
                    />
                    {historySearchQuery && (
                      <button
                        onClick={() => setHistorySearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {activeProfileHistory.length > 0 ? (
                  (() => {
                    const filteredHistory = activeProfileHistory.filter((item) => {
                      const sportText = (item.sport || "").toLowerCase();
                      const themeText = (item.themeTitle || "").toLowerCase();
                      const query = historySearchQuery.toLowerCase().trim();
                      return sportText.includes(query) || themeText.includes(query);
                    });

                    if (filteredHistory.length > 0) {
                      return (
                        <div className="flex flex-col gap-2">
                          {filteredHistory.map((item) => {
                            const pct = Math.round((item.score / item.totalQuestions) * 100);
                            return (
                              <div
                                key={item.id}
                                className="bg-stone-50 border border-stone-150 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-stone-950">
                                      {item.isThemedPack ? item.themeTitle : item.sport.charAt(0).toUpperCase() + item.sport.slice(1)}
                                    </span>
                                    <span className="text-[9px] font-mono bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded font-bold uppercase">
                                      {item.difficulty}
                                    </span>
                                    {item.isThemedPack && (
                                      <span className="text-[9px] font-mono bg-violet-100 text-violet-800 px-1.5 py-0.2 rounded font-bold uppercase">
                                        Themed
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-stone-400 font-mono mt-1">
                                    Completed: {item.timestamp} • Time elapsed: {formatTime(item.timeElapsed)}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 self-end sm:self-auto">
                                  <span className="text-xs font-mono text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded font-bold">
                                    {item.score} / {item.totalQuestions} pts
                                  </span>
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                    pct >= 80 ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : pct >= 50 ? "text-amber-700 bg-amber-50 border border-amber-100" : "text-stone-500 bg-stone-100 border border-stone-200"
                                  }`}>
                                    {pct}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="py-8 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
                          <Search className="w-6 h-6 text-stone-300 stroke-1 mx-auto mb-2" />
                          <p className="text-xs text-stone-500">No matching quiz runs found.</p>
                          <p className="text-[10px] text-stone-400 max-w-[200px] mx-auto mt-0.5">
                            Try searching with another keyword or sport name.
                          </p>
                          <button
                            onClick={() => setHistorySearchQuery("")}
                            className="mt-3 text-[10px] font-bold text-stone-900 bg-white border border-stone-200 px-3 py-1 rounded-lg hover:bg-stone-50 transition-all shadow-3xs"
                          >
                            Clear Search
                          </button>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="w-8 h-8 text-stone-300 stroke-1 mx-auto mb-2" />
                    <p className="text-xs text-stone-500">No trivia runs registered.</p>
                    <p className="text-[10px] text-stone-400 max-w-sm mx-auto mt-0.5">
                      Trigger some quizzes from the "Assemble Quiz" tab. Finished attempts will populate here.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        )}

        {/* 3. PROFILES / LEADERBOARD VIEW */}
        {activeView === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 max-w-3xl mx-auto"
          >
            <div className="mb-6 pb-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-stone-950 flex items-center gap-2">
                  <Users className="w-5 h-5 text-stone-700" />
                  Athlete Profiles List
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage multiple browser profiles, review cumulative correct answers, and switch active players.
                </p>
              </div>

              <button
                onClick={() => setShowSignup(true)}
                className="bg-stone-950 hover:bg-stone-850 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-xs flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                New Profile
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {profiles.map((profile, index) => {
                const isSelected = profile.id === activeProfileId;
                const hist = JSON.parse(localStorage.getItem(`history_${profile.id}`) || "[]") as QuizHistoryItem[];
                
                // Stats details
                const totalRuns = hist.length;
                const totalCorrect = hist.reduce((acc, curr) => acc + curr.score, 0);
                const averageAccuracy = totalRuns > 0 
                  ? Math.round((hist.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / totalRuns) * 100)
                  : 0;

                const profileAccent = getAccentClass(profile.avatarColor);

                return (
                  <div
                    key={profile.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                      isSelected 
                        ? `border-stone-950 bg-stone-50 ring-1 ring-stone-950`
                        : "border-stone-200 hover:bg-stone-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="text-2xl bg-white w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center shrink-0 shadow-2xs">
                        {profile.avatarEmoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-stone-950">{profile.username}</h4>
                          {isSelected && (
                            <span className="text-[8px] font-mono bg-stone-900 text-white px-1 py-0.2 rounded font-bold uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 mt-0.5 font-mono">
                          Fav: {profile.preferredSport.toUpperCase()} • Joined {profile.createdAt}
                        </p>
                      </div>
                    </div>

                    {/* Performance summaries */}
                    <div className="flex items-center gap-4.5">
                      <div className="text-center font-mono">
                        <p className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-wider">Runs</p>
                        <p className="font-bold text-xs text-stone-900 mt-0.5">{totalRuns}</p>
                      </div>

                      <div className="text-center font-mono">
                        <p className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-wider">Correct</p>
                        <p className="font-bold text-xs text-stone-900 mt-0.5">{totalCorrect}</p>
                      </div>

                      <div className="text-center font-mono">
                        <p className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-wider">Avg Acc</p>
                        <p className="font-bold text-xs text-stone-900 mt-0.5">{averageAccuracy}%</p>
                      </div>

                      <div className="text-center font-mono">
                        <p className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-wider">Badges</p>
                        <p className="font-bold text-xs text-stone-900 mt-0.5">🏅 {profile.unlockedBadges.length}</p>
                      </div>

                      <div className="text-center font-mono">
                        <p className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-wider">Streak</p>
                        <p className="font-bold text-xs text-amber-600 mt-0.5">🔥 {profile.streakCount || 0}</p>
                      </div>
                    </div>

                    {/* Switch/delete actions */}
                    <div className="flex gap-2 self-end sm:self-auto">
                      {!isSelected ? (
                        <button
                          onClick={() => handleSwitchProfile(profile.id)}
                          className="bg-stone-900 hover:bg-stone-800 text-white font-semibold text-[10px] px-3.5 py-1.5 rounded-lg transition-all"
                        >
                          Switch Active
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-mono italic px-3.5">
                          Active profile
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </motion.div>
        )}

      </main>

    </div>
  );
}
