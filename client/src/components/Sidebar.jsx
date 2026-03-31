// Sidebar — Navigation for dashboard sections
import {
  HiOutlineViewGrid,
  HiOutlinePencilAlt,
  HiOutlineChartBar,
  HiOutlineLightBulb,
  HiOutlineChatAlt2,
  HiOutlineFire,
  HiOutlineCog,
} from "react-icons/hi";

const navItems = [
  { id: "overview", label: "Overview", icon: HiOutlineViewGrid },
  { id: "log", label: "Food Log", icon: HiOutlinePencilAlt },
  { id: "charts", label: "Nutrition", icon: HiOutlineChartBar },
  { id: "goals", label: "Goals", icon: HiOutlineFire },
  { id: "recommendations", label: "AI Meals", icon: HiOutlineLightBulb },
  { id: "insights", label: "Insights", icon: HiOutlineChatAlt2 },
];

export default function Sidebar({ activeSection, onSectionChange, isOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => onSectionChange(activeSection)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white dark:bg-surface-900 border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Nav items */}
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`text-xl ${isActive ? "text-brand-500" : ""}`} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom branding */}
          <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs text-slate-400">Powered by GROQ AI</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
