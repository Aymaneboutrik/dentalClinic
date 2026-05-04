import secureApi from "@apis/instances/secure-api";
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

const API_PREFIX = "/personnel/api/horaires";

export const getPlannings = async (): Promise<Planning[]> => {
  try {
    const response = await secureApi.get(API_PREFIX);
    const result = response.data;

    if (!Array.isArray(result)) {
      return [];
    }

    return result.map((item: any) => normalizePlanning(item));
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const createPlanning = async (
  planningData: CreatePlanningRequest
): Promise<Planning> => {
  try {
    const response = await secureApi.post(API_PREFIX, planningData);
    const result = response.data as PlanningApiResponse;
    return normalizePlanning(result);
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const updatePlanning = async (
  id: number,
  planningData: UpdatePlanningRequest
): Promise<Planning> => {
  try {
    const response = await secureApi.patch(`${API_PREFIX}/${id}`, planningData);
    const result = response.data as PlanningApiResponse;
    return normalizePlanning(result);
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const deletePlanning = async (id: number): Promise<void> => {
  try {
    await secureApi.delete(`${API_PREFIX}/${id}`);
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};