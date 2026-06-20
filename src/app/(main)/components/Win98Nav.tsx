"use client";

import { Win98Window } from "./Win98Window";

interface Win98NavProps {
  activeTab: "home" | "blogs" | "contact";
  setActiveTab: (tab: "home" | "blogs" | "contact") => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Win98Nav({ activeTab, setActiveTab, darkMode, onToggleDarkMode }: Win98NavProps) {
  return (
    <Win98Window title="Navigation" className="win98-nav">
      <ul className="win98-nav-list">
        <li>
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            aria-current={activeTab === "home" ? "page" : undefined}
            className={activeTab === "home" ? "win98-nav-button nav-active" : "win98-nav-button"}
          >
            Home
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab("blogs")}
            aria-current={activeTab === "blogs" ? "page" : undefined}
            className={activeTab === "blogs" ? "win98-nav-button nav-active" : "win98-nav-button"}
          >
            Blogs
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            aria-current={activeTab === "contact" ? "page" : undefined}
            className={activeTab === "contact" ? "win98-nav-button nav-active" : "win98-nav-button"}
          >
            Contact
          </button>
        </li>
        <li className="win98-dark-mode-toggle">
          <div className="win98-theme-toggle">
            <input
              type="checkbox"
              id="dark-mode"
              checked={darkMode}
              onChange={onToggleDarkMode}
            />
            <label htmlFor="dark-mode">
              Dark Mode
            </label>
          </div>
        </li>
      </ul>
    </Win98Window>
  );
}
