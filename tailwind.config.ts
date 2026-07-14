import type { Config } from "tailwindcss";

// Tokens tomados de sdd/design-system.md. Los colores referencian variables CSS
// (definidas en app/globals.css, con bloques :root y .dark) en vez de hex fijos,
// así las clases bg-background, text-text, etc. cambian solas según el tema.
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        destructive: "rgb(var(--color-destructive) / <alpha-value>)",
        // Paleta fija de categorías — no cambia con el tema
        cat: {
          green: "#16A34A",
          blue: "#2563EB",
          violet: "#7C3AED",
          pink: "#DB2777",
          orange: "#EA580C",
          yellow: "#CA8A04",
          cyan: "#0891B2",
          gray: "#57534E",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "20px",
        xl: "28px",
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      maxWidth: {
        app: "448px", // ancho máximo del layout — ver sdd/design-system.md "Layout"
      },
    },
  },
  plugins: [],
} satisfies Config;