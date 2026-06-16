import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#FAFAFA",
        mist: "#09090B",
        twitch: "#7C3AED",
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6"
        },
        surface: {
          DEFAULT: "#111113",
          hover: "#18181B"
        },
        line: "#27272A",
        muted: "#A1A1AA",
        success: "#22C55E",
        danger: "#EF4444",
        warning: "#F59E0B"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.28)",
        glow: "0 0 0 1px rgba(124, 58, 237, 0.24), 0 18px 80px rgba(124, 58, 237, 0.18)"
      },
      backgroundImage: {
        "app-bg": "linear-gradient(180deg, #09090B 0%, #0B0B0F 100%)"
      }
    }
  },
  plugins: []
};

export default config;
