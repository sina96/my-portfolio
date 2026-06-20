"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "../hooks/useTheme";
import { BlogPost } from "../types/blog";
import { Win98Nav } from "./Win98Nav";
import { HomeTab } from "./HomeTab";
import { BlogsTab } from "./BlogsTab";
import { ContactTab } from "./ContactTab";
import { LatestBlogsWindow } from "./LatestBlogsWindow";
import { Win98Window } from "./Win98Window";

interface HomeContentProps {
  blogPosts: BlogPost[];
}

export function HomeContent({ blogPosts }: HomeContentProps) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"home" | "blogs" | "contact">("home");
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "home") {
      setActiveTab("home");
    } else if (tab === "blogs") {
      setActiveTab("blogs");
    } else if (tab === "contact") {
      setActiveTab("contact");
    } else {
      // Default to "home" for missing or invalid tab values
      setActiveTab("home");
    }
  }, [searchParams]);

  return (
    <div className="win98-page-shell">
      <div className="win98-content-wrapper">
        <div className="win98-layout">
          <Win98Nav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {/* Main Content Window */}
          <Win98Window
            title="Sina Bastani - Portfolio"
            className="win98-main"
            showMinimize
            showMaximize
            statusBar={
              <div className="status-bar">
                <p className="status-bar-field">
                  {activeTab === "home"
                    ? "HomePage"
                    : activeTab === "blogs"
                    ? "BlogsPage"
                    : "ContactPage"}
                </p>
                <p className="status-bar-field">
                  &copy; {new Date().getFullYear()} Sina Bastani
                </p>
              </div>
            }
          >
            {activeTab === "home" && <HomeTab />}
            {activeTab === "blogs" && <BlogsTab posts={blogPosts} />}
            {activeTab === "contact" && <ContactTab />}
          </Win98Window>
        </div>

        {/* Latest Blogs Window - Only show on home tab */}
        {activeTab === "home" && <LatestBlogsWindow posts={blogPosts} />}
      </div>
    </div>
  );
}
