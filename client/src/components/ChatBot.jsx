// ChatBot — Slide-up chat panel with message history and typing indicator
import { useState, useRef, useEffect } from "react";
import { HiOutlineChat, HiOutlineX, HiOutlinePaperAirplane } from "react-icons/hi";
import api from "../services/api";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! 👋 I'm NutriAI, your personal nutrition assistant. Ask me anything about food, meals, or healthy eating!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Send only role & content for API
      const chatHistory = updatedMessages
        .filter((m) => m.role !== "system")
        .map(({ role, content }) => ({ role, content }));

      const res = await api.post("/ai/chat", { messages: chatHistory });
      const reply = res.data?.data?.reply || "Sorry, I couldn't process that. Try again!";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Please try again. 😕" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating chat button */}
      <button
        id="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-slate-700 dark:bg-slate-600 rotate-0"
            : "bg-gradient-to-br from-brand-500 to-cyan-500 hover:shadow-xl hover:shadow-brand-500/25 hover:scale-105"
        }`}
      >
        {isOpen ? (
          <HiOutlineX className="text-2xl text-white" />
        ) : (
          <HiOutlineChat className="text-2xl text-white" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-300 origin-bottom-right ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-cyan-500 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-white">NutriAI Chat</h3>
                <p className="text-xs text-white/70">Powered by GROQ</p>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-300 animate-pulse" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-br-md"
                      : "bg-slate-100 dark:bg-surface-700 text-slate-800 dark:text-slate-200 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-slate-100 dark:bg-surface-700 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                placeholder="Ask about nutrition..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-50 dark:bg-surface-900 border-none rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              />
              <button
                id="chat-send"
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-brand-500 text-white disabled:opacity-40 hover:bg-brand-600 transition-colors"
              >
                <HiOutlinePaperAirplane className="text-lg rotate-90" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
