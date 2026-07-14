"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginWithCredentials, loginWithGoogle } from "@/app/actions/session";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginWithCredentials,
    undefined
  );

  return (
    <main className="flex flex-col gap-6 pt-10">
      <h1 className="text-xl font-semibold text-text">Iniciar sesión</h1>

      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-control border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Contraseña"
          className="rounded-control border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-control bg-primary py-2 text-sm text-white disabled:opacity-70"
        >
          {isPending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex items-center gap-2 text-xs text-text-muted">
        <div className="h-px flex-1 bg-border" />
        o
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="w-full rounded-control border border-border py-2 text-sm text-text"
        >
          Continuar con Google
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 text-sm text-text-muted">
        <p>
          ¿No tenés cuenta?{" "}
          <Link href="/signup" className="text-text underline">
            Registrate
          </Link>
        </p>
        <Link href="/forgot-password" className="underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </main>
  );
}
