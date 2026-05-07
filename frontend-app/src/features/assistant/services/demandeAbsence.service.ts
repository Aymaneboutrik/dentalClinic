import secureApi from "@apis/instances/secure-api";
import type {
  DemandeAbsence,
  CreateDemandeAbsenceRequest,
  DemandeAbsenceActionResponse,
  ApiError,
} from "../../../types/demandeAbsence/demandeAbsence";

const API_BASE_URL = "/demande-absence";
const CURRENT_ASSISTANT_ID = 3;

export const getDemandesAbsenceByEmployeId = async (): Promise<DemandeAbsence[]> => {
  try {
    const response = await secureApi.get(`${API_BASE_URL}/employe/${CURRENT_ASSISTANT_ID}`);
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch (error: any) {

    throw error.response?.data || { message: "Une erreur est survenue." };
  }
};

export const createDemandeAbsence = async (
  payload: CreateDemandeAbsenceRequest
): Promise<DemandeAbsenceActionResponse> => {
  try {
    const response = await secureApi.post(`${API_BASE_URL}/${CURRENT_ASSISTANT_ID}`, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur est survenue." };
  }
};

export type { ApiError };