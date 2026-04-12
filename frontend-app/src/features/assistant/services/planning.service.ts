import type { Planning } from "../../../types/planning/planning";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

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

const normalizePlanning = (item: any): Planning => {
  return {
    idHoraire: Number(item?.idHoraire ?? item?.IdHoraire ?? 0),
    jour: String(item?.jour ?? item?.Jour ?? ""),
    heureDebut: String(item?.heureDebut ?? item?.HeureDebut ?? ""),
    heureFin: String(item?.heureFin ?? item?.HeureFin ?? ""),
    idEmploye: Number(item?.idEmploye ?? item?.IdEmploye ?? 0),
    nom: String(item?.nom ?? item?.Nom ?? ""),
    prenom: String(item?.prenom ?? item?.Prenom ?? ""),
    role: String(item?.role ?? item?.Role ?? ""),
  };
};

export const getPlannings = async (): Promise<Planning[]> => {
  let response: Response;

  try {
    response = await fetch("/api/personnel/api/horaires");
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

  return result.map((item) => normalizePlanning(item));
};