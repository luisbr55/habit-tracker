"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

export type ActionResult = { ok: true } | { ok: false; error: string };

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export async function signUp(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const email = normalizeEmail(input.email);

  if (!email.includes("@")) {
    return { ok: false, error: "Ingresá un email válido." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return {
      ok: false,
      error: "Ya existe una cuenta con ese email. Iniciá sesión.",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  await db.insert(users).values({ email, passwordHash });

  const token = randomBytes(32).toString("hex");
  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    purpose: "email_verify",
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (err) {
    // No bloqueamos el registro si falla el envío del email — el usuario puede
    // seguir usando la app (verificación es informativa, ver functional-spec.md).
    console.error("No se pudo enviar el email de verificación:", err);
  }

  return { ok: true };
}

export async function verifyEmail(token: string): Promise<ActionResult> {
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.purpose, "email_verify")
      )
    )
    .limit(1);

  if (!record || record.expires < new Date()) {
    return { ok: false, error: "El link expiró o no es válido." };
  }

  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, record.identifier));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return { ok: true };
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const normalized = normalizeEmail(email);

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  // Mensaje genérico siempre — no revelamos si el email existe o no.
  if (!user || !user.passwordHash) {
    return { ok: true };
  }

  const token = randomBytes(32).toString("hex");
  await db.insert(verificationTokens).values({
    identifier: normalized,
    token,
    purpose: "password_reset",
    expires: new Date(Date.now() + TOKEN_TTL_MS),
  });

  try {
    await sendPasswordResetEmail(normalized, token);
  } catch (err) {
    console.error("No se pudo enviar el email de reset:", err);
  }

  return { ok: true };
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  if (newPassword.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.purpose, "password_reset")
      )
    )
    .limit(1);

  if (!record || record.expires < new Date()) {
    return { ok: false, error: "El link expiró o no es válido." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.email, record.identifier));

  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));

  return { ok: true };
}
