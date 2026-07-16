import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/api/cron", // protegido con CRON_SECRET propio, no con sesión de usuario
];

// Config "liviana": sin providers reales, sin bcrypt, sin adapter de Drizzle.
// Es la que corre en el middleware (Edge Runtime) — solo necesita poder leer
// el JWT de sesión para decidir si la ruta está permitida o no.
export default {
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },
  // Sesión corta por seguridad: expira a las 2 horas de inactividad. Se renueva
  // sola si el usuario sigue usando la app (updateAge = cada 30 min de uso activo).
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 horas, en segundos
    updateAge: 30 * 60, // renueva el token cada 30 min de actividad
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isPublic =
        PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
        pathname.startsWith("/api/auth");

      // false → Auth.js redirige solo a pages.signIn ("/login")
      if (!auth && !isPublic) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;