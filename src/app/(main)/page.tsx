"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTheme } from "./hooks/useTheme";
import { Win98Nav } from "./components/Win98Nav";
import { HomeTab } from "./components/HomeTab";
import { BlogsTab } from "./components/BlogsTab";
import { ContactTab } from "./components/ContactTab";
import { LatestBlogsWindow } from "./components/LatestBlogsWindow";

const blogPosts = [
  {
    slug: "hello-world",
    title: "Hello World - My First Blog Post",
    date: "2026-02-01",
    excerpt: "Welcome to my blog! This is my first post where I share my thoughts on web development and life.",
  },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"home" | "blogs" | "contact">("home");
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "blogs" || tab === "contact") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      <div className="win98-content-wrapper">
        <div className="win98-layout">
          <Win98Nav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {/* Main Content Window */}
          <div className="window win98-main">
            <div className="title-bar">
              <div className="title-bar-text">Sina Bastani - Portfolio</div>
              <div className="title-bar-controls">
                <button aria-label="Minimize"></button>
                <button aria-label="Maximize"></button>
                <button aria-label="Close"></button>
              </div>
            </div>
            <div className="window-body">
              {activeTab === "home" && <HomeTab />}
              {activeTab === "blogs" && <BlogsTab posts={blogPosts} />}
              {activeTab === "contact" && <ContactTab />}
            </div>
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
          </div>
        </div>

        {/* Latest Blogs Window - Only show on home tab */}
        {activeTab === "home" && <LatestBlogsWindow posts={blogPosts} />}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: "20px" }}>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
