import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const TELEGRAM_TOKEN = "8701343794:AAEvX1DexX6Gt8K7HLMAFHaCz6TlXU95q5I";
const TELEGRAM_CHANNEL_ID = "-1003181034907";

async function sendToTelegram(text: string, isSwag: boolean) {
  let messageText = `📩 Анон: ${text}`;
  if (isSwag) {
    messageText += "\nпошел нахуй @McTrakser";
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHANNEL_ID,
      text: messageText,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram API Error:", errorText);
    throw new Error("Failed to send message to Telegram");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.messages.list.path, async (req, res) => {
    try {
      const msgs = await storage.getMessages();
      res.json(msgs);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.messages.send.path, async (req, res) => {
    try {
      const input = api.messages.send.input.parse(req.body);
      
      // Save to database
      const msg = await storage.createMessage(input);
      
      // Forward to Telegram
      try {
        await sendToTelegram(input.content, input.isSwag);
      } catch (tgError) {
        console.error("Failed to forward to Telegram, but saved to DB.", tgError);
        // We might still want to return 201 since it was saved, but maybe with a note, 
        // or we can just fail the request. Let's return 500 so the user knows it failed.
        return res.status(500).json({ message: "Saved to database but failed to forward to Telegram" });
      }

      res.status(201).json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
