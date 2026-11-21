export const SITE_URL = "https://sinabastani.dev";
export const SITE_NAME = "Sina Bastani";
export const SITE_DESCRIPTION = "Software developer focused on backend systems, cloud migration, and modern delivery.";
export const SITE_TAGLINE = "printers are not the only bottlenecks we have at the office anymore.";
export const SITE_STATUS: { state: "busy" | "available"; label: string } = {
  state: "busy",
  label: "in a project",
};
export const SITE_ROLE_LINE = "Developer (human) · Stockholm";
export const SITE_NOW: ReadonlyArray<{ label: string; value: string }> = [
  { label: "building", value: "cooking up with agents in Rex" },
  { label: "reading", value: "Throne of Glass series" },
  { label: "listening to", value: "lots of tech podcasts" },
  { label: "based in", value: "Stockholm" },
];
export const SITE_EMAIL = "contact@sinabastani.dev";
export const CONTACT_URL = `mailto:${SITE_EMAIL}?subject=Contact%20Request&body=Hello!`;

export const RSS_ALTERNATE = {
  "application/rss+xml": [{ url: "/feed.xml", title: `${SITE_NAME} - Blog` }],
};

/** Pairs a page canonical with the site-wide RSS discovery link. */
export function siteAlternates(canonical: string) {
  return { canonical, types: RSS_ALTERNATE };
}

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/sina-bastani",
  github: "https://github.com/sina96",
  instagram: "https://www.instagram.com/sinabastanii",
  letterboxd: "https://boxd.it/2YAg9",
  spotify: "https://open.spotify.com/user/11183243899",
} as const;
