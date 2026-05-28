import { useEffect, useState } from "react";
import { Overview } from "./tabs/Overview";
import { LiveBlocks } from "./tabs/LiveBlocks";
import { Playground } from "./tabs/Playground";
import { BuildYourOwn } from "./tabs/BuildYourOwn";
import { GRAPH_URL } from "./lib/client";

type Theme = "light" | "dark";

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof localStorage === "undefined") return "light";
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

const TABS = [
  { id: "overview", label: "1. Overview", Component: Overview },
  { id: "live", label: "2. Live Blocks", Component: LiveBlocks },
  { id: "playground", label: "3. Query Playground", Component: Playground },
  { id: "build", label: "4. Build Your Own", Component: BuildYourOwn },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function App() {
  const [active, setActive] = useState<TabId>("overview");
  const [theme, toggleTheme] = useTheme();
  const Active = TABS.find((t) => t.id === active)!.Component;

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <img src="/brand/quai-mark.svg" alt="Quai" />
          <div>
            <div className="title">Quai Graph Example</div>
            <div className="subtitle">graph.quai.network · cyprus-1</div>
          </div>
        </div>
        <div className="header-right">
          <span className="endpoint mono">{GRAPH_URL}</span>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${active === t.id ? "active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <Active />
    </div>
  );
}
