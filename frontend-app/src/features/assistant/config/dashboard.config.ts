export const assistantDashboardConfig = {
  title: "Espace Assistant(e)",
  subtitle: "Gestion administrative et dossiers patients",

  stats: [
    {
      title: "Rendez-vous du jour",
      value: "12",
      description: "8 confirmés, 4 en attente",
    },
    {
      title: "Nouveaux Patients",
      value: "5",
      description: "Inscrits cette semaine",
    },
    {
      title: "Total Patients",
      value: "1,284",
      description: "Dossiers enregistrés",
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
      title: "Dossier Médical mis à jour",
      name: "Ahmed Mansouri",
      time: "Il y a 10 min",
    },
    {
      title: "Nouveau document scanné",
      name: "Sarah El Amrani",
      time: "Il y a 25 min",
    },
    {
      title: "Fiche patient créée",
      name: "Yassine Benjelloun",
      time: "Il y a 1 heure",
    },
  ],
};