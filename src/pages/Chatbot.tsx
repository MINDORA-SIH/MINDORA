import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, PhoneCall, Bell, Grid, RefreshCw, Volume2, Mic } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello Savitri! 👋 I am your Mindora Companion. How can I assist you with your games, medications, or daily schedule today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickPrompts = [
    { label: "🧩 Best game for today?", query: "Which game should I play today for memory improvement?" },
    { label: "💊 Show my medication", query: "What are my upcoming medication reminders?" },
    { label: "📊 Check my progress", query: "How is my brain score and game progress this week?" },
    { label: "💡 Daily brain tip", query: "Give me a daily cognitive tip for senior health" },
  ];

  const getBotResponse = (userText: string): string => {
    const lower = userText.toLowerCase();

    if (lower.includes("game") || lower.includes("play") || lower.includes("puzzle")) {
      return "🎮 Based on your recent activity, **Memory Cards** and **Word Association** are ideal for you today! They help strengthen short-term recall. Would you like to start a game now?";
    } else if (lower.includes("reminder") || lower.includes("medication") || lower.includes("pill") || lower.includes("medicine")) {
      return "💊 **Upcoming Reminders for Today:**\n• 8:00 PM - Donepezil 5mg (1 Tablet after dinner)\n• 9:30 PM - Evening Hydration & Water Intake\n\nAll set! I can remind you 15 minutes before.";
    } else if (lower.includes("progress") || lower.includes("score") || lower.includes("stat") || lower.includes("week")) {
      return "📊 **Great News, Savitri!** Your cognitive accuracy is up **+12%** this week with an overall **85% memory score**. You completed 4 game sessions yesterday! Keep up the brilliant effort!";
    } else if (lower.includes("tip") || lower.includes("exercise") || lower.includes("health") || lower.includes("brain")) {
      return "💡 **Today's Brain Tip:** Try taking a 10-minute gentle morning walk and naming 5 different colors you see outdoors. Combining physical motion with visual recognition boosts brain plasticity!";
    } else if (lower.includes("caretaker") || lower.includes("doctor") || lower.includes("call") || lower.includes("help")) {
      return "📞 **Caregiver Assistance:** You can reach out to your designated caregiver Ramesh at any time. You can tap the 'Help' icon in the top bar to place a direct call!";
    } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      return "Hello Savitri! 😊 I'm right here with you. Feel free to ask me anything about your routine or games!";
    } else {
      return `I understand you asked about "${userText}". I'm always here to help you navigate Mindora, track your reminders, and suggest brain exercises. Is there a specific game or schedule item you'd like help with?`;
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: getBotResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div
      className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-180px)] rounded-3xl shadow-xl border-2 border-purple-100 overflow-hidden"
      style={{ backgroundColor: "var(--card-bg)" }}
    >
      {/* Chatbot Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-inner">
              <Bot size={28} className="text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-purple-700 rounded-full"></span>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wide flex items-center gap-2">
              Mindora Assistant <Sparkles size={20} className="text-amber-300" />
            </h2>
            <p className="text-[18px] sm:text-[20px] text-purple-100 font-medium">Your 24/7 Cognitive Companion</p>
          </div>
        </div>

        <button 
          onClick={() => setMessages([{
            id: Date.now().toString(),
            sender: "bot",
            text: "Chat reset! How can I assist you now, Savitri?",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }])}
          title="Reset Conversation"
          className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 transition-colors text-white text-[20px] font-semibold flex items-center gap-1.5"
        >
          <RefreshCw size={18} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.sender === "user" 
                ? "bg-sky-500 text-white" 
                : "bg-purple-600 text-white"
            }`}>
              {msg.sender === "user" ? <User size={22} /> : <Bot size={22} />}
            </div>

            <div
              className={`max-w-[80%] sm:max-w-[70%] rounded-3xl p-4 shadow-sm ${
                msg.sender === "user"
                  ? "bg-sky-500 text-white rounded-tr-none"
                  : "border-2 border-purple-100/80 rounded-tl-none"
              }`}
              style={
                msg.sender === "user"
                  ? undefined
                  : { backgroundColor: "var(--card-bg)", color: "var(--foreground)" }
              }
            >
              <p className="text-base sm:text-lg font-medium leading-relaxed whitespace-pre-line">
                {msg.text}
              </p>
              <span
                className={`text-[11px] font-semibold mt-1.5 block ${
                  msg.sender === "user" ? "text-sky-100 text-right" : ""
                }`}
                style={msg.sender === "user" ? undefined : { color: "var(--muted)" }}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot size={22} />
            </div>
            <div
              className="border-2 border-purple-100 rounded-3xl rounded-tl-none p-4 shadow-sm flex items-center gap-2"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-t border-purple-100" style={{ backgroundColor: "var(--card-bg)" }}>
        <p className="text-[18px] font-bold tracking-wider mb-2 px-1" style={{ color: "var(--muted)" }}>
          Suggested Questions:
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt.query)}
              className="px-3.5 py-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 dark:text-purple-200 text-[20px] font-bold whitespace-nowrap transition-colors border border-purple-200 flex-shrink-0"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-3 sm:p-4 border-t-2 border-purple-100 flex items-center gap-2" style={{ backgroundColor: "var(--card-bg)" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask Mindora Assistant anything..."
          className="flex-1 bg-slate-100 border-2 border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-800 rounded-2xl px-4 py-3 text-base sm:text-lg font-medium outline-none transition-all placeholder:text-slate-400"
          style={{ color: "var(--foreground)" }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="p-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={22} />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;

