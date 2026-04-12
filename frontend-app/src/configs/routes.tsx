import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "@layouts/auth/auth-layout";
import { DashboardLayout } from "@layouts/dashboard/dashboard-layout";
import RootLayout from "@layouts/root/root-layout";

import { Error404, Error500, Login } from "@pages/index";

import AssistantDashboardPage from "../features/assistant/pages/AssistantDashboardPage";
import DoctorDashboardPage from "../features/doctor/pages/DoctorDashboardPage";
import SecretaireDashboardPage from "../features/secretaire/pages/SecretaireDashboardPage";
////////
import PersonnelPage from "../features/doctor/pages/PersonnelPage";
///////
import PlanningPage from "../features/doctor/pages/PlanningPage";
//////
import DemandesAbsencePage from "../features/doctor/pages/DemandesAbsencePage";
//////
import AbsencePage from "../features/doctor/pages/AbsencePage";
///////
// 
import SecretaireDemandeAbsencePage from "../features/secretaire/pages/SecretaireDemandeAbsencePage";
//////
import SecretairePlanningPage from "../features/secretaire/pages/SecretairePlanningPage";
///
import SecretaireAbsencePage from "../features/secretaire/pages/SecretaireAbsencePage";
/////
import AssistantDemandeAbsencePage from "../features/assistant/pages/AssistantDemandeAbsencePage";
import AssistantPlanningPage from "../features/assistant/pages/AssistantPlanningPage";
import AssistantAbsencePage from "../features/assistant/pages/AssistantAbsencePage";
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
            element: <SecretaireDashboardPage />,
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
            element: <AssistantDashboardPage />,
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
