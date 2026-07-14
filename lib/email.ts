import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Remitente: cambialo por tu dominio verificado en Resend cuando lo tengas.
// "onboarding@resend.dev" solo funciona en modo de pruebas.
const FROM = "Hábitos <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.AUTH_URL}/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Confirmá tu email",
    html: `
      <p>Confirmá tu cuenta de Hábitos tocando este link (expira en 24 horas):</p>
      <p><a href="${url}">${url}</a></p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.AUTH_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Recuperar contraseña",
    html: `
      <p>Pediste restablecer tu contraseña. Este link expira en 24 horas:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Si no fuiste vos, ignorá este email.</p>
    `,
  });
}
