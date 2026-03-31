// WeeklyInsights — AI-generated nutrition analysis card
import { useState } from "react";
import { HiOutlineLightBulb, HiOutlineRefresh } from "react-icons/hi";
import api from "../services/api";

export default function WeeklyInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchInsights() {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/ai/insights");
      setInsights(res.data?.data);
    } catch (err) {
      setError("Failed to generate insights. Try again!");
    } finally {
      setLoading(false);
    }
  }

  const data = insights;
  const isRaw = !!data?.raw;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <HiOutlineLightBulb className="text-xl text-violet-500" />
          <h3 className="font-bold text-slate-800 dark:text-white">Weekly AI Insights</h3>
        </div>
        <button
          id="get-insights"
          onClick={fetchInsights}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiOutlineRefresh className="text-lg" />
          )}
          Analyze
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      {!insights && !loading && !error && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Click "Analyze" to get AI insights on your weekly nutrition
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="shimmer h-16 rounded-xl" />
          <div className="shimmer h-20 rounded-xl" />
          <div className="shimmer h-12 rounded-xl" />
        </div>
      )}

      {data && !isRaw && (
        <div className="space-y-4 animate-fade-in">
          {/* Health Score */}
          {data.score != null && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-500/10 to-cyan-500/10 border border-brand-500/20">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(data.score / 100) * 176} 176`}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute text-lg font-bold text-gradient">{data.score}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">Health Score</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Based on this week's nutrition</p>
              </div>
            </div>
          )}

          {/* Summary */}
          {data.summary && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{data.summary}</p>
          )}

          {/* Strengths */}
          {data.strengths?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">✅ Strengths</h4>
              <ul className="space-y-1.5">
                {data.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {data.improvements?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">📈 Areas to Improve</h4>
              <ul className="space-y-1.5">
                {data.improvements.map((s, i) => (
                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          {data.encouragement && (
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30">
              <p className="text-sm text-violet-700 dark:text-violet-400">🌟 {data.encouragement}</p>
            </div>
          )}
        </div>
      )}

      {/* Raw response fallback */}
      {isRaw && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-900/50 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {data.raw}
        </div>
      )}
    </div>
  );
}
