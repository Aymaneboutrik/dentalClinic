import React from "react";

type StatItem = {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactElement;
};

export const doctorDashboardConfig = {
  title: "Tableau de Bord",
  subtitle: "Bienvenue, Docteur. Voici un aperçu de votre activité.",

  stats: <StatItem[]>[
    {
      title: "Patients aujourd’hui",
      value: "12",
      description: "+2 depuis hier",
    },
    {
      title: "Rendez-vous confirmés",
      value: "8",
      description: "pour aujourd’hui",
    },
    {
      title: "Total Patients",
      value: "1,284",
      description: "+14 ce mois-ci",
    },
    {
      title: "Taux d'occupation",
      value: "85%",
      description: "Semaine en cours",
    },
  ],

  weeklyActivity: [
    { day: "Lun", appointments: 12 },
    { day: "Mar", appointments: 18 },
    { day: "Mer", appointments: 15 },
    { day: "Jeu", appointments: 22 },
    { day: "Ven", appointments: 19 },
    { day: "Sam", appointments: 8 },
    { day: "Dim", appointments: 0 },
  ],

  appointmentStatus: [
    { name: "Confirmé", value: 65, fill: "hsl(var(--primary))" },
    { name: "En attente", value: 25, fill: "hsl(180 80% 45%)" },
    { name: "Annulé", value: 10, fill: "hsl(0 84% 60%)" },
  ],

  recentActivities: [
    {
      title: "Consultation terminée",
      name: "Sara Amrani",
      time: "10:30",
    },
    {
      title: "Nouveau rendez-vous",
      name: "Ali Benali",
      time: "11:10",
    },
  ],
};