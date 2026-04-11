import secureApi from "@apis/instances/secure-api";

export const userService = {
  getUsers: async () => {
    const response = await secureApi.get("/users");
    return response.data;
  },

  createUser: async (data: Record<string, any>) => {
    const response = await secureApi.post("/users", data);
    return response.data;
  },

  toggleUserStatus: async (id: number, active: boolean) => {
    const response = await secureApi.post(`/users/${id}/status`, { active });
    return response.data;
  },

  changeDoctorPassword: async (data: { oldPassword: string; newPassword: string }) => {
    const response = await secureApi.post("/users/password", data);
    return response.data;
  },

  getPendingPasswordRequests: async () => {
    const response = await secureApi.get("/users/password-requests");
    return response.data;
  },

  approvePasswordRequest: async (id: number) => {
    const response = await secureApi.post(`/users/password-requests/${id}/approve`);
    return response.data;
  },

  rejectPasswordRequest: async (id: number) => {
    const response = await secureApi.post(`/users/password-requests/${id}/reject`);
    return response.data;
  },

  clearNotifications: async () => {
    const response = await secureApi.post("/users/notifications/clear");
    return response.data;
  },

  resetPasswordDirectly: async (id: number, newPassword: string) => {
    const response = await secureApi.post(`/users/${id}/reset-password-direct`, { newPassword });
    return response.data;
  },
};
