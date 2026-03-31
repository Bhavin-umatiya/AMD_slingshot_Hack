// NutritionChart — Bar chart for daily calories + Pie chart for macro distribution
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const MACRO_COLORS = ["#10b981", "#06b6d4", "#f59e0b", "#ef4444"];

// Custom tooltip for bar chart
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      <p className="text-sm text-brand-500 font-medium">{payload[0].value} kcal</p>
    </div>
  );
}

export default function NutritionChart({ dailyStats = [], todayStats = {} }) {
  // Prepare bar chart data (last 7 days)
  const barData = dailyStats.slice(-7).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    calories: d.calories,
  }));

  // Prepare pie chart data (today's macros)
  const pieData = [
    { name: "Protein", value: todayStats.protein || 0 },
    { name: "Carbs", value: todayStats.carbs || 0 },
    { name: "Fat", value: todayStats.fat || 0 },
  ].filter((d) => d.value > 0);

  const hasBarData = barData.length > 0;
  const hasPieData = pieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Daily Calories Bar Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          📊 Weekly Calories
        </h3>
        {hasBarData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="calories" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${160 - i * 5}, 70%, ${50 + i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
            No data yet — log your first meal!
          </div>
        )}
      </div>

      {/* Today's Macro Distribution Pie Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">
          🥧 Today's Macros
        </h3>
        {hasPieData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                stroke="none"
                label={({ name, value }) => `${name}: ${value}g`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={MACRO_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
            No macros logged today
          </div>
        )}
      </div>
    </div>
  );
}
