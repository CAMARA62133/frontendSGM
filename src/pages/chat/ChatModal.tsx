import { useState, useRef, useEffect } from "react";
import { Send, X, Loader2, Copy, Check, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";


import Toast from "../../components/ui/Toast";
import type { AIParams } from "../../models/Communication";
import { communicationService } from "./services/communicationService";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll fluide
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const askAI = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const params: AIParams = { question: userText };
      const data = await communicationService.askAI(params);

      if (data.success) {
        setMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
      } else {
        throw new Error(data.answer || "Une erreur est survenue.");
      }
    } catch {
      setToast({
        message: "Impossible de contacter l'IA. Veuillez réessayer.",
        type: "error",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "❌ Désolé, je rencontre des difficultés techniques actuellement.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white/90 border border-white/20 w-full max-w-lg h-150 rounded-4xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 shadow-2xl">
        {/* Header - Design conservé à 100% */}
        <header className="bg-linear-to-r from-purple-500 to-cyan-500 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">IA Assistant</h2>
              <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">
                Assistant du système de gestion de messagerie
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-full transition-colors"
          >
            <X size={22} />
          </button>
        </header>

        {/* Messages Area */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4">
              <div className="inline-flex p-3 rounded-2xl bg-linear-to-tr from-purple-500/10 to-cyan-500/10 border border-purple-100 animate-bounce">
                <Sparkles className="text-purple-600" size={32} />
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Assistant{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-cyan-600">
                  Messagerie
                </span>
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed max-w-70">
                Améliorez votre productivité au quotidien. Je vous accompagne
                pour corriger vos textes, effectuer des recherches précises ou
                analyser vos contenus.
              </p>

              <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Comment puis-je assister votre système aujourd'hui ?
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative group max-w-[85%] p-4 transition-all ${
                  msg.role === "user"
                    ? "bg-linear-to-br from-purple-500 to-cyan-500 text-white rounded-2xl rounded-tr-none shadow-lg shadow-purple-200"
                    : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-none"
                }`}
              >
                {/* break-words ajouté pour éviter les débordements */}
                <div className="prose prose-sm max-w-none break-words leading-relaxed overflow-hidden">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {msg.role === "ai" && (
                  <button
                    onClick={() => copyToClipboard(msg.text, i)}
                    className="absolute -right-10 top-0 p-2 text-slate-300 hover:text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedIndex === i ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start items-center gap-3">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none">
                <Loader2 size={20} className="animate-spin text-cyan-500" />
              </div>
              <span className="text-xs text-slate-400 font-medium animate-pulse">
                Analyse des données...
              </span>
            </div>
          )}
        </main>

        {/* Input area */}
        <footer className="p-5 bg-white border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border-2 border-transparent focus-within:border-cyan-500/30 focus-within:bg-white transition-all shadow-sm">
            <input
              type="text"
              placeholder={
                isLoading ? "L'IA réfléchit..." : "Posez votre question..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-slate-700 placeholder:text-slate-400 disabled:cursor-not-allowed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
            />
            <button
              onClick={askAI}
              disabled={isLoading || !input.trim()}
              className="bg-linear-to-r from-purple-500 to-cyan-500 text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center shadow-md shadow-purple-200"
            >
              <Send size={18} />
            </button>
          </div>
        </footer>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
