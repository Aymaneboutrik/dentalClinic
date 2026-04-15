import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  ListOrdered,
} from "lucide-react";

export const secretaireSidebarConfig = [
  {
    name: "Dashboard",
    route: "/secretaire",
    icon: <LayoutDashboard size={18} />,
    childs: [],
  },
  {
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
    childs: [],
  },
];