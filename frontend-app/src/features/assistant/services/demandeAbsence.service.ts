import type {
  DemandeAbsence,
  CreateDemandeAbsenceRequest,
  DemandeAbsenceActionResponse,
  ApiError,
} from "../../../types/demandeAbsence/demandeAbsence";

const API_BASE_URL = "/api/demande-absence";
const CURRENT_ASSISTANT_ID = 3;

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

export const getDemandesAbsenceByEmployeId = async (): Promise<
  DemandeAbsence[]
> => {
  const response = await fetch(
    `${API_BASE_URL}/employe/${CURRENT_ASSISTANT_ID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw await buildApiError(response);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const createDemandeAbsence = async (
  payload: CreateDemandeAbsenceRequest
): Promise<DemandeAbsenceActionResponse> => {
  const response = await fetch(`${API_BASE_URL}/${CURRENT_ASSISTANT_ID}`, {
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

export type { ApiError };