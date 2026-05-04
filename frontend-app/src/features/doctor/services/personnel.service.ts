import secureApi from "@apis/instances/secure-api";
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

const API_PREFIX = "/personnel/api/Employees";

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await secureApi.get(API_PREFIX);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const getEmployeeById = async (id: number): Promise<EmployeeDetails> => {
  try {
    const response = await secureApi.get(`${API_PREFIX}/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const createEmployee = async (
  employeeData: CreateEmployeeRequest
): Promise<Employee> => {
  try {
    const response = await secureApi.post(API_PREFIX, employeeData);
    const result = response.data as CreateEmployeeApiResponse;
    return result.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const updateEmployee = async (
  id: number,
  employeeData: UpdateEmployeeRequest
): Promise<EmployeeDetails> => {
  try {
    const response = await secureApi.patch(`${API_PREFIX}/${id}`, employeeData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};

export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    await secureApi.delete(`${API_PREFIX}/${id}`);
  } catch (error: any) {
    throw error.response?.data || { message: "Impossible de contacter le serveur.", status: 0 };
  }
};