import axios from "axios";

// Create a new instance of Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Use an "interceptor" to automatically add the token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      // Attach the token as a 'Bearer' token in the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
