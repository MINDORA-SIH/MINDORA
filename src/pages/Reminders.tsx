import { Pill, Droplets, Calendar, ClipboardList, Plus } from "lucide-react";

export function Reminders() {
  const remindersList = [
    { id: 1, type: "medicine", title: "Morning Pills", time: "08:00 AM", done: true, icon: <Pill size={40} className="text-rose-pink" /> },
    { id: 2, type: "hydration", title: "Drink Water", time: "10:30 AM", done: false, icon: <Droplets size={40} className="text-sky-blue" /> },
    { id: 3, type: "activity", title: "Garden Walk", time: "04:00 PM", done: false, icon: <ClipboardList size={40} className="text-lavender" /> },
    { id: 4, type: "appointment", title: "Doctor Visit", time: "02:00 PM (Tomorrow)", done: false, icon: <Calendar size={40} className="text-rose-pink" /> },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
      <header className="pt-4 pb-2 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal mb-4">
            Daily Reminders
          </h1>
          <p className="text-2xl text-charcoal/80 font-medium">
            Your schedule for today.
          </p>
        </div>
        
        <button className="bg-rose-pink hover:bg-rose-pink/80 text-charcoal py-4 px-6 rounded-2xl font-bold text-xl flex items-center gap-3 transition-colors tap-target shadow-sm">
          <Plus size={32} />
          Add New
        </button>
      </header>

      <div className="flex flex-col gap-5">
        {remindersList.map((reminder) => (
          <div 
            key={reminder.id} 
            className={`flex items-center gap-6 p-6 rounded-3xl border-4 ${
              reminder.done 
                ? 'bg-off-white border-charcoal/10 opacity-70' 
                : 'bg-white border-lavender/40 shadow-sm'
            }`}
          >
            <div className={`p-4 rounded-full ${reminder.done ? 'bg-charcoal/5' : 'bg-lavender/20'}`}>
              {reminder.icon}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-2xl font-bold ${reminder.done ? 'line-through text-charcoal/50' : 'text-charcoal'}`}>
                {reminder.title}
              </h3>
              <p className="text-xl text-charcoal/70 mt-1">
                {reminder.time}
              </p>
            </div>
            
            <button className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-colors tap-target ${
              reminder.done 
                ? 'bg-sky-blue border-sky-blue text-charcoal' 
                : 'bg-white border-sky-blue hover:bg-sky-blue/20'
            }`}>
              {reminder.done && (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
