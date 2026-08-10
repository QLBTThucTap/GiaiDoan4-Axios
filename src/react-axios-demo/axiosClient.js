/**
 * ============================================================
 *  axiosClient.js
 * ------------------------------------------------------------
 *  File này giải thích cách Axios hoạt động bên trong,
 *  và cách tạo ra một "instance" (thực thể) Axios dùng chung
 *  cho toàn bộ ứng dụng React.
 * ============================================================
 */

import axios from "axios";

/**
 * 1) axios.create(config)
 * ------------------------------------------------------------
 * - Axios là một thư viện HTTP Client, bản chất nó bọc (wrap)
 *   quanh XMLHttpRequest (trên trình duyệt) hoặc module `http`
 *   (trên Node.js) để gửi các request HTTP (GET, POST, PUT,
 *   DELETE, PATCH...) và trả về kết quả dưới dạng Promise.
 *
 * - Khi gọi axios.create(), Axios sẽ tạo ra một "instance" mới,
 *   độc lập với instance mặc định (axios global). Instance này
 *   có config riêng (baseURL, headers, timeout...) mà không làm
 *   ảnh hưởng tới các phần khác của ứng dụng dùng axios trực tiếp.
 *
 * - Lợi ích: nếu bạn có nhiều API (VD: API chính + API thanh toán),
 *   bạn có thể tạo nhiều instance khác nhau, mỗi instance có
 *   baseURL và cấu hình riêng.
 */
const axiosClient = axios.create({
  // baseURL: mọi request gọi qua axiosClient sẽ tự động được
  // nối thêm baseURL này ở phía trước.
  // VD: axiosClient.get('/users') => thực chất gọi tới
  // https://jsonplaceholder.typicode.com/users
  baseURL: "https://jsonplaceholder.typicode.com",

  // timeout: nếu request không nhận được phản hồi trong 10s,
  // Axios sẽ tự động hủy và ném ra lỗi (Error: timeout of 10000ms exceeded)
  timeout: 10000,

  // headers mặc định gửi kèm mọi request
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * 2) Interceptors (Bộ đánh chặn request/response)
 * ------------------------------------------------------------
 * Đây là điểm mạnh nhất của Axios so với fetch() thuần.
 * Interceptor cho phép bạn "chen vào giữa" quá trình gửi/nhận
 * để xử lý logic chung (auth token, logging, xử lý lỗi tập trung...)
 * mà không cần lặp lại code ở từng nơi gọi API.
 *
 * Có 2 loại interceptor:
 *   - request interceptor: chạy TRƯỚC khi request được gửi đi
 *   - response interceptor: chạy SAU khi nhận được response
 *     (hoặc khi có lỗi xảy ra)
 */

// ---- REQUEST INTERCEPTOR ----
axiosClient.interceptors.request.use(
  (config) => {
    // Hàm này chạy trước mỗi request.
    // Thường dùng để gắn token xác thực (Authorization header)
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Bắt buộc phải return config, nếu không request sẽ bị "treo"
    return config;
  },
  (error) => {
    // Nếu có lỗi xảy ra TRƯỚC khi request được gửi
    // (VD: lỗi cấu hình), nó sẽ rơi vào đây.
    return Promise.reject(error);
  },
);

// ---- RESPONSE INTERCEPTOR ----
axiosClient.interceptors.response.use(
  (response) => {
    // Axios mặc định trả về toàn bộ object response gồm:
    // { data, status, statusText, headers, config, request }
    // Ở đây ta chỉ lấy phần "data" ra để nơi gọi API
    // không cần viết response.data lặp đi lặp lại.
    return response.data;
  },
  (error) => {
    // Mọi lỗi HTTP (4xx, 5xx) hoặc lỗi mạng (network error),
    // hoặc lỗi timeout đều rơi vào đây.
    if (error.response) {
      // Server có phản hồi nhưng status code lỗi (4xx, 5xx)
      console.error(
        "Lỗi từ server:",
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      // Request đã được gửi đi nhưng không nhận được phản hồi
      // (VD: mất mạng, server sập, CORS chặn...)
      console.error("Không nhận được phản hồi từ server:", error.request);
    } else {
      // Lỗi xảy ra khi đang thiết lập request (VD: sai config)
      console.error("Lỗi khi thiết lập request:", error.message);
    }

    // Ném lỗi tiếp để nơi gọi (component) có thể bắt bằng try/catch
    return Promise.reject(error);
  },
);

/**
 * 3) Vì sao dùng Axios thay vì fetch()?
 * ------------------------------------------------------------
 * - Axios tự động chuyển đổi dữ liệu JSON (không cần JSON.parse/stringify)
 * - Hỗ trợ interceptor (fetch không có sẵn)
 * - Tự động ném lỗi (reject Promise) khi status code là 4xx/5xx
 *   (fetch KHÔNG tự làm điều này, phải tự kiểm tra response.ok)
 * - Hỗ trợ hủy request (Cancel Token / AbortController)
 * - Hỗ trợ timeout có sẵn
 * - Hoạt động đồng nhất trên cả trình duyệt và Node.js
 */

export default axiosClient;
