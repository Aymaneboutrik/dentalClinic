/// <reference types="vite/client" />
import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Request interceptor
publicApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log("public request");
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
publicApi.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("public response");
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export default publicApi;