"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string } | undefined;

export async function loginWithCredentials(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw err; // deja pasar el error de redirect interno de Next/Auth.js
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
