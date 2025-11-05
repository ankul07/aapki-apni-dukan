import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER,
  withCredentials: true, // Important for cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    config.headers["x-platform"] = "web";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // console.log(error);
    if (error.response) {
      // console.log(error.response.data?.message);
    } else {
      // console.log("Network error or no response from server");
    }
    // Check if the error is due to an expired access token (401 status code)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (error.response.data.message === "Access Token Expired") {
        try {
          // Refresh token will be sent automatically in cookies due to withCredentials: true
          const response = await api.get(
            "/user/refresh-token",

            { withCredentials: true }
          );
          // console.log(response);

          // Save new access token
          if (response.data.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);

            // Update the failed request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh token is also expired or invalid, redirect to login
          localStorage.removeItem("accessToken");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
