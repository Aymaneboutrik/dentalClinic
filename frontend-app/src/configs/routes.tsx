import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "@layouts/auth/auth-layout";
import { DashboardLayout } from "@layouts/dashboard/dashboard-layout";
import RootLayout from "@layouts/root/root-layout";

import { Error404, Error500, Login } from "@pages/index";
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

import CommandesDoctorPage from "../features/doctor/pages/CommandesDoctorPage";
import DoctorRendezVousPage from "../features/doctor/pages/DoctorRendezVousPage";
import RendezVousHistoryPage from "../features/doctor/pages/RendezVousHistoryPage";

import SecretaireDashboardPage from "../features/secretaire/pages/SecretaireDashboardPage";
import RendezVousPage from "../features/secretaire/pages/RendezVousPage";
import SecretaireDemandeAbsencePage from "../features/secretaire/pages/SecretaireDemandeAbsencePage";
import SecretairePlanningPage from "../features/secretaire/pages/SecretairePlanningPage";
import SecretaireAbsencePage from "../features/secretaire/pages/SecretaireAbsencePage";
import PatientListPage from "../features/secretaire/pages/PatientListPage";
import PatientHistoryPage from "../features/secretaire/pages/PatientHistoryPage";
import ProduitsPage from "../features/secretaire/pages/ProduitsPage";
import CommandesPage from "../features/secretaire/pages/CommandesPage";
import FournisseursPage from "../features/secretaire/pages/FournisseursPage";
import LignesCommandePage from "../features/secretaire/pages/LignesCommandePage";

import MouvementsStockPage from "../features/assistant/pages/MouvementsStockPage";

import DoctorActesMedicauxPage from "../features/doctor/pages/DoctorActesMedicauxPage";
import DoctorFacturesPage from "../features/doctor/pages/DoctorFacturesPage";
import DoctorLignesFacturePage from "../features/doctor/pages/DoctorLignesFacturePage";
import DoctorPaiementsPage from "../features/doctor/pages/DoctorPaiementsPage";
import DoctorRemisesPage from "../features/doctor/pages/DoctorRemisesPage";
import DoctorTransactionsPage from "../features/doctor/pages/DoctorTransactionsPage";

import ActesMedicauxPage from "../features/secretaire/pages/ActesMedicauxPage";
import FacturesPage from "../features/secretaire/pages/FacturesPage";
import LignesFacturePage from "../features/secretaire/pages/LignesFacturePage";
import PaiementsPage from "../features/secretaire/pages/PaiementsPage";
import RemisesPage from "../features/secretaire/pages/RemisesPage";
import TransactionsPage from "../features/secretaire/pages/TransactionsPage";

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
              {
                path: "patients",
                children: [
                   { index: true, element: <PatientListPage /> },
                   { path: "history", element: <PatientHistoryPage /> }
                ]
              },
              {
                path: "rendez-vous",
                element: <DoctorRendezVousPage />,
              },
              {
                path: "historique",
                element: <RendezVousHistoryPage />,
              },
              {
                path: "facturation",
                children: [
                  { path: "actes", element: <DoctorActesMedicauxPage /> },
                  { path: "factures", element: <DoctorFacturesPage /> },
                  { path: "lignes-facture", element: <DoctorLignesFacturePage /> },
                  { path: "paiements", element: <DoctorPaiementsPage /> },
                  { path: "remises", element: <DoctorRemisesPage /> },
                  { path: "transactions", element: <DoctorTransactionsPage /> }
                ]
              },
              {
                path: "personnel",
                element: <PersonnelPage />,
              },
              {
                path: "planning",
                element: <PlanningPage />,
              },
              {
                path: "demandes-absence",
                element: <DemandesAbsencePage />,
              },
              {
                path: "absences",
                element: <AbsencePage />,
              },
              {
                path: "stock/commandes",
                element: <CommandesDoctorPage />,
              },
              {
                path: "stock/mouvements",
                element: <MouvementsStockPage />,
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
              },
              {
                path: "rendez-vous",
                element: <RendezVousPage />,
              },
              {
                path: "facturation",
                children: [
                  { path: "actes", element: <ActesMedicauxPage /> },
                  { path: "factures", element: <FacturesPage /> },
                  { path: "lignes-facture", element: <LignesFacturePage /> },
                  { path: "paiements", element: <PaiementsPage /> },
                  { path: "remises", element: <RemisesPage /> },
                  { path: "transactions", element: <TransactionsPage /> }
                ]
              },
              {
                path: "demandes-absence",
                element: <SecretaireDemandeAbsencePage />,
              },
              {
                path: "absences",
                element: <SecretaireAbsencePage />,
              },
              {
                path: "planning",
                element: <SecretairePlanningPage />,
              },
              {
                path: "stock/produits",
                element: <ProduitsPage />,
              },
              {
                path: "stock/commandes",
                element: <CommandesPage />,
              },
              {
                path: "stock/fournisseurs",
                element: <FournisseursPage />,
              },
              {
                path: "stock/lignes-commande",
                element: <LignesCommandePage />,
              },
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
              },
              {
                path: "demandes-absence",
                element: <AssistantDemandeAbsencePage />,
              },
              {
                path: "planning",
                element: <AssistantPlanningPage />,
              },
              {
                path: "absences",
                element: <AssistantAbsencePage />,
              },
              {
                path: "stock/mouvements",
                element: <MouvementsStockPage />,
              },
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
