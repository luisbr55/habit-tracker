"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;

    startTransition(async () => {
      await requestPasswordReset(email);
      // Mensaje siempre igual, exista o no el email — ver functional-spec.md
      setSent(true);
    });
  }

  if (sent) {
    return (
      <main className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-base text-text">
          Si el email está registrado, te va a llegar un link para restablecer tu
          contraseña.
        </p>
        <Link href="/login" className="text-sm text-text underline">
          Volver a iniciar sesión
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 pt-10">
      <h1 className="text-xl font-semibold text-text">Recuperar contraseña</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-control border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-control bg-primary py-2 text-sm text-white disabled:opacity-70"
        >
          {isPending ? "Enviando…" : "Enviar link"}
        </button>
      </form>

      <Link href="/login" className="text-center text-sm text-text-muted underline">
        Volver a iniciar sesión
      </Link>
    </main>
  );
}
