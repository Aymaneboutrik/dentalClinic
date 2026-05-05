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
    name: "sidebar.dashboard",
    route: "/doctor",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
    name: "sidebar.employees",
    route: "/doctor/personnel",
    icon: <Users size={18} />,
    childs: [],
  },
  {
    name: "sidebar.accounts",
    route: "/doctor/employees",
    icon: <ShieldAlert size={18} />,
    childs: [],
  },
  {
    name: "sidebar.planning",
    route: "/doctor/planning",
    icon: <CalendarDays size={18} />,
    childs: [],
  },
  {
    name: "sidebar.absenceRequests",
    route: "/doctor/demandes-absence",
    icon: <FileText size={18} />,
    childs: [],
  },
  {
    name: "sidebar.absences",
    route: "/doctor/absences",
    icon: <ClipboardMinus size={18} />,
    childs: [],
  },
  {
    name: "sidebar.patientFiles",
    route: "/doctor/patients",
    icon: <UserRound size={18} />,
    childs: [],
  },
  {
    name: "sidebar.appointments",
    route: "/doctor/rendez-vous",
    icon: <CalendarDays size={18} />,
    childs: [
      { name: "sidebar.appointmentsManagement", route: "/doctor/rendez-vous" },
      { name: "sidebar.appointmentsHistory", route: "/doctor/historique" }
    ],
  },
  {
    name: "sidebar.stockOrders",
    route: "/doctor/stock/commandes",
    icon: <Package size={18} />,
    childs: [],
  },
  {
    name: "sidebar.stockMovements",
    route: "/doctor/stock/mouvements",
    icon: <Package size={18} />,
    childs: [],
  },
  {
    name: "sidebar.billing",
    route: "/doctor/facturation",
    icon: <FileText size={18} />,
    childs: [
      { name: "sidebar.invoices", route: "/doctor/facturation/factures" },
      { name: "sidebar.payments", route: "/doctor/facturation/paiements" },
      { name: "sidebar.medicalActs", route: "/doctor/facturation/actes" },
      { name: "sidebar.discounts", route: "/doctor/facturation/remises" },
      { name: "sidebar.transactions", route: "/doctor/facturation/transactions" },
      { name: "sidebar.invoiceLines", route: "/doctor/facturation/lignes-facture" },
    ],
  },
];