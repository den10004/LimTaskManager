import MainPage from "./pages/Main";
import Gant from "./pages/Gant";
import Calendar from "./pages/Calendar";
import Task from "./pages/Task";
import TeamPage from "./pages/Team";
import TaskDetails from "./pages/TaskDetails";
import Directions from "./pages/Directions";
import CreatePage from "./pages/Create";

export const routes = [
  { path: "/", component: MainPage, protected: false },
  { path: "/Gant", component: Gant, protected: true },
  { path: "/calendar", component: Calendar, protected: true },
  { path: "/task", component: Task, protected: true },
  { path: "/team", component: TeamPage, protected: true },
  { path: "/tasks/:id", component: TaskDetails, protected: true },
  { path: "/directions", component: Directions, protected: true },
  { path: "/create", component: CreatePage, protected: true },
];
