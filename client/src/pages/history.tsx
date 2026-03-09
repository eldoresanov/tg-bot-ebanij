import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { History as HistoryIcon, Sparkles, MessageSquareX } from "lucide-react";
import { useMessages } from "@/hooks/use-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function History() {
  const { data: messages, isLoading, isError } = useMessages();

  // Sort messages descending (newest first)
  const sortedMessages = messages
    ? [...messages].sort((a, b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())
    : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative min-h-full p-4 sm:p-8 max-w-4xl mx-auto w-full">
      {/* Page Header */}
      <div className="mb-10 mt-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="p-3 bg-white shadow-sm rounded-2xl border border-border/50">
            <HistoryIcon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            История сообщений
          </h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground ml-16"
        >
          Все сообщения, отправленные на модерацию, собраны здесь.
        </motion.p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border-white/60 bg-white/50 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="rounded-3xl border-destructive/20 bg-destructive/5 p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center p-0">
            <MessageSquareX className="w-12 h-12 text-destructive mb-4 opacity-80" />
            <h3 className="text-xl font-bold text-destructive mb-2">Упс, ошибка!</h3>
            <p className="text-destructive/80">Не удалось загрузить историю сообщений. Попробуйте обновить страницу.</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && sortedMessages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="rounded-3xl border-dashed border-border bg-white/40 shadow-sm p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center p-0">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <HistoryIcon className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Пустота...</h3>
              <p className="text-muted-foreground max-w-sm">
                Пока никто ничего не отправил. Станьте первым, кто нарушит эту тишину!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Message List */}
      {!isLoading && !isError && sortedMessages.length > 0 && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {sortedMessages.map((msg) => (
            <motion.div key={msg.id} variants={item}>
              <Card className={`
                rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:shadow-lg
                ${msg.isSwag 
                  ? 'border-pink-200 bg-gradient-to-br from-white to-pink-50 hover:border-pink-300 shadow-pink-500/5' 
                  : 'border-white/60 bg-white/80 backdrop-blur-xl shadow-primary/5 hover:border-primary/20'}
              `}>
                <div className={`h-1 w-full ${msg.isSwag ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-primary/20'}`} />
                <CardContent className="p-6 sm:p-8">
                  <p className="text-lg text-foreground whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {msg.sentAt 
                        ? format(new Date(msg.sentAt), "d MMMM yyyy, HH:mm", { locale: ru })
                        : "Неизвестно"}
                    </span>
                    
                    {msg.isSwag ? (
                      <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        С матом
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border-none px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        Обычное
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
