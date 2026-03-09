import type { Express } from "express";
import type { Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const TELEGRAM_TOKEN = "8701343794:AAEvX1DexX6Gt8K7HLMAFHaCz6TlXU95q5I";
const MAIN_CHANNEL_ID = "-1003181034907";
const MOD_CHANNEL_ID = "-1003278302331";
const ADMIN_ID = 6437612855;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

type MediaType = "photo" | "video" | "animation";

function detectMediaType(mimetype: string): MediaType | null {
  if (mimetype.startsWith("image/gif")) return "animation";
  if (mimetype.startsWith("image/")) return "photo";
  if (mimetype.startsWith("video/")) return "video";
  return null;
}

async function sendMediaToModeration(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string,
  mediaType: MediaType,
  caption: string,
  msgId: number
): Promise<string> {
  const tgMethod =
    mediaType === "photo"
      ? "sendPhoto"
      : mediaType === "video"
      ? "sendVideo"
      : "sendAnimation";
  const fieldName =
    mediaType === "photo"
      ? "photo"
      : mediaType === "video"
      ? "video"
      : "animation";

  const replyMarkup = JSON.stringify({
    inline_keyboard: [
      [
        { text: "✅ Одобрить и отправить", callback_data: `web_approve_${msgId}` },
        { text: "❌ Отклонить", callback_data: `web_reject_${msgId}` },
      ],
    ],
  });

  const form = new FormData();
  form.set("chat_id", MOD_CHANNEL_ID);
  form.set("caption", caption);
  form.set("reply_markup", replyMarkup);
  form.set(fieldName, new Blob([fileBuffer], { type: mimetype }), filename);

  const resp = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/${tgMethod}`,
    { method: "POST", body: form as any }
  );

  if (!resp.ok) {
    const err = await resp.text();
    console.error("Telegram media upload error:", err);
    throw new Error("Failed to send media to Telegram");
  }

  const result = await resp.json();
  const msg = result?.result;
  const fileId: string =
    msg?.photo?.at(-1)?.file_id ||
    msg?.video?.file_id ||
    msg?.animation?.file_id ||
    "";

  return fileId;
}

async function sendTextToModeration(text: string, msgId: number) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: MOD_CHANNEL_ID,
        text,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ Одобрить и отправить", callback_data: `web_approve_${msgId}` },
              { text: "❌ Отклонить", callback_data: `web_reject_${msgId}` },
            ],
          ],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Telegram API Error:", errorText);
    throw new Error("Failed to send message to moderation channel");
  }
}

async function sendToMainChannel(
  text: string,
  mediaType?: string | null,
  mediaFileId?: string | null
) {
  if (mediaType && mediaFileId) {
    const tgMethod =
      mediaType === "photo"
        ? "sendPhoto"
        : mediaType === "video"
        ? "sendVideo"
        : "sendAnimation";
    const fieldName =
      mediaType === "photo"
        ? "photo"
        : mediaType === "video"
        ? "video"
        : "animation";

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${tgMethod}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: MAIN_CHANNEL_ID,
        [fieldName]: mediaFileId,
        caption: `📩 Анон:\n${text}`,
      }),
    });
  } else {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: MAIN_CHANNEL_ID,
        text: `📩 Анон:\n${text}`,
      }),
    });
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
  // Auto-register Telegram webhook on deployed Replit domains
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    const primaryDomain = replitDomains.split(",")[0].trim();
    registerTelegramWebhook(`https://${primaryDomain}/api/telegram/webhook`);
  }

  app.get("/api/telegram/setup-webhook", async (req, res) => {
    const host = req.headers.host || "";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const webhookUrl = `${proto}://${host}/api/telegram/webhook`;
    await registerTelegramWebhook(webhookUrl);
    res.json({ webhookUrl, message: "Webhook registration attempted" });
  });

  app.get(api.messages.list.path, async (req, res) => {
    try {
      const msgs = await storage.getMessages();
      res.json(msgs);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Send message (text only via JSON)
  app.post(api.messages.send.path, async (req, res) => {
    try {
      const input = api.messages.send.input.parse(req.body);
      const msg = await storage.createMessage(input);

      let caption = `📩 Анон:\n\n${input.content}`;
      if (input.isSwag) caption += "\nпошел нахуй @McTrakser";

      try {
        await sendTextToModeration(caption, msg.id);
      } catch (tgError) {
        console.error("Failed to forward to moderation.", tgError);
        return res.status(500).json({ message: "Не удалось отправить на модерацию" });
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

  // Send message with media (multipart/form-data)
  app.post(
    "/api/messages/upload",
    upload.single("file"),
    async (req: any, res: any) => {
      try {
        const content = (req.body.content as string) || "";
        const isSwag = req.body.isSwag === "true";
        const file = req.file as Express.Multer.File | undefined;

        if (!file && !content.trim()) {
          return res.status(400).json({ message: "Нужен текст или медиафайл" });
        }

        let mediaType: MediaType | null = null;
        if (file) {
          mediaType = detectMediaType(file.mimetype);
          if (!mediaType) {
            return res.status(400).json({ message: "Неподдерживаемый тип файла" });
          }
        }

        const msg = await storage.createMessage({
          content,
          isSwag,
          mediaType: mediaType || null,
          mediaFileId: null,
        });

        let caption = `📩 Анон:\n\n${content}`;
        if (isSwag) caption += "\nпошел нахуй @McTrakser";

        try {
          if (file && mediaType) {
            const fileId = await sendMediaToModeration(
              file.buffer,
              file.originalname,
              file.mimetype,
              mediaType,
              caption,
              msg.id
            );
            // Update stored message with real file_id from Telegram
            if (fileId) {
              await storage.updateMessageFileId(msg.id, fileId);
            }
          } else {
            await sendTextToModeration(caption, msg.id);
          }
        } catch (tgError) {
          console.error("Failed to forward to moderation.", tgError);
          return res.status(500).json({ message: "Не удалось отправить на модерацию" });
        }

        res.status(201).json(msg);
      } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  );

  // Telegram webhook for moderation callbacks
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      const update = req.body;

      // Handle /start command
      if (update?.message?.text?.startsWith("/start")) {
        const chatId = update.message.chat.id;
        const webAppUrl =
          process.env.WEB_APP_URL ||
          "https://telegram-bot-helper--McTrakser.replit.app";

        const body: Record<string, unknown> = {
          chat_id: chatId,
          text:
            "Привет!\n\nЗдесь ты можешь отправить анонимное сообщение в канал.\n\nНажми кнопку ниже, чтобы открыть мини-приложение:",
        };

        if (webAppUrl) {
          body.reply_markup = JSON.stringify({
            inline_keyboard: [
              [{ text: "Открыть мини-приложение", url: webAppUrl }],
            ],
          });
        }

        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        return res.sendStatus(200);
      }

      if (!update?.callback_query) return res.sendStatus(200);

      const { callback_query } = update;
      const fromId = callback_query.from?.id;
      const data: string = callback_query.data || "";

      if (fromId !== ADMIN_ID) {
        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callback_query.id,
              text: "❌ Только админ может модерировать",
              show_alert: true,
            }),
          }
        );
        return res.sendStatus(200);
      }

      const approveMatch = data.match(/^web_approve_(\d+)$/);
      const rejectMatch = data.match(/^web_reject_(\d+)$/);

      if (approveMatch || rejectMatch) {
        const msgId = parseInt((approveMatch || rejectMatch)![1]);
        const isApprove = !!approveMatch;

        const msg = await storage.getMessageById(msgId);
        let replyText: string;

        if (!msg) {
          replyText = "Сообщение не найдено ❌";
        } else if (isApprove) {
          let text = msg.content;
          if (msg.isSwag) text += "\nпошел нахуй @McTrakser";
          try {
            await sendToMainChannel(text, msg.mediaType, msg.mediaFileId);
            replyText = "Сообщение одобрено и отправлено ✅";
          } catch {
            replyText = "Ошибка при отправке в основной канал ❌";
          }
        } else {
          replyText = "Сообщение отклонено ❌";
        }

        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callback_query.message.chat.id,
              message_id: callback_query.message.message_id,
              text: replyText,
            }),
          }
        );

        await fetch(
          `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callback_query_id: callback_query.id }),
          }
        );
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook error:", err);
      res.sendStatus(200);
    }
  });

  return httpServer;
}
