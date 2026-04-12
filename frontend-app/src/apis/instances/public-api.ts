/// <reference types="vite/client" />
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Add a request interceptor
publicApi.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    console.log("public request");
    return config;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
publicApi.interceptors.response.use(
  function (response: AxiosResponse) {
    console.log("public response");
    return response;
  },
  function (error: AxiosError) {
    return Promise.reject(error);
  }
);

export default publicApi;