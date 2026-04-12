import {
  LayoutDashboard,
  CalendarDays,
<<<<<<< HEAD
  Users,
=======
  UserRound,
  FileText,
  ClipboardList,
>>>>>>> Consommation-API--Personnel-Service
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
  {
  name: "Planning",
  route: "/secretaire/planning",
  icon: <CalendarDays size={18} />,
  childs: [],
},
  {
    name: "Demandes d’absence",
    route: "/secretaire/demandes-absence",
    icon: <ClipboardList size={18} />,
    childs: [],
  },
  {
  name: "Absences",
  route: "/secretaire/absences",
  icon: <FileText size={18} />,
  childs: [],
},
];