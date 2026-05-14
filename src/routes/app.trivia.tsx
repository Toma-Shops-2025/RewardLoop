import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Brain, Timer, Flame, Trophy, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { supabase } from "@/integrations/supabase/client";
import { fireConfetti } from "@/lib/confetti";

export const Route = createFileRoute("/app/trivia")({ component: Trivia });

type Category = "all" | "sports" | "movies" | "gaming" | "tech" | "music" | "general";
type Q = { q: string; a: string[]; correct: number; cat: Exclude<Category, "all"> };

const POOL: Q[] = [
  // Sports
  { cat: "sports", q: "How many players are on a soccer team on the field?", a: ["9", "10", "11", "12"], correct: 2 },
  { cat: "sports", q: "In which sport is the term 'love' used for zero?", a: ["Tennis", "Golf", "Cricket", "Bowling"], correct: 0 },
  { cat: "sports", q: "How many rings are on the Olympic flag?", a: ["4", "5", "6", "7"], correct: 1 },
  { cat: "sports", q: "Which country invented basketball?", a: ["USA", "Canada", "UK", "France"], correct: 0 },
  { cat: "sports", q: "How long is a marathon (in km, rounded)?", a: ["32", "38", "42", "50"], correct: 2 },
  { cat: "sports", q: "Who has won the most Formula 1 World Championships (tied)?", a: ["Senna", "Schumacher & Hamilton", "Vettel", "Prost"], correct: 1 },
  // Movies
  { cat: "movies", q: "Who directed 'Inception'?", a: ["Steven Spielberg", "Christopher Nolan", "James Cameron", "Ridley Scott"], correct: 1 },
  { cat: "movies", q: "What year did 'Titanic' release?", a: ["1995", "1996", "1997", "1998"], correct: 2 },
  { cat: "movies", q: "Which studio created 'Toy Story'?", a: ["DreamWorks", "Pixar", "Illumination", "Disney"], correct: 1 },
  { cat: "movies", q: "What is the highest-grossing film of all time?", a: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars VII"], correct: 0 },
  { cat: "movies", q: "Who played Jack Sparrow?", a: ["Brad Pitt", "Johnny Depp", "Orlando Bloom", "Will Smith"], correct: 1 },
  { cat: "movies", q: "Which film won Best Picture in 2020?", a: ["Joker", "1917", "Parasite", "The Irishman"], correct: 2 },
  // Gaming
  { cat: "gaming", q: "What does 'PvP' mean?", a: ["Pay vs Pay", "Player vs Player", "Public vs Private", "Power vs Power"], correct: 1 },
  { cat: "gaming", q: "Which company makes the PlayStation?", a: ["Nintendo", "Microsoft", "Sony", "Sega"], correct: 2 },
  { cat: "gaming", q: "What is the best-selling video game of all time?", a: ["Tetris", "Minecraft", "GTA V", "Wii Sports"], correct: 1 },
  { cat: "gaming", q: "What does 'RPG' stand for?", a: ["Real Player Game", "Role Playing Game", "Random Player Group", "Rapid Play Genre"], correct: 1 },
  { cat: "gaming", q: "Which character is Nintendo's mascot?", a: ["Link", "Mario", "Kirby", "Yoshi"], correct: 1 },
  { cat: "gaming", q: "Which studio created The Witcher 3?", a: ["Bethesda", "CD Projekt Red", "BioWare", "Ubisoft"], correct: 1 },
  // Tech
  { cat: "tech", q: "What does 'Wi-Fi' technically stand for?", a: ["Wireless Fidelity", "Nothing — it's a marketing term", "Web Find", "Wide Frequency"], correct: 1 },
  { cat: "tech", q: "Who co-founded Apple alongside Steve Jobs?", a: ["Bill Gates", "Steve Wozniak", "Tim Cook", "Paul Allen"], correct: 1 },
  { cat: "tech", q: "Which language runs in a web browser natively?", a: ["Java", "Python", "JavaScript", "Ruby"], correct: 2 },
  { cat: "tech", q: "What does 'HTTP' stand for?", a: ["HyperText Transfer Protocol", "High Tech Test Page", "Home Tool Transfer Path", "Hyper Type Text"], correct: 0 },
  { cat: "tech", q: "Which company developed Android?", a: ["Apple", "Google", "Microsoft", "Samsung"], correct: 1 },
  { cat: "tech", q: "What does 'SSD' stand for?", a: ["Solid State Drive", "Super Speed Disk", "Storage System Drive", "Smart Save Device"], correct: 0 },
  // Music
  { cat: "music", q: "Which band performed 'Bohemian Rhapsody'?", a: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"], correct: 1 },
  { cat: "music", q: "How many strings does a standard guitar have?", a: ["4", "5", "6", "7"], correct: 2 },
  { cat: "music", q: "Who is known as the 'King of Pop'?", a: ["Elvis Presley", "Michael Jackson", "Prince", "David Bowie"], correct: 1 },
  { cat: "music", q: "Which instrument has 88 keys?", a: ["Organ", "Accordion", "Piano", "Harpsichord"], correct: 2 },
  { cat: "music", q: "Beyoncé was a member of which group?", a: ["Spice Girls", "Destiny's Child", "TLC", "En Vogue"], correct: 1 },
  // General
  { cat: "general", q: "How many continents are there?", a: ["5", "6", "7", "8"], correct: 2 },
  { cat: "general", q: "What is the largest planet in our solar system?", a: ["Saturn", "Jupiter", "Neptune", "Earth"], correct: 1 },
  { cat: "general", q: "Which is the longest river in the world?", a: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
  { cat: "general", q: "What's the chemical symbol for gold?", a: ["Go", "Gd", "Au", "Ag"], correct: 2 },
  { cat: "general", q: "Mount Everest is on the border of Nepal and which other country?", a: ["India", "China", "Bhutan", "Pakistan"], correct: 1 },
  { cat: "general", q: "What is the smallest country in the world?", a: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2 },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sports", label: "Sports" },
  { id: "movies", label: "Movies" },
  { id: "gaming", label: "Gaming" },
  { id: "tech", label: "Tech" },
  { id: "music", label: "Music" },
  { id: "general", label: "General" },
];

const TIMER_SECS = 15;
const QUESTIONS_PER_DAY = 10;

// Deterministic daily rotation: same questions for everyone today, different tomorrow.
function dailyKey() {
  const d = new Date();
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function pickDailyQuestions(cat: Category): Q[] {
  const pool = cat === "all" ? POOL : POOL.filter((p) => p.cat === cat);
  const rand = mulberry32(dailyKey() + cat.length * 31);
  // Fisher-Yates shuffle, take N
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(QUESTIONS_PER_DAY, arr.length));
}

function Trivia() {
  const navigate = useNavigate();
  const { refresh } = useApp();
  const [cat, setCat] = useState<Category>("all");
  const [streak, setStreak] = useState(0);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECS);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const todaysQuestions = useMemo(() => pickDailyQuestions(cat), [cat]);
  const q = todaysQuestions[idx % todaysQuestions.length];

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resetTimer = () => {
    setTimeLeft(TIMER_SECS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPicked(-1);
          setStreak(0);
          toast("Time's up — try the next one");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx, cat]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextQ = () => {
    setIdx((i) => (i + 1) % todaysQuestions.length);
    setPicked(null);
  };

  const switchCat = (c: Category) => {
    setCat(c);
    setIdx(0);
    setPicked(null);
  };

  const choose = async (i: number) => {
    if (picked !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setPicked(i);
    if (i === q.correct) {
      const bonus = streak >= 2 ? 5 : 0;
      setBusy(true);
      const { error } = await supabase.rpc("claim_trivia_reward");
      setBusy(false);
      if (error) {
        toast.error(error.message);
        setStreak(0);
      } else {
        setStreak((s) => s + 1);
        fireConfetti(35);
        toast.success(`+15 points${bonus ? ` · streak bonus +${bonus}!` : ""}`);
        await refresh();
      }
    } else {
      setStreak(0);
      toast("Not quite — try the next one");
    }
  };

  return (
    <div className="bg-background min-h-full pb-12">
      <header className="brand-header px-5 py-5 flex items-center gap-4">
        <button onClick={() => navigate({ to: "/app" })} aria-label="Back" className="text-brand-foreground"><ArrowLeft className="h-6 w-6" /></button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-brand-foreground">Trivia</h1>
          <p className="text-xs text-brand-foreground/80 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Daily set · refreshes every 24h
          </p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 bg-card/20 rounded-full px-3 py-1">
            <Flame className="h-4 w-4 text-warning flame-pulse" />
            <span className="text-sm font-extrabold text-brand-foreground">{streak}</span>
          </div>
        )}
      </header>

      <nav className="px-3 pt-4 overflow-x-auto">
        <ul className="flex gap-2 min-w-max">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <button onClick={() => switchCat(c.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
                  cat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                }`}>
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="px-5 mt-5">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-semibold">
            Question {(idx % todaysQuestions.length) + 1} of {todaysQuestions.length}
          </span>
          <span className="text-muted-foreground tabular-nums">{timeLeft}s</span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${timeLeft <= 5 ? "bg-destructive" : "bg-brand"}`}
              style={{ width: `${(timeLeft / TIMER_SECS) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 card-shadow text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-brand" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{q.cat}</span>
          </div>
          <p className="font-bold text-lg">{q.q}</p>
        </div>

        <ul className="mt-5 space-y-2">
          {q.a.map((opt, i) => {
            const state =
              picked === null ? "border-border" :
              i === q.correct ? "border-success bg-success/10 reward-pop" :
              picked === i ? "border-destructive bg-destructive/10" : "opacity-50 border-border";
            return (
              <li key={i}>
                <button onClick={() => choose(i)} disabled={picked !== null || busy}
                  className={`w-full text-left bg-card border-2 rounded-xl p-4 font-semibold text-sm transition active:scale-[0.99] ${state}`}>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>

        {picked !== null && (
          <button onClick={nextQ} className="pill-btn bg-primary text-primary-foreground w-full mt-5 flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4" /> Next question
          </button>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Answer 3 in a row for a streak bonus. New questions every day. Trivia is for entertainment only.
        </p>
      </section>
    </div>
  );
}
