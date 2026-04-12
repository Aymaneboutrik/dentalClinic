export type Absence = {
  idAbsence: number;
  dateDebut: string;
  dateFin: string;
  typeAbsence: string;
  dateValidation?: string | null;
  employeId: number;
  nom: string;
  prenom: string;
};

export type CreateAbsenceRequest = {
  dateDebut: string;
  dateFin: string;
  typeAbsence: string;
  employeId: number;
};

export type AbsenceActionResponse = {
  message: string;
};

export type ApiError = {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
};