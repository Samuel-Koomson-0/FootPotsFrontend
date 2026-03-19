// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        sans:    ["DM Sans", "sans-serif"],
      },
      colors: {
        fp: {
          purple:       "#37003c",
          "purple-mid": "#5a0060",
          green:        "#00ff87",
          "green-dark": "#00c96b",
          "off-white":  "#f2f4f2",
        },
      },
    },
  },
  plugins: [],
};

export default config;
