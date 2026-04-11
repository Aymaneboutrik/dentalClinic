import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "@layouts/auth/auth-layout";
import { DashboardLayout } from "@layouts/dashboard/dashboard-layout";
import RootLayout from "@layouts/root/root-layout";

import { Error404, Error500, Login } from "@pages/index";
import ResetPasswordPage from "../pages/login/reset-password-page";

import AssistantDashboardPage from "../features/assistant/pages/AssistantDashboardPage";
import DoctorDashboardPage from "../features/doctor/pages/DoctorDashboardPage";
import DoctorEmployeesPage from "../features/doctor/pages/DoctorEmployeesPage";
import SecretaireDashboardPage from "../features/secretaire/pages/SecretaireDashboardPage";
import PatientListPage from "../features/secretaire/pages/PatientListPage";
import PatientHistoryPage from "../features/secretaire/pages/PatientHistoryPage";
import { RoleGuard } from "../components/commons/RoleGuard";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
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