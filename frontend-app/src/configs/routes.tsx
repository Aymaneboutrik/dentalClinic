import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "@layouts/auth/auth-layout";
import { DashboardLayout } from "@layouts/dashboard/dashboard-layout";
import RootLayout from "@layouts/root/root-layout";

import { Error404, Error500, Login } from "@pages/index";
<<<<<<< HEAD

import AssistantDashboardPage from "../features/assistant/pages/AssistantDashboardPage";
import DoctorDashboardPage from "../features/doctor/pages/DoctorDashboardPage";
import SecretaireDashboardPage from "../features/secretaire/pages/SecretaireDashboardPage";

import FournisseursPage from "../features/secretaire/pages/FournisseursPage";
import ProduitsPage from "../features/secretaire/pages/ProduitsPage";
import CommandesPage from "../features/secretaire/pages/CommandesPage";
import LignesCommandePage from "../features/secretaire/pages/LignesCommandePage";

import CommandesDoctorPage from "../features/doctor/pages/CommandesDoctorPage";

import MouvementsStockPage from "../features/assistant/pages/MouvementsStockPage";

=======
import ResetPasswordPage from "../pages/login/reset-password-page";

import { RoleGuard } from "../components/commons/RoleGuard";

import AssistantDashboardPage from "../features/assistant/pages/AssistantDashboardPage";
import AssistantDemandeAbsencePage from "../features/assistant/pages/AssistantDemandeAbsencePage";
import AssistantPlanningPage from "../features/assistant/pages/AssistantPlanningPage";
import AssistantAbsencePage from "../features/assistant/pages/AssistantAbsencePage";

import DoctorDashboardPage from "../features/doctor/pages/DoctorDashboardPage";
import DoctorEmployeesPage from "../features/doctor/pages/DoctorEmployeesPage";
import PersonnelPage from "../features/doctor/pages/PersonnelPage";
import PlanningPage from "../features/doctor/pages/PlanningPage";
import DemandesAbsencePage from "../features/doctor/pages/DemandesAbsencePage";
import AbsencePage from "../features/doctor/pages/AbsencePage";

import SecretaireDashboardPage from "../features/secretaire/pages/SecretaireDashboardPage";
import SecretaireDemandeAbsencePage from "../features/secretaire/pages/SecretaireDemandeAbsencePage";
import SecretairePlanningPage from "../features/secretaire/pages/SecretairePlanningPage";
import SecretaireAbsencePage from "../features/secretaire/pages/SecretaireAbsencePage";
import PatientListPage from "../features/secretaire/pages/PatientListPage";
import PatientHistoryPage from "../features/secretaire/pages/PatientHistoryPage";
>>>>>>> origin/main
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
<<<<<<< HEAD
=======
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
>>>>>>> origin/main
        element: <DashboardLayout />,
        children: [
          {
            index: true,
<<<<<<< HEAD
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
=======
            element: <Navigate to="/auth/login" replace />,
          },

          {
            path: "doctor",
            element: <RoleGuard allowedRoles={["Dentiste", "Doctor", "Medecin"]} />,
            children: [
              {
                index: true,
                element: <DoctorDashboardPage />,
              },
              {
                path: "employees",
                element: <DoctorEmployeesPage />,
              },
            ],
          },
          {
            path: "doctor/personnel",
            element: <PersonnelPage />,
          },
          {
            path: "doctor/planning",
            element: <PlanningPage />,
          },
          {
            path: "doctor/demandes-absence",
            element: <DemandesAbsencePage />,
          },
           {
            path: "doctor/absences",
            element: <AbsencePage />,
          },
          {
            path: "secretaire",
            element: <RoleGuard allowedRoles={["Secretaire"]} />,
            children: [
              {
                index: true,
                element: <SecretaireDashboardPage />,
              },
              {
                path: "patients",
                children: [
                   { index: true, element: <PatientListPage /> },
                   { path: "history", element: <PatientHistoryPage /> }
                ]
              }
            ],
          },
          {
            path: "/secretaire/demandes-absence",
            element: <SecretaireDemandeAbsencePage />,
          },
          {
            path: "/secretaire/absences",
            element: <SecretaireAbsencePage />,
          },
          {
            path: "/secretaire/planning",
            element: <SecretairePlanningPage />,
          },
          {
            path: "assistant",
            element: <RoleGuard allowedRoles={["Assistant", "Assistante"]} />,
            children: [
              {
                index: true,
                element: <AssistantDashboardPage />,
              },
              {
                path: "patients",
                children: [
                   { index: true, element: <PatientListPage /> },
                   { path: "history", element: <PatientHistoryPage /> }
                ]
              }
            ],
          },
          {
              path: "/assistant/demandes-absence",
              element: <AssistantDemandeAbsencePage />,
            },
            {
              path: "/assistant/planning",
              element: <AssistantPlanningPage />,
            },
            {
              path: "/assistant/absences",
              element: <AssistantAbsencePage />,
            },
>>>>>>> origin/main
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
<<<<<<< HEAD
]);
=======
   
]);
>>>>>>> origin/main
