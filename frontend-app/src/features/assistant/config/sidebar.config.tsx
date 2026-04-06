import {
  LayoutDashboard,
  FileText,
  UserRound,
  ClipboardList,
} from "lucide-react";

export const assistantSidebarConfig = [
  {
    name: "Dashboard",
    route: "/assistant",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "Dossiers",
    route: "/assistant/files",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
    name: "Patients",
    route: "/assistant/patients",
    icon: <UserRound size={18} />,
    childs: [],
  },
  {
    name: "Tâches",
    route: "/assistant/tasks",
    icon: <ClipboardList size={18} />,
    childs: [],
  },
 
];