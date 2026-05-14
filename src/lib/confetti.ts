// Lightweight DOM confetti — no deps.
const COLORS = ["#ff7a00", "#ffb74d", "#ffd54f", "#ffffff", "#1f2937", "#f97316"];

export function fireConfetti(count = 60) {
  if (typeof document === "undefined") return;
  const root = document.body;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "confetti-piece";
    const left = Math.random() * 100;
    const dx = (Math.random() - 0.5) * 320;
    const delay = Math.random() * 0.25;
    el.style.left = `${left}vw`;
    el.style.background = COLORS[i % COLORS.length];
    el.style.setProperty("--dx", `${dx}px`);
    el.style.animationDelay = `${delay}s`;
    el.style.borderRadius = Math.random() > 0.5 ? "2px" : "50%";
    root.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }
}
