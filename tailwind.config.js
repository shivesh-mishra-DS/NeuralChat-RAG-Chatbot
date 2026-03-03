/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        // Dark base
        base:    { 950: "#080b0f", 900: "#0e1117", 800: "#161b24", 700: "#1e2530", 600: "#28303d" },
        // Borders and muted
        border:  { DEFAULT: "#2a3140", soft: "#1e2530" },
        muted:   { DEFAULT: "#4a5568", light: "#718096" },
        // Text
        ink:     { DEFAULT: "#e2e8f0", dim: "#94a3b8", faint: "#475569" },
        // Green accent
        green:   { DEFAULT: "#4ade80", dark: "#22c55e", dim: "#166534", glow: "rgba(74,222,128,0.15)", soft: "rgba(74,222,128,0.08)" },
        // Error
        red:     { DEFAULT: "#f87171", soft: "rgba(248,113,113,0.1)" },
      },
      boxShadow: {
        card:     "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.2)",
        "green":  "0 0 16px rgba(74,222,128,0.2)",
        input:    "0 0 0 2px rgba(74,222,128,0.3)",
      },
      animation: {
        "fade-in":   "fadeIn 0.35s ease forwards",
        "slide-up":  "slideUp 0.4s ease forwards",
        "spin-slow": "spin 1s linear infinite",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:   { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:  { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.4)", opacity: "0.4" },
          "40%":           { transform: "scale(1)",   opacity: "1"   },
        },
      },
    },
  },
  plugins: [],
}
