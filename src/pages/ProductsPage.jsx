import React, { useCallback, useEffect, useState } from "react";
import productService from "../api/productService";
import ProductModal from "../components/ProductModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

function currency(n) {
  return Number(n || 0).toLocaleString("vi-VN") + "đ";
}

export default function ProductsPage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState(null); // { mode: "add" } | { mode: "edit", product }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await productService.getAll({ search: query, page: 1, pageSize: 20 });
      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || "Không tải được danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSave = async (formData) => {
    setSaving(true);
    setError("");
    try {
      if (modal.mode === "edit") {
        const res = await productService.update(modal.product.id, formData);
        setProducts((prev) => prev.map((p) => (p.id === modal.product.id ? res.data : p)));
      } else {
        const res = await productService.create(formData);
        setProducts((prev) => [...prev, res.data]);
        setTotal((t) => t + 1);
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "Lưu sản phẩm thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError("");
    try {
      await productService.remove(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setTotal((t) => t - 1);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Xóa sản phẩm thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Product Management</h1>
            <p className="text-xs text-slate-500">Quản lý sản phẩm điện tử</p>
          </div>
          <div className="flex items-center gap-4">
            {user?.name && <span className="text-sm text-slate-600 hidden sm:block">{user.name}</span>}
            <button
              onClick={onLogout}
              className="text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Products</h2>
            <p className="text-sm text-slate-500 mt-1">{total} sản phẩm</p>
          </div>
          <button
            onClick={() => setModal({ mode: "add" })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
          >
            + Thêm sản phẩm
          </button>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition mb-5"
        />

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 rounded-lg px-4 py-2 mb-4">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3.5 font-medium">Sản phẩm</th>
                  <th className="px-6 py-3.5 font-medium">Danh mục</th>
                  <th className="px-6 py-3.5 font-medium">Giá</th>
                  <th className="px-6 py-3.5 font-medium">Kho</th>
                  <th className="px-6 py-3.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                )}

                {!loading && products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400">
                      Không có sản phẩm nào.
                    </td>
                  </tr>
                )}

                {!loading &&
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{p.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{currency(p.price)}</td>
                      <td className="px-6 py-4">{p.stock}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setModal({ mode: "edit", product: p })}
                            className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modal && (
        <ProductModal
          initial={modal.mode === "edit" ? modal.product : null}
          submitting={saving}
          onClose={() => setModal(null)}
          onSubmit={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          product={deleteTarget}
          submitting={saving}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
