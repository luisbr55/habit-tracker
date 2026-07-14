import Link from "next/link";
import { verifyEmail } from "@/app/actions/auth";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="flex flex-col items-center gap-4 pt-10 text-center">
        <p className="text-sm text-destructive">Falta el token de verificación.</p>
        <Link href="/login" className="text-sm text-text underline">
          Ir a iniciar sesión
        </Link>
      </main>
    );
  }

  const result = await verifyEmail(token);

  return (
    <main className="flex flex-col items-center gap-4 pt-10 text-center">
      {result.ok ? (
        <>
          <p className="text-base text-text">✅ Tu email quedó verificado.</p>
          <Link href="/login" className="text-sm text-text underline">
            Ir a iniciar sesión
          </Link>
        </>
      ) : (
        <p className="text-sm text-destructive">{result.error}</p>
      )}
    </main>
  );
}
