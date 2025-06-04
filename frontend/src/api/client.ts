import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const client = axios.create({
  baseURL: BASE_URL,
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default client;
