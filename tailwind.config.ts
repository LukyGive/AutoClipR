import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15151a",
        mist: "#f5f7fb",
        twitch: "#9146ff",
        success: "#0e9f6e",
        warning: "#b45309"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(21, 21, 26, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
