// Dashboard — Main page with all sections, data loading, and layout
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import FoodLogForm from "../components/FoodLogForm";
import NutritionChart from "../components/NutritionChart";
import MealRecommendations from "../components/MealRecommendations";
import WeeklyInsights from "../components/WeeklyInsights";
import HabitTracker from "../components/HabitTracker";
import ChatBot from "../components/ChatBot";
import {
  HiOutlinePlus,
  HiOutlineFire,
  HiOutlineLightningBolt,
  HiOutlineBeaker,
  HiOutlineTrash,
  HiOutlineChevronRight,
} from "react-icons/hi";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);

  // Data state
  const [stats, setStats] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/food-logs/stats?days=7");
      setStats(res.data?.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch food logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await api.get("/food-logs?days=7");
      setFoodLogs(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchLogs();
  }, [fetchStats, fetchLogs]);

  // Handler: refresh data after logging
  function handleLogAdded() {
    fetchStats();
    fetchLogs();
  }

  // Handler: add AI-suggested meal to food log
  async function handleAddAIMeal(meal) {
    try {
      await api.post("/food-logs", { ...meal, mealType: "snack" });
      handleLogAdded();
    } catch (err) {
      console.error("Failed to add AI meal:", err);
    }
  }

  // Handler: delete food log
  async function handleDeleteLog(id) {
    try {
      await api.delete(`/food-logs/${id}`);
      handleLogAdded();
    } catch (err) {
      console.error("Failed to delete log:", err);
    }
  }

  // Section change (also closes mobile sidebar)
  function handleSectionChange(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  const todayStats = stats?.today || {};

  // Stat cards for overview
  const statCards = [
    {
      label: "Calories Today",
      value: Math.round(todayStats.calories || 0),
      unit: "kcal",
      icon: HiOutlineFire,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Protein",
      value: Math.round(todayStats.protein || 0),
      unit: "g",
      icon: HiOutlineLightningBolt,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Carbs",
      value: Math.round(todayStats.carbs || 0),
      unit: "g",
      icon: HiOutlineBeaker,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Meals Logged",
      value: todayStats.count || 0,
      unit: "today",
      icon: HiOutlinePlus,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isOpen={sidebarOpen}
      />

      {/* Main content area */}
      <main className="pt-16 lg:pl-64 min-h-screen">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                {activeSection === "overview" && `Good ${getGreeting()}, ${user?.name?.split(" ")[0] || "there"}! 👋`}
                {activeSection === "log" && "📝 Food Log"}
                {activeSection === "charts" && "📊 Nutrition Analytics"}
                {activeSection === "goals" && "🎯 Goals & Habits"}
                {activeSection === "recommendations" && "✨ AI Recommendations"}
                {activeSection === "insights" && "🧠 Weekly Insights"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {activeSection === "overview" && "Here's your nutrition snapshot for today"}
                {activeSection === "log" && "Track everything you eat"}
                {activeSection === "charts" && "Visualize your nutrition data"}
                {activeSection === "goals" && "Set targets and track your streaks"}
                {activeSection === "recommendations" && "AI-powered meal suggestions just for you"}
                {activeSection === "insights" && "AI analysis of your weekly nutrition patterns"}
              </p>
            </div>
            {(activeSection === "overview" || activeSection === "log") && (
              <button
                id="open-food-log"
                onClick={() => setShowLogForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <HiOutlinePlus className="text-lg" />
                <span className="hidden sm:inline">Log Food</span>
              </button>
            )}
          </div>

          {/* ═══ OVERVIEW SECTION ═══ */}
          {activeSection === "overview" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {statCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="stat-card">
                      <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                        <Icon className={`text-xl ${card.color}`} />
                      </div>
                      <div className="mt-1">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {loadingStats ? "—" : card.value}
                          <span className="text-sm font-normal text-slate-400 ml-1">{card.unit}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts */}
              <NutritionChart
                dailyStats={stats?.daily || []}
                todayStats={todayStats}
              />

              {/* Quick sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <HabitTracker todayStats={todayStats} />

                {/* Recent food logs */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-white">Recent Meals</h3>
                    <button
                      onClick={() => handleSectionChange("log")}
                      className="btn-ghost text-sm flex items-center gap-1"
                    >
                      View all <HiOutlineChevronRight />
                    </button>
                  </div>
                  {loadingLogs ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="shimmer h-14 rounded-xl" />
                      ))}
                    </div>
                  ) : foodLogs.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">No meals logged yet today</p>
                  ) : (
                    <div className="space-y-2">
                      {foodLogs.slice(0, 5).map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-surface-900/50 hover:bg-slate-100 dark:hover:bg-surface-900 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                              {log.foodName}
                            </p>
                            <p className="text-xs text-slate-400">
                              {log.calories} kcal · {log.mealType}
                            </p>
                          </div>
                          {log.aiSuggested && <span className="badge-blue mr-2">AI</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ FOOD LOG SECTION ═══ */}
          {activeSection === "log" && (
            <div className="animate-fade-in">
              <div className="glass-card overflow-hidden">
                {loadingLogs ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="shimmer h-16 rounded-xl" />
                    ))}
                  </div>
                ) : foodLogs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">🍽️</div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No food logs yet
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Start tracking your nutrition by logging your first meal
                    </p>
                    <button onClick={() => setShowLogForm(true)} className="btn-primary">
                      <HiOutlinePlus className="inline mr-2" />
                      Log Your First Meal
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {foodLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-surface-800/50 transition-colors group"
                      >
                        {/* Meal type icon */}
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-lg shrink-0">
                          {log.mealType === "breakfast" ? "🌅" : log.mealType === "lunch" ? "🌞" : log.mealType === "dinner" ? "🌙" : "🍿"}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                              {log.foodName}
                            </p>
                            {log.aiSuggested && <span className="badge-blue">AI</span>}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {/* Macros */}
                        <div className="hidden sm:flex items-center gap-2">
                          <span className="badge-green">{log.calories} kcal</span>
                          <span className="badge-blue">P:{log.protein}g</span>
                          <span className="badge-orange">C:{log.carbs}g</span>
                          <span className="badge-red">F:{log.fat}g</span>
                        </div>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CHARTS SECTION ═══ */}
          {activeSection === "charts" && (
            <div className="animate-fade-in">
              <NutritionChart
                dailyStats={stats?.daily || []}
                todayStats={todayStats}
              />
            </div>
          )}

          {/* ═══ GOALS SECTION ═══ */}
          {activeSection === "goals" && (
            <div className="animate-fade-in max-w-xl">
              <HabitTracker todayStats={todayStats} />
            </div>
          )}

          {/* ═══ RECOMMENDATIONS SECTION ═══ */}
          {activeSection === "recommendations" && (
            <div className="animate-fade-in max-w-2xl">
              <MealRecommendations onAddMeal={handleAddAIMeal} />
            </div>
          )}

          {/* ═══ INSIGHTS SECTION ═══ */}
          {activeSection === "insights" && (
            <div className="animate-fade-in max-w-2xl">
              <WeeklyInsights />
            </div>
          )}
        </div>
      </main>

      {/* Food log modal */}
      <FoodLogForm
        isOpen={showLogForm}
        onClose={() => setShowLogForm(false)}
        onLogAdded={handleLogAdded}
      />

      {/* Floating chatbot */}
      <ChatBot />
    </div>
  );
}

// Helper: Get time-appropriate greeting
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
