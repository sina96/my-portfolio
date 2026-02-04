"use client";

interface Win98NavProps {
  activeTab: "home" | "blogs" | "contact";
  setActiveTab: (tab: "home" | "blogs" | "contact") => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Win98Nav({ activeTab, setActiveTab, darkMode, onToggleDarkMode }: Win98NavProps) {
  return (
    <div className="window win98-nav">
      <div className="title-bar">
        <div className="title-bar-text">Navigation</div>
        <div className="title-bar-controls">
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        <ul className="win98-nav-list">
          <li>
            <button
              onClick={() => setActiveTab("home")}
              style={{
                background: "none",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer",
                color: activeTab === "home" ? "blue" : "inherit",
                textDecoration: activeTab === "home" ? "underline" : "none",
              }}
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("blogs")}
              style={{
                background: "none",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer",
                color: activeTab === "blogs" ? "blue" : "inherit",
                textDecoration: activeTab === "blogs" ? "underline" : "none",
              }}
            >
              Blogs
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("contact")}
              style={{
                background: "none",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer",
                color: activeTab === "contact" ? "blue" : "inherit",
                textDecoration: activeTab === "contact" ? "underline" : "none",
              }}
            >
              Contact
            </button>
          </li>
          <li className="win98-dark-mode-toggle">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="checkbox"
                id="dark-mode"
                checked={darkMode}
                onChange={onToggleDarkMode}
                style={{ margin: 0 }}
              />
              <label htmlFor="dark-mode" style={{ cursor: "pointer", margin: 0, fontSize: "12px" }}>
                Dark Mode
              </label>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
