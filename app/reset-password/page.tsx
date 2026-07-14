"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Falta el token de reset.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;

    startTransition(async () => {
      const result = await resetPassword(token, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    });
  }

  if (!token) {
    return (
      <main className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-sm text-destructive">Falta el token de reset.</p>
        <Link href="/forgot-password" className="text-sm text-text underline">
          Pedir un link nuevo
        </Link>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-base text-text">
          ✅ Contraseña actualizada. Redirigiendo…
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 pt-10">
      <h1 className="text-xl font-semibold text-text">Nueva contraseña</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Contraseña nueva (mínimo 8 caracteres)"
          className="rounded-control border border-border bg-surface px-3 py-2 text-base text-text outline-none focus:border-primary"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-control bg-primary py-2 text-sm text-white disabled:opacity-70"
        >
          {isPending ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </main>
  );
}
