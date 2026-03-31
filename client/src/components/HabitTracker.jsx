// HabitTracker — Streak display with goal progress bars
import { useState, useEffect } from "react";
import { HiOutlineFire, HiOutlinePencilAlt, HiOutlineCheck } from "react-icons/hi";
import api from "../services/api";

export default function HabitTracker({ todayStats = {} }) {
  const [goals, setGoals] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    try {
      const res = await api.get("/goals");
      setGoals(res.data?.data);
      setEditValues(res.data?.data || {});
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  }

  async function saveGoals() {
    try {
      await api.put("/goals", {
        caloriesTarget: Number(editValues.caloriesTarget),
        proteinTarget: Number(editValues.proteinTarget),
        carbsTarget: Number(editValues.carbsTarget),
        fatTarget: Number(editValues.fatTarget),
      });
      setGoals({ ...goals, ...editValues });
      setEditing(false);
    } catch (err) {
      console.error("Failed to save goals:", err);
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="shimmer h-8 w-40 rounded-lg mb-4" />
        <div className="shimmer h-24 rounded-xl mb-3" />
        <div className="space-y-3">
          <div className="shimmer h-12 rounded-lg" />
          <div className="shimmer h-12 rounded-lg" />
        </div>
      </div>
    );
  }

  const streak = goals?.streakDays || 0;
  const progressItems = [
    {
      label: "Calories",
      current: todayStats.calories || 0,
      target: goals?.caloriesTarget || 2000,
      unit: "kcal",
      color: "from-emerald-500 to-green-400",
      key: "caloriesTarget",
    },
    {
      label: "Protein",
      current: todayStats.protein || 0,
      target: goals?.proteinTarget || 100,
      unit: "g",
      color: "from-blue-500 to-cyan-400",
      key: "proteinTarget",
    },
    {
      label: "Carbs",
      current: todayStats.carbs || 0,
      target: goals?.carbsTarget || 250,
      unit: "g",
      color: "from-amber-500 to-yellow-400",
      key: "carbsTarget",
    },
    {
      label: "Fat",
      current: todayStats.fat || 0,
      target: goals?.fatTarget || 65,
      unit: "g",
      color: "from-red-500 to-orange-400",
      key: "fatTarget",
    },
  ];

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <HiOutlineFire className="text-xl text-orange-500" />
          <h3 className="font-bold text-slate-800 dark:text-white">Goals & Streaks</h3>
        </div>
        <button
          id="edit-goals"
          onClick={() => {
            if (editing) saveGoals();
            else setEditing(true);
          }}
          className="btn-ghost flex items-center gap-1.5 text-sm"
        >
          {editing ? (
            <>
              <HiOutlineCheck className="text-lg text-brand-500" />
              Save
            </>
          ) : (
            <>
              <HiOutlinePencilAlt className="text-lg" />
              Edit
            </>
          )}
        </button>
      </div>

      {/* Streak Banner */}
      <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 mb-5">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🔥</div>
          <div>
            <div className="text-3xl font-extrabold text-gradient-warm">{streak}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {streak === 0 ? "Start your streak today!" : streak === 1 ? "day streak — keep going!" : "day streak — you're on fire!"}
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-orange-500/5" />
        <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-amber-500/5" />
      </div>

      {/* Goal Progress Bars */}
      <div className="space-y-4">
        {progressItems.map((item) => {
          const pct = Math.min((item.current / item.target) * 100, 100);
          const isOver = item.current > item.target;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {item.label}
                </span>
                {editing ? (
                  <input
                    type="number"
                    value={editValues[item.key] || ""}
                    onChange={(e) => setEditValues({ ...editValues, [item.key]: e.target.value })}
                    className="w-20 text-right text-sm bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                ) : (
                  <span className={`text-sm font-semibold ${isOver ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}>
                    {Math.round(item.current)} / {item.target} {item.unit}
                  </span>
                )}
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-surface-900 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
