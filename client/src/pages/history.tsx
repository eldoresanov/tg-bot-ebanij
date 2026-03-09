import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Image, Video, FileVideo } from "lucide-react";
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
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest lain-border text-teal-600/50"
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
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  };

  return (
    <div className="relative min-h-full p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10 mt-4">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3"
        >
          <p
            className="text-[10px] text-teal-800/50 tracking-[0.35em] uppercase mb-2"
            style={{ fontFamily: "'Share Tech Mono', monospace" }}
          >
            // NODE HISTORY
          </p>
          <h1
            className="glitch leading-none"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "clamp(2rem, 5vw, 2.8rem)",
              color: "rgba(120,200,210,0.65)",
              textShadow: "0 0 12px rgba(80,200,200,0.3)",
              letterSpacing: "0.05em",
            }}
          >
            TRANSMISSION LOG
          </h1>
        </motion.div>
        <div className="h-px w-40 bg-gradient-to-r from-teal-700/30 to-transparent" />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="lain-border bg-[#060c10] p-5">
              <Skeleton className="h-3 w-3/4 mb-3 bg-teal-900/20" />
              <Skeleton className="h-3 w-1/2 mb-5 bg-teal-900/20" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-28 bg-teal-900/20" />
                <Skeleton className="h-4 w-14 bg-teal-900/20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="lain-border bg-[#060c10] p-10 text-center">
          <p
            className="text-sm text-teal-700/50 mb-2 tracking-[0.3em] uppercase"
            style={{ fontFamily: "'VT323', monospace", fontSize: "1.4rem" }}
          >
            CONNECTION ERROR
          </p>
          <p className="text-[10px] text-slate-600/40 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
            node unreachable — try again
          </p>
        </div>
      )}

      {!isLoading && !isError && sortedMessages.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="lain-border bg-[#060c10] p-14 text-center">
            <p
              className="text-teal-700/30 mb-3"
              style={{ fontFamily: "'VT323', monospace", fontSize: "1.8rem", letterSpacing: "0.1em" }}
            >
              NO DATA
            </p>
            <p className="text-[10px] text-slate-700/30 tracking-widest" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              the wired is silent — be the first to connect
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && sortedMessages.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2.5">
          {sortedMessages.map((msg) => (
            <motion.div key={msg.id} variants={item} data-testid={`card-message-${msg.id}`}>
              <div
                className={`overflow-hidden transition-all duration-200 lain-border ${
                  msg.isSwag
                    ? "bg-gradient-to-br from-[#060d12] to-[#081015] hover:border-teal-600/30"
                    : "bg-[#060c10] hover:border-teal-800/30"
                }`}
              >
                <div className={`h-px w-full ${msg.isSwag ? "bg-teal-600/25" : "bg-teal-900/15"}`} />
                <div className="p-5 sm:p-6 border-l border-teal-800/20 ml-3">
                  {msg.content && (
                    <p
                      className="text-sm whitespace-pre-wrap leading-6 mb-4"
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        color: msg.isSwag ? "rgba(160,215,220,0.65)" : "rgba(140,190,200,0.55)",
                      }}
                    >
                      {msg.content}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-teal-900/15 flex-wrap gap-2">
                    <span
                      className="text-[10px] text-slate-600/40 tracking-widest"
                      style={{ fontFamily: "'Share Tech Mono', monospace" }}
                    >
                      {msg.sentAt
                        ? format(new Date(msg.sentAt), "dd.MM.yyyy // HH:mm", { locale: ru })
                        : "timestamp unknown"}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      <MediaBadge mediaType={msg.mediaType ?? null} />
                      {msg.isSwag ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest lain-border text-teal-400/50 bg-teal-950/20"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          wired+
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest lain-border text-slate-600/35"
                          style={{ fontFamily: "'Share Tech Mono', monospace" }}
                        >
                          standard
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
