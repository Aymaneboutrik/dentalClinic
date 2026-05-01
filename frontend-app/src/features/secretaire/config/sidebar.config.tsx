import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  ClipboardList,
  Package,
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
    route: "/secretaire/rendez-vous",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "Dossier Patient",
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
  {
    name: "Gestion Stock",
    route: "/secretaire/stock",
    icon: <Package size={18} />,
    childs: [
      { name: "Produits", route: "/secretaire/stock/produits" },
      { name: "Fournisseurs", route: "/secretaire/stock/fournisseurs" },
      { name: "Commandes", route: "/secretaire/stock/commandes" },
      { name: "Lignes Commande", route: "/secretaire/stock/lignes-commande" },
    ],
  },
  {
    name: "Facturation & Paiement",
    route: "/secretaire/facturation",
    icon: <FileText size={18} />,
    childs: [
      { name: "Factures", route: "/secretaire/facturation/factures" },
      { name: "Paiements", route: "/secretaire/facturation/paiements" },
      { name: "Actes Médicaux", route: "/secretaire/facturation/actes" },
      { name: "Remises", route: "/secretaire/facturation/remises" },
      { name: "Transactions", route: "/secretaire/facturation/transactions" },
      { name: "Lignes de Facture", route: "/secretaire/facturation/lignes-facture" },
    ],
  },
];