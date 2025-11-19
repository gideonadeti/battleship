import axios from "axios";

import authStore from "../state/auth-store";
import ENV from "../config/env";

const httpClient = axios.create({
  baseURL: ENV.API_BASE_URL,
});

httpClient.interceptors.request.use((config) => {
  const token = authStore.getAccessToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clearSession();
    }

    return Promise.reject(error);
  }
);

export { httpClient };
