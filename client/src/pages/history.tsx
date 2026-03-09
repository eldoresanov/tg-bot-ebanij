import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Database, Image, Video, FileVideo, AlertTriangle } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { Skeleton } from "@/components/ui/skeleton";

function MediaBadge({ mediaType }: { mediaType: string | null }) {
  if (!mediaType) return null;
  const config = {
    photo: { label: "IMG", Icon: Image },
    video: { label: "VID", Icon: Video },
    animation: { label: "GIF", Icon: FileVideo },
  }[mediaType];
  if (!config) return null;
  const { label, Icon } = config;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest border border-purple-700/40 text-purple-400/70 bg-purple-950/30"
      style={{ fontFamily: "'Share Tech Mono', monospace" }}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

export default function History() {
  const { data: messages, isLoading, isError } = useMessages();

  const sortedMessages = messages
    ? [...messages].sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())
    : [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  };

  return (
    <div className="relative min-h-full p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10 mt-4">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-3"
        >
          <div className="p-2.5 border border-purple-700/40 bg-purple-950/20">
            <Database className="w-4 h-4 text-purple-500/70" />
          </div>
          <div>
            <p className="text-[10px] text-purple-600/50 tracking-[0.35em] uppercase mb-0.5"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              NERV // DATA ARCHIVE
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-white/90 tracking-wider leading-none"
              style={{ fontFamily: "'Orbitron', sans-serif", textShadow: "0 0 20px rgba(120,40,255,0.4)" }}>
              TRANSMISSION LOG
            </h1>
          </div>
        </motion.div>
        <div className="ml-14 h-px bg-gradient-to-r from-purple-700/40 via-purple-500/10 to-transparent w-48" />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-purple-800/30 bg-[#060312] p-5">
              <Skeleton className="h-3 w-3/4 mb-3 bg-purple-900/30" />
              <Skeleton className="h-3 w-1/2 mb-5 bg-purple-900/30" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-28 bg-purple-900/30" />
                <Skeleton className="h-4 w-16 bg-purple-900/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="border border-red-800/40 bg-red-950/10 p-10 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600/60 mb-4 mx-auto" />
          <h3 className="text-sm font-bold text-red-500/70 mb-2 tracking-widest uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}>
            SYSTEM ERROR
          </h3>
          <p className="text-purple-500/50 text-xs tracking-wide"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            FAILED TO LOAD ARCHIVE // REFRESH AND TRY AGAIN
          </p>
        </div>
      )}

      {!isLoading && !isError && sortedMessages.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="border border-purple-800/20 bg-[#060312] p-14 text-center">
            <div className="w-14 h-14 border border-purple-800/30 flex items-center justify-center mb-6 mx-auto bg-purple-950/20">
              <Database className="w-6 h-6 text-purple-700/40" />
            </div>
            <h3 className="text-sm font-black mb-3 tracking-widest uppercase text-purple-600/50"
              style={{ fontFamily: "'Orbitron', sans-serif" }}>
              NO DATA
            </h3>
            <p className="text-purple-700/40 text-xs tracking-wide max-w-xs mx-auto"
              style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              ARCHIVE IS EMPTY // INITIATE FIRST TRANSMISSION
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && sortedMessages.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {sortedMessages.map((msg) => (
            <motion.div key={msg.id} variants={item} data-testid={`card-message-${msg.id}`}>
              <div
                className={`border overflow-hidden transition-all duration-200 ${
                  msg.isSwag
                    ? "border-purple-500/40 bg-gradient-to-br from-[#0a031a] to-[#120526] hover:border-purple-400/60"
                    : "border-purple-800/25 bg-[#060312] hover:border-purple-700/40"
                }`}
              >
                <div className={`h-0.5 w-full ${msg.isSwag
                  ? "bg-gradient-to-r from-purple-700 via-purple-400 to-purple-700"
                  : "bg-purple-900/30"}`}
                />
                <div className="p-5 sm:p-6 border-l-2 border-purple-700/25 ml-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-purple-700/40 text-xs mt-0.5 flex-shrink-0"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                      &gt;
                    </span>
                    {msg.content && (
                      <p className="text-sm text-purple-100/75 whitespace-pre-wrap leading-6"
                        style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                        {msg.content}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-purple-900/30 flex-wrap gap-2">
                    <span className="text-[10px] text-purple-600/40 tracking-widest"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}>
                      {msg.sentAt
                        ? format(new Date(msg.sentAt), "dd.MM.yyyy // HH:mm", { locale: ru })
                        : "TIMESTAMP UNKNOWN"}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      <MediaBadge mediaType={msg.mediaType ?? null} />
                      {msg.isSwag ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest border border-purple-500/50 text-purple-300/70 bg-purple-900/20"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          ⚡ BERSERK
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest border border-purple-800/30 text-purple-600/40"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          STANDARD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
