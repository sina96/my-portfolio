/** @type {import('next').NextConfig} */
const nextConfig = {
  // This tells Next “yes, Turbopack is intentionally configured”
  // and prevents the Next 16 dev error when a webpack() config exists.
  turbopack: {},

  webpack(config) {
    // Find the rule that currently handles SVGs (often via next-image / asset modules)
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule?.test?.test?.(".svg")
    );

    // If we can't find it (rules structure changed), just add SVGR and exit safely.
    if (!fileLoaderRule) {
      config.module.rules.push({
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: { removeViewBox: false },
                  },
                },
              ],
            },
          },
        },
      });
      return config;
    }

    // Ensure resourceQuery objects exist before referencing them
    const existingNot = fileLoaderRule?.resourceQuery?.not ?? [];

    config.module.rules.push(
      // Keep *.svg?url behaving like a file (string URL)
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // All other *.svg imports become React components via SVGR
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer ?? /\.[jt]sx?$/,
        resourceQuery: { not: [...existingNot, /url/] },
        use: {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: { removeViewBox: false },
                  },
                },
              ],
            },
          },
        },
      }
    );

    // Exclude SVGs from the original loader so our rules apply
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
