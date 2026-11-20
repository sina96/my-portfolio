import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import memojiImage from "@/assets/images/sina-pc-memoji.png";
import { JsonLd } from "@/lib/jsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_STATUS, SITE_TAGLINE, SITE_URL, SOCIAL_LINKS, siteAlternates } from "@/lib/site";
import { BlogList } from "./components/BlogList";
import { HomeHero } from "./components/HomeHero";
import { HillScene } from "./components/HillScene";
import { XpWindow } from "./components/XpWindow";
import { getAllBlogPosts } from "./data/blogPosts";

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: siteAlternates("/"),
};

export default function Home() {
  return (
    <>
      <JsonLd value={{
        "@context": "https://schema.org", "@type": "Person",
        name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION, sameAs: Object.values(SOCIAL_LINKS),
      }} />
      <HillScene mode="intro">
        <HomeHero />
      </HillScene>
      <main id="main" className="xp-content xp-home-content" tabIndex={-1}>
        <XpWindow id="home-intro" title="About me">
          <div className="xp-intro">
            <Image src={memojiImage} alt="Sina memoji" width={100} height={100} />
            <div>
              <h1>{SITE_NAME}</h1>
              <p>{SITE_TAGLINE}</p>
            </div>
          </div>
          <p className="xp-status" data-status={SITE_STATUS.state}><span aria-hidden="true" />Current Status: {SITE_STATUS.label}</p>
          <div className="xp-actions"><Link href="/cv" className="xp-button-link">View CV</Link></div>
        </XpWindow>
        <XpWindow id="home-posts" title="Latest posts">
          <BlogList posts={getAllBlogPosts().slice(0, 3)} />
          <div className="xp-actions"><Link href="/blog" className="xp-button-link">All posts</Link></div>
        </XpWindow>
      </main>
    </>
  );
}
