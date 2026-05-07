import axios from "axios";
import Cookie from "js-cookie";
import { TOKEN } from "@configs/vars";

const secureApi = axios.create({
  // Prefer relative baseURL so Vite proxy (dev) / reverse-proxy (prod) can route requests.
  // Can be overridden via VITE_API_URL (e.g. "http://localhost:80/api" or "http://localhost:5003/api").
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
});

// Add a request interceptor
secureApi.interceptors.request.use(
  function (config) {
    const token = Cookie.get(TOKEN) || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[secureApi] Authorization header injected for URL: ${config.url}`);
    } else {
      console.warn(`[secureApi] NO TOKEN FOUND for URL: ${config.url}`);
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
secureApi.interceptors.response.use(
  function (response) {
    console.log("secure response");
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // If we get a 401 (Unauthorized), it means the token is invalid or expired
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request detected (401). Logging out...");
      
      // Clear authentication data
      Cookie.remove(TOKEN);
      
      // Redirect to login page only if not already there
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.href = "/auth/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default secureApi;
