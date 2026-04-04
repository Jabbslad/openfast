import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "Timer", icon: "⏱" },
  { to: "/log", label: "Log", icon: "📋" },
  { to: "/hydration", label: "Water", icon: "💧" },
  { to: "/progress", label: "Progress", icon: "📊" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function TabBar() {
  return (
    <nav className="flex justify-around border-t border-[#2a2a4a] bg-[#0a0a14] py-2 shrink-0">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} end={tab.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center min-w-[44px] min-h-[44px] justify-center text-xs ${isActive ? "text-indigo-400" : "text-gray-500"}`
          }>
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="mt-0.5">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
