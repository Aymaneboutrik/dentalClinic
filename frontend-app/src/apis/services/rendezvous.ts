import type { 
  RendezVous, 
  CreateRendezVousRequest, 
  UpdateRendezVousRequest,
  RescheduleRendezVousRequest,
  HistoriqueRDV 
} from "../../types/rendezvous/rendezvous";

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
      result?.title ||
      "Une erreur est survenue lors de la communication avec le serveur.",
    status: response.status,
    code: result?.code,
    errors: result?.errors,
  };
};

const BASE_URL = "/api/rendez-vous/api/RendezVous";

export const getRendezVous = async (): Promise<RendezVous[]> => {
  let response: Response;
  try {
    response = await fetch(BASE_URL);
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
  return await response.json();
};

export const getRendezVousById = async (id: number): Promise<RendezVous> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}`);
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
  return await response.json();
};

export const createRendezVous = async (data: CreateRendezVousRequest): Promise<RendezVous> => {
  let response: Response;
  try {
    response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
  return await response.json();
};

export const updateRendezVous = async (id: number, data: UpdateRendezVousRequest): Promise<RendezVous> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
  return await response.json();
};

export const cancelRendezVous = async (id: number, modifiePar: string): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}/annuler?modifiePar=${modifiePar}`, { method: "PUT" });
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
};



export const markAsAbsent = async (id: number, modifiePar: number): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}/absent?modifiePar=${modifiePar}`, { method: "PUT" });
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
};

export const markAsCompleted = async (id: number, modifiePar: number): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}/effectuer?modifiePar=${modifiePar}`, { method: "PUT" });
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
};

export const rescheduleRendezVous = async (id: number, data: RescheduleRendezVousRequest): Promise<void> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}/reporter`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
};

export const getHistory = async (id: number): Promise<HistoriqueRDV[]> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${id}/historique`);
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
  return await response.json();
};

export const getAllHistory = async (): Promise<HistoriqueRDV[]> => {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/historique`);
  } catch {
    throw { message: "Impossible de contacter le serveur.", status: 0 } as ApiError;
  }
  if (!response.ok) throw await buildApiError(response);
  return await response.json();
};
