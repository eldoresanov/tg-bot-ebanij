import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type Message = z.infer<typeof api.messages.send.responses[201]>;
type InsertMessage = z.infer<typeof api.messages.send.input>;

export function useMessages() {
  return useQuery({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const res = await fetch(api.messages.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      
      // Bypassing strict parsing to safely handle JSON date strings without crashing, 
      // since the schema might expect Date objects while JSON provides ISO strings.
      return data as Message[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertMessage) => {
      // Validate locally before sending
      const validated = api.messages.send.input.parse(data);
      
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Не удалось отправить сообщение");
      }

      return (await res.json()) as Message;
    },
    onSuccess: () => {
      // Invalidate the list so history is up-to-date
      queryClient.invalidateQueries({ queryKey: [api.messages.list.path] });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
