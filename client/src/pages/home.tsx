import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Paperclip, X, Image, Video, FileVideo, Radio, Send, Zap } from "lucide-react";
import { useSendMessage, useSendMedia } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

const SYNC_LINES = [
  "NERV CENTRAL DOGMA // TERMINAL ACTIVE",
  "ENTRY PLUG INTERFACE ESTABLISHED",
  "LCL PRESSURIZATION COMPLETE",
  "NEURAL LINK SYNCHRONIZED",
  "INITIATING TRANSMISSION...",
];

function SyncScreen() {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setLineIndex((i) => {
        if (i >= SYNC_LINES.length - 1) { clearInterval(lineTimer); return i; }
        return i + 1;
      });
    }, 420);
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progressTimer); setDone(true); return 100; }
        return p + 4;
      });
    }, 90);
    return () => { clearInterval(lineTimer); clearInterval(progressTimer); };
  }, []);

  return (
    <div className="w-full py-14 px-8 flex flex-col gap-6 relative scanline">
      <div className="flex items-center gap-3 mb-2">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="w-2.5 h-2.5 rounded-full bg-[#00ff64]"
          style={{ boxShadow: "0 0 8px #00ff64, 0 0 20px #00ff64" }}
        />
        <span className="text-[#00ff64] text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: "'Share Tech Mono', monospace", textShadow: "0 0 10px rgba(0,255,100,0.6)" }}>
          NERV SYS // TRANSMISSION IN PROGRESS
        </span>
      </div>

      <div className="border border-purple-800/40 bg-black/40 p-4 rounded-sm space-y-1.5 min-h-[140px]">
        {SYNC_LINES.slice(0, lineIndex + 1).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="text-purple-500/60 text-xs" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              &gt;
            </span>
            <span
              className="text-xs"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                color: i === lineIndex ? "#00ff64" : "rgba(180,140,255,0.6)",
                textShadow: i === lineIndex ? "0 0 8px rgba(0,255,100,0.5)" : "none",
              }}
            >
              {line}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-purple-400/60 tracking-widest uppercase"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            SYNC RATE
          </span>
          <motion.span
            className="text-sm font-bold"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: "#00ff64",
              textShadow: "0 0 10px rgba(0,255,100,0.7)",
            }}
          >
            {progress}%
          </motion.span>
        </div>
        <div className="h-2 bg-black/50 border border-purple-800/30 rounded-sm overflow-hidden">
          <motion.div
            className="h-full rounded-sm"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #7b2fff 0%, #00ff64 100%)",
              boxShadow: "0 0 12px rgba(0,255,100,0.6)",
              transition: "width 0.09s linear",
            }}
          />
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p
              className="text-sm tracking-[0.4em] uppercase"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                color: "#00ff64",
                textShadow: "0 0 20px rgba(0,255,100,0.8), 0 0 40px rgba(0,255,100,0.4)",
              }}
            >
              ✓ TRANSMISSION COMPLETE
            </p>
            <p className="text-xs text-purple-500/50 mt-2 tracking-widest"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              MESSAGE FORWARDED TO MODERATOR
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
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      className="relative rounded-sm overflow-hidden border border-purple-700/30 bg-black/30 group"
      data-testid="file-preview"
    >
      {isImage ? (
        <img src={url} alt="preview" className="w-full max-h-48 object-cover opacity-75" />
      ) : (
        <video src={url} className="w-full max-h-48 object-cover opacity-75" muted playsInline />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-purple-400/80 flex-shrink-0" />
        <span className="text-purple-200/80 text-xs truncate flex-1"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}>{file.name}</span>
        <span className="text-purple-400/50 text-xs">{sizeKb}KB</span>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-black/60 hover:bg-purple-900/60 text-purple-400/80 hover:text-white rounded-sm p-1.5 transition-colors border border-purple-700/20"
        data-testid="button-remove-file"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

type Phase = "form" | "sync";

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

  const getTelegramUserId = (): number | undefined => {
    try {
      return (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    } catch {
      return undefined;
    }
  };

  const handleSubmit = (isSwag: boolean) => {
    if (!hasContent) return;

    const telegramUserId = getTelegramUserId();

    const onSuccess = () => {
      setContent("");
      setFile(null);
      setPhase("sync");
      setTimeout(() => setPhase("form"), 3200);
    };

    if (file) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("isSwag", String(isSwag));
      if (telegramUserId) formData.append("telegramUserId", String(telegramUserId));
      formData.append("file", file);
      sendMedia(formData, { onSuccess });
    } else {
      sendMessage({ content, isSwag, ...(telegramUserId ? { telegramUserId } : {}) }, { onSuccess });
    }
  };

  return (
    <div className="relative min-h-full flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, rgba(100,30,180,0.4) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-700/30 to-transparent" />
      </div>

      <div className="w-full max-w-2xl z-10">
        <AnimatePresence mode="wait">
          {phase === "sync" ? (
            <motion.div
              key="sync"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="nerv-border rounded-sm purple-glow overflow-hidden"
              style={{ background: "linear-gradient(135deg, #060312 0%, #0a0520 100%)" }}
            >
              <div className="warning-stripe h-1.5 w-full" />
              <div className="flex items-center gap-2 px-5 py-3 border-b border-purple-800/20">
                <Radio className="w-3.5 h-3.5 text-purple-500/60" />
                <span className="text-xs text-purple-400/50 tracking-[0.25em] uppercase"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  EVANGELION UNIT-01 // INTERFACE
                </span>
              </div>
              <SyncScreen />
              <div className="warning-stripe h-1.5 w-full" />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="nerv-border rounded-sm purple-glow overflow-hidden"
              style={{ background: "linear-gradient(135deg, #060312 0%, #0a0520 100%)" }}
            >
              <div className="warning-stripe h-1.5 w-full" />

              <div className="flex items-center justify-between px-5 py-2.5 border-b border-purple-800/20">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-[#00ff64]"
                    style={{ boxShadow: "0 0 6px #00ff64" }}
                  />
                  <span className="text-xs text-purple-400/50 tracking-[0.25em] uppercase"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    NERV // ANONYMOUS TRANSMISSION
                  </span>
                </div>
                <span className="text-xs text-purple-600/40 tracking-widest"
                  style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                  EVA-01
                </span>
              </div>

              <div className="px-7 pt-7 pb-4">
                <div className="mb-1">
                  <p className="text-xs text-purple-500/50 tracking-[0.3em] uppercase mb-2"
                    style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                    // UNIT-01 TRANSMISSION INTERFACE
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white/90 tracking-wider"
                    style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 20px rgba(120,40,255,0.5)" }}>
                    ANON
                    <span style={{ color: "#7b2fff", textShadow: "0 0 20px rgba(120,40,255,0.8)" }}>
                      {" "}ПОСЛАНИЕ
                    </span>
                  </h1>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-purple-700/50 via-purple-500/20 to-transparent" />
              </div>

              <div className="px-7 pb-7">
                <div className="space-y-4">
                  <AnimatePresence>
                    {file && <FilePreview file={file} onRemove={() => setFile(null)} />}
                  </AnimatePresence>

                  <div className="relative">
                    <Textarea
                      placeholder={file ? "CAPTION (OPTIONAL)..." : "ENTER MESSAGE..."}
                      className="min-h-[160px] text-sm resize-none rounded-sm border border-purple-800/40 bg-black/30 focus-visible:border-purple-600/70 focus-visible:ring-1 focus-visible:ring-purple-600/30 transition-all duration-200 p-4 pr-14 text-purple-100/80 placeholder:text-purple-700/40 leading-6"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
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
                      className="absolute bottom-4 right-4 p-2 rounded-sm text-purple-600/50 hover:text-purple-400 hover:bg-purple-900/20 transition-colors border border-transparent hover:border-purple-700/30"
                      data-testid="button-attach-file"
                      title="Прикрепить медиа"
                    >
                      <Paperclip className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 pt-1">
                    <Button
                      size="lg"
                      className="w-full rounded-sm min-h-12 h-auto py-3 text-xs tracking-tight sm:tracking-[0.2em] uppercase font-bold transition-all border border-purple-700/50 bg-purple-950/40 hover:bg-purple-900/50 hover:border-purple-600/70 text-purple-200/80 whitespace-normal text-center leading-tight"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                      onClick={() => handleSubmit(false)}
                      disabled={isPending || !hasContent}
                      data-testid="button-send-normal"
                    >
                      <Send className="w-3.5 h-3.5 mr-2 opacity-70 shrink-0" />
                      {isPending ? "TRANSMITTING..." : "SEND — СТАНДАРТНЫЙ РЕЖИМ"}
                    </Button>

                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-purple-900/40" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 text-[10px] text-purple-700/50 tracking-[0.4em] uppercase bg-[#070315]"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                          OR
                        </span>
                      </div>
                    </div>

                    <Button
                      size="lg"
                      className="w-full rounded-sm min-h-12 h-auto py-3 text-xs tracking-tight sm:tracking-[0.2em] uppercase font-black transition-all relative overflow-hidden group border border-purple-500/60 whitespace-normal text-center leading-tight"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        background: "linear-gradient(135deg, #2d0f6b 0%, #4a1482 100%)",
                        color: "#e0d0ff",
                        boxShadow: "0 0 20px rgba(120,40,200,0.3), inset 0 0 20px rgba(120,40,200,0.1)",
                      }}
                      onClick={() => handleSubmit(true)}
                      disabled={isPending || !hasContent}
                      data-testid="button-send-swag"
                    >
                      <div className="absolute inset-0 bg-purple-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center justify-center gap-2 flex-wrap">
                        <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#00ff64" }} />
                        {isPending ? "TRANSMITTING..." : "ПОСЛАТЬ НАХУЙ — БЕРСЕРК РЕЖИМ"}
                      </span>
                    </Button>
                  </div>

                  {!file && content.length > 0 && content.length < 5 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-2 text-xs text-amber-500/70 bg-amber-950/20 border border-amber-800/30 p-3 rounded-sm"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <p>WARNING // MESSAGE TOO SHORT — CAN STILL TRANSMIT</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="warning-stripe h-1.5 w-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
