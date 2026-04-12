import type {
  DemandeAbsence,
  DemandeAbsenceActionResponse,
  ApiError,
} from "../../../types/demandeAbsence/demandeAbsence";

const API_BASE_URL = "/api/demande-absence";

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

export const getDemandesAbsence = async (): Promise<DemandeAbsence[]> => {
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

export const accepterDemandeAbsence = async (
  idDemande: number,
  traiteParId: number
): Promise<DemandeAbsenceActionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/${idDemande}/accepter/${traiteParId}`,
    {
      method: "PUT",
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

export const refuserDemandeAbsence = async (
  idDemande: number,
  traiteParId: number
): Promise<DemandeAbsenceActionResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/${idDemande}/refuser/${traiteParId}`,
    {
      method: "PUT",
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