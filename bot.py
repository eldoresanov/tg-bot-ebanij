from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters
import os

TOKEN = "8701343794:AAEvX1DexX6Gt8K7HLMAFHaCz6TlXU95q5I"
MAIN_CHANNEL_ID = "-1003181034907"
MOD_CHANNEL_ID = "-1003278302331"
ADMIN_ID = 6437612855

WEB_APP_URL = os.environ.get("WEB_APP_URL", "https://telegram-bot-helper--McTrakser.replit.app")

active_chats = set()
pending_messages = {}
mod_messages = {}
pending_admin_replies = {}  # ADMIN_ID -> user_chat_id when admin is composing a reply


# ===== /start =====
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.effective_chat.id
    active_chats.add(chat_id)

    keyboard = [[InlineKeyboardButton("Открыть мини-приложение", web_app=WebAppInfo(url=WEB_APP_URL))]]
    await update.message.reply_text(
        "Привет!\n\n"
        "Здесь ты можешь отправить анонимное сообщение в канал.\n\n"
        "Нажми кнопку ниже, чтобы открыть мини-приложение:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


# ===== Входящее сообщение =====
async def text_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = update.effective_chat
    msg = update.message

    # Если это ответ администратора анониму
    if chat.id == ADMIN_ID and ADMIN_ID in pending_admin_replies:
        user_chat_id = pending_admin_replies.pop(ADMIN_ID)
        try:
            await context.bot.send_message(
                chat_id=user_chat_id,
                text=f"💬 Ответ модератора:\n\n{msg.text}"
            )
            await msg.reply_text("✅ Ответ отправлен анониму")
        except Exception as e:
            await msg.reply_text(f"❌ Не удалось отправить ответ: {e}")
        return

    # Обычное сообщение от пользователя
    if chat.type != "private" or chat.id not in active_chats:
        return

    pending_messages[chat.id] = msg

    keyboard = [[
        InlineKeyboardButton("Отправить спокойно", callback_data="send_normal"),
        InlineKeyboardButton("Послать нахуй и отправить", callback_data="send_swag")
    ]]
    await msg.reply_text("Выберите вариант отправки:", reply_markup=InlineKeyboardMarkup(keyboard))


# ===== Кнопки выбора варианта отправки =====
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

    keyboard_mod = [[
        InlineKeyboardButton("✅ Одобрить", callback_data=f"approve_{chat_id}"),
        InlineKeyboardButton("❌ Отклонить", callback_data=f"reject_{chat_id}"),
        InlineKeyboardButton("💬 Ответить лично", callback_data=f"reply_{chat_id}"),
    ]]

    try:
        if msg.photo:
            await context.bot.send_photo(
                chat_id=MOD_CHANNEL_ID,
                photo=msg.photo[-1].file_id,
                caption=f"⬡ NERV // АНОНИМ\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "photo", "file_id": msg.photo[-1].file_id, "text": text}

        elif msg.video:
            await context.bot.send_video(
                chat_id=MOD_CHANNEL_ID,
                video=msg.video.file_id,
                caption=f"⬡ NERV // АНОНИМ\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "video", "file_id": msg.video.file_id, "text": text}

        elif msg.animation:
            await context.bot.send_animation(
                chat_id=MOD_CHANNEL_ID,
                animation=msg.animation.file_id,
                caption=f"⬡ NERV // АНОНИМ\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "animation", "file_id": msg.animation.file_id, "text": text}

        else:
            await context.bot.send_message(
                chat_id=MOD_CHANNEL_ID,
                text=f"⬡ NERV // АНОНИМ\n\n{text}",
                reply_markup=InlineKeyboardMarkup(keyboard_mod)
            )
            mod_messages[chat_id] = {"type": "text", "text": text}

        await query.edit_message_text("Ваше сообщение отправлено на модерацию")
        del pending_messages[chat_id]

    except Exception as e:
        await query.edit_message_text("Ошибка при отправке")
        print("Ошибка отправки в модерацию:", e)


# ===== Кнопки модерации (одобрить/отклонить) =====
async def moderation_buttons(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query

    if query.from_user.id != ADMIN_ID:
        await query.answer("Только админ может модерировать", show_alert=True)
        return

    await query.answer()
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
                await context.bot.send_photo(chat_id=MAIN_CHANNEL_ID, photo=msg_data["file_id"], caption=f"⬡ NERV // АНОНИМ\n{text}")
            elif msg_data["type"] == "video":
                await context.bot.send_video(chat_id=MAIN_CHANNEL_ID, video=msg_data["file_id"], caption=f"⬡ NERV // АНОНИМ\n{text}")
            elif msg_data["type"] == "animation":
                await context.bot.send_animation(chat_id=MAIN_CHANNEL_ID, animation=msg_data["file_id"], caption=f"⬡ NERV // АНОНИМ\n{text}")
            else:
                await context.bot.send_message(chat_id=MAIN_CHANNEL_ID, text=f"⬡ NERV // АНОНИМ\n{text}")
        except Exception as e:
            print("Ошибка отправки в основной канал:", e)
        await query.edit_message_text("✅ Сообщение одобрено и отправлено")
    else:
        await query.edit_message_text("❌ Сообщение отклонено")


# ===== Кнопка "Ответить лично" =====
async def reply_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query

    if query.from_user.id != ADMIN_ID:
        await query.answer("Только админ может отвечать", show_alert=True)
        return

    await query.answer()
    user_chat_id = int(query.data.split("_")[1])
    pending_admin_replies[ADMIN_ID] = user_chat_id

    await context.bot.send_message(
        chat_id=ADMIN_ID,
        text="✏️ Напишите ответное сообщение — оно будет отправлено анониму лично:"
    )


# ===== MAIN =====
if __name__ == "__main__":
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(send_buttons, pattern="^send_"))
    app.add_handler(CallbackQueryHandler(moderation_buttons, pattern="^(approve|reject)_"))
    app.add_handler(CallbackQueryHandler(reply_button, pattern="^reply_"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_message))
    print("Бот запущен...")
    app.run_polling()
