import axios, { AxiosInstance } from 'axios';

console.log(import.meta.env.VITE_API_URL);

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL ,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }
}
const axiosInstance = axios.create(API_CONFIG)


export default axiosInstance;
