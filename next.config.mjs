/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Find and exclude svg from any existing asset rules
    // Next often has one or more rules that include svg in a regex for images/assets.
    config.module.rules.forEach((rule) => {
      if (rule?.test && rule.test instanceof RegExp && rule.test.test(".svg")) {
        rule.exclude = rule.exclude
          ? Array.isArray(rule.exclude)
            ? [...rule.exclude, /\.svg$/i]
            : [rule.exclude, /\.svg$/i]
          : [/\.svg$/i];
      }
    });

    // 1) `import url from "./icon.svg?url"` -> string URL
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /url/,
      type: "asset/resource",
    });

    // 2) `import Icon from "./icon.svg"` -> React component (SVGR)
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: { not: [/url/] },
      type: "javascript/auto",
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: { overrides: { removeViewBox: false } },
                },
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
