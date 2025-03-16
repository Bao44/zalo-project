import axios from "axios";
import { BACKEND_URL } from "../constants/ip";

export const axiosConfig = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});