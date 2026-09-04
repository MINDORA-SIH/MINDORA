import { Moon, Sun, Globe, BellRing } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";

function ToggleSwitch({ enabled, onToggle, activeColor }: { enabled: boolean; onToggle: () => void; activeColor: string }) {
  return (
    <button
      onClick={onToggle}
      className={`toggle-track w-16 h-8 sm:w-20 sm:h-10 md:w-24 md:h-12 rounded-full p-1 transition-colors flex-shrink-0 ${enabled ? activeColor : "bg-charcoal/20"}`}
    >
      <div
        className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-white rounded-full shadow-md transform transition-transform ${enabled ? "translate-x-8 sm:translate-x-10 md:translate-x-12" : "translate-x-0"}`}
      />
    </button>
  );
}

export function Settings() {
  const { darkMode, setDarkMode } = useOutletContext<{ darkMode: boolean; setDarkMode: (val: boolean) => void }>();
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="pt-2 sm:pt-4 pb-1 sm:pb-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-4" style={{ color: "var(--foreground)" }}>
          Settings
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium" style={{ color: "var(--muted)" }}>
          Adjust the app to your preferences.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:gap-6">
        
        {/* Dark Mode Toggle */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-pale-sky/40 shadow-sm flex items-center justify-between gap-3 sm:gap-4" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
            <div className="bg-pale-sky/20 p-2.5 sm:p-3 md:p-4 rounded-full flex-shrink-0">
              {darkMode ? (
                <Sun size={24} className="text-amber-500 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              ) : (
                <Moon size={24} className="text-sky-blue sm:w-8 sm:h-8 md:w-10 md:h-10" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: "var(--foreground)" }}>Dark Mode</h2>
              <p className="text-sm sm:text-base md:text-xl truncate" style={{ color: "var(--muted)" }}>Make the screen darker</p>
            </div>
          </div>
          <ToggleSwitch enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} activeColor="bg-sky-blue" />
        </div>

        {/* App Language */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-lavender/40 shadow-sm flex items-center justify-between gap-3 sm:gap-4 flex-wrap" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
            <div className="bg-lavender/20 p-2.5 sm:p-3 md:p-4 rounded-full flex-shrink-0">
              <Globe size={24} className="text-lavender sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: "var(--foreground)" }}>Language</h2>
              <p className="text-sm sm:text-base md:text-xl truncate" style={{ color: "var(--muted)" }}>Change app language</p>
            </div>
          </div>
          <select className="bg-off-white border-2 sm:border-4 border-lavender/40 text-base sm:text-lg md:text-2xl font-bold rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 tap-target outline-none focus:border-lavender">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        {/* Notifications Toggle */}
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-soft-pink/40 shadow-sm flex items-center justify-between gap-3 sm:gap-4" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
            <div className="bg-soft-pink/20 p-2.5 sm:p-3 md:p-4 rounded-full flex-shrink-0">
              <BellRing size={24} className="text-rose-pink sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: "var(--foreground)" }}>Notifications</h2>
              <p className="text-sm sm:text-base md:text-xl truncate" style={{ color: "var(--muted)" }}>Turn reminders on or off</p>
            </div>
          </div>
          <ToggleSwitch enabled={alertsEnabled} onToggle={() => setAlertsEnabled(prev => !prev)} activeColor="bg-rose-pink" />
        </div>

      </div>
    </div>
  );
}

export default Settings;
