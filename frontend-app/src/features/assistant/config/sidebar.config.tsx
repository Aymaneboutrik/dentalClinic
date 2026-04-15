import {
  LayoutDashboard,
<<<<<<< HEAD
  FileText,
  UserRound,
  ClipboardList,
  BarChart2,
=======
  CalendarDays,
  Users,
  FileText,
  ClipboardList,
>>>>>>> origin/main
} from "lucide-react";

export const assistantSidebarConfig = [
  {
    name: "Dashboard",
    route: "/assistant",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
<<<<<<< HEAD
=======
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
  {
>>>>>>> origin/main
    name: "Dossiers",
    route: "/assistant/files",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
<<<<<<< HEAD
    name: "Patients",
    route: "/assistant/patients",
    icon: <UserRound size={18} />,
    childs: [],
  },
  {
    name: "Tâches",
    route: "/assistant/tasks",
=======
    name: "Planning",
    route: "/assistant/planning",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Demandes d’absence",
    route: "/assistant/demandes-absence",
>>>>>>> origin/main
    icon: <ClipboardList size={18} />,
    childs: [],
  },
  {
<<<<<<< HEAD
    name: "Mouvements stock",
    route: "/assistant/mouvements",
    icon: <BarChart2 size={18} />,
=======
    name: "Absences",
    route: "/assistant/absences",
    icon: <FileText size={18} />,
>>>>>>> origin/main
    childs: [],
  },
];