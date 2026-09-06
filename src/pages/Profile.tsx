import { User, MapPin, Droplet, Calendar, Mail, AlertCircle, Activity, Ear, Pill } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Profile() {
  const { t } = useTranslation();
  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "var(--foreground)" }}>{t("profile.title")}</h1>
        <p className="text-xl" style={{ color: "var(--muted)" }}>{t("profile.subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="rounded-[32px] p-8 border-4 border-lavender/30 shadow-sm hover:shadow-lg transition-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-sky-blue/30 p-4 rounded-full" style={{ color: "var(--foreground)" }}>
              <User size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold" style={{ color: "var(--foreground)" }}>{t("profile.patientName", { defaultValue: "Savitri Devi" })}</h2>
              <p className="text-lg font-medium" style={{ color: "var(--muted)" }}>{t("profile.patient")}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <Calendar className="text-rose-pink" size={28} />
              <div>
                <p className="text-[20px] font-bold tracking-wider" style={{ color: "var(--muted)" }}>{t("profile.age")}</p>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{t("profile.years", { count: 72 })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <Droplet className="text-rose-pink" size={28} />
              <div>
                <p className="text-[20px] font-bold tracking-wider" style={{ color: "var(--muted)" }}>{t("profile.bloodGroup")}</p>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>B+</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <MapPin className="text-sky-blue" size={28} />
              <div>
                <p className="text-[20px] font-bold tracking-wider" style={{ color: "var(--muted)" }}>{t("profile.location")}</p>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{t("profile.locationValue", { defaultValue: "Guwahati, Assam" })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
              <Mail className="text-lavender" size={28} />
              <div>
                <p className="text-[20px] font-bold tracking-wider" style={{ color: "var(--muted)" }}>{t("profile.email")}</p>
                <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>xyz@email.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="rounded-[32px] p-8 border-4 border-rose-pink/30 shadow-sm hover:shadow-lg transition-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <Activity className="text-rose-pink" />
            {t("profile.medicalInfo")}
          </h3>
          
          <div className="space-y-4">
            <div className="bg-rose-pink/10 p-4 rounded-2xl">
              <p className="text-[20px] font-bold tracking-wider mb-1" style={{ color: "var(--muted)" }}>{t("profile.diagnosis")}</p>
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>{t("profile.diagnosisValue")}</p>
            </div>
            
            <div className="bg-lavender/20 p-4 rounded-2xl">
              <p className="text-[20px] font-bold tracking-wider mb-1" style={{ color: "var(--muted)" }}>{t("profile.mmseScore")}</p>
              <p className="text-xl font-bold" style={{ color: "var(--foreground)" }}>23/30</p>
            </div>
            
            <div className="bg-sky-blue/10 p-4 rounded-2xl flex items-center gap-4">
              <Activity className="text-sky-blue" size={28} />
              <div>
                <p className="text-[20px] font-bold tracking-wider" style={{ color: "var(--muted)" }}>{t("profile.mobility")}</p>
                <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{t("profile.mobilityValue")}</p>
              </div>
            </div>
            
            <div className="bg-soft-pink/20 p-4 rounded-2xl flex items-center gap-4">
              <Ear className="text-rose-pink" size={28} />
              <div>
                <p className="text-[20px] font-bold tracking-wider" style={{ color: "var(--muted)" }}>{t("profile.hearing")}</p>
                <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{t("profile.hearingValue")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medications & Allergies */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-[32px] p-8 border-4 border-sky-blue/30 shadow-sm hover:shadow-lg transition-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
              <Pill className="text-sky-blue" />
              {t("profile.currentMedications")}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
                <div className="w-3 h-3 rounded-full bg-lavender"></div>
                <div className="flex-1">
                  <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{t("profile.medDonepezil", { defaultValue: "Donepezil 5 mg" })}</p>
                  <p className="font-medium" style={{ color: "var(--muted)" }}>{t("profile.medicationNight")}</p>
                </div>
              </li>
              <li className="flex items-center gap-4 bg-off-white p-4 rounded-2xl">
                <div className="w-3 h-3 rounded-full bg-rose-pink"></div>
                <div className="flex-1">
                  <p className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{t("profile.medVitaminD3", { defaultValue: "Vitamin D3" })}</p>
                  <p className="font-medium" style={{ color: "var(--muted)" }}>{t("profile.medicationMorning")}</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="rounded-[32px] p-8 border-4 border-red-200 shadow-sm hover:shadow-lg transition-shadow" style={{ backgroundColor: "var(--card-bg)" }}>
            <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              {t("profile.knownAllergies")}
            </h3>
            <div className="bg-red-50 p-4 rounded-2xl border-2 border-red-100 flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <p className="text-xl font-bold text-red-700">{t("profile.allergyPenicillin", { defaultValue: "Penicillin" })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
