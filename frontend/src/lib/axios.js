import axios from "axios";

let API_URL;

if (window.location.hostname === "localhost") {
  API_URL = "http://localhost:5001/api";
} else {
  // fallback to LAN or production domain
  API_URL = `http://${window.location.hostname}:5001/api`;
}

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
