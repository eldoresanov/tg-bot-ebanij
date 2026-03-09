import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, AlertCircle, Paperclip, X, Image, Video, FileVideo } from "lucide-react";
import { useSendMessage, useSendMedia } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/");
  const isGif = file.type === "image/gif";
  const url = URL.createObjectURL(file);
  const sizeKb = (file.size / 1024).toFixed(0);
  const icon = isGif ? FileVideo : isImage ? Image : Video;
  const Icon = icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative rounded-2xl overflow-hidden border-2 border-border/50 bg-white/60 group"
      data-testid="file-preview"
    >
      {isImage ? (
        <img src={url} alt="preview" className="w-full max-h-64 object-cover" />
      ) : (
        <video src={url} className="w-full max-h-64 object-cover" muted playsInline />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-white/80 flex-shrink-0" />
        <span className="text-white/90 text-sm truncate flex-1">{file.name}</span>
        <span className="text-white/60 text-xs">{sizeKb} КБ</span>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
        data-testid="button-remove-file"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function Home() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
      toast({
        title: "Отправлено на модерацию",
        description: "Ваше сообщение ожидает проверки перед публикацией.",
      });
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
    <div className="relative min-h-full flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[120px] mix-blend-multiply" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl z-10"
      >
        <Card className="border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4 text-center sm:text-left">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <CardTitle className="font-display text-3xl sm:text-4xl text-foreground">
                Анонимное послание
              </CardTitle>
              <CardDescription className="text-base mt-2 text-muted-foreground/80">
                Напиши текст, прикрепи фото, видео или GIF — всё останется анонимно.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* File preview */}
              <AnimatePresence>
                {file && (
                  <FilePreview file={file} onRemove={() => setFile(null)} />
                )}
              </AnimatePresence>

              {/* Text area with attach button */}
              <div className="relative">
                <Textarea
                  placeholder={file ? "Подпись к медиа (необязательно)..." : "Ваше сообщение начинается здесь..."}
                  className="min-h-[160px] text-lg resize-none rounded-2xl bg-white/60 border-2 border-border/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-300 p-5 pr-14 shadow-inner"
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
                  className="absolute bottom-4 right-4 p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  data-testid="button-attach-file"
                  title="Прикрепить медиа"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4 pt-1">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full rounded-2xl h-14 text-base font-semibold"
                  onClick={() => handleSubmit(false)}
                  disabled={isPending || !hasContent}
                  data-testid="button-send-normal"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isPending ? "Отправка..." : "Отправить спокойно"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/70 backdrop-blur-md px-4 text-muted-foreground font-bold tracking-wider rounded-full">
                      ИЛИ
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-2xl h-14 text-base font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-white border-none group relative overflow-hidden"
                  onClick={() => handleSubmit(true)}
                  disabled={isPending || !hasContent}
                  data-testid="button-send-swag"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    {isPending ? "Отправка..." : "Послать нахуй и отправить"}
                  </span>
                </Button>
              </div>

              {!file && content.length > 0 && content.length < 5 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Сообщение коротковато, но вы можете отправить и так!</p>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
