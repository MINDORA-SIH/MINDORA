import { User, MapPin, Droplet, Calendar, Mail, AlertCircle, Activity, Ear, Pill } from "lucide-react";

export function Profile() {
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal mb-4">Patient Profile</h1>
        <p className="text-xl text-charcoal/80">Personal and medical details.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-[32px] p-8 border-4 border-lavender/30 shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-sky-blue/30 p-4 rounded-full text-charcoal">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-charcoal">Savitri Devi</h2>
              <p className="text-lg text-charcoal/60 font-medium">Patient</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <Calendar className="text-rose-pink" size={28} />
              <div>
                <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider">Age</p>
                <p className="text-xl font-bold text-charcoal">72 Years</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <Droplet className="text-rose-pink" size={28} />
              <div>
                <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider">Blood Group</p>
                <p className="text-xl font-bold text-charcoal">B+</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <MapPin className="text-sky-blue" size={28} />
              <div>
                <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider">Location</p>
                <p className="text-xl font-bold text-charcoal">Guwahati, Assam</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <Mail className="text-lavender" size={28} />
              <div>
                <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider">Email</p>
                <p className="text-xl font-bold text-charcoal">xyz@email.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-white rounded-[32px] p-8 border-4 border-rose-pink/30 shadow-sm hover:shadow-lg transition-shadow">
          <h3 className="text-2xl font-bold text-charcoal mb-6 flex items-center gap-2">
            <Activity className="text-rose-pink" />
            Medical Information
          </h3>
          
          <div className="space-y-4">
            <div className="bg-rose-pink/10 p-4 rounded-2xl">
              <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider mb-1">Diagnosis</p>
              <p className="text-xl font-bold text-charcoal">Mild Dementia (Early Stage)</p>
            </div>
            
            <div className="bg-lavender/20 p-4 rounded-2xl">
              <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider mb-1">MMSE Score</p>
              <p className="text-xl font-bold text-charcoal">23/30</p>
            </div>
            
            <div className="bg-sky-blue/10 p-4 rounded-2xl flex items-center gap-4">
              <Activity className="text-sky-blue" size={28} />
              <div>
                <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider">Mobility</p>
                <p className="text-lg font-bold text-charcoal">Walks independently</p>
              </div>
            </div>
            
            <div className="bg-soft-pink/20 p-4 rounded-2xl flex items-center gap-4">
              <Ear className="text-rose-pink" size={28} />
              <div>
                <p className="text-sm text-charcoal/60 font-bold uppercase tracking-wider">Hearing</p>
                <p className="text-lg font-bold text-charcoal">Mild hearing loss</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medications & Allergies */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] p-8 border-4 border-sky-blue/30 shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-charcoal mb-6 flex items-center gap-2">
              <Pill className="text-sky-blue" />
              Current Medications
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
                <div className="w-3 h-3 rounded-full bg-lavender"></div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-charcoal">Donepezil 5 mg</p>
                  <p className="text-charcoal/60 font-medium">Night</p>
                </div>
              </li>
              <li className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
                <div className="w-3 h-3 rounded-full bg-rose-pink"></div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-charcoal">Vitamin D3</p>
                  <p className="text-charcoal/60 font-medium">Morning</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-[32px] p-8 border-4 border-red-200 shadow-sm hover:shadow-lg transition-shadow">
            <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              Known Allergies
            </h3>
            <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="text-xl font-bold text-red-700">Penicillin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
