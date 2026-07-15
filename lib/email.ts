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

export async function sendDigestEmail(
  email: string,
  input: { missingHabitNames: string[]; allDone: boolean }
) {
  const subject = input.allDone
    ? "¡Completaste todo hoy! 🎉"
    : `Te faltan ${input.missingHabitNames.length} hábito${
        input.missingHabitNames.length === 1 ? "" : "s"
      } hoy`;

  const html = input.allDone
    ? `<p>¡Completaste todos tus hábitos programados de hoy! 🎉 Seguí así.</p>`
    : `
      <p>Todavía te faltan estos hábitos hoy:</p>
      <ul>
        ${input.missingHabitNames.map((name) => `<li>${name}</li>`).join("")}
      </ul>
      <p><a href="${process.env.AUTH_URL}">Marcarlos como completados</a></p>
    `;

  await resend.emails.send({ from: FROM, to: email, subject, html });
}