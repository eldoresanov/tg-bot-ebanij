import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Paperclip, X, Image, Video, FileVideo } from "lucide-react";
import { useSendMessage, useSendMedia } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

const LAYERS = [
  { label: "LAYER:01", text: "PHYSICAL LAYER", delay: 0 },
  { label: "LAYER:02", text: "DATA LINK", delay: 600 },
  { label: "LAYER:03", text: "PROTOCOL ESTABLISHED", delay: 1200 },
  { label: "LAYER:04", text: "TRANSMISSION COMPLETE", delay: 1800 },
  { label: "LAYER:07", text: "YOU ARE CONNECTED TO THE WIRED", delay: 2400 },
];

function WiredScreen() {
  const [visible, setVisible] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    LAYERS.forEach((layer, i) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, i]);
        if (i === LAYERS.length - 1) setTimeout(() => setDone(true), 400);
      }, layer.delay);
    });
  }, []);

  return (
    <div className="w-full py-14 px-8 flex flex-col gap-5 relative">
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="w-2 h-2 bg-teal-400/70"
          style={{ boxShadow: "0 0 6px rgba(80,200,200,0.8)" }}
        />
        <span className="text-teal-400/60 text-xs tracking-[0.25em]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          WIRED // CONNECTING
        </span>
      </div>

      <div className="space-y-3 min-h-[160px]">
        {LAYERS.map((layer, i) => (
          <AnimatePresence key={i}>
            {visible.includes(i) && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline gap-3"
              >
                <span
                  className="text-teal-600/50 text-sm flex-shrink-0"
                  style={{ fontFamily: "'VT323', monospace" }}
                >
                  {layer.label}
                </span>
                <span
                  className={`text-sm tracking-wider ${i === LAYERS.length - 1 ? "text-teal-300/80" : "text-slate-400/50"}`}
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: "1.1rem",
                    textShadow: i === LAYERS.length - 1 ? "0 0 12px rgba(80,200,200,0.5)" : "none",
                  }}
                >
                  {layer.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="border-t border-teal-900/30 pt-5 space-y-1"
          >
            <p
              className="text-xs text-slate-500/60 tracking-[0.3em] uppercase"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              PRESENT DAY. PRESENT TIME.
            </p>
            <p
              className="text-slate-600/40 text-xs italic"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}
            >
              — no matter where you go, everyone is connected.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
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
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative overflow-hidden lain-border bg-black/30 group"
      data-testid="file-preview"
    >
      {isImage ? (
        <img src={url} alt="preview" className="w-full max-h-44 object-cover opacity-60 grayscale" />
      ) : (
        <video src={url} className="w-full max-h-44 object-cover opacity-60 grayscale" muted playsInline />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-teal-500/60 flex-shrink-0" />
        <span className="text-slate-400/70 text-xs truncate flex-1" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
          {file.name}
        </span>
        <span className="text-slate-600/50 text-xs">{sizeKb}kb</span>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/60 hover:bg-teal-900/40 text-slate-500 hover:text-slate-200 p-1.5 transition-colors lain-border"
        data-testid="button-remove-file"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

type Phase = "form" | "wired";

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
      setPhase("wired");
      setTimeout(() => setPhase("form"), 4000);
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
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10"
          style={{ background: "radial-gradient(ellipse, rgba(40,150,160,0.5) 0%, transparent 70%)" }}
        />
      </div>

      <div className="w-full max-w-xl z-10">
        <AnimatePresence mode="wait">
          {phase === "wired" ? (
            <motion.div
              key="wired"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="lain-border lain-glow overflow-hidden static-noise"
              style={{ background: "linear-gradient(160deg, #060c10 0%, #080f14 100%)" }}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-700/40 to-transparent" />
              <div className="flex items-center gap-2 px-5 py-2.5 border-b border-teal-900/20">
                <span className="text-xs text-teal-700/40 tracking-[0.3em]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  WIRED // NODE CONNECTED
                </span>
              </div>
              <WiredScreen />
              <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-700/20 to-transparent" />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="lain-border lain-glow overflow-hidden static-noise"
              style={{ background: "linear-gradient(160deg, #060c10 0%, #080f14 100%)" }}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-700/30 to-transparent" />

              <div className="flex items-center justify-between px-5 py-2.5 border-b border-teal-900/20">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-1.5 h-1.5 bg-teal-400/60"
                    style={{ boxShadow: "0 0 4px rgba(80,200,200,0.6)" }}
                  />
                  <span className="text-xs text-teal-700/40 tracking-[0.25em]" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    WIRED // ANONYMOUS NODE
                  </span>
                </div>
                <span className="text-[10px] text-slate-700/30 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  PRESENT DAY
                </span>
              </div>

              <div className="px-7 pt-7 pb-4">
                <p className="text-[10px] text-teal-800/50 tracking-[0.35em] uppercase mb-2" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  // ANONYMOUS TRANSMISSION
                </p>
                <h1
                  className="glitch leading-none"
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: "clamp(2.2rem, 6vw, 3.2rem)",
                    color: "rgba(120,200,210,0.75)",
                    textShadow: "0 0 16px rgba(80,200,200,0.4), 2px 0 rgba(200,80,120,0.15)",
                    letterSpacing: "0.05em",
                  }}
                >
                  АНОНИМНОЕ ПОСЛАНИЕ
                </h1>
                <div className="mt-3 h-px bg-gradient-to-r from-teal-800/30 via-teal-700/10 to-transparent" />
              </div>

              <div className="px-7 pb-7">
                <div className="space-y-4">
                  <AnimatePresence>
                    {file && <FilePreview file={file} onRemove={() => setFile(null)} />}
                  </AnimatePresence>

                  <div className="relative">
                    <Textarea
                      placeholder={file ? "подпись к файлу..." : "пиши сюда..."}
                      className="min-h-[160px] text-sm resize-none lain-border bg-black/20 focus-visible:border-teal-700/50 focus-visible:ring-0 focus-visible:shadow-[0_0_12px_rgba(40,140,150,0.15)] transition-all duration-300 p-4 pr-12 placeholder:text-slate-700/40 leading-6"
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        color: "rgba(180,210,215,0.7)",
                        borderRadius: 0,
                      }}
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
                      className="absolute bottom-4 right-3 p-1.5 text-slate-700/50 hover:text-teal-500/70 transition-colors"
                      data-testid="button-attach-file"
                      title="Прикрепить медиа"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-1">
                    <Button
                      size="lg"
                      className="w-full h-11 text-xs tracking-[0.2em] uppercase transition-all lain-border bg-transparent hover:bg-teal-950/30 hover:border-teal-700/40"
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        color: "rgba(120,180,190,0.6)",
                        borderRadius: 0,
                      }}
                      onClick={() => handleSubmit(false)}
                      disabled={isPending || !hasContent}
                      data-testid="button-send-normal"
                    >
                      {isPending ? "connecting..." : "отправить — тихо"}
                    </Button>

                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-teal-900/20" />
                      </div>
                      <div className="relative flex justify-center">
                        <span
                          className="px-3 text-[10px] text-teal-900/40 tracking-[0.4em] uppercase bg-[#070d12]"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          or
                        </span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full h-11 text-xs tracking-[0.2em] uppercase transition-all relative overflow-hidden group"
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        background: "rgba(20,70,80,0.35)",
                        border: "1px solid rgba(40,140,150,0.3)",
                        color: "rgba(150,210,215,0.7)",
                        borderRadius: 0,
                      }}
                      onClick={() => handleSubmit(true)}
                      disabled={isPending || !hasContent}
                      data-testid="button-send-swag"
                    >
                      <div className="absolute inset-0 bg-teal-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-400" />
                      <span className="relative">
                        {isPending ? "connecting..." : "послать нахуй — через wired"}
                      </span>
                    </Button>
                  </div>

                  {!file && content.length > 0 && content.length < 5 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-2 text-xs text-amber-700/60 bg-amber-950/10 border border-amber-900/20 p-3"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <p>signal too weak — but can still transmit</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-700/15 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
