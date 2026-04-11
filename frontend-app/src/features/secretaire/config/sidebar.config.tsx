import {
  LayoutDashboard,
  CalendarDays,
  Users,
} from "lucide-react";

export const secretaireSidebarConfig = [
  {
    name: "Dashboard",
    route: "/secretaire",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "Rendez-vous",
    route: "/secretaire/appointments",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Patients",
    route: "/secretaire/patients",
    icon: <Users size={18} />,
    childs: [],
  },
];