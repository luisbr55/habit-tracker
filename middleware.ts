import NextAuth from "next-auth";
import authConfig from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Corre en todo menos assets estáticos y archivos internos de Next
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};