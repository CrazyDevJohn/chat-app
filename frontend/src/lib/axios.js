import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
  // headers: {
  //   "Content-Type": "application/json;charset=utf-8",
  //   "Access-Control-Allow-Origin": "/*",
  // },
});
