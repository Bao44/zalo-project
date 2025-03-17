import axios from "axios";
import TokenAPI from "../api/TokenAPI";

const API_URL = `${import.meta.env.VITE_REACT_APP_API_URL}`;

const axiosAuth = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

axiosAuth.interceptors.request.use(
  async (config) => {
    const access_token = TokenAPI.getAccessToken();
    console.log("access_token", access_token);

    config.headers.Authorization = `Bearer ${access_token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

axiosAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    // Access Token was expired
    if (error.response && error.response.status === 500 && !config._retry) {
      config._retry = true;
      try {
        const refresh_token = TokenAPI.getRefreshToken();
        console.log("refresh_token ->", refresh_token);

        if (refresh_token) {
          const { data } = await axios({
            url: API_URL + "/api/v1/users/refresh-token",
            method: "post",
            data: {
              refreshToken: refresh_token,
            },
          });

          if (data.data) {
            TokenAPI.setAccessToken(data.data.accessToken);
            TokenAPI.setRefreshToken(data.data.refreshToken);
          }
          return axiosAuth(config);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

const axiosNotAuth = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

axiosNotAuth.interceptors.request.use(
  async (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

axiosNotAuth.interceptors.response.use((response) => {
  return response;
});

const axiosFormData = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "multipart/form-data",
  },
});

axiosFormData.interceptors.response.use((response) => {
  return response;
});

axiosFormData.interceptors.request.use(
  async (config) => {
    const access_token = TokenAPI.getAccessToken();
    config.headers.Authorization = "Bearer " + access_token;
    return config;
  },
  (error) => Promise.reject(error)
);

export { axiosAuth, axiosNotAuth, axiosFormData };
