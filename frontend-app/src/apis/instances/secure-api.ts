import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Cookie from "js-cookie";
import { TOKEN } from "@configs/vars";

const secureApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost/api",
  timeout: 10000,
});

// Request interceptor (attach token)
secureApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookie.get(TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("secure request");

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
secureApi.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("secure response");
    return response;
  },
  (error: AxiosError) => {
    // Handle expired/invalid token
    if (error.response?.status === 401) {
      console.warn("Unauthorized request detected (401). Logging out...");

      Cookie.remove(TOKEN);

      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);

export default secureApi;