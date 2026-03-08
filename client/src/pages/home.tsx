import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, AlertCircle } from "lucide-react";
import { useSendMessage } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [content, setContent] = useState("");
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { toast } = useToast();

  const handleSubmit = (isSwag: boolean) => {
    if (!content.trim()) return;

    sendMessage(
      { content, isSwag },
      {
        onSuccess: () => {
          setContent("");
          toast({
            title: isSwag ? "Агрессивно отправлено! 💥" : "Успешно отправлено! ✉️",
            description: "Ваше анонимное сообщение успешно доставлено.",
            className: isSwag ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-none" : "",
          });
        },
      }
    );
  };

  return (
    <div className="relative min-h-full flex items-center justify-center p-4 sm:p-8">
      {/* Ambient animated background */}
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
        <Card className="border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] shadow-primary/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8 pb-4 text-center sm:text-left">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="font-display text-3xl sm:text-4xl text-foreground">
                Анонимное послание
              </CardTitle>
              <CardDescription className="text-base mt-2 text-muted-foreground/80">
                Напишите что-нибудь важное... или совершенно бесполезное. 
                Всё останется между нами.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="relative group">
                <Textarea
                  placeholder="Ваше сообщение начинается здесь..."
                  className="min-h-[180px] text-lg resize-none rounded-2xl bg-white/60 border-2 border-border/50 focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-300 p-5 shadow-inner"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full rounded-2xl h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 bg-primary hover:bg-primary/90"
                  onClick={() => handleSubmit(false)}
                  disabled={isPending || !content.trim()}
                >
                  <Send className="w-5 h-5 mr-2" />
                  Отправить спокойно
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
                  className="w-full rounded-2xl h-14 text-base font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 hover:from-orange-600 hover:via-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 border-none group relative overflow-hidden"
                  onClick={() => handleSubmit(true)}
                  disabled={isPending || !content.trim()}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                    Послать нахуй @McTrakser и отправить
                  </span>
                </Button>
              </div>

              {content.length > 0 && content.length < 5 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
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
