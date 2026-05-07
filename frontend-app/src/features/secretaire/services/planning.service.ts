import type { Planning } from "../../../types/planning/planning";
import secureApi from "@apis/instances/secure-api";


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
  try {
    const response = await secureApi.get("/personnel/api/horaires");
    const result = response.data;

    if (!Array.isArray(result)) {
      return [];
    }

    return result.map((item: any) => normalizePlanning(item));
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || "Impossible de contacter le serveur.",
      status: error.response?.status || 0,
    } as ApiError;
  }
};