import axios from "axios";

const API_URL = `${process.env.REACT_APP_BACKEND_URL}`;

export const axiosConfig = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});