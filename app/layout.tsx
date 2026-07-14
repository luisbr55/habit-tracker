import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Hábitos",
  description: "Registrá tus hábitos diarios y seguí tu racha.",
};

// Layout responsive: una sola columna de ancho mobile (max-w-app = 448px),
// centrada en tablet/desktop. Ver sdd/spec-habitos/technical-spec.md → "Layout responsive".
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans text-base">
        <ThemeProvider>
          <div className="mx-auto min-h-screen w-full max-w-app bg-background px-4 pb-24 pt-6">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}