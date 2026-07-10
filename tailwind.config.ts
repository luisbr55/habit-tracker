import type { Config } from "tailwindcss";

// Tokens tomados de sdd/design-system.md — únicos que se pueden usar en el proyecto.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FAFAF9",
        surface: "#FFFFFF",
        border: "#E7E5E4",
        text: "#1C1917",
        "text-muted": "#78716C",
        primary: "#292524",
        accent: "#16A34A",
        warning: "#D97706",
        destructive: "#DC2626",
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
