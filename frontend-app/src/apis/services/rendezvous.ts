import secureApi from "@apis/instances/secure-api";
import type { 
  RendezVous, 
  CreateRendezVousRequest, 
  UpdateRendezVousRequest,
  RescheduleRendezVousRequest,
  HistoriqueRDV 
} from "../../types/rendezvous/rendezvous";

const BASE_URL = "/rendez-vous/api/RendezVous";

export interface ApiError {
  message: string;
}

export const getRendezVous = async (): Promise<RendezVous[]> => {
  const response = await secureApi.get(BASE_URL);
  return response.data;
};

export const getRendezVousById = async (id: number): Promise<RendezVous> => {
  const response = await secureApi.get(`${BASE_URL}/${id}`);
  return response.data;
};

export const createRendezVous = async (data: CreateRendezVousRequest): Promise<RendezVous> => {
  const response = await secureApi.post(BASE_URL, data);
  return response.data;
};

export const updateRendezVous = async (id: number, data: UpdateRendezVousRequest): Promise<RendezVous> => {
  const response = await secureApi.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

export const cancelRendezVous = async (id: number, modifiePar: string): Promise<void> => {
  await secureApi.put(`${BASE_URL}/${id}/annuler`, null, {
    params: { modifiePar }
  });
};

export const markAsAbsent = async (id: number, modifiePar: number): Promise<void> => {
  await secureApi.put(`${BASE_URL}/${id}/absent`, null, {
    params: { modifiePar }
  });
};

export const markAsCompleted = async (id: number, modifiePar: number): Promise<void> => {
  await secureApi.put(`${BASE_URL}/${id}/effectuer`, null, {
    params: { modifiePar }
  });
};

export const rescheduleRendezVous = async (id: number, data: RescheduleRendezVousRequest): Promise<void> => {
  await secureApi.put(`${BASE_URL}/${id}/reporter`, data);
};

export const getHistory = async (id: number): Promise<HistoriqueRDV[]> => {
  const response = await secureApi.get(`${BASE_URL}/${id}/historique`);
  return response.data;
};

export const getAllHistory = async (): Promise<HistoriqueRDV[]> => {
  const response = await secureApi.get(`${BASE_URL}/historique`);
  return response.data;
};
