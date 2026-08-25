import axios from "axios";
import { useAuthStore } from "../stores/authStore";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
};

// Lỗi đã được chuẩn hóa để component chỉ cần đọc { status, message }
export interface ApiError {
  status: number | null;
  message: string;
}

const axiosClient = axios.create({
  baseURL: "/api/",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Gắn token vào mọi request nếu đã đăng nhập.
axiosClient.interceptors.request.use((request) => {
  const token = useAuthStore.getState().token;
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        useAuthStore.getState().logout();
      }

      return Promise.reject({
        status,
        message: data?.message || "Có lỗi ở server.",
      });
    }

    if (error.request) {
      return Promise.reject({
        status: null,
        message: "Không thể kết nối server",
      });
    }

    return Promise.reject({ status: null, message: error.message });
  },
);

export default axiosClient;
