import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BookOpen, Feather, MessageSquareX, Image, Video, FileVideo } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { Skeleton } from "@/components/ui/skeleton";

function MediaBadge({ mediaType }: { mediaType: string | null }) {
  if (!mediaType) return null;
  const config = {
    photo: { label: "Фото", Icon: Image },
    video: { label: "Видео", Icon: Video },
    animation: { label: "GIF", Icon: FileVideo },
  }[mediaType];
  if (!config) return null;
  const { label, Icon } = config;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-sans uppercase tracking-widest border border-red-900/40 text-red-700/80 bg-red-950/20">
      <Icon className="w-3 h-3" />
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
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 26 } },
  };

  return (
    <div className="relative min-h-full p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10 mt-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-2.5 border border-red-900/40 rounded bg-red-950/20">
            <BookOpen className="w-5 h-5 text-red-700/70" />
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "'Cinzel', serif", color: "#e0cca0" }}
          >
            Записи тетради
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-stone-500 ml-14 text-sm font-body italic"
        >
          Все послания, записанные в тетрадь смерти.
        </motion.p>
        <div className="mt-4 ml-14 w-48 h-px bg-gradient-to-r from-red-900/50 to-transparent" />
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded border border-red-900/20 bg-[#0d0a09] p-6">
              <Skeleton className="h-4 w-3/4 mb-4 bg-stone-800" />
              <Skeleton className="h-4 w-1/2 mb-6 bg-stone-800" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24 bg-stone-800" />
                <Skeleton className="h-5 w-20 rounded bg-stone-800" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded border border-red-900/30 bg-red-950/10 p-10 text-center">
          <MessageSquareX className="w-10 h-10 text-red-800/60 mb-4 mx-auto" />
          <h3 className="text-lg font-bold text-red-700/80 mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
            Ошибка
          </h3>
          <p className="text-stone-500 font-body italic text-sm">
            Не удалось загрузить записи. Попробуйте обновить страницу.
          </p>
        </div>
      )}

      {!isLoading && !isError && sortedMessages.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="rounded border border-dashed border-red-900/20 bg-[#0d0a09] p-14 text-center">
            <div className="w-16 h-16 border border-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto bg-red-950/10">
              <BookOpen className="w-8 h-8 text-red-900/40" />
            </div>
            <h3
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "'Cinzel', serif", color: "#6b5a3e" }}
            >
              Пустые страницы
            </h3>
            <p className="text-stone-600 font-body italic text-sm max-w-xs mx-auto">
              Тетрадь пуста. Напишите первое анонимное послание.
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && !isError && sortedMessages.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {sortedMessages.map((msg) => (
            <motion.div key={msg.id} variants={item} data-testid={`card-message-${msg.id}`}>
              <div
                className={`rounded border overflow-hidden transition-all duration-200 hover:border-red-900/40 ${
                  msg.isSwag
                    ? "border-red-900/40 bg-gradient-to-br from-[#0d0808] to-[#150a0a]"
                    : "border-red-900/20 bg-[#0d0a09]"
                }`}
              >
                <div className={`h-0.5 w-full ${msg.isSwag ? "bg-gradient-to-r from-red-900 via-red-700 to-red-900" : "bg-red-900/20"}`} />
                <div className="p-5 sm:p-7 border-l-2 border-red-900/30 ml-4">
                  {msg.content && (
                    <p className="text-base text-stone-300 whitespace-pre-wrap leading-8 mb-4 font-body italic">
                      {msg.content}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-red-900/20 flex-wrap gap-2">
                    <span className="text-xs text-stone-600 font-sans tracking-wide">
                      {msg.sentAt
                        ? format(new Date(msg.sentAt), "d MMMM yyyy, HH:mm", { locale: ru })
                        : "Неизвестно"}
                    </span>

                    <div className="flex items-center gap-2 flex-wrap">
                      <MediaBadge mediaType={msg.mediaType ?? null} />
                      {msg.isSwag ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-sans uppercase tracking-widest border border-red-900/50 text-red-600/80 bg-red-950/30">
                          <Feather className="w-3 h-3" />
                          С матом
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-sans uppercase tracking-widest border border-stone-800 text-stone-600">
                          Обычное
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
