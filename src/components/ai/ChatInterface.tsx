"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { chatWithNvidiaAI } from "@/lib/api";
import type { ChatMessage } from "@/types/mcp";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatInterfaceProps {
  initialMessage?: string;
  contextProblem?: string;
}

export default function ChatInterface({ initialMessage, contextProblem }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextProblem) {
      setMessages([]);
    }
  }, [contextProblem]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  async function handleSendMessage(text: string = input) {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    
    // Add system message if this is the first message
    let newMessages = [...messages, userMessage];
    if (messages.length === 0) {
      const systemMessage: ChatMessage = { 
        role: "system", 
        content: "You are a professional Research Assistant. Your goal is to help solve complex open questions. Provide detailed, scholarly, and creative brainstorms. Do not output internal logs, tool call markers like 'Turn 2', or raw JSON unless asked. Focus on academic and practical approaches." 
      };
      newMessages = [systemMessage, userMessage];
    }

    setMessages(newMessages.filter(m => m.role !== "system")); // Keep UI clean of system messages
    setInput("");
    setIsLoading(true);

    try {
      console.log("[NVIDIA AI] Sending request with messages:", newMessages.length);
      const response = await chatWithNvidiaAI(newMessages);
      console.log("[NVIDIA AI] Received response:", response);
      
      const assistantMessage = response?.choices?.[0]?.message;
      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        toast.error("Received an empty or malformed response from AI");
        // Fallback: If we got nothing, maybe the format was completely unexpected
        console.error("[NVIDIA AI] Malformed response structure:", response);
      }
    } catch (error: any) {
      console.error("[NVIDIA AI] Request error:", error);
      toast.error(error.message || "Failed to get response from AI");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-[600px] border-zinc-200 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
      <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-zinc-800 text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">NVIDIA Research Agent</h3>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">meta/llama-3.1-8b-instruct</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
          onClick={() => setMessages([])}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center">
              <Bot className="h-8 w-8 text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-900 font-semibold">How can I help you today?</p>
              <p className="text-sm text-zinc-500 max-w-[200px] mx-auto mt-1">Ask about quantum computing, biology, or any open problem.</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                m.role === "user" ? "bg-zinc-900 text-white" : "bg-emerald-100 text-emerald-600"
              )}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={cn(
                "rounded-2xl p-4 text-sm leading-relaxed shadow-sm",
                m.role === "user" 
                  ? "bg-zinc-900 text-white rounded-tr-none" 
                  : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-none"
              )}>
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 mr-auto"
          >
            <div className="h-8 w-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Bot className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="bg-white border border-zinc-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-zinc-50/50 border-t border-zinc-100">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-4 pr-14 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-inner"
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white p-0 shadow-lg"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        <p className="text-[10px] text-center text-zinc-400 mt-3 font-medium uppercase tracking-tight">
          Agent-enabled research proxy via NVIDIA NIM
        </p>
      </div>
    </Card>
  );
}
