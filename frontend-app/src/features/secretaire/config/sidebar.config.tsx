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
    name: "sidebar.dashboard",
    route: "/secretaire",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "sidebar.appointments",
    route: "/secretaire/rendez-vous",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "sidebar.patientFiles",
    route: "/secretaire/patients",
    icon: <Users size={18} />,
    childs: [],
  },
  {
    name: "sidebar.planning",
    route: "/secretaire/planning",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "sidebar.absenceRequests",
    route: "/secretaire/demandes-absence",
    icon: <ClipboardList size={18} />,
    childs: [],
  },
  {
    name: "sidebar.absences",
    route: "/secretaire/absences",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
    name: "sidebar.stockManagement",
    route: "/secretaire/stock",
    icon: <Package size={18} />,
    childs: [
      { name: "sidebar.stockProducts", route: "/secretaire/stock/produits" },
      { name: "sidebar.stockSuppliers", route: "/secretaire/stock/fournisseurs" },
      { name: "sidebar.stockOrders", route: "/secretaire/stock/commandes" },
      { name: "sidebar.invoiceLines", route: "/secretaire/stock/lignes-commande" },
    ],
  },
  {
    name: "sidebar.billing",
    route: "/secretaire/facturation",
    icon: <FileText size={18} />,
    childs: [
      { name: "sidebar.invoices", route: "/secretaire/facturation/factures" },
      { name: "sidebar.payments", route: "/secretaire/facturation/paiements" },
      { name: "sidebar.medicalActs", route: "/secretaire/facturation/actes" },
      { name: "sidebar.discounts", route: "/secretaire/facturation/remises" },
      { name: "sidebar.transactions", route: "/secretaire/facturation/transactions" },
      { name: "sidebar.invoiceLines", route: "/secretaire/facturation/lignes-facture" },
    ],
  },
];