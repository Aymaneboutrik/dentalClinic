/// <reference types="vite/client" />
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost/api",
  timeout: 15000,
});


// Add a request interceptor
publicApi.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    console.log("public request");
    // Do something before request is sent
    return config;
  },
  function (error: AxiosError) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
publicApi.interceptors.response.use(
  function (response: AxiosResponse) {
    console.log("public response");
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error: AxiosError) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default publicApi;
