<<<<<<< HEAD
import axios from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 1000,
=======
/// <reference types="vite/client" />
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
>>>>>>> origin/main
});

// Add a request interceptor
publicApi.interceptors.request.use(
<<<<<<< HEAD
  function (config) {
    console.log("public request");
    // Do something before request is sent
    return config;
  },
  function (error) {
    // Do something with request error
=======
  function (config: InternalAxiosRequestConfig) {
    console.log("public request");
    return config;
  },
  function (error: AxiosError) {
>>>>>>> origin/main
    return Promise.reject(error);
  }
);

// Add a response interceptor
publicApi.interceptors.response.use(
<<<<<<< HEAD
  function (response) {
    console.log("public response");
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
=======
  function (response: AxiosResponse) {
    console.log("public response");
    return response;
  },
  function (error: AxiosError) {
>>>>>>> origin/main
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
export default publicApi;
=======
export default publicApi;
>>>>>>> origin/main
