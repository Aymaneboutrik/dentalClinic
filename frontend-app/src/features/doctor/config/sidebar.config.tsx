import {
  LayoutDashboard,
  Users,
  UserRound,
  CalendarDays,
  FileText,
  ClipboardMinus,
  ShieldAlert,
  Package,
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
    name: "Dossier Patient",
    route: "/doctor/patients",
    icon: <UserRound size={18} />,
    childs: [],
  },
  {
    name: "Rendez-vous",
    route: "/doctor/rendez-vous",
    icon: <CalendarDays size={18} />,
    childs: [
      { name: "Gestion", route: "/doctor/rendez-vous" },
      { name: "Historique", route: "/doctor/historique" }
    ],
  },
  {
    name: "Commandes Stock",
    route: "/doctor/stock/commandes",
    icon: <Package size={18} />,
    childs: [],
  },
  {
    name: "Mouvements Stock",
    route: "/doctor/stock/mouvements",
    icon: <Package size={18} />,
    childs: [],
  },
  {
    name: "Facturation & Paiement",
    route: "/doctor/facturation",
    icon: <FileText size={18} />,
    childs: [
      { name: "Factures", route: "/doctor/facturation/factures" },
      { name: "Paiements", route: "/doctor/facturation/paiements" },
      { name: "Actes Médicaux", route: "/doctor/facturation/actes" },
      { name: "Remises", route: "/doctor/facturation/remises" },
      { name: "Transactions", route: "/doctor/facturation/transactions" },
      { name: "Lignes de Facture", route: "/doctor/facturation/lignes-facture" },
    ],
  },
];