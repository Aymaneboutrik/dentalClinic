import type { Employee } from "../../../types/employee/employee";

export interface CreateEmployeeRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  idRole: number;
}

export interface UpdateEmployeeRequest {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  idRole?: number;
  statut?: string;
}

interface CreateEmployeeApiResponse {
  message: string;
  data: Employee;
}

export interface EmployeeDetails extends Employee {
  idRole?: number;
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
      result?.title ||
      "Une erreur est survenue lors de la communication avec le serveur.",
    status: response.status,
    code: result?.code,
    errors: result?.errors,
  };
};

export const getEmployees = async (): Promise<Employee[]> => {
  let response: Response;

  try {
    response = await fetch("/api/personnel/api/Employees");
  } catch {
    throw {
      message: "Impossible de contacter le serveur.",
      status: 0,
    } as ApiError;
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return await response.json();
};

export const getEmployeeById = async (id: number): Promise<EmployeeDetails> => {
  let response: Response;

  try {
    response = await fetch(`/api/personnel/api/Employees/${id}`);
  } catch {
    throw {
      message: "Impossible de contacter le serveur.",
      status: 0,
    } as ApiError;
  }

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return await response.json();
};

export const createEmployee = async (
  employeeData: CreateEmployeeRequest
): Promise<Employee> => {
  let response: Response;

  try {
    response = await fetch("/api/personnel/api/Employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
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

  const result = (await response.json()) as CreateEmployeeApiResponse;
  return result.data;
};

export const updateEmployee = async (
  id: number,
  employeeData: UpdateEmployeeRequest
): Promise<EmployeeDetails> => {
  let response: Response;

  try {
    response = await fetch(`/api/personnel/api/Employees/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
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

  return await response.json();
};

export const deleteEmployee = async (id: number): Promise<void> => {
  let response: Response;

  try {
    response = await fetch(`/api/personnel/api/Employees/${id}`, {
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