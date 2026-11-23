import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { SITE } from "@/lib/config";

let transporter: Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Versendet eine E-Mail. Ohne SMTP-Konfiguration wird die Mail nur im Server-Log ausgegeben
 * (für die lokale Entwicklung).
 */
export async function sendMail(opts: { to: string; subject: string; text: string; actionUrl?: string; actionLabel?: string }) {
  const t = getTransporter();
  const text = opts.actionUrl ? `${opts.text}\n\n${opts.actionLabel ?? "Link"}: ${opts.actionUrl}\n` : opts.text;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1f2937;max-width:560px">
<p style="font-size:22px;font-weight:bold;color:#0f766e">${SITE.name}</p>
${escapeHtml(opts.text).split("\n").map((l) => `<p>${l}</p>`).join("")}
${opts.actionUrl ? `<p><a href="${escapeHtml(opts.actionUrl)}" style="display:inline-block;background:#0f766e;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${escapeHtml(opts.actionLabel ?? "Öffnen")}</a></p><p style="font-size:12px;color:#6b7280">Falls der Button nicht funktioniert: ${escapeHtml(opts.actionUrl)}</p>` : ""}
<p style="font-size:12px;color:#6b7280">Diese E-Mail wurde automatisch von ${SITE.domain} versendet.</p></div>`;

  if (!t) {
    console.info(`\n[MAIL – nicht versendet, SMTP fehlt]\nAn: ${opts.to}\nBetreff: ${opts.subject}\n${text}\n`);
    return;
  }
  await t.sendMail({
    from: process.env.MAIL_FROM || `${SITE.name} <no-reply@${SITE.domain}>`,
    to: opts.to,
    subject: opts.subject,
    text,
    html,
  });
}
