import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertCircle, Paperclip, X, Image, Video, FileVideo, Feather } from "lucide-react";
import { useSendMessage, useSendMedia } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

function DeathNoteCover() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center py-16 px-8 select-none"
      style={{ perspective: 1000 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-700 to-transparent" />

        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-red-700/60 tracking-[0.4em] text-xs uppercase font-sans mb-2">
            Тетрадь смерти
          </p>
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-widest leading-none"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#cc1a1a",
              textShadow: "0 0 30px rgba(180,20,20,0.7), 0 0 60px rgba(180,20,20,0.3)",
            }}
          >
            DEATH
          </h1>
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-widest leading-none mt-1"
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#e0d0b0",
              textShadow: "0 0 20px rgba(220,200,160,0.3)",
            }}
          >
            NOTE
          </h1>
        </motion.div>

        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-700 to-transparent" />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-stone-500 tracking-widest uppercase font-sans"
        >
          Сообщение отправлено на модерацию
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 0.6, duration: 1.5, repeat: 1 }}
          className="flex gap-1 mt-2"
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-red-800/60" />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/");
  const isGif = file.type === "image/gif";
  const url = URL.createObjectURL(file);
  const sizeKb = (file.size / 1024).toFixed(0);
  const Icon = isGif ? FileVideo : isImage ? Image : Video;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded overflow-hidden border border-red-900/40 bg-black/40 group"
      data-testid="file-preview"
    >
      {isImage ? (
        <img src={url} alt="preview" className="w-full max-h-48 object-cover opacity-80" />
      ) : (
        <video src={url} className="w-full max-h-48 object-cover opacity-80" muted playsInline />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-red-400/80 flex-shrink-0" />
        <span className="text-stone-300 text-sm truncate flex-1">{file.name}</span>
        <span className="text-stone-500 text-xs">{sizeKb} КБ</span>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/70 hover:bg-red-900/70 text-stone-400 hover:text-white rounded p-1.5 transition-colors"
        data-testid="button-remove-file"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

type Phase = "form" | "cover";

const bookClose = {
  exit: {
    rotateY: -90,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.45, ease: "easeIn" as const },
  },
};

const bookOpenFromLeft = {
  initial: { rotateY: 90, opacity: 0, scale: 0.95 },
  animate: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const coverEnter = {
  initial: { rotateY: 90, opacity: 0 },
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    transition: { duration: 0.45, ease: "easeIn" as const },
  },
};

export default function Home() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: sendMessage, isPending: isSendingText } = useSendMessage();
  const { mutate: sendMedia, isPending: isSendingMedia } = useSendMedia();
  const { toast } = useToast();
  const isPending = isSendingText || isSendingMedia;

  const hasContent = !!file || content.trim().length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      toast({ title: "Неподдерживаемый формат", description: "Разрешены: фото, GIF, видео.", variant: "destructive" });
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      toast({ title: "Файл слишком большой", description: "Максимум 50 МБ.", variant: "destructive" });
      return;
    }
    setFile(selected);
    e.target.value = "";
  };

  const handleSubmit = (isSwag: boolean) => {
    if (!hasContent) return;

    const onSuccess = () => {
      setContent("");
      setFile(null);
      setPhase("cover");
      setTimeout(() => setPhase("form"), 3000);
    };

    if (file) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("isSwag", String(isSwag));
      formData.append("file", file);
      sendMedia(formData, { onSuccess });
    } else {
      sendMessage({ content, isSwag }, { onSuccess });
    }
  };

  return (
    <div
      className="relative min-h-full flex items-center justify-center p-4 sm:p-8"
      style={{ perspective: "1200px" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-red-900/20 to-transparent" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-red-950/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl z-10">
        <AnimatePresence mode="wait">
          {phase === "cover" ? (
            <motion.div
              key="cover"
              {...coverEnter}
              className="book-shadow rounded border border-red-900/60 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0d0808 0%, #140a0a 50%, #0d0808 100%)",
                transformStyle: "preserve-3d",
                minHeight: "420px",
              }}
            >
              <div className="h-full border-l-4 border-red-900/80">
                <DeathNoteCover />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              {...bookOpenFromLeft}
              {...{ exit: bookClose.exit }}
              className="book-shadow rounded border border-red-900/30 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0d0a09 0%, #110c0b 100%)",
                transformStyle: "preserve-3d",
              }}
            >
              <div className="border-l-4 border-red-900/70">
                <div className="px-8 pt-8 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <Feather className="w-5 h-5 text-red-700/70" />
                    <p className="text-xs tracking-[0.3em] uppercase text-red-800/70 font-sans">
                      Тетрадь смерти
                    </p>
                  </div>
                  <h1
                    className="text-3xl sm:text-4xl font-bold mt-2"
                    style={{ fontFamily: "'Cinzel', serif", color: "#e0cca0" }}
                  >
                    Анонимное послание
                  </h1>
                  <p className="text-sm mt-2 text-stone-500 font-body italic">
                    Имя человека, написанное в этой тетради, останется в тайне...
                  </p>
                  <div className="mt-4 w-full h-px bg-gradient-to-r from-red-900/60 via-red-900/20 to-transparent" />
                </div>

                <div className="px-8 pb-8">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {file && (
                        <FilePreview file={file} onRemove={() => setFile(null)} />
                      )}
                    </AnimatePresence>

                    <div className="relative notebook-lines rounded">
                      <Textarea
                        placeholder={
                          file
                            ? "Подпись к медиа (необязательно)..."
                            : "Пиши своё послание здесь..."
                        }
                        className="min-h-[180px] text-base resize-none rounded border border-red-900/30 bg-transparent focus-visible:border-red-800/60 focus-visible:ring-2 focus-visible:ring-red-900/20 transition-all duration-300 p-4 pr-14 text-stone-200 placeholder:text-stone-600 font-body italic leading-8"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isPending}
                        data-testid="input-message"
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_TYPES.join(",")}
                        className="hidden"
                        onChange={handleFileChange}
                        data-testid="input-file"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending}
                        className="absolute bottom-4 right-4 p-2 rounded text-stone-600 hover:text-red-600 hover:bg-red-900/10 transition-colors"
                        data-testid="button-attach-file"
                        title="Прикрепить медиа"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 pt-1">
                      <Button
                        size="lg"
                        className="w-full rounded h-13 text-sm tracking-widest uppercase font-sans font-semibold bg-transparent border border-stone-700 text-stone-300 hover:bg-stone-800/50 hover:border-stone-600 transition-all"
                        onClick={() => handleSubmit(false)}
                        disabled={isPending || !hasContent}
                        data-testid="button-send-normal"
                      >
                        <Send className="w-4 h-4 mr-2 opacity-60" />
                        {isPending ? "Записываю..." : "Отправить спокойно"}
                      </Button>

                      <div className="relative py-1">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-red-900/30" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[#110c0b] px-4 text-red-900/60 tracking-widest font-sans">
                            или
                          </span>
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full rounded h-13 text-sm tracking-widest uppercase font-sans font-bold transition-all relative overflow-hidden group border border-red-900/50"
                        style={{
                          background: "linear-gradient(135deg, #3d0a0a 0%, #5a0f0f 100%)",
                          color: "#e0c8a0",
                        }}
                        onClick={() => handleSubmit(true)}
                        disabled={isPending || !hasContent}
                        data-testid="button-send-swag"
                      >
                        <div className="absolute inset-0 bg-red-800/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                          <Feather className="w-4 h-4" />
                          {isPending ? "Записываю..." : "Послать нахуй и отправить"}
                        </span>
                      </Button>
                    </div>

                    {!file && content.length > 0 && content.length < 5 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-2 text-sm text-amber-700/80 bg-amber-950/30 border border-amber-900/30 p-3 rounded"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="font-body italic">Сообщение коротковато, но вы можете отправить и так!</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
