import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { MainGameGrid } from "./pages/MainGameGrid";
import { Dashboard } from "./pages/Dashboard";
import { Reminders } from "./pages/Reminders";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Chatbot } from "./pages/Chatbot";

const EmptyPage = () => <div />;

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MainGameGrid },
      { path: "dashboard", Component: Dashboard },
      { path: "reminders", Component: Reminders },
      { path: "settings", Component: Settings },
      { path: "profile", Component: Profile },
      { path: "chatbot", Component: Chatbot },
      { path: "who-is-this", Component: EmptyPage },
    ],
  },
]);
