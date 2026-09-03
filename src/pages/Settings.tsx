import { Moon, Globe, BellRing } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";

export function Settings() {
  const { darkMode, setDarkMode } = useOutletContext<{ darkMode: boolean; setDarkMode: (val: boolean) => void }>();
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="pt-4 pb-2">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "var(--foreground)" }}>
          Settings
        </h1>
        <p className="text-2xl font-medium" style={{ color: "var(--muted)" }}>
          Adjust the app to your preferences.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        
        {/* Dark Mode Toggle */}
        <div className="p-6 md:p-8 rounded-3xl border-4 border-pale-sky/40 shadow-sm flex items-center justify-between gap-4" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-6">
            <div className="bg-pale-sky/20 p-4 rounded-full">
              <Moon size={40} className="text-sky-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Dark Mode</h2>
              <p className="text-xl" style={{ color: "var(--muted)" }}>Make the screen darker</p>
            </div>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-24 h-12 rounded-full p-1 transition-colors ${darkMode ? 'bg-sky-blue' : 'bg-charcoal/20'}`}
          >
            <div className={`w-10 h-10 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? 'translate-x-12' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* App Language */}
        <div className="p-6 md:p-8 rounded-3xl border-4 border-lavender/40 shadow-sm flex items-center justify-between gap-4 flex-wrap" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-6">
            <div className="bg-lavender/20 p-4 rounded-full">
              <Globe size={40} className="text-lavender" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Language</h2>
              <p className="text-xl" style={{ color: "var(--muted)" }}>Change app language</p>
            </div>
          </div>
          <select className="bg-off-white border-4 border-lavender/40 text-2xl font-bold rounded-2xl px-6 py-4 tap-target outline-none focus:border-lavender">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="hi">हिंदी</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>

        {/* Alerts Settings */}
        <div className="p-6 md:p-8 rounded-3xl border-4 border-soft-pink/40 shadow-sm flex items-center justify-between gap-4" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-6">
            <div className="bg-soft-pink/20 p-4 rounded-full">
              <BellRing size={40} className="text-rose-pink" />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Notifications</h2>
              <p className="text-xl" style={{ color: "var(--muted)" }}>Turn reminders on or off</p>
            </div>
          </div>
          <button 
            onClick={() => setAlertsEnabled((prev) => !prev)}
            className={`w-24 h-12 rounded-full p-1 transition-colors ${alertsEnabled ? 'bg-rose-pink' : 'bg-charcoal/20'}`}
          >
            <div className={`w-10 h-10 bg-white rounded-full shadow-md transform transition-transform ${alertsEnabled ? 'translate-x-12' : 'translate-x-0'}`}></div>
          </button>
        </div>

      </div>
    </div>
  );
}

export default Settings;
