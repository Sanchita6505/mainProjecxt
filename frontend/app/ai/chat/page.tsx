"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Flame, Sparkles, Send, User, Bot, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  vendors?: { vendor_name?: string; document?: string }[];
}

const SUGGESTIONS = [
  "Best momos near Lajpat Nagar",
  "Spicy chaat under ₹50",
  "Top rated biryani in Delhi",
  "Veg street food in Connaught Place",
];

export default function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post<{ data: { response?: string; reply?: string; context?: { vendor_name?: string; document?: string }[] } }>("/ai/chat", { message: text });
      const assistantMessage = res.data.response || res.data.reply || "No response from AI service";
      setMessages(prev => [...prev, {
        role: "assistant",
        content: assistantMessage,
        vendors: res.data.context,
      }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMsg = err.message || "Sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Flame className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-bold">AI Food Chat</h2>
        <p className="text-muted-foreground max-w-sm">Sign in to chat with our AI and discover the best street food in Delhi.</p>
        <Link href="/login"><Button>Sign in to chat</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.68_0.2_355)] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl">AI Food Chat</h1>
            <p className="text-xs text-muted-foreground">Powered by DilliBites AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-4 min-h-0 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Ask me anything about Delhi street food</h3>
              <p className="text-muted-foreground text-sm mb-6">I'll find the best vendors, dishes, and hidden gems for you.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="px-3 py-2 rounded-xl border border-border bg-card text-sm hover:bg-accent hover:border-primary/30 transition-all text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.68_0.2_355)] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={cn("max-w-[80%] space-y-2")}>
                <div className={cn("rounded-2xl px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm")}>
                  {msg.content}
                </div>
                {msg.vendors && msg.vendors.length > 0 && (
                  <div className="space-y-1.5">
                    {msg.vendors.filter(v => v.vendor_name).map((v, j) => (
                      <div key={j} className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                        <span className="font-semibold text-primary">{v.vendor_name}</span>
                        {v.document && <p className="text-muted-foreground mt-0.5 line-clamp-2">{v.document}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-foreground">
                  {user.name[0].toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-[oklch(0.68_0.2_355)] flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about street food in Delhi..."
            className="flex-1 h-12"
            disabled={loading}
          />
          <Button type="submit" size="lg" className="h-12 px-4" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
