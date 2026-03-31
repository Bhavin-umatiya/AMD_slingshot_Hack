// FoodLogForm — Modal form to log food manually with macro inputs
import { useState } from "react";
import { HiOutlineX, HiOutlinePlus } from "react-icons/hi";
import api from "../services/api";

const mealTypes = [
  { value: "breakfast", label: "🌅 Breakfast" },
  { value: "lunch", label: "🌞 Lunch" },
  { value: "dinner", label: "🌙 Dinner" },
  { value: "snack", label: "🍿 Snack" },
];

export default function FoodLogForm({ isOpen, onClose, onLogAdded }) {
  const [formData, setFormData] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    mealType: "snack",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.foodName || !formData.calories) {
      setError("Food name and calories are required");
      return;
    }

    setLoading(true);
    try {
      await api.post("/food-logs", {
        ...formData,
        calories: Number(formData.calories),
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fat: Number(formData.fat) || 0,
      });

      // Reset & close
      setFormData({ foodName: "", calories: "", protein: "", carbs: "", fat: "", mealType: "snack" });
      onLogAdded();
      onClose();
    } catch (err) {
      setError("Failed to log food. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-surface-800 rounded-3xl shadow-2xl animate-slide-up border border-slate-200/50 dark:border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Log Food</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track what you eat</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
          >
            <HiOutlineX className="text-xl text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Food Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Food Name *
            </label>
            <input
              id="food-name-input"
              name="foodName"
              type="text"
              placeholder="e.g., Grilled Chicken Salad"
              value={formData.foodName}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {mealTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mealType: type.value })}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    formData.mealType === type.value
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/30"
                      : "bg-slate-50 dark:bg-surface-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-700"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Calories *
              </label>
              <input
                id="calories-input"
                name="calories"
                type="number"
                placeholder="kcal"
                value={formData.calories}
                onChange={handleChange}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Protein (g)
              </label>
              <input
                name="protein"
                type="number"
                placeholder="grams"
                value={formData.protein}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Carbs (g)
              </label>
              <input
                name="carbs"
                type="number"
                placeholder="grams"
                value={formData.carbs}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Fat (g)
              </label>
              <input
                name="fat"
                type="number"
                placeholder="grams"
                value={formData.fat}
                onChange={handleChange}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="submit-food-log"
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <HiOutlinePlus className="text-lg" />
                Log Food
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
