import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import logoUrl from "./assets/logo.png";
import { User, Gamepad2, BarChart2, Bell, Settings as SettingsIcon, Mic, MicOff, Check, Moon, Sun, ArrowLeft, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback, cloneElement } from "react";
import { clsx } from "clsx";
import { LanguageDropdown, DEFAULT_LANGUAGE, type Language } from "./components/LanguageDropdown";

/**
 * Speech recognition stays pinned to one locale. The language dropdown is a
 * display-only control, so switching it must not retarget the microphone.
 */
const SPEECH_RECOGNITION_LANG = "hi-IN";

export function Layout() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const [isListening, setIsListening] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mindora_dark") === "true");
  const [transcript, setTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // Emergency SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosSent, setSosSent] = useState(false);
  const sosIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Close all popups — called before opening any new one
  const closeAllPopups = useCallback(() => {
    setIsLangOpen(false);
    setIsListening(false);
    setVoiceFeedback(null);
  }, []);

  // Track navigation direction for slide animations
  const routeOrder = ["/", "/dashboard", "/manage-data", "/reminders", "/settings", "/profile", "/chatbot", "/who-is-this"];
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

  // Emergency SOS countdown logic
  const triggerSos = useCallback(() => {
    setSosActive(true);
    setSosCountdown(5);
    setSosSent(false);
  }, []);

  const cancelSos = useCallback(() => {
    setSosActive(false);
    setSosCountdown(5);
    setSosSent(false);
    if (sosIntervalRef.current) {
      clearInterval(sosIntervalRef.current);
      sosIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (sosActive && !sosSent) {
      sosIntervalRef.current = setInterval(() => {
        setSosCountdown((prev) => {
          if (prev <= 1) {
            // Timer reached 0 — send alert
            setSosSent(true);
            if (sosIntervalRef.current) clearInterval(sosIntervalRef.current);
            sosIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (sosIntervalRef.current) {
        clearInterval(sosIntervalRef.current);
        sosIntervalRef.current = null;
      }
    };
  }, [sosActive, sosSent]);

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
      setVoiceFeedback("Navigating to Dashboard...");
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
    } else if (lower.includes("help") || lower.includes("emergency") || lower.includes("sos")) {
      setVoiceFeedback("Triggering Emergency Alert...");
      triggerSos();
      setTimeout(() => {
        setIsListening(false);
        setVoiceFeedback(null);
      }, 1000);
    } else {
      setVoiceFeedback(`Heard: "${text}" [Voice Lang: ${SPEECH_RECOGNITION_LANG}]`);
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
          recognition.lang = SPEECH_RECOGNITION_LANG;
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
        <header
          className="px-3 sm:px-5 md:px-8 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300"
          style={{
            backgroundColor: "var(--header-bg)",
            borderBottom: "2px solid var(--header-border)",
            boxShadow: "var(--header-shadow)",
          }}
        >
          {/* Left Side: MINDORA Logo + Brand Title + Language underneath */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            <NavLink to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-2 border-amber-400 shadow-md flex items-center justify-center overflow-hidden bg-white flex-shrink-0">
                <img src={logoUrl} alt="Mindora Logo" className="w-[85%] h-[85%] object-contain" />
              </div>
            </NavLink>

            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
              <NavLink to="/" className="hover:opacity-90 transition-opacity">
                <span className="font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight leading-none" style={{ color: "var(--foreground)" }}>
                  MINDORA
                </span>
              </NavLink>

              <LanguageDropdown
                value={language}
                onChange={setLanguage}
                open={isLangOpen}
                onOpenChange={(next) => {
                  if (next) closeAllPopups();
                  setIsLangOpen(next);
                }}
                size="sm"
                align="start"
              />
            </div>
          </div>

          {/* Right Side Header Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* 1. Emergency SOS Button */}
            <button
              onClick={triggerSos}
              title="Emergency Alert"
              className="h-9 sm:h-10 md:h-11 px-3 sm:px-4 md:px-5 rounded-full bg-red-600 hover:bg-red-700 border-2 border-red-700 text-white flex items-center transition-all cursor-pointer active:scale-95 shadow-md flex-shrink-0 font-black text-sm sm:text-base tracking-wide"
            >
              SOS
            </button>

            {/* 2. Dark Mode Toggle */}
            {isWide && (
              <button
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className={clsx(
                  "h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0",
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-200"
                    : "bg-white/70 hover:bg-white border-slate-200 text-slate-700",
                )}
              >
                {darkMode ? (
                  <Sun size={18} className="text-amber-500" />
                ) : (
                  <Moon size={18} className="text-indigo-500" />
                )}
              </button>
            )}

            {/* 3. Profile Button */}
            <NavLink
              to="/profile"
              title="Profile"
              className="h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 rounded-full bg-white/70 hover:bg-white border-2 border-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs flex-shrink-0"
            >
              <User size={18} />
            </NavLink>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-5 md:px-8 lg:px-10 pt-3 sm:pt-4 md:pt-6 pb-24 sm:pb-28 max-w-7xl w-full mx-auto overflow-x-hidden">
          <div key={location.pathname} className={slideDirection}>
            <Outlet context={{ darkMode, setDarkMode, language, setLanguage }} />
          </div>
        </main>

        {/* Bottom Navigation Dock */}
        <nav
          className="fixed bottom-0 left-0 w-full z-40 transition-colors duration-300"
          style={{
            backgroundColor: "var(--dock-bg)",
            borderTop: "2px solid var(--dock-border)",
            boxShadow: "var(--dock-shadow)",
          }}
        >
          <div className="max-w-md sm:max-w-lg mx-auto px-4 py-2">
            <div className="grid grid-cols-4 items-center gap-2">
              <NavItem to="/" icon={<Gamepad2 size={24} />} label="Games" />
              <NavItem to="/dashboard" icon={<BarChart2 size={24} />} label="Dashboard" />
              <NavItem to="/reminders" icon={<Bell size={24} />} label="Reminders" />
              <NavItem to="/settings" icon={<SettingsIcon size={24} />} label="Settings" />
            </div>
          </div>
        </nav>

        {/* Fixed Mic FAB — bottom right, above dock */}
        <button
          onClick={() => {
            if (!isListening) closeAllPopups();
            toggleListening();
          }}
          title="Voice Assistant"
          className={clsx(
            "fixed z-50 right-4 sm:right-6 bottom-[5.5rem] sm:bottom-[6rem] w-14 h-14 sm:w-16 sm:h-16 rounded-full border-3 flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-lg",
            isListening
              ? "bg-[#FF6584] text-white border-[#FF6584] animate-pulse shadow-[0_0_20px_rgba(255,101,132,0.5)]"
              : "bg-white hover:bg-[#FFF0F3] border-[#FF6584] text-[#FF6584] shadow-[0_4px_15px_rgba(255,101,132,0.3)]"
          )}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Global Root-Level Popups */}

        {/* 1. Voice Assistant Popup */}
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

              <div className="relative mt-2 flex items-center justify-center">
                {/* Pulsing wave rings */}
                <div className="absolute w-28 h-28 rounded-full bg-pink-200/40 mic-wave-ring mic-wave-ring-1" />
                <div className="absolute w-36 h-36 rounded-full bg-pink-200/25 mic-wave-ring mic-wave-ring-2" />
                <div className="absolute w-44 h-44 rounded-full bg-pink-100/15 mic-wave-ring mic-wave-ring-3" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shadow-lg border-4 border-white z-10">
                  <Mic size={36} className="text-[#FF6584]" />
                </div>
              </div>

              <div>
                <h3 className="font-extrabold text-2xl text-slate-800">Voice Assistant</h3>
                <p className="text-slate-500 text-[20px] mt-1.5 font-bold">
                  {voiceFeedback || "Listening... Speak a command"}
                </p>
              </div>

              {transcript && (
                <div className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 text-slate-800 font-bold text-[20px] italic">
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

        {/* 2. Emergency SOS Overlay */}
        {sosActive && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all bg-black/30 backdrop-blur-md"
          >
            <div 
              className={clsx(
                "w-full max-w-sm rounded-3xl shadow-2xl border-4 p-6 sm:p-8 flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-200",
                sosSent
                  ? "bg-slate-50 border-slate-300"
                  : "bg-white border-red-400"
              )}
              onClick={e => e.stopPropagation()}
            >
              {!sosSent ? (
                <>
                  {/* Countdown state */}
                  <div className="relative">
                    {/* Animated ring */}
                    <svg className="w-28 h-28 sm:w-32 sm:h-32" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#FEE2E2" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="52"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        strokeDashoffset={`${2 * Math.PI * 52 * (1 - sosCountdown / 5)}`}
                        className="transition-all duration-1000 ease-linear"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl sm:text-6xl font-black text-red-600">{sosCountdown}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-xl sm:text-2xl text-red-700">🚨 Emergency Alert</h3>
                    <p className="text-slate-600 text-sm sm:text-base font-bold mt-2 leading-relaxed">
                      Sending SMS to your caregiver in <span className="text-red-600 font-black">{sosCountdown}s</span>
                    </p>
                    <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
                      Press cancel to stop the alert
                    </p>
                  </div>

                  <button
                    onClick={cancelSos}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-base sm:text-lg rounded-2xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                  >
                    <X size={22} />
                    Cancel Alert
                  </button>
                </>
              ) : (
                <>
                  {/* Sent confirmation — grey theme */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-200 flex items-center justify-center border-4 border-slate-300">
                    <Check size={48} className="text-slate-600" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-xl sm:text-2xl text-slate-700">Alert Sent</h3>
                    <p className="text-slate-500 text-sm sm:text-base font-bold mt-2 leading-relaxed">
                      Your caregiver has been notified via SMS. Help is on the way.
                    </p>
                  </div>

                  <button
                    onClick={cancelSos}
                    className="w-full py-4 bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-base sm:text-lg rounded-2xl transition-all shadow-lg cursor-pointer"
                  >
                    Close
                  </button>
                </>
              )}
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
          "flex flex-col items-center justify-center py-1 rounded-2xl transition-all duration-300 flex-1 text-center cursor-pointer relative",
          isActive ? "font-extrabold" : "font-bold"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={clsx(
              "flex items-center justify-center w-14 h-9 rounded-full border-2 transition-all duration-300 mb-1",
              isActive
                ? "bg-[var(--dock-indicator)] border-[var(--dock-indicator-border)] text-[var(--dock-on-indicator)] shadow-[shadow:var(--dock-indicator-shadow)]"
                : "bg-transparent border-transparent text-[var(--dock-inactive)]"
            )}
          >
            {cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
              fill: "none",
              strokeWidth: isActive ? 2.75 : 2.5
            })}
          </div>
          <span
            className={clsx(
              "text-[16px] leading-tight",
              isActive ? "text-[var(--dock-active)]" : "text-[var(--dock-inactive)]"
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
