import secureApi from "@apis/instances/secure-api";

export type AssistantEmployee = {
  idEmploye: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  idRole: number;
  nomRole: string;
};

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

const normalizeEmployee = (item: any): AssistantEmployee => {
  return {
    idEmploye: Number(item?.idEmploye ?? item?.IdEmploye ?? 0),
    nom: String(item?.nom ?? item?.Nom ?? ""),
    prenom: String(item?.prenom ?? item?.Prenom ?? ""),
    telephone: String(item?.telephone ?? item?.Telephone ?? ""),
    email: String(item?.email ?? item?.Email ?? ""),
    idRole: Number(item?.idRole ?? item?.IdRole ?? 0),
    nomRole: String(item?.nomRole ?? item?.NomRole ?? ""),
  };
};

export const getEmployees = async (): Promise<AssistantEmployee[]> => {
  try {
    const response = await secureApi.get("/personnel/api/Employees");
    const result = response.data;

    if (!Array.isArray(result)) {
      return [];
    }

    return result.map((item: any) => normalizeEmployee(item));
  } catch (error: any) {
    throw {
      message: error.response?.data?.message || "Une erreur est survenue lors de la communication avec le serveur.",
      status: error.response?.status || 0,
    } as ApiError;
  }
};