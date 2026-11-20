import type { Config } from "tailwindcss";

export default {
  content: ["./src/app/anita/**/*.{ts,tsx}"],
  theme: {
    screens: { sm: "375px", md: "768px", lg: "1200px" },
  },
} satisfies Config;
