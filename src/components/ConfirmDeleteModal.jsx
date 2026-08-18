import React from "react";

export default function ConfirmDeleteModal({ product, onClose, onConfirm, submitting }) {
  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 text-xl">
          !
        </div>
        <h3 className="font-semibold text-slate-900">Xóa sản phẩm?</h3>
        <p className="text-sm text-slate-500 mt-1.5">
          Bạn sắp xóa <span className="font-medium text-slate-700">{product.name}</span>. Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-60"
          >
            {submitting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
