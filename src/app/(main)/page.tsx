import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import memojiImage from "@/assets/images/sina-pc-memoji.png";
import { JsonLd } from "@/lib/jsonLd";
import { SHARE_IMAGE_SIZE } from "@/lib/shareImage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_NOW, SITE_STATUS, SITE_TAGLINE, SITE_URL, SOCIAL_LINKS, siteAlternates } from "@/lib/site";
import { BlogList } from "./components/BlogList";
import { HomeHero } from "./components/HomeHero";
import { HillScene } from "./components/HillScene";
import { XpWindow } from "./components/XpWindow";
import { getAllBlogPosts } from "./data/blogPosts";

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: siteAlternates("/"),
  // Only the homepage sets og:url to the site root; other routes keep their own. A page-level openGraph
  // replaces the root one (including the file-based image), so the share image is listed again here.
  openGraph: {
    type: "website",
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [{ url: "/opengraph-image", ...SHARE_IMAGE_SIZE, type: "image/png", alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
};

export default function Home() {
  const now = SITE_NOW.filter(({ value }) => value.trim());
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
        <XpWindow id="home-posts" title="Latest posts" icon="blog">
          <h2 className="xp-sr-only">Latest posts</h2>
          <BlogList posts={getAllBlogPosts().slice(0, 5)} />
          <div className="xp-actions"><Link href="/blog" className="xp-button-link">All posts</Link></div>
        </XpWindow>
        <XpWindow id="home-intro" title="About me" icon="about">
          <div className="xp-intro">
            <Image src={memojiImage} alt="" width={56} height={56} />
            <p>{SITE_TAGLINE}</p>
          </div>
          <p className="xp-status" data-status={SITE_STATUS.state}><span aria-hidden="true" />{SITE_STATUS.label}</p>
          {now.length > 0 && <>
            <h2>Now</h2>
            <dl className="xp-now">
              {now.map(({ label, value }) => (
                <div key={label}><dt>{label}:</dt><dd>{value}</dd></div>
              ))}
            </dl>
          </>}
        </XpWindow>
      </main>
    </>
  );
}
