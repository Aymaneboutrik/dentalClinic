import secureApi from "@apis/instances/secure-api";
import type {
  DemandeAbsence,
  DemandeAbsenceActionResponse,
  ApiError,
} from "../../../types/demandeAbsence/demandeAbsence";

const API_BASE_URL = "/demande-absence";

export const getDemandesAbsence = async (): Promise<DemandeAbsence[]> => {
  try {
    const response = await secureApi.get(API_BASE_URL);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur inattendue est survenue." };
  }
};

export const accepterDemandeAbsence = async (
  idDemande: number,
  traiteParId: number
): Promise<DemandeAbsenceActionResponse> => {
  try {
    const response = await secureApi.put(
      `${API_BASE_URL}/${idDemande}/accepter/${traiteParId}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur inattendue est survenue." };
  }
};

export const refuserDemandeAbsence = async (
  idDemande: number,
  traiteParId: number
): Promise<DemandeAbsenceActionResponse> => {
  try {
    const response = await secureApi.put(
      `${API_BASE_URL}/${idDemande}/refuser/${traiteParId}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur inattendue est survenue." };
  }
};

export type { ApiError };