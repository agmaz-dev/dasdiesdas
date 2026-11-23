import "server-only";
import { db } from "./db";

export async function getUnreadCount(userId: string) {
  return db.message.count({
    where: {
      readAt: null,
      senderId: { not: userId },
      conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    },
  });
}
