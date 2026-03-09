import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const TELEGRAM_TOKEN = "8265225057:AAHrORerpEToxN9mx07YvcPhzO8HEP8usv0";
const MAIN_CHANNEL_ID = "-1003181034907";
const MOD_CHANNEL_ID = "-1003278302331";
const ADMIN_ID = 6437612855;

async function sendToModeration(text: string, isSwag: boolean, msgId: number) {
  let messageText = `📩 Анон:\n\n${text}`;
  if (isSwag) {
    messageText += "\nпошел нахуй @McTrakser";
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: MOD_CHANNEL_ID,
      text: messageText,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Одобрить и отправить", callback_data: `web_approve_${msgId}` },
            { text: "❌ Отклонить", callback_data: `web_reject_${msgId}` },
          ],
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram API Error:", errorText);
    throw new Error("Failed to send message to Telegram moderation channel");
  }

  return response.json();
}

async function sendToMainChannel(text: string) {
  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: MAIN_CHANNEL_ID,
      text: `📩 Анон:\n${text}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram API Error:", errorText);
    throw new Error("Failed to send message to main channel");
  }
}

async function registerTelegramWebhook(webhookUrl: string) {
  try {
    const current = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo`
    ).then((r) => r.json());

    if (current?.result?.url === webhookUrl) {
      console.log("[telegram] Webhook already set to", webhookUrl);
      return;
    }

    const resp = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl }),
      }
    );
    const result = await resp.json();
    if (result.ok) {
      console.log("[telegram] Webhook registered:", webhookUrl);
    } else {
      console.error("[telegram] Failed to register webhook:", result);
    }
  } catch (e) {
    console.error("[telegram] Error registering webhook:", e);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auto-register Telegram webhook when running on a deployed Replit domain
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    const primaryDomain = replitDomains.split(",")[0].trim();
    const webhookUrl = `https://${primaryDomain}/api/telegram/webhook`;
    registerTelegramWebhook(webhookUrl);
  }

  // Manual setup endpoint: GET /api/telegram/setup-webhook
  // Visit this URL once if the webhook wasn't auto-registered
  app.get("/api/telegram/setup-webhook", async (req, res) => {
    const host = req.headers.host || "";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const webhookUrl = `${proto}://${host}/api/telegram/webhook`;
    await registerTelegramWebhook(webhookUrl);
    res.json({ webhookUrl, message: "Webhook registration attempted — check server logs" });
  });

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

      const msg = await storage.createMessage(input);

      try {
        await sendToModeration(input.content, !!input.isSwag, msg.id);
      } catch (tgError) {
        console.error("Failed to forward to Telegram moderation channel.", tgError);
        return res.status(500).json({ message: "Не удалось отправить сообщение на модерацию" });
      }

      res.status(201).json(msg);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Telegram webhook for moderation callbacks (web_approve / web_reject)
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update = req.body;

      if (!update?.callback_query) {
        return res.sendStatus(200);
      }

      const { callback_query } = update;
      const fromId = callback_query.from?.id;
      const data: string = callback_query.data || "";

      if (fromId !== ADMIN_ID) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: callback_query.id,
            text: "❌ Только админ может модерировать",
            show_alert: true,
          }),
        });
        return res.sendStatus(200);
      }

      const webApproveMatch = data.match(/^web_approve_(\d+)$/);
      const webRejectMatch = data.match(/^web_reject_(\d+)$/);

      if (webApproveMatch || webRejectMatch) {
        const msgId = parseInt((webApproveMatch || webRejectMatch)![1]);
        const isApprove = !!webApproveMatch;

        const msg = await storage.getMessageById(msgId);

        let replyText: string;

        if (!msg) {
          replyText = "Сообщение не найдено ❌";
        } else if (isApprove) {
          let text = msg.content;
          if (msg.isSwag) text += "\nпошел нахуй @McTrakser";
          try {
            await sendToMainChannel(text);
            replyText = "Сообщение одобрено и отправлено ✅";
          } catch (e) {
            replyText = "Ошибка при отправке в основной канал ❌";
          }
        } else {
          replyText = "Сообщение отклонено ❌";
        }

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: callback_query.message.chat.id,
            message_id: callback_query.message.message_id,
            text: replyText,
          }),
        });

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: callback_query.id }),
        });
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook error:", err);
      res.sendStatus(200);
    }
  });

  return httpServer;
}
