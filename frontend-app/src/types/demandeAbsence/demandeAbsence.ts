export interface DemandeAbsence {
  idDemande: number;
  dateCreation: string;
  dateDebut: string;
  dateFin: string;
  typeDemande: string;
  motif?: string | null;
  statut: string;
  dateTraitement?: string | null;
  idEmploye: number;
  nom: string;
  prenom: string;
}

export interface DemandeAbsenceActionResponse {
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}
export interface CreateDemandeAbsenceRequest {
  dateDebut: string;
  dateFin: string;
  typeDemande: string;
  motif?: string | null;
}