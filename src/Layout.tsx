import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import logoUrl from "./assets/logo.png";
import { User, HelpCircle, Globe, Gamepad2, BarChart2, Bell, Settings as SettingsIcon, PhoneCall, BookOpen, Mail, Mic, MicOff, X, Volume2, Bot, ChevronDown, Check, Moon, Sun, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindora_dark") === "true");
  const [transcript, setTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Refs for click-outside detection on every popup
  const langRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Close all popups — called before opening any new one
  const closeAllPopups = useCallback(() => {
    setIsLangOpen(false);
    setIsListening(false);
    setIsChatOpen(false);
    setIsHelpOpen(false);
    setVoiceFeedback(null);
  }, []);

  // Track navigation direction for slide animations
  const routeOrder = ["/", "/dashboard", "/reminders", "/settings", "/profile", "/chatbot", "/who-is-this"];
  const prevPathRef = useRef(location.pathname);
  const [slideDirection, setSlideDirection] = useState("page-slide-right");
  const [isWide, setIsWide] = useState(() => window.innerWidth > 600);

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth > 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply dark mode class to <html> element and persist
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("mindora_dark", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const prevIndex = routeOrder.indexOf(prevPathRef.current);
    const currIndex = routeOrder.indexOf(location.pathname);
    setSlideDirection(currIndex >= prevIndex ? "page-slide-right" : "page-slide-left");
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

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
      <div className="w-full min-h-screen flex flex-col relative transition-colors duration-300" style={{ backgroundColor: "var(--card-bg)", color: "var(--foreground)" }}>
        
        {/* Header */}
        <header className="px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-xs transition-colors duration-300" style={{ backgroundColor: "var(--header-bg)", borderBottom: "1px solid var(--header-border)" }}>
          {/* Left Side: MINDORA Logo + Brand Title + Language underneath */}
          <div className="flex items-center gap-3 md:gap-4">
            <NavLink to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity flex-shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-amber-300 shadow-xs flex items-center justify-center overflow-hidden bg-white flex-shrink-0">
                <img src={logoUrl} alt="Mindora Logo" className="w-full h-full object-cover" />
              </div>
            </NavLink>

            <div className="flex flex-col gap-1">
              <NavLink to="/" className="hover:opacity-90 transition-opacity">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none" style={{ color: "var(--foreground)" }}>
                  MINDORA
                </span>
              </NavLink>

              <div className="relative">
                <button
                  onClick={() => { if (!isLangOpen) closeAllPopups(); setIsLangOpen(!isLangOpen); }}
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
              </div>
            </div>
          </div>

          {/* Right Side Header Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* 1. Mic Button */}
            <button
              onClick={() => {
                if (!isListening) closeAllPopups();
                toggleListening();
              }}
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
                {isListening ? "Listening..." : "Talk"}
              </span>
            </button>

            {/* 2. Chatbot Button */}
            <button
              onClick={() => { if (!isChatOpen) closeAllPopups(); setIsChatOpen(!isChatOpen); }}
              title="Mindora AI Assistant"
              className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-full bg-[#F5F0FF] hover:bg-[#EBE0FF] border-2 border-[#EBE0FF] text-[#9333EA] flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0 font-bold text-sm"
            >
              <Bot size={22} />
              <span className="hidden md:inline font-extrabold">Chatbot</span>
            </button>

            {/* 3. Help Button */}
            <button
              onClick={() => { if (!isHelpOpen) closeAllPopups(); setIsHelpOpen(!isHelpOpen); }}
              title="Help & Support"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[#F0F7FF] hover:bg-[#E0F0FF] border-2 border-[#E0F0FF] text-[#3B82F6] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0"
            >
              <HelpCircle size={22} />
            </button>

            {/* 4. Dark Mode Toggle */}
            {isWide && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className={clsx(
                  "h-11 w-11 sm:h-12 sm:w-12 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0",
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700",
                )}
              >
                {darkMode ? (
                  <Sun size={22} className="text-amber-500" />
                ) : (
                  <Moon size={22} className="text-indigo-500" />
                )}
              </button>
            )}

            {/* 5. Profile Button */}
            <NavLink
              to="/profile"
              title="Profile"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0"
            >
              <User size={22} />
            </NavLink>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 pt-4 md:pt-6 pb-28 max-w-6xl w-full mx-auto overflow-x-hidden">
          <div key={location.pathname} className={slideDirection}>
            <Outlet context={{ darkMode, setDarkMode }} />
          </div>
        </main>

        {/* Floating Glass Bottom Navigation */}
        <nav className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md sm:max-w-lg group">
          <div className={clsx(
            "backdrop-blur-xl border shadow-[0_8px_40px_rgba(255,101,132,0.12),0_2px_12px_rgba(0,0,0,0.04)] rounded-[28px] px-3 sm:px-5 py-2.5 sm:py-3 transition-all duration-300 ease-out",
            darkMode
              ? "bg-[rgba(30,41,59,0.85)] border-slate-700/60 group-hover:bg-[rgba(30,41,59,0.95)]"
              : "bg-[rgba(255,228,236,0.75)] border-pink-100/60 group-hover:bg-[rgba(255,200,215,0.85)] group-hover:shadow-[0_12px_50px_rgba(255,101,132,0.25),0_4px_16px_rgba(0,0,0,0.06)]"
          )}>
            <div className="grid grid-cols-4 items-center">
              <NavItem to="/" icon={<Gamepad2 size={24} />} label="Games" />
              <NavItem to="/dashboard" icon={<BarChart2 size={24} />} label="Progress" />
              <NavItem to="/reminders" icon={<Bell size={24} />} label="Reminders" />
              <NavItem to="/settings" icon={<SettingsIcon size={24} />} label="Settings" />
            </div>
          </div>
        </nav>

        {/* Global Root-Level Popups */}

        {/* 1. Language Popup */}
        {isLangOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all"
            onClick={() => setIsLangOpen(false)}
          >
            <div 
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-purple-100 p-4 sm:p-5 animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
                <button 
                  onClick={() => setIsLangOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="flex-1 flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                    Select Language / भाषा
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md">
                    {currentLang.code}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang);
                      setIsLangOpen(false);
                      localStorage.setItem("mindora_lang", JSON.stringify(lang));
                    }}
                    className={clsx(
                      "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all text-left w-full cursor-pointer border-2",
                      currentLang.code === lang.code
                        ? "bg-purple-600 border-purple-600 text-white shadow-md"
                        : "bg-slate-50 border-transparent hover:bg-purple-50 hover:border-purple-200 text-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{lang.flag}</span>
                      <div>
                        <div className="font-extrabold text-base">{lang.name}</div>
                        <div className={clsx("text-xs font-medium mt-0.5", currentLang.code === lang.code ? "text-purple-200" : "text-slate-500")}>
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>
                    {currentLang.code === lang.code && (
                      <Check size={24} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Voice Assistant Popup */}
        {isListening && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all"
            onClick={() => { setIsListening(false); setVoiceFeedback(null); }}
          >
            <div 
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-pink-200 p-6 flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full flex justify-start -mb-2">
                <button 
                  onClick={() => { setIsListening(false); setVoiceFeedback(null); }}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={24} />
                </button>
              </div>

              <div className="relative mt-2">
                <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center animate-bounce shadow-inner border-4 border-white">
                  <Mic size={36} className="text-[#FF6584]" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow border-2 border-pink-200">
                  <Volume2 size={16} className="text-[#FF6584] animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-2xl text-slate-800">Voice Assistant</h3>
                <p className="text-slate-500 text-sm mt-1.5 font-medium">
                  {voiceFeedback || "Listening... Speak a command"}
                </p>
              </div>

              {transcript && (
                <div className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-slate-800 font-bold text-sm italic">
                  "{transcript}"
                </div>
              )}

              <button
                onClick={() => { setIsListening(false); setVoiceFeedback(null); }}
                className="w-full py-3.5 bg-slate-800 text-white font-extrabold text-base rounded-2xl hover:bg-slate-900 transition-colors shadow-md cursor-pointer mt-2"
              >
                Stop Listening
              </button>
            </div>
          </div>
        )}

        {/* 3. Chatbot Popup */}
        {isChatOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all"
            onClick={() => setIsChatOpen(false)}
          >
            <div 
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-purple-200 p-6 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsChatOpen(false)}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={24} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Bot size={22} />
                  </div>
                  <span className="font-extrabold text-slate-800 text-lg">Mindora AI</span>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 cursor-pointer hidden"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 relative">
                <div className="absolute -top-2 left-6 w-4 h-4 bg-purple-50 border-t border-l border-purple-100 rotate-45"></div>
                <p className="text-base font-bold text-purple-900 leading-snug relative z-10">
                  Hi Savitri! Ask me anything about your activities, schedule, or brain health tips.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  navigate("/chatbot");
                }}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl transition-all shadow-md text-center flex items-center justify-center gap-2 text-base cursor-pointer mt-2"
              >
                <Bot size={22} /> Open Chat
              </button>
            </div>
          </div>
        )}

        {/* 4. Help Popup */}
        {isHelpOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all"
            onClick={() => setIsHelpOpen(false)}
          >
            <div 
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-blue-200 p-5 flex flex-col animate-in fade-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={24} />
                </button>
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                  <HelpCircle size={22} className="text-blue-500" /> Help & Support
                </h3>
              </div>
              
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 font-extrabold text-base text-slate-800 transition-all w-full text-left cursor-pointer border border-transparent hover:border-pink-200">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                    <PhoneCall size={24} className="text-pink-600" />
                  </div>
                  <span>Call Caretaker</span>
                </button>
                
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 font-extrabold text-base text-slate-800 transition-all w-full text-left cursor-pointer border border-transparent hover:border-blue-200">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <BookOpen size={24} className="text-blue-600" />
                  </div>
                  <span>App Tutorial</span>
                </button>
                
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 font-extrabold text-base text-slate-800 transition-all w-full text-left cursor-pointer border border-transparent hover:border-purple-200">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <Mail size={24} className="text-purple-600" />
                  </div>
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          "flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 flex-1 text-center cursor-pointer relative hover:scale-110",
          isActive
            ? "text-[#7C3AED] font-extrabold"
            : "text-slate-400 hover:text-slate-600 font-medium"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={clsx(
              "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
              isActive
                ? "bg-purple-100/80 shadow-[0_0_12px_rgba(124,58,237,0.25)]"
                : "bg-transparent"
            )}
          >
            {icon}
          </div>
          <span className="text-[10px] sm:text-xs mt-0.5 leading-tight">{label}</span>
        </>
      )}
    </NavLink>
  );
}
