/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // HireMind AI design tokens — "signal intelligence" palette.
        // Deliberately not the cream/terracotta or near-black/acid-green
        // AI-SaaS defaults: base is a deep indigo-slate, accent is a
        // violet -> cyan "signal" gradient representing data becoming insight.
        ink: {
          DEFAULT: "#0A0D16",   // page background (dark)
          soft: "#121729",      // card surface (dark)
          softer: "#1A2038",    // elevated surface (dark)
        },
        paper: {
          DEFAULT: "#F8F9FD",   // page background (light)
          soft: "#FFFFFF",      // card surface (light)
          softer: "#EEF0FA",    // elevated surface (light)
        },
        line: {
          dark: "rgba(148, 163, 209, 0.14)",
          light: "rgba(20, 23, 45, 0.08)",
        },
        signal: {
          violet: "#6C5CE7",
          "violet-light": "#8B7CF6",
          cyan: "#22D3EE",
          amber: "#F5A524",
          rose: "#F5455C",
          mint: "#2DD4A7",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "signal-gradient": "linear-gradient(135deg, #6C5CE7 0%, #8B7CF6 45%, #22D3EE 100%)",
        "signal-gradient-soft": "linear-gradient(135deg, rgba(108,92,231,0.14) 0%, rgba(34,211,238,0.14) 100%)",
      },
      boxShadow: {
        glass: "0 1px 1px rgba(15,18,34,0.04), 0 8px 24px -8px rgba(15,18,34,0.12)",
        "glass-dark": "0 1px 1px rgba(0,0,0,0.2), 0 12px 32px -8px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(108,92,231,0.25), 0 8px 40px -8px rgba(108,92,231,0.45)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "count-ring": {
          "0%": { strokeDashoffset: "var(--ring-start)" },
          "100%": { strokeDashoffset: "var(--ring-end)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
