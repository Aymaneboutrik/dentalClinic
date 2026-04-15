import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
<<<<<<< HEAD
  ShoppingCart,
=======
  FileText,
  ClipboardMinus,
  ShieldAlert,
>>>>>>> origin/main
} from "lucide-react";

export const doctorSidebarConfig = [
  {
    name: "Dashboard",
    route: "/doctor",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
<<<<<<< HEAD
    name: "Employés",
    route: "/doctor/employees",
=======
    name: "Fiches Employés",
    route: "/doctor/personnel",
>>>>>>> origin/main
    icon: <Users size={18} />,
    childs: [],
  },
  {
<<<<<<< HEAD
=======
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
>>>>>>> origin/main
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
<<<<<<< HEAD
  {
    name: "Commandes stock",
    route: "/doctor/stock",
    icon: <ShoppingCart size={18} />,
    childs: [],
  },
=======
>>>>>>> origin/main
];