export interface RendezVous {
  id: number;
  patientId: number;
  dentisteId: number;
  date: string;
  heureDebut: string;
  motif: string;
  statutId: number;
  heureFinPrevue: string;
  heureFinReelle?: string;
  estUrgent?: boolean;
}

export interface CreateRendezVousRequest {
  patientId: number;
  dentisteId: number;
  date: string;
  heureDebut: string;
  motif: string;
  heureFinPrevue: string;
  estUrgent?: boolean;
}

export interface UpdateRendezVousRequest {
  date: string;
  heureDebut: string;
  motif: string;
  heureFinPrevue: string;
  estUrgent?: boolean;
}

export interface RescheduleRendezVousRequest {
  date: string;
  heureDebut: string;
  heureFinPrevue: string;
  modifiePar: number;
}

export interface HistoriqueRDV {
  id: number;
  rendezVousId: number;
  ancienStatut?: string | number;
  nouveauStatut?: string | number;
  dateModification: string;
  modifiePar: string;
  typeModification: string | number;
  patientId?: number;
  dentisteId?: number;
  date?: string;
  heureDebut?: string;
  motif?: string;
  estUrgent?: boolean;
  ancienDentisteId?: number;
}
