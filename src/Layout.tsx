import { Outlet, NavLink, useNavigate } from "react-router";
import logoUrl from "./assets/logo.png";
import { User, HelpCircle, Globe, Gamepad2, BarChart2, Bell, Settings as SettingsIcon, PhoneCall, BookOpen, Mail, Mic, MicOff, X, Volume2, Bot, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "en-US", name: "English (US)", nativeName: "English", flag: "🇺🇸" },
  { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "bn-IN", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "mr-IN", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "es-ES", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
];

export function Layout() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    const saved = localStorage.getItem("mindora_lang");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return LANGUAGES[0]; // Hindi default matching screenshot
  });

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleVoiceCommand = (text: string) => {
    setTranscript(text);
    const lower = text.toLowerCase();
    
    if (lower.includes("game") || lower.includes("home") || lower.includes("play")) {
      setVoiceFeedback("Navigating to Games...");
      setTimeout(() => {
        navigate("/");
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else if (lower.includes("chat") || lower.includes("bot") || lower.includes("assistant")) {
      setVoiceFeedback("Opening Chatbot...");
      setTimeout(() => {
        navigate("/chatbot");
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else if (lower.includes("progress") || lower.includes("dashboard") || lower.includes("stat")) {
      setVoiceFeedback("Navigating to Progress Dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else if (lower.includes("reminder") || lower.includes("medicine") || lower.includes("pill")) {
      setVoiceFeedback("Navigating to Reminders...");
      setTimeout(() => {
        navigate("/reminders");
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else if (lower.includes("setting")) {
      setVoiceFeedback("Navigating to Settings...");
      setTimeout(() => {
        navigate("/settings");
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else if (lower.includes("profile") || lower.includes("patient") || lower.includes("account")) {
      setVoiceFeedback("Opening Profile...");
      setTimeout(() => {
        navigate("/profile");
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else if (lower.includes("help") || lower.includes("caretaker") || lower.includes("support")) {
      setVoiceFeedback("Opening Help Menu...");
      setIsHelpOpen(true);
      setTimeout(() => {
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else {
      setVoiceFeedback(`Heard: "${text}" [Voice Lang: ${currentLang.code}]`);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceFeedback(null);
    } else {
      setIsListening(true);
      setTranscript("");
      setVoiceFeedback(null);

      const windowWithSpeech = window as unknown as {
        SpeechRecognition?: new () => any;
        webkitSpeechRecognition?: new () => any;
      };

      const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = currentLang.code;
          recognition.onresult = (event: any) => {
            const speechResult = event.results[0][0].transcript;
            handleVoiceCommand(speechResult);
          };
          recognition.onerror = () => {};
          recognition.onend = () => {};
          recognition.start();
        } catch (e) {
          console.error("Speech recognition error:", e);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center text-[#1E2445]">
      {/* Laptop & Mobile Responsive App Container */}
      <div className="w-full max-w-6xl min-h-screen bg-white shadow-xl flex flex-col relative border-x border-slate-200/60">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
          {/* Left Side: MINDORA Logo + Brand Title + Language underneath */}
          <div className="flex items-center gap-3 md:gap-4">
            <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-amber-300 shadow-xs flex items-center justify-center overflow-hidden bg-white flex-shrink-0">
                <img src={logoUrl} alt="Mindora Logo" className="w-full h-full object-cover" />
              </div>
            </NavLink>

            <div className="flex flex-col gap-1">
              <NavLink to="/" className="hover:opacity-90 transition-opacity">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#1E2445] leading-none">
                  MINDORA
                </span>
              </NavLink>

              {/* Language Selector Dropdown Pill — below the title */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  aria-label="Select Language"
                  title="Language Settings"
                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
                >
                  <Globe size={13} className="text-purple-600 flex-shrink-0" />
                  <span className="text-sm">{currentLang.flag}</span>
                  <span className="hidden sm:inline font-bold text-slate-800 text-xs">{currentLang.name}</span>
                  <span className="sm:hidden font-extrabold text-slate-800 text-[10px]">{currentLang.code.split("-")[0].toUpperCase()}</span>
                  <ChevronDown size={12} className={clsx("text-slate-400 transition-transform duration-200", isLangOpen && "rotate-180")} />
                </button>

                {isLangOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                        Select Language / भाषा
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">
                        {currentLang.code}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-1.5 max-h-64 overflow-y-auto">
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCurrentLang(lang);
                            setIsLangOpen(false);
                            localStorage.setItem("mindora_lang", JSON.stringify(lang));
                          }}
                          className={clsx(
                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all text-left w-full cursor-pointer min-h-[48px]",
                            currentLang.code === lang.code
                              ? "bg-purple-600 text-white shadow-sm"
                              : "hover:bg-purple-50 text-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{lang.flag}</span>
                            <div>
                              <div className="font-extrabold text-sm sm:text-base">{lang.name}</div>
                              <div className={clsx("text-xs font-medium", currentLang.code === lang.code ? "text-purple-100" : "text-slate-500")}>
                                {lang.nativeName}
                              </div>
                            </div>
                          </div>
                          {currentLang.code === lang.code && (
                            <Check size={20} className="text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Header Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* 1. Mic Button */}
            <button
              onClick={toggleListening}
              title="Voice Assistant"
              className={clsx(
                "h-11 sm:h-12 px-3.5 sm:px-4 rounded-full border-2 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0 font-bold text-sm",
                isListening
                  ? "bg-[#FF6584] text-white border-[#FF6584] animate-pulse"
                  : "bg-[#FFF0F3] hover:bg-[#FFE0E6] border-[#FFE0E6] text-[#FF6584]"
              )}
            >
              {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              <span className="hidden md:inline font-extrabold">
                {isListening ? "Listening..." : "Mic"}
              </span>
            </button>

            {/* 2. Chatbot Button */}
            <div className="relative">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                title="Mindora AI Assistant"
                className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-[#F5F0FF] hover:bg-[#EBE0FF] border-2 border-[#EBE0FF] text-[#9333EA] flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0 font-bold text-sm"
              >
                <Bot size={22} />
                <span className="hidden md:inline font-extrabold">Chatbot</span>
              </button>

              {isChatOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 p-4 flex flex-col gap-3.5 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Bot size={18} />
                      </div>
                      <span className="font-extrabold text-slate-800 text-base">Mindora AI Assistant</span>
                    </div>
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-snug">
                    Hi Savitri! Ask me anything about your activities, schedule, or brain health tips.
                  </p>
                  <button
                    onClick={() => {
                      setIsChatOpen(false);
                      navigate("/chatbot");
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-sm text-center flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[48px]"
                  >
                    <Bot size={18} /> Open Mindora AI Chatbot
                  </button>
                </div>
              )}
            </div>

            {/* 3. Help Button */}
            <div className="relative">
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                title="Help & Support"
                className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-[#F0F7FF] hover:bg-[#E0F0FF] border-2 border-[#E0F0FF] text-[#3B82F6] flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0 font-bold text-sm"
              >
                <HelpCircle size={22} />
                <span className="hidden md:inline font-extrabold">Help</span>
              </button>

              {isHelpOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 p-2.5 flex flex-col gap-2 z-50">
                  <button className="flex items-center gap-3 p-3.5 rounded-xl bg-pink-50 hover:bg-pink-100 font-extrabold text-sm text-slate-800 transition-colors w-full text-left cursor-pointer min-h-[48px]">
                    <PhoneCall size={22} className="text-pink-500 flex-shrink-0" /> Call Caretaker
                  </button>
                  <button className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 font-extrabold text-sm text-slate-800 transition-colors w-full text-left cursor-pointer min-h-[48px]">
                    <BookOpen size={22} className="text-blue-500 flex-shrink-0" /> Tutorial
                  </button>
                  <button className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 font-extrabold text-sm text-slate-800 transition-colors w-full text-left cursor-pointer min-h-[48px]">
                    <Mail size={22} className="text-purple-500 flex-shrink-0" /> Contact Support
                  </button>
                </div>
              )}
            </div>

            {/* 4. Profile Button */}
            <NavLink
              to="/profile"
              title="Profile"
              className="h-11 sm:h-12 px-3 sm:px-4 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0 font-bold text-sm"
            >
              <User size={22} />
              <span className="hidden md:inline font-extrabold">Profile</span>
            </NavLink>
          </div>
        </header>

        {/* Voice Assistant Overlay Modal */}
        {isListening && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm sm:max-w-md w-full shadow-2xl border border-pink-200 flex flex-col items-center gap-4 text-center relative animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsListening(false)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close voice assistant"
              >
                <X size={20} />
              </button>

              <div className="relative mt-2">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center animate-bounce shadow-inner">
                  <Mic size={32} className="text-[#FF6584]" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow border border-pink-200">
                  <Volume2 size={14} className="text-[#FF6584] animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-xl sm:text-2xl text-slate-800">Voice Assistant</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                  {voiceFeedback || "Listening... Speak a command"}
                </p>
              </div>

              {transcript && (
                <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs sm:text-sm italic">
                  "{transcript}"
                </div>
              )}

              <button
                onClick={() => setIsListening(false)}
                className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors text-sm shadow-xs cursor-pointer mt-1"
              >
                Stop Listening
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pt-4 md:pt-6 pb-28 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] z-40 py-2 px-4 md:px-8">
          <div className="grid grid-cols-4 items-center max-w-md sm:max-w-lg md:max-w-xl mx-auto">
            <NavItem to="/" icon={<Gamepad2 size={24} />} label="Games" />
            <NavItem to="/dashboard" icon={<BarChart2 size={24} />} label="Progress" />
            <NavItem to="/reminders" icon={<Bell size={24} />} label="Reminders" />
            <NavItem to="/settings" icon={<SettingsIcon size={24} />} label="Settings" />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center py-1 transition-all flex-1 text-center cursor-pointer",
          isActive
            ? "text-[#7C3AED] font-extrabold"
            : "text-slate-400 hover:text-slate-600 font-medium"
        )
      }
    >
      {({ isActive }) => (
        <>
          {icon}
          <span className="text-[11px] sm:text-xs mt-0.5 leading-tight">{label}</span>
          <div
            className={clsx(
              "w-6 h-0.5 rounded-full mt-0.5 transition-all",
              isActive ? "bg-[#7C3AED]" : "bg-transparent"
            )}
          />
        </>
      )}
    </NavLink>
  );
}
