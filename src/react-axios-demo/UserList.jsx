/**
 * ============================================================
 *  UserList.jsx
 * ------------------------------------------------------------
 *  Component minh họa cách React kết hợp với Axios để:
 *   1. Gọi API lấy danh sách user (GET)
 *   2. Gửi dữ liệu tạo user mới (POST)
 *   3. Quản lý trạng thái loading / error
 *   4. Hủy request khi component unmount (tránh memory leak)
 * ============================================================
 */

import { useState, useEffect } from "react";
import axiosClient from "./axiosClient";

function UserList() {
  // state lưu danh sách user lấy từ API
  const [users, setUsers] = useState([]);
  // state cho biết đang gọi API hay không (hiển thị spinner/loading)
  const [loading, setLoading] = useState(true);
  // state lưu lỗi nếu có
  const [error, setError] = useState(null);
  // state cho form tạo user mới
  const [newUserName, setNewUserName] = useState("");

  /**
   * useEffect này chạy 1 lần khi component được mount (nhờ mảng
   * dependency rỗng []). Đây là nơi thích hợp để gọi API lấy dữ liệu
   * ban đầu, tương tự componentDidMount trong class component.
   */
  useEffect(() => {
    /**
     * AbortController là API chuẩn của trình duyệt để hủy các
     * tác vụ bất đồng bộ (fetch/axios). Axios hỗ trợ AbortController
     * thông qua thuộc tính `signal` trong config.
     *
     * Vì sao cần hủy request?
     * Nếu người dùng rời khỏi trang (component unmount) trước khi
     * API trả lời xong, mà ta vẫn cố gọi setUsers(...) sau đó,
     * React sẽ cảnh báo lỗi "memory leak" vì cập nhật state trên
     * một component đã bị hủy.
     */
    const controller = new AbortController();

    async function fetchUsers() {
      try {
        setLoading(true);

        /**
         * axiosClient.get(url, config)
         * ------------------------------------------------------
         * - Axios trả về một Promise.
         * - Nhờ response interceptor đã cấu hình ở axiosClient.js
         *   (return response.data), biến `data` ở đây CHÍNH LÀ
         *   mảng user, không cần viết response.data.data.
         * - Tham số thứ 2 (config) cho phép truyền `signal` để
         *   liên kết request này với AbortController ở trên.
         */
        const data = await axiosClient.get("/users", {
          signal: controller.signal,
        });

        setUsers(data);
        setError(null);
      } catch (err) {
        // Nếu lỗi là do request bị hủy (unmount), Axios/browser sẽ
        // ném lỗi có tên "CanceledError" hoặc "AbortError".
        // Ta bỏ qua lỗi này vì đó là hành vi chủ động, không phải
        // lỗi thật sự cần hiển thị cho người dùng.
        if (err.name === "CanceledError" || err.name === "AbortError") {
          return;
        }
        setError("Không thể tải danh sách người dùng.");
      } finally {
        // finally luôn chạy dù thành công hay thất bại (trừ khi bị abort
        // trước khi setLoading kịp chạy, nhưng ở đây ta chấp nhận điều đó)
        setLoading(false);
      }
    }

    fetchUsers();

    /**
     * Hàm cleanup của useEffect: React sẽ tự động gọi hàm này
     * khi component unmount, hoặc trước khi effect chạy lại lần sau.
     * Ở đây ta gọi controller.abort() để hủy request đang treo (nếu có).
     */
    return () => {
      controller.abort();
    };
  }, []); // mảng dependency rỗng => chỉ chạy 1 lần khi mount

  /**
   * Hàm xử lý khi người dùng submit form tạo user mới.
   * Minh họa cách gửi request POST với Axios.
   */
  async function handleCreateUser(e) {
    e.preventDefault();
    if (!newUserName.trim()) return;

    try {
      /**
       * axiosClient.post(url, body, config)
       * ------------------------------------------------------
       * - Tham số thứ 2 là "body" (payload) sẽ được Axios TỰ ĐỘNG
       *   chuyển thành chuỗi JSON (nhờ header Content-Type: application/json
       *   đã đặt sẵn trong axiosClient.js). Với fetch(), bạn phải tự
       *   gọi JSON.stringify(body) thủ công.
       */
      const createdUser = await axiosClient.post("/users", {
        name: newUserName,
      });

      // Cập nhật lại danh sách hiển thị (thêm user vừa tạo vào đầu danh sách)
      setUsers((prevUsers) => [createdUser, ...prevUsers]);
      setNewUserName("");
    } catch (err) {
      setError("Không thể tạo người dùng mới.");
    }
  }

  if (loading) return <p>Đang tải danh sách người dùng...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Danh sách người dùng</h2>

      <form onSubmit={handleCreateUser} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
          placeholder="Tên người dùng mới"
        />
        <button type="submit">Thêm</button>
      </form>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
