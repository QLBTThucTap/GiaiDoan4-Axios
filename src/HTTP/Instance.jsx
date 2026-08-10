import axios from "axios";
import React from "react";

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

export const Instance = axios.create({
  // baseURL: mọi request gọi qua Instance sẽ tự động được
  // nối thêm baseURL này ở phía trước.
  // VD: Instance.get('/1') => thực chất gọi tới
  // https://jsonplaceholder.typicode.com/posts/1

  baseURL: "https://jsonplaceholder.typicode.com/posts/",

  // timeout: nếu request không nhận được phản hồi trong 1s,
  // Axios sẽ tự động hủy và ném ra lỗi (Error: timeout of 1000ms exceeded)
  timeout: 10000,

  // headers mặc định gửi kèm mọi request
  headers: {
    "Content-Type": "application/json", // Dữ liệu gửi đi dạng JSON
    Authorization: "Bearer your_token_here", // Xác thực token
    Accept: "application/json", // Client muốn nhận JSON
    "X-Custom-Header": "some-value", // Header tùy chỉnh
  },
});

// ---- REQUEST INTERCEPTOR ----
Instance.interceptors.request.use(
  (request) => {
    //Hàm này chạy trước mỗi request
    //Thường dùng để gắn token xác thực (Authorization header)
    const token = localStorage.getItem("access_token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    //Bắt buộc phải return request, nếu không request sẽ bị treo
    return request;
  },
  (error) => {
    // Nếu có lỗi xảy ra Trước khi request được gửi
    //(VD: lỗi cấu hình), nó sẽ rơi vào đây
    return Promise.reject(error);
  },
);

// ---- RESPONSE INTERCEPTOR ----
Instance.interceptors.response.use(
  (response) => {
    // Axios mặc định trả về toàn bộ object response gồm:
    // { data, status, statusText, headers, config, request }
    // Ở đây ta chỉ lấy phần "data" ra để nơi gọi API
    // không cần viết response.data lặp đi lặp lại.
    return response;
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
