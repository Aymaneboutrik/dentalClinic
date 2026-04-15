import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  ShoppingCart,
} from "lucide-react";

export const doctorSidebarConfig = [
  {
    name: "Dashboard",
    route: "/doctor",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "Employés",
    route: "/doctor/employees",
    icon: <Users size={18} />,
    childs: [],
  },
  {
    name: "Patients",
    route: "/doctor/patients",
    icon: <UserRound size={18} />,
    childs: [],
  },
  {
    name: "Rendez-vous",
    route: "/doctor/appointments",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Commandes stock",
    route: "/doctor/stock",
    icon: <ShoppingCart size={18} />,
    childs: [],
  },
];