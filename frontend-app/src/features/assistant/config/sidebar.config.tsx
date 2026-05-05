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
    name: "sidebar.dashboard",
    route: "/assistant",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "sidebar.patientFiles",
    route: "/assistant/patients",
    icon: <Users size={18} />,
    childs: [],
  },
  {
    name: "sidebar.planning",
    route: "/assistant/planning",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "sidebar.absenceRequests",
    route: "/assistant/demandes-absence",
    icon: <ClipboardList size={18} />,
    childs: [],
  },
  {
    name: "sidebar.absences",
    route: "/assistant/absences",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
    name: "sidebar.stockMovements",
    route: "/assistant/stock/mouvements",
    icon: <Package size={18} />,
    childs: [],
  },
];