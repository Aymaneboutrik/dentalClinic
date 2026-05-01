import publicApi from "@apis/instances/public-api";
import secureApi from "@apis/instances/secure-api";

export const authService = {
  login: async (data: Record<string, string>) => {
    // Map either 'email' or 'u_key_auth' to 'email'
    const payload = {
      email: (data.email || data.u_key_auth || "").trim(),
      password: data.password || data.p_key_auth || "",
    };

    console.log("Auth Service - Sending payload:", { ...payload, password: "[REDACTED]" });

    const response = await publicApi.post("/auth/login", payload);
    return response.data;
  },

  requestPasswordReset: async () => {
    const response = await secureApi.post("/users/password-reset-request");
    return response.data;
  },

  changePasswordAfterReset: async (oldPassword: string, newPassword: string) => {
    const response = await secureApi.post("/users/change-password-approved", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  forgotPasswordEmail: async (email: string) => {
    const response = await publicApi.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPasswordWithToken: async (token: string, newPassword: string) => {
    const response = await publicApi.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
};
