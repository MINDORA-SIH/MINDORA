import { BrainCircuit, TrendingUp, Sparkles, PlusCircle } from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="pt-4 pb-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal mb-4">
          Your Progress
        </h1>
        <p className="text-2xl text-charcoal/80 font-medium">
          See how well you are doing with your daily exercises.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cognitive Skill Breakdown */}
        <div className="bg-white rounded-3xl p-8 border-4 border-pale-sky/40 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <BrainCircuit size={40} className="text-sky-blue" />
            <h2 className="text-3xl font-bold">Skills</h2>
          </div>
          
          <div className="space-y-5">
            <SkillBar label="Memory" percentage={80} color="bg-rose-pink" />
            <SkillBar label="Attention" percentage={65} color="bg-lavender" />
            <SkillBar label="Pattern Recognition" percentage={90} color="bg-sky-blue" />
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-lavender/10 rounded-3xl p-8 border-4 border-lavender/30 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Sparkles size={40} className="text-lavender" />
            <h2 className="text-3xl font-bold">Great Job!</h2>
          </div>
          <p className="text-2xl leading-relaxed text-charcoal/90">
            You remembered <strong>3 more family members</strong> today than yesterday. Keep up the excellent work! Your music memory is also exceptionally strong this week.
          </p>
        </div>

        {/* Progress Over Time */}
        <div className="md:col-span-2 bg-soft-pink/10 rounded-3xl p-8 border-4 border-soft-pink/30 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <TrendingUp size={40} className="text-rose-pink" />
            <h2 className="text-3xl font-bold">Weekly Activity</h2>
          </div>
          
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 pt-6">
            {/* Simple CSS Bar Chart placeholder */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex flex-col items-center flex-1 gap-3">
                <div 
                  className="w-full bg-soft-pink rounded-t-xl transition-all duration-1000 min-h-[20px]" 
                  style={{ height: `${Math.max(20, [50, 70, 40, 90, 60, 80, 100][i])}%` }}
                ></div>
                <span className="text-lg font-bold text-charcoal/60">{day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Caretaker Input */}
      <div className="pt-8">
        <button className="w-full bg-sky-blue/20 hover:bg-sky-blue/40 border-4 border-sky-blue/40 text-charcoal py-6 px-8 rounded-3xl font-bold text-2xl flex items-center justify-center gap-4 transition-all tap-target">
          <PlusCircle size={36} className="text-sky-blue" />
          <span>Caregiver: Update Story & Photo Data</span>
        </button>
      </div>
    </div>
  );
}

function SkillBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-xl font-bold">{label}</span>
      </div>
      <div className="w-full bg-off-white rounded-full h-6 border-2 border-charcoal/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}
