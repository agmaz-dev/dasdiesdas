"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { db } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/auth";
import { rateLimit } from "@/lib/server/rate-limit";
import { sendMail } from "@/lib/server/mail";
import { publicListingWhere } from "@/lib/server/search";
import { SITE } from "@/lib/config";
import { formValues, type ActionState } from "@/lib/action-state";

function cleanBody(v: FormDataEntryValue | null) {
  return typeof v === "string"
    ? v.replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";
}

async function notify(recipientId: string, senderName: string, listingTitle: string, conversationId: string) {
  const recipient = await db.user.findUnique({ where: { id: recipientId }, select: { email: true, name: true } });
  if (!recipient) return;
  await sendMail({
    to: recipient.email,
    subject: `Neue Nachricht zu „${listingTitle}“`,
    text: `Hallo ${recipient.name},\n\n${senderName} hat Ihnen eine Nachricht zur Anzeige „${listingTitle}“ geschrieben.\n\nSicherheitshinweis: Leisten Sie keine Vorauszahlungen an Unbekannte und geben Sie keine Codes oder Ausweisdaten weiter.`,
    actionUrl: `${SITE.url}/konto/nachrichten/${conversationId}`,
    actionLabel: "Nachricht lesen",
  }).catch((e) => console.error("Mailversand fehlgeschlagen", e));
}

function checkLimits(userId: string) {
  return rateLimit(`msg:min:${userId}`, 10, 60_000) && rateLimit(`msg:day:${userId}`, 300, 86_400_000);
}

export async function startConversationAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const values = formValues(fd);
  const listingId = typeof fd.get("listingId") === "string" ? (fd.get("listingId") as string) : "";
  const user = await getCurrentUser();
  if (!user) {
    const l = await db.listing.findUnique({ where: { id: listingId }, select: { number: true } });
    redirect(`/anmelden?weiter=${encodeURIComponent(l ? `/anzeige/${l.number}` : "/")}`);
  }
  if (!user.emailVerified) return { values, message: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse (siehe Mein Konto)." };

  const body = cleanBody(fd.get("body"));
  if (body.length < 2) return { values, message: "Bitte geben Sie eine Nachricht ein." };
  if (body.length > 4000) return { values, message: "Die Nachricht darf höchstens 4.000 Zeichen haben." };
  if (!checkLimits(user.id)) return { values, message: "Sie haben zu viele Nachrichten gesendet. Bitte warten Sie einen Moment." };

  const listing = await db.listing.findFirst({ where: { id: listingId, ...publicListingWhere() }, select: { id: true, userId: true, title: true } });
  if (!listing) return { values, message: "Diese Anzeige ist nicht mehr verfügbar." };
  if (listing.userId === user.id) return { values, message: "Sie können sich nicht selbst schreiben." };

  const conv = await db.conversation.upsert({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: user.id } },
    create: { listingId: listing.id, buyerId: user.id, sellerId: listing.userId },
    update: {},
  });
  await db.message.create({ data: { conversationId: conv.id, senderId: user.id, body } });
  await db.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });
  await notify(listing.userId, user.name, listing.title, conv.id);
  redirect(`/konto/nachrichten/${conv.id}`);
}

export async function replyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) redirect("/anmelden");
  const conversationId = typeof fd.get("conversationId") === "string" ? (fd.get("conversationId") as string) : "";
  const body = cleanBody(fd.get("body"));
  if (body.length < 1) return { message: "Bitte geben Sie eine Nachricht ein." };
  if (body.length > 4000) return { message: "Die Nachricht darf höchstens 4.000 Zeichen haben.", values: { body } };
  if (!checkLimits(user.id)) return { message: "Sie haben zu viele Nachrichten gesendet. Bitte warten Sie einen Moment.", values: { body } };

  const conv = await db.conversation.findFirst({
    where: { id: conversationId, OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: { listing: { select: { title: true, status: true } } },
  });
  if (!conv) return { message: "Unterhaltung nicht gefunden." };
  if (conv.listing.status === "BLOCKED") return { message: "Diese Anzeige wurde gesperrt. Antworten sind nicht mehr möglich." };

  await db.message.create({ data: { conversationId: conv.id, senderId: user.id, body } });
  await db.conversation.update({ where: { id: conv.id }, data: { updatedAt: new Date() } });
  const recipient = conv.buyerId === user.id ? conv.sellerId : conv.buyerId;
  await notify(recipient, user.name, conv.listing.title, conv.id);
  refresh();
  return { ok: true };
}
