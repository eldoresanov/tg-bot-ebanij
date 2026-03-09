import { db } from "./db";
import {
  messages,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  getMessageById(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageFileId(id: number, fileId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(desc(messages.sentAt));
  }

  async getMessageById(id: number): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async updateMessageFileId(id: number, fileId: string): Promise<void> {
    await db.update(messages).set({ mediaFileId: fileId }).where(eq(messages.id, id));
  }
}

export const storage = new DatabaseStorage();
