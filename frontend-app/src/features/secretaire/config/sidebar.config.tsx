import {
  LayoutDashboard,
<<<<<<< HEAD
  Package,
  Truck,
  ShoppingCart,
  ListOrdered,
=======
  CalendarDays,
  Users,
  FileText,
  ClipboardList,
>>>>>>> origin/main
} from "lucide-react";

export const secretaireSidebarConfig = [
  {
    name: "Dashboard",
    route: "/secretaire",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
<<<<<<< HEAD
    name: "Fournisseurs",
    route: "/secretaire/fournisseurs",
    icon: <Truck size={18} />,
    childs: [],
  },
  {
    name: "Produits",
    route: "/secretaire/produits",
    icon: <Package size={18} />,
    childs: [],
  },
  {
    name: "Commandes",
    route: "/secretaire/commandes",
    icon: <ShoppingCart size={18} />,
    childs: [],
  },
  {
    name: "Lignes de commande",
    route: "/secretaire/lignes",
    icon: <ListOrdered size={18} />,
=======
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
>>>>>>> origin/main
    childs: [],
  },
];