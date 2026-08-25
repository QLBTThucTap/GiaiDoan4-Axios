import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authService from "../api/authService";
import { useAuthStore } from "../stores/authStore";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authService.login(username, password);
      // Kỳ vọng backend trả về: { success: true, data: { token, user } }
      const token = res.data?.token;
      if (!token) {
        setError("Phản hồi từ server không có token.");
        return;
      }
      setAuth(token, res.data.user);
      const destination = location.state?.from?.pathname || "/products";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-slate-900">
          Đăng nhập hệ thống
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Nhập thông tin quản trị viên để tiếp tục.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tên đăng nhập
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 ring-1 ring-rose-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-2.5 text-sm transition disabled:opacity-60"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <div className="mt-5 rounded-2xl bg-gray-300 p-3 text-sm text-center">
          <p>Tài khoản: admin</p>
          <p>Mật khẩu: 123456</p>
        </div>
      </div>
    </div>
  );
}
