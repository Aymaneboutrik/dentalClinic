import type {
  Absence,
  CreateAbsenceRequest,
  AbsenceActionResponse,
  ApiError,
} from "../../../types/absence/absence";

const API_BASE_URL = "/api/absence";
const CURRENT_DOCTOR_ID = 7;

const buildApiError = async (response: Response): Promise<ApiError> => {
  try {
    const data = await response.json();

    return {
      message: data.message || "Une erreur est survenue.",
      code: data.code,
      errors: data.errors,
    };
  } catch {
    return {
      message: "Une erreur inattendue est survenue.",
    };
  }
};

export const getAbsences = async (): Promise<Absence[]> => {
  const response = await fetch(API_BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const createAbsence = async (
  payload: CreateAbsenceRequest
): Promise<AbsenceActionResponse> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json();
};

export const deleteAbsence = async (
  idAbsence: number
): Promise<AbsenceActionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/${idAbsence}/${CURRENT_DOCTOR_ID}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.json();
};

export type { ApiError };