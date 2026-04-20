import secureApi from "@apis/instances/secure-api";

export interface Patient {
  id?: number;
  cin: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  sexe?: string;
  archived?: boolean;
  dossierId?: number;
}

export interface Consultation {
  id?: number;
  dateConsultation?: string;
  motif: string;
  observations?: any[];
}

export const patientService = {
  // Patients Management
  getAllPatients: async (query?: string) => {
    const response = await secureApi.get("/patients", { params: { query } });
    return response.data;
  },

  getPatientById: async (id: number) => {
    const response = await secureApi.get(`/patients/${id}`);
    return response.data;
  },

  addPatient: async (data: Patient) => {
    const response = await secureApi.post("/patients", data);
    return response.data;
  },

  updatePatient: async (id: number, data: Patient) => {
    const response = await secureApi.put(`/patients/${id}`, data);
    return response.data;
  },

  archivePatient: async (id: number) => {
    const response = await secureApi.patch(`/patients/${id}/archive`);
    return response.data;
  },

  unarchivePatient: async (id: number) => {
    const response = await secureApi.patch(`/patients/${id}/unarchive`);
    return response.data;
  },

  // Consultations
  getPatientHistory: async (patientId: number) => {
    const response = await secureApi.get(`/consultations/patient/${patientId}`);
    return response.data;
  },

  addConsultation: async (patientId: number, data: { motif: string; observation?: string }) => {
    const response = await secureApi.post(`/consultations/patient/${patientId}`, data);
    return response.data;
  },

  addObservation: async (consultationId: number, contenu: string) => {
    const response = await secureApi.post(`/consultations/${consultationId}/observations`, { contenu });
    return response.data;
  },

  addAssistantObservation: async (consultationId: number, contenu: string) => {
    const response = await secureApi.post(`/assistant/consultations/${consultationId}/observations`, { contenu });
    return response.data;
  },

  // Documents
  uploadDossierDocument: async (dossierId: number, file: File, nom?: string, type: string = "MEDICAL") => {
    const formData = new FormData();
    formData.append("file", file);
    if (nom) formData.append("nom", nom);
    formData.append("type", type);
    const response = await secureApi.post(`/documents/dossier/${dossierId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadConsultationDocument: async (consultationId: number, file: File, nom?: string, type: string = "MEDICAL") => {
    const formData = new FormData();
    formData.append("file", file);
    if (nom) formData.append("nom", nom);
    formData.append("type", type);
    const response = await secureApi.post(`/documents/consultation/${consultationId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getDossierDocuments: async (dossierId: number) => {
    const response = await secureApi.get(`/documents/dossier/${dossierId}`);
    return response.data;
  },

  getConsultationDocuments: async (consultationId: number) => {
    const response = await secureApi.get(`/documents/consultation/${consultationId}`);
    return response.data;
  },

  deleteDocument: async (id: number) => {
    await secureApi.delete(`/documents/${id}`);
  },

  renameDocument: async (id: number, name: string) => {
    const response = await secureApi.patch(`/documents/${id}/name?nom=${encodeURIComponent(name)}`);
    return response.data;
  },

  downloadDocument: async (id: number) => {
    const response = await secureApi.get(`/documents/${id}`, { responseType: "blob" });
    return response.data;
  },

  // Ordonnances
  getOrdonnanceById: async (id: number) => {
    const response = await secureApi.get(`/ordonnances/${id}`);
    return response.data;
  },

  getOrdonnanceByConsultation: async (consultationId: number) => {
    const response = await secureApi.get(`/ordonnances/consultation/${consultationId}`);
    return response.data;
  },
  
  createOrdonnance: async (consultationId: number, lignes: any[]) => {
    const response = await secureApi.post(`/ordonnances/consultation/${consultationId}`, lignes);
    return response.data;
  },

  updateOrdonnance: async (id: number, lignes: any[]) => {
    const response = await secureApi.put(`/ordonnances/${id}`, lignes);
    return response.data;
  },

  deleteOrdonnance: async (id: number) => {
    await secureApi.delete(`/ordonnances/${id}`);
  },

  // Role Specific - Assistant
  assistantSearchPatients: async (query?: string) => {
    const response = await secureApi.get(`/assistant/patients/search`, { params: { query } });
    return response.data;
  },

  // Role Specific - Secretary
  secretaryListPatients: async () => {
    const response = await secureApi.get(`/sec/patients`);
    return response.data;
  },

  secretaryGetPatientByCin: async (cin: string) => {
    const response = await secureApi.get(`/sec/patients/by-cin`, { params: { cin } });
    return response.data;
  },

  secretaryGetHistoryByCin: async (cin: string) => {
    const response = await secureApi.get(`/sec/patients/history-by-cin`, { params: { cin } });
    return response.data;
  },

  secretaryAddPatient: async (data: Patient) => {
    const response = await secureApi.post("/sec/patients", data);
    return response.data;
  },

  secretaryUpdatePatient: async (id: number, data: Patient) => {
    const response = await secureApi.put(`/sec/patients/${id}`, data);
    return response.data;
  },

  secretaryArchivePatient: async (id: number) => {
    const response = await secureApi.patch(`/sec/patients/${id}/archive`);
    return response.data;
  },

  secretaryUnarchivePatient: async (id: number) => {
    const response = await secureApi.patch(`/sec/patients/${id}/unarchive`);
    return response.data;
  },

  secretaryGetDossierDocuments: async (dossierId: number) => {
    const response = await secureApi.get(`/sec/patients/${dossierId}/documents`);
    return response.data;
  },

  secretaryDownloadDocument: async (id: number) => {
    const response = await secureApi.get(`/sec/documents/${id}`, { responseType: "blob" });
    return response.data;
  }
};

