import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  FileText,
  ClipboardMinus,
  ShieldAlert,
} from "lucide-react";

export const doctorSidebarConfig = [
  {
    name: "Dashboard",
    route: "/doctor",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "Fiches Employés",
    route: "/doctor/personnel",
    icon: <Users size={18} />,
    childs: [],
  },
  {
    name: "Comptes & Sécurité",
    route: "/doctor/employees",
    icon: <ShieldAlert size={18} />,
    childs: [],
  },
  {
    name: "Planning",
    route: "/doctor/planning",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Demandes d’absence",
    route: "/doctor/demandes-absence",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
    name: "Absences",
    route: "/doctor/absences",
    icon: <ClipboardMinus size={18} />,
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
];