/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0a0e1a",
          surface: "#0d1526",
          card: "#111827",
          border: "#1e2d4a",
          cyan: "#00d4ff",
          blue: "#0066ff",
          green: "#00ff88",
          red: "#ff3366",
          orange: "#ff6b35",
          yellow: "#ffd60a",
          purple: "#7c3aed",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "cyber-gradient": "linear-gradient(135deg, #0a0e1a 0%, #0d1526 50%, #0a0e1a 100%)",
        "glow-cyan": "radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)",
        "glow-blue": "radial-gradient(ellipse at center, rgba(0,102,255,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)",
        "glow-blue": "0 0 20px rgba(0,102,255,0.3), 0 0 40px rgba(0,102,255,0.1)",
        "glow-red": "0 0 20px rgba(255,51,102,0.3), 0 0 40px rgba(255,51,102,0.1)",
        "glow-green": "0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)",
        "card": "0 4px 24px rgba(0,0,0,0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scan": "scan 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "counter": "counter 1s ease-out forwards",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0,212,255,0.2), 0 0 10px rgba(0,212,255,0.1)" },
          "100%": { boxShadow: "0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.2)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
