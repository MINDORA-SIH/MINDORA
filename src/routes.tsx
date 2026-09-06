import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./Layout";
import { MainGameGrid } from "./pages/MainGameGrid";
import { Dashboard } from "./pages/Dashboard";
import { ManageData } from "./pages/ManageData";
import { Reminders } from "./pages/Reminders";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Chatbot } from "./pages/Chatbot";
import { SpotTheDifference } from "./pages/SpotTheDifference";
import { WhoIsThisGame } from "./pages/WhoIsThis";
import { DailyRoutine } from "./pages/DailyRoutine";
import { UnderDevelopment } from "./pages/UnderDevelopment";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MainGameGrid },
      { path: "dashboard", Component: Dashboard },
      { path: "manage-data", Component: ManageData },
      { path: "reminders", Component: Reminders },
      { path: "settings", Component: Settings },
      { path: "profile", Component: Profile },
      { path: "chatbot", Component: Chatbot },
      { path: "daily-routine", Component: DailyRoutine },
      // Daily routine setup is now part of Manage Game Data. Keep existing links working.
      { path: "daily-routines", element: <Navigate to="/manage-data" replace /> },
      { path: "spot-the-difference", Component: SpotTheDifference },
      { path: "who-is-this", Component: WhoIsThisGame },
      { path: "*", Component: UnderDevelopment },
    ],
  },
]);
