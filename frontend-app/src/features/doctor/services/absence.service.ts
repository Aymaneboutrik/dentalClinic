import secureApi from "@apis/instances/secure-api";
import type {
  Absence,
  CreateAbsenceRequest,
  AbsenceActionResponse,
  ApiError,
} from "../../../types/absence/absence";

const API_BASE_URL = "/absence";
const CURRENT_DOCTOR_ID = 7;

export const getAbsences = async (): Promise<Absence[]> => {
  try {
    const response = await secureApi.get(API_BASE_URL);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur inattendue est survenue." };
  }
};

export const createAbsence = async (
  payload: CreateAbsenceRequest
): Promise<AbsenceActionResponse> => {
  try {
    const response = await secureApi.post(API_BASE_URL, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur inattendue est survenue." };
  }
};

export const deleteAbsence = async (
  idAbsence: number
): Promise<AbsenceActionResponse> => {
  try {
    const response = await secureApi.delete(
      `${API_BASE_URL}/${idAbsence}/${CURRENT_DOCTOR_ID}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Une erreur inattendue est survenue." };
  }
};

export type { ApiError };