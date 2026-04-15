import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "@layouts/auth/auth-layout";
import { DashboardLayout } from "@layouts/dashboard/dashboard-layout";
import RootLayout from "@layouts/root/root-layout";

import { Error404, Error500, Login } from "@pages/index";

import AssistantDashboardPage from "../features/assistant/pages/AssistantDashboardPage";
import DoctorDashboardPage from "../features/doctor/pages/DoctorDashboardPage";
import SecretaireDashboardPage from "../features/secretaire/pages/SecretaireDashboardPage";

import FournisseursPage from "../features/secretaire/pages/FournisseursPage";
import ProduitsPage from "../features/secretaire/pages/ProduitsPage";
import CommandesPage from "../features/secretaire/pages/CommandesPage";
import LignesCommandePage from "../features/secretaire/pages/LignesCommandePage";

import CommandesDoctorPage from "../features/doctor/pages/CommandesDoctorPage";

import MouvementsStockPage from "../features/assistant/pages/MouvementsStockPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/doctor" replace />,
          },
          {
            path: "doctor",
            element: <DoctorDashboardPage />,
          },
          {
            path: "doctor/stock",
            element: <CommandesDoctorPage />,
          },
          {
            path: "secretaire",
            element: <SecretaireDashboardPage />,
          },
          {
            path: "secretaire/fournisseurs",
            element: <FournisseursPage />,
          },
          {
            path: "secretaire/produits",
            element: <ProduitsPage />,
          },
          {
            path: "secretaire/commandes",
            element: <CommandesPage />,
          },
          {
            path: "secretaire/lignes",
            element: <LignesCommandePage />,
          },
          {
            path: "assistant",
            element: <AssistantDashboardPage />,
          },
          {
            path: "assistant/mouvements",
            element: <MouvementsStockPage />,
          },
          {
            path: "404",
            element: <Error404 />,
          },
          {
            path: "500",
            element: <Error500 />,
          },
        ],
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
]);