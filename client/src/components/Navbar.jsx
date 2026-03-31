// Navbar — Top navigation with branding, dark mode toggle, user menu
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { HiOutlineSun, HiOutlineMoon, HiOutlineLogout, HiOutlineMenu } from "react-icons/hi";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return true;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            id="toggle-sidebar"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-colors"
          >
            <HiOutlineMenu className="text-xl" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-md shadow-brand-500/20">
              <span className="text-lg">🥗</span>
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-gradient">Nutri</span>
              <span className="text-slate-800 dark:text-white">AI</span>
            </h1>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            id="toggle-theme"
            onClick={() => setDark(!dark)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-surface-800 transition-all duration-200"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? (
              <HiOutlineSun className="text-xl text-amber-400" />
            ) : (
              <HiOutlineMoon className="text-xl text-slate-600" />
            )}
          </button>

          {/* User info */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-surface-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
              {user?.name || "User"}
            </span>
          </div>

          {/* Logout */}
          <button
            id="logout-btn"
            onClick={logout}
            className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 transition-all duration-200"
            title="Sign out"
          >
            <HiOutlineLogout className="text-xl" />
          </button>
        </div>
      </div>
    </nav>
  );
}
