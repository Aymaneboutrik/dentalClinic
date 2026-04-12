import type { Planning } from "../../../types/planning/planning";

export interface CreatePlanningRequest {
  idEmploye: number;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface UpdatePlanningRequest {
  jour?: string;
  heureDebut?: string;
  heureFin?: string;
}

interface PlanningApiResponse {
  message?: string;
  Message?: string;
  idHoraire?: number;
  IdHoraire?: number;
  jour?: string;
  Jour?: string;
  heureDebut?: string;
  HeureDebut?: string;
  heureFin?: string;
  HeureFin?: string;
  idEmploye?: number;
  IdEmploye?: number;
  nom?: string;
  Nom?: string;
  prenom?: string;
  Prenom?: string;
  role?: string;
  Role?: string;
}

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

export const createPlanning = async (
  planningData: CreatePlanningRequest
): Promise<Planning> => {
  let response: Response;

  try {
    response = await fetch("/api/personnel/api/horaires", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planningData),
    });
  } catch {
    throw {
      message: "Impossible de contacter le serveur.",
      status: 0,
    } as ApiError;
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  const result = (await response.json()) as PlanningApiResponse;
  return normalizePlanning(result);
};

export const updatePlanning = async (
  id: number,
  planningData: UpdatePlanningRequest
): Promise<Planning> => {
  let response: Response;

  try {
    response = await fetch(`/api/personnel/api/horaires/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planningData),
    });
  } catch {
    throw {
      message: "Impossible de contacter le serveur.",
      status: 0,
    } as ApiError;
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  const result = (await response.json()) as PlanningApiResponse;
  return normalizePlanning(result);
};

export const deletePlanning = async (id: number): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(`/api/personnel/api/horaires/${id}`, {
      method: "DELETE",
    });
  } catch {
    throw {
      message: "Impossible de contacter le serveur.",
      status: 0,
    } as ApiError;
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }
};