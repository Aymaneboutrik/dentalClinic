import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  ClipboardList,
  Package,
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
    name: "Dossier Patient",
    route: "/assistant/patients",
    icon: <Users size={18} />,
    childs: [],
  },
  {
    name: "Planning",
    route: "/assistant/planning",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Demandes d’absence",
    route: "/assistant/demandes-absence",
    icon: <ClipboardList size={18} />,
    childs: [],
  },
  {
    name: "Absences",
    route: "/assistant/absences",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
    name: "Mouvements Stock",
    route: "/assistant/stock/mouvements",
    icon: <Package size={18} />,
    childs: [],
  },
];