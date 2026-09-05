import { CaregiverDashboard } from "./CaregiverDashboard";

/**
 * `/dashboard` is the caregiver monitoring view. Kept as a thin wrapper so the
 * route stays exactly where it was while the view itself lives in one place and
 * can be reused by a future patient-facing dashboard.
 */
export function Dashboard() {
  return <CaregiverDashboard />;
}

export default Dashboard;
