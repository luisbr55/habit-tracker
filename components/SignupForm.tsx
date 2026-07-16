"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { loginWithGoogle } from "@/app/actions/session";
import { GoogleIcon } from "./GoogleIcon";

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUp({
        email: form.get("email") as string,
        password: form.get("password") as string,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <main className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-base text-text">
          Cuenta creada. Te mandamos un email para verificarla.
        </p>
        <Link href="/login" className="text-sm text-text underline">
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 pt-10">
      <h1 className="text-xl font-semibold text-text">Crear cuenta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          minLength={8}
          placeholder="Contraseña (mínimo 8 caracteres)"
          className="rounded-control border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-control bg-primary py-2 text-sm text-white disabled:opacity-70"
        >
          {isPending ? "Creando…" : "Crear cuenta"}
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
          className="flex w-full items-center justify-center gap-2 rounded-control border border-border py-2 text-sm text-text"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </form>

      <p className="text-center text-sm text-text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-text underline">
          Iniciá sesión
        </Link>
      </p>
    </main>
  );
}