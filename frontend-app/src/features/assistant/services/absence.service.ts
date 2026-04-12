import type { Absence } from "../../../types/absence/absence";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

const CURRENT_ASSISTANT_ID = 3;

const buildApiError = async (response: Response): Promise<ApiError> => {
  let result: any = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  return {
    message:
      result?.message ||
      result?.Message ||
      result?.title ||
      "Une erreur est survenue lors de la communication avec le serveur.",
    status: response.status,
    code: result?.code || result?.Code,
    errors: result?.errors || result?.Errors,
  };
};

const normalizeAbsence = (item: any): Absence => {
  return {
    idAbsence: Number(item?.idAbsence ?? item?.IdAbsence ?? 0),
    dateDebut: String(item?.dateDebut ?? item?.DateDebut ?? ""),
    dateFin: String(item?.dateFin ?? item?.DateFin ?? ""),
    typeAbsence: String(item?.typeAbsence ?? item?.TypeAbsence ?? ""),
    dateValidation: item?.dateValidation ?? item?.DateValidation ?? null,
    employeId: Number(item?.employeId ?? item?.EmployeId ?? 0),
    nom: String(item?.nom ?? item?.Nom ?? ""),
    prenom: String(item?.prenom ?? item?.Prenom ?? ""),
  };
};

export const getAbsencesByEmployeId = async (): Promise<Absence[]> => {
  let response: Response;

  try {
    response = await fetch(`/api/absence/employe/${CURRENT_ASSISTANT_ID}`);
  } catch {
    throw {
      message: "Impossible de contacter le serveur.",
      status: 0,
    } as ApiError;
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  const result = await response.json();

  if (!Array.isArray(result)) {
    return [];
  }

  return result.map((item) => normalizeAbsence(item));
};