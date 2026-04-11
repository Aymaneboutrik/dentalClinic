import {
  LayoutDashboard,
  CalendarDays,
  Users,
} from "lucide-react";

export const assistantSidebarConfig = [
  {
    name: "Dashboard",
    route: "/assistant",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "Rendez-vous",
    route: "/assistant/appointments",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Patients",
    route: "/assistant/patients",
    icon: <Users size={18} />,
    childs: [],
  },
];