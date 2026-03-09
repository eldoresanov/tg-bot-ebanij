from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters
import os

TOKEN = "8701343794:AAEvX1DexX6Gt8K7HLMAFHaCz6TlXU95q5I"
MAIN_CHANNEL_ID = "-1003181034907"
MOD_CHANNEL_ID = "-1003278302331"
ADMIN_ID = 6437612855

# URL веб-приложения — замени на свой задеплоенный адрес
WEB_APP_URL = os.environ.get("WEB_APP_URL", "https://telegram-bot-helper--McTrakser.replit.app")

active_chats = set()
pending_messages = {}
mod_messages = {}


# ===== /start =====
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    active_chats.add(chat_id)

    keyboard = [
        [
            InlineKeyboardButton(
                "Открыть мини-приложение",
                url=WEB_APP_URL
            )
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "Привет!\n\n"
        "Здесь ты можешь отправить анонимное сообщение в канал.\n\n"
        "Нажми кнопку ниже, чтобы открыть мини-приложение:",
        reply_markup=reply_markup
    )


# ===== Пользовательское сообщение =====
async def text_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = update.effective_chat
    if chat.type != "private" or chat.id not in active_chats:
        return

    msg = update.message
    pending_messages[chat.id] = msg

    keyboard = [
        [
            InlineKeyboardButton("Отправить спокойно", callback_data="send_normal"),
            InlineKeyboardButton("Послать нахуй и отправить", callback_data="send_swag")
        ]
    ]
    await msg.reply_text(
        "Выберите вариант отправки:", reply_markup=InlineKeyboardMarkup(keyboard)
    )


# ===== Кнопки отправки анонимки =====
async def send_buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    chat_id = query.message.chat.id

    msg = pending_messages.get(chat_id)
    if not msg:
        await query.edit_message_text("Сообщение не найдено")
        return

    text = msg.text or msg.caption or ""
    if query.data == "send_swag":
        text += "\nпошел нахуй @McTrakser"

    keyboard_mod = [
        [
            InlineKeyboardButton("Одобрить и отправить", callback_data=f"approve_{chat_id}"),
            InlineKeyboardButton("Отклонить", callback_data=f"reject_{chat_id}")
        ]
    ]

    try:
        if msg.photo:
            await context.bot.send_photo(
                chat_id=MOD_CHANNEL_ID,
                photo=msg.photo[-1].file_id,
                caption=f"Анон:\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "photo", "file_id": msg.photo[-1].file_id, "text": text}

        elif msg.video:
            await context.bot.send_video(
                chat_id=MOD_CHANNEL_ID,
                video=msg.video.file_id,
                caption=f"Анон:\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "video", "file_id": msg.video.file_id, "text": text}

        elif msg.animation:
            await context.bot.send_animation(
                chat_id=MOD_CHANNEL_ID,
                animation=msg.animation.file_id,
                caption=f"Анон:\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "animation", "file_id": msg.animation.file_id, "text": text}

        else:
            await context.bot.send_message(
                chat_id=MOD_CHANNEL_ID,
                text=f"Анон:\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "text", "text": text}

        await query.edit_message_text("Ваше сообщение отправлено на модерацию")
        del pending_messages[chat_id]

    except Exception as e:
        await query.edit_message_text("Ошибка при отправке")
        print("Ошибка отправки в модерацию:", e)


# ===== Модерация (админ) =====
async def moderation_buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if query.from_user.id != ADMIN_ID:
        await query.answer("Только админ может модерировать", show_alert=True)
        return

    data = query.data
    parts = data.split("_")
    action = parts[0]
    user_chat_id = int(parts[1])

    msg_data = mod_messages.pop(user_chat_id, None)
    if msg_data is None:
        await query.edit_message_text("Сообщение уже обработано")
        return

    text = msg_data.get("text", "")

    if action == "approve":
        try:
            if msg_data["type"] == "photo":
                await context.bot.send_photo(chat_id=MAIN_CHANNEL_ID, photo=msg_data["file_id"], caption=f"Анон:\n{text}")
            elif msg_data["type"] == "video":
                await context.bot.send_video(chat_id=MAIN_CHANNEL_ID, video=msg_data["file_id"], caption=f"Анон:\n{text}")
            elif msg_data["type"] == "animation":
                await context.bot.send_animation(chat_id=MAIN_CHANNEL_ID, animation=msg_data["file_id"], caption=f"Анон:\n{text}")
            else:
                await context.bot.send_message(chat_id=MAIN_CHANNEL_ID, text=f"Анон:\n{text}")
        except Exception as e:
            print("Ошибка отправки в основной канал:", e)
        await query.edit_message_text("Сообщение одобрено и отправлено")
    else:
        await query.edit_message_text("Сообщение отклонено")


# ===== MAIN =====
if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.ALL & ~filters.COMMAND, text_message))
    app.add_handler(CallbackQueryHandler(send_buttons, pattern="send_.*"))
    app.add_handler(CallbackQueryHandler(moderation_buttons, pattern="^(approve|reject)_"))
    print("Бот запущен...")
    app.run_polling()
