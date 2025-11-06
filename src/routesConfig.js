import { lazy } from "react";

const MainPage = lazy(() => import("./pages/Main"));
const Gant = lazy(() => import("./pages/Gant"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Task = lazy(() => import("./pages/Task"));
const TeamPage = lazy(() => import("./pages/Team"));
const TaskDetails = lazy(() => import("./pages/TaskDetails"));
const Directions = lazy(() => import("./pages/Directions"));
const CreatePage = lazy(() => import("./pages/Create"));

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
