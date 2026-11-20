/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    "postcss-prefix-selector": {
      prefix: ":where(.xp-desktop)",
      includeFiles: ["/xp.css/dist/XP.css", "/anita/anita.css"],
      transform(prefix, selector, prefixed, file) {
        // XP.css uses nested rules; only scope their outer selector.
        if (selector.includes("&")) return selector;
        if (file?.endsWith("/anita/anita.css")) {
          // Tailwind preflight must cover html/body, but only on the Anita route.
          const scope = "html:has(.anita-page)";
          if (selector === "html" || selector === ":root") return scope;
          if (selector === "body") return "body:has(.anita-page)";
          if (selector.startsWith("[data-theme=")) return scope + selector;
          return `${scope} ${selector}`;
        }
        // XP.css 0.2.6 repeats :not([value]) after the progress pseudo-element.
        return selector === "body" ? prefix : prefixed.replace(/(:(?:before|after)):not\(\[value\]\)/g, "$1");
      },
    },
    autoprefixer: {},
  },
};

export default config;
