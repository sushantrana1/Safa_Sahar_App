export const BADGE_STYLES = {
  Bronze: {
    chip: "bg-amber-100 text-amber-800 border border-amber-200",
    text: "text-amber-700",
    bg: "bg-amber-500",
  },
  Silver: {
    chip: "bg-slate-100 text-slate-700 border border-slate-200",
    text: "text-slate-700",
    bg: "bg-slate-400",
  },
  Gold: {
    chip: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    text: "text-yellow-700",
    bg: "bg-yellow-500",
  },
  Platinum: {
    chip: "bg-primary-100 text-primary-800 border border-primary-200",
    text: "text-primary-700",
    bg: "bg-primary-500",
  },
};

export const badgeStyle = (name) => BADGE_STYLES[name] || BADGE_STYLES.Bronze;

// Progress to next tier
export const tierProgress = (points, current, next) => {
  if (!next) return { pct: 100, remaining: 0 };
  const range = next.min - current.min;
  const progress = points - current.min;
  return {
    pct: Math.min(100, Math.round((progress / range) * 100)),
    remaining: Math.max(0, next.min - points),
  };
};