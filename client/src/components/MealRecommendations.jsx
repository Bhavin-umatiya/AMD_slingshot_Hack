// MealRecommendations — AI-powered meal suggestion cards
import { useState } from "react";
import { HiOutlineSparkles, HiOutlineRefresh, HiOutlinePlus } from "react-icons/hi";
import api from "../services/api";

export default function MealRecommendations({ onAddMeal }) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchRecommendations() {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/ai/recommend");
      setRecommendations(res.data?.data);
    } catch (err) {
      setError("Failed to get recommendations. Try again!");
    } finally {
      setLoading(false);
    }
  }

  const data = recommendations;
  const meals = data?.meals || [];
  const isRaw = !!data?.raw;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <HiOutlineSparkles className="text-xl text-amber-500" />
          <h3 className="font-bold text-slate-800 dark:text-white">AI Meal Recommendations</h3>
        </div>
        <button
          id="get-recommendations"
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiOutlineRefresh className="text-lg" />
          )}
          {recommendations ? "Refresh" : "Get Suggestions"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 text-sm mb-4">
          {error}
        </div>
      )}

      {!recommendations && !loading && !error && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Click "Get Suggestions" to receive AI-personalized meal ideas
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-24 rounded-xl" />
          ))}
        </div>
      )}

      {/* Greeting */}
      {data?.greeting && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 italic">"{data.greeting}"</p>
      )}

      {/* Meals */}
      {meals.length > 0 && (
        <div className="space-y-3">
          {meals.map((meal, i) => (
            <div
              key={i}
              className="group p-4 rounded-2xl bg-slate-50 dark:bg-surface-900/50 border border-slate-100 dark:border-slate-700/50 hover:border-brand-500/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{meal.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{meal.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge-green">{meal.calories} kcal</span>
                    <span className="badge-blue">P: {meal.protein}g</span>
                    <span className="badge-orange">C: {meal.carbs}g</span>
                    <span className="badge-red">F: {meal.fat}g</span>
                  </div>
                  {meal.reason && (
                    <p className="text-xs text-brand-600 dark:text-brand-400 mt-2">💡 {meal.reason}</p>
                  )}
                </div>
                <button
                  onClick={() =>
                    onAddMeal?.({
                      foodName: meal.name,
                      calories: meal.calories,
                      protein: meal.protein,
                      carbs: meal.carbs,
                      fat: meal.fat,
                      aiSuggested: true,
                    })
                  }
                  className="ml-3 p-2 rounded-xl opacity-0 group-hover:opacity-100 bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-500/20 transition-all"
                  title="Add to food log"
                >
                  <HiOutlinePlus className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw response fallback */}
      {isRaw && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-900/50 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
          {data.raw}
        </div>
      )}

      {/* Tip */}
      {data?.tip && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <p className="text-sm text-amber-700 dark:text-amber-400">💡 {data.tip}</p>
        </div>
      )}
    </div>
  );
}
