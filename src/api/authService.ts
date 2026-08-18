import type { ApiResponse } from "./axiosClient";

export type User = {
  id: number;
  name: string;
  username: string;
};

export type LoginResult = {
  token: string;
  user: User;
};

const authService = {
  login: async (
    username: string,
    password: string,
  ): Promise<ApiResponse<LoginResult>> => {
    if (username.trim() === "admin" && password === "123456") {
      return {
        success: true,
        data: {
          token: "demo-admin-token",
          user: {
            id: 1,
            name: "Lã Ngọc Huyền",
            username: "admin",
          },
        },
      };
    }

    throw {
      status: 401,
      message: "Tên đăng nhập hoặc mật khẩu không đúng.",
    };
  },
};

export default authService;
