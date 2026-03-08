import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  isSwag: boolean("is_swag").default(false).notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  isSwag: true,
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
