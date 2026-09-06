import { Construction, House } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";

/** Fallback for routes whose feature has not been built yet. */
export function UnderDevelopment() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <main className="mx-auto flex min-h-[52vh] max-w-2xl items-center justify-center py-8">
      <section className="w-full rounded-3xl border-2 border-[#D6CBF5] bg-[#F5F2FF] p-7 text-center shadow-sm dark:border-[#44386B] dark:bg-[#251F3D] sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-[#5044A8] shadow-sm dark:bg-slate-800 dark:text-[#C4B5FD]">
          <Construction size={32} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
          {t("underDevelopment.title")}
        </h1>
        <p className="mt-2 text-[17px] font-semibold" style={{ color: "var(--muted-strong)" }}>
          {t("underDevelopment.subtitle")}
        </p>
        <p className="mt-1 text-sm font-semibold" style={{ color: "var(--muted)" }}>
          {location.pathname}
        </p>
        <Link to="/" className="tap-target mx-auto mt-6 w-fit gap-2 rounded-2xl bg-[#6C5CC4] px-5 text-[16px] font-extrabold text-white shadow-md">
          <House size={18} aria-hidden="true" />
          {t("underDevelopment.backToGames")}
        </Link>
      </section>
    </main>
  );
}

export default UnderDevelopment;
