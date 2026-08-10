import { Instance } from "./Instance";

/**
 * ============================================================
 * NGUYÊN TẮC HTTP CƠ BẢN (RFC 7231 / REST)
 * ============================================================
 *
 *              | Safe?  | Idempotent? | Có body request? | Mục đích
 * -------------|--------|-------------|-------------------|------------------------------
 * GET          | Có     | Có          | Không             | Lấy dữ liệu, không thay đổi server
 * POST         | Không  | Không       | Có                | Tạo mới tài nguyên (mỗi lần gọi tạo 1 bản ghi mới)
 * PUT          | Không  | Có          | Có (toàn bộ)      | Thay thế TOÀN BỘ tài nguyên
 * PATCH        | Không  | Không*      | Có (một phần)     | Cập nhật MỘT PHẦN tài nguyên
 * DELETE       | Không  | Có          | Thường không      | Xóa tài nguyên
 *
 * - "Safe"       = không làm thay đổi trạng thái server (chỉ đọc)
 * - "Idempotent" = gọi 1 lần hay N lần thì kết quả cuối cùng trên server như nhau
 *   (POST không idempotent: gọi 3 lần createPost => tạo ra 3 bản ghi khác nhau)
 *   (PUT idempotent: gọi PUT với cùng dữ liệu 3 lần => tài nguyên chỉ có 1 trạng thái đó)
 *
 * Mã trạng thái (status code) thường gặp:
 *   200 OK              - GET/PUT/PATCH/DELETE thành công
 *   201 Created         - POST thành công, tạo mới tài nguyên
 *   204 No Content       - DELETE thành công nhưng không trả về body
 *   400 Bad Request      - Dữ liệu gửi lên sai định dạng
 *   401 Unauthorized     - Thiếu / sai token xác thực
 *   404 Not Found        - Không tìm thấy tài nguyên
 *   500 Internal Error   - Lỗi phía server
 * ============================================================
 */

// ------------------------------------------------------------
// 1) GET — Lấy dữ liệu (Read)
// Nguyên tắc: KHÔNG gửi body, chỉ dùng query string / URL param
// ------------------------------------------------------------
export const getResource = async (id) => {
  try {
    const response = await Instance.get(`/${id}`);
    console.log("✅ GET thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError("GET", error);
    return null;
  }
};

// Lấy danh sách + lọc bằng query string (vẫn là GET, không có body)
export const getResourceList = async (params = {}) => {
  try {
    const response = await Instance.get("", { params });
    // axios tự động build query string từ object params
    // VD: { userId: 1 } => ?userId=1
    console.log("✅ GET list thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError("GET list", error);
    return [];
  }
};

// ------------------------------------------------------------
// 2) POST — Tạo mới (Create)
// Nguyên tắc: LUÔN có body, KHÔNG idempotent (gọi nhiều lần = tạo nhiều bản ghi)
// Server trả về 201 Created + tài nguyên vừa tạo (thường kèm id mới)
// ------------------------------------------------------------
export const createResource = async (payload) => {
  try {
    const response = await Instance.post("", payload);
    console.log("✅ POST thành công, status:", response.status); // kỳ vọng 201
    console.log("Tài nguyên mới:", response.data);
    return response.data;
  } catch (error) {
    handleError("POST", error);
    return null;
  }
};

// ------------------------------------------------------------
// 3) PUT — Thay thế toàn bộ (Full Update)
// Nguyên tắc: Body PHẢI chứa đầy đủ tất cả field của tài nguyên,
// vì PUT sẽ GHI ĐÈ toàn bộ, field nào không gửi sẽ bị mất/reset
// Idempotent: gọi lại nhiều lần với cùng payload -> kết quả không đổi
// ------------------------------------------------------------
export const replaceResource = async (id, fullPayload) => {
  try {
    const response = await Instance.put(`/${id}`, fullPayload);
    console.log("✅ PUT thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError("PUT", error);
    return null;
  }
};

// ------------------------------------------------------------
// 3b) PATCH — Cập nhật một phần (Partial Update)
// Nguyên tắc: Chỉ gửi field cần thay đổi, các field khác giữ nguyên
// (Đưa vào đây để so sánh với PUT, không phải 1 trong 4 method chính
//  nhưng hay bị nhầm lẫn với PUT)
// ------------------------------------------------------------
export const updateResourcePartial = async (id, partialPayload) => {
  try {
    const response = await Instance.patch(`/${id}`, partialPayload);
    console.log("✅ PATCH thành công:", response.data);
    return response.data;
  } catch (error) {
    handleError("PATCH", error);
    return null;
  }
};

// ------------------------------------------------------------
// 4) DELETE — Xóa (Delete)
// Nguyên tắc: Thường KHÔNG có body, chỉ cần id trên URL
// Idempotent: xóa 1 lần hay gọi lại nhiều lần, tài nguyên vẫn ở
// trạng thái "không tồn tại" -> kết quả cuối như nhau
// Server có thể trả 200 (kèm data) hoặc 204 (không có body)
// ------------------------------------------------------------
export const deleteResource = async (id) => {
  try {
    const response = await Instance.delete(`/${id}`);
    console.log("✅ DELETE thành công, status:", response.status);
    return response.status === 204 ? true : response.data;
  } catch (error) {
    handleError("DELETE", error);
    return null;
  }
};

// ------------------------------------------------------------
// Hàm xử lý lỗi dùng chung cho tất cả method
// ------------------------------------------------------------
function handleError(method, error) {
  if (error.response) {
    // Server phản hồi nhưng status lỗi (4xx, 5xx)
    console.error(`❌ [${method}] Server trả lỗi:`, {
      status: error.response.status,
      data: error.response.data,
    });
  } else if (error.request) {
    // Request gửi đi nhưng không nhận được phản hồi
    console.error(`❌ [${method}] Không nhận được phản hồi (mất mạng/timeout)`);
  } else {
    // Lỗi khi thiết lập request
    console.error(`❌ [${method}] Lỗi cấu hình request:`, error.message);
  }
}

// ------------------------------------------------------------
// DEMO: chạy thử tuần tự toàn bộ vòng đời CRUD trên 1 tài nguyên
// ------------------------------------------------------------
export const demoFullCycle = async () => {
  console.log("========== 1. GET (Read) ==========");
  await getResource(1);

  console.log("========== 2. POST (Create) ==========");
  const created = await createResource({
    title: "Bài viết mới",
    body: "Nội dung demo",
    userId: 1,
  });

  console.log("========== 3. PUT (Full Update) ==========");
  await replaceResource(1, {
    id: 1,
    title: "Tiêu đề đã thay thế toàn bộ",
    body: "Nội dung đã thay thế toàn bộ",
    userId: 1,
  });

  console.log("========== 4. PATCH (Partial Update) ==========");
  await updateResourcePartial(1, { title: "Chỉ đổi tiêu đề" });

  console.log("========== 5. DELETE ==========");
  await deleteResource(1);

  console.log("========== Hoàn tất demo CRUD ==========");
};
