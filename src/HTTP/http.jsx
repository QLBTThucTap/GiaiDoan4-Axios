import axios from "axios";
import React from "react";
import { Instance } from "./Instance";

// Hàm gọi API lấy posts số 1
export const getPost = async (id = 1) => {
  try {
    // const response = await axios.get(
    //   "https://jsonplaceholder.typicode.com/posts/1",
    // );
    const response = await Instance.get(`${id}`);

    //log để test request
    console.log("REQUEST: ", {
      method: "GET",
      url: `${Instance.defaults.baseURL}${id}`,
      headers: Instance.defaults.headers,
    });

    //log để test response
    console.log("RESPONSE: ", response);

    return response.data; // Trả về dữ liệu bài viết
  } catch (error) {
    console.log("Error! ", error.message);
    if (error.response) {
      console.log("🔴 Server Error:", response);
    } else if (error.request) {
      console.log("No response: ", error.request);
    } else {
      console.log("Request Error: ", error.message);
    }
    return null;
  }
};
// === THÊM CÁC HÀM TEST MỚI ===

// 1. Test GET với tham số query
export const getPostWithQuery = async (id = 1) => {
  try {
    const response = await Instance.get(`?id=${id}`);
    console.log("📤 GET with query:", `?id=${id}`);
    console.log("📥 Response data:", response);
    return response;
  } catch (error) {
    console.log("❌ Error:", error.message);
    return null;
  }
};

// 2. Test POST (tạo mới bài viết)
export const createPost = async (postData) => {
  try {
    const response = await Instance.post("", postData);
    console.log("📤 POST REQUEST:", {
      url: Instance.defaults.baseURL,
      data: postData,
    });
    console.log("📥 POST RESPONSE:", response);
    return response;
  } catch (error) {
    console.log("❌ POST Error:", error.message);
    return null;
  }
};

// 3. Test PUT (cập nhật toàn bộ)
export const updatePost = async (id, postData) => {
  try {
    const response = await Instance.put(`/${id}`, postData);
    console.log("📤 PUT REQUEST:", {
      url: `/${id}`,
      data: postData,
    });
    console.log("📥 PUT RESPONSE:", response);
    return response;
  } catch (error) {
    console.log("❌ PUT Error:", error.message);
    return null;
  }
};

// 4. Test PATCH (cập nhật một phần)
export const patchPost = async (id, postData) => {
  try {
    const response = await Instance.patch(`/${id}`, postData);
    console.log("📤 PATCH REQUEST:", {
      url: `/${id}`,
      data: postData,
    });
    console.log("📥 PATCH RESPONSE:", response);
    return response;
  } catch (error) {
    console.log("❌ PATCH Error:", error.message);
    return null;
  }
};

// 5. Test DELETE
export const deletePost = async (id) => {
  try {
    const response = await Instance.delete(`/${id}`);
    console.log("📤 DELETE REQUEST:", `/${id}`);
    console.log("📥 DELETE RESPONSE:", response);
    return response;
  } catch (error) {
    console.log("❌ DELETE Error:", error.message);
    return null;
  }
};

// 6. Test lỗi 404
export const getNonExistentPost = async () => {
  try {
    const response = await Instance.get("/9999");
    return response;
  } catch (error) {
    console.log("❌ 404 Error Test:");
    if (error.response) {
      console.log("Status:", response); // 404
    }
    return null;
  }
};

// 7. Test timeout
export const testTimeout = async () => {
  try {
    // Tạo instance mới với timeout ngắn để test
    const testInstance = axios.create({
      baseURL: "https://jsonplaceholder.typicode.com/posts",
      timeout: 1, // 1ms - sẽ timeout ngay lập tức
    });
    const response = await testInstance.get("/1");
    return response;
  } catch (error) {
    console.log("⏱️ TIMEOUT TEST:", error.message);
    return null;
  }
};

//Hàm gọi FETCH API
// export const getFetch = async () => {
//   try {
//     const respone = await fetch("https://jsonplaceholder.typicode.com/posts/1");
//     const data = await respone.json();    // fetch phải thêm 1 bước để parse dữ liệu vào json
//     return data;
//   } catch (error) {
//     console.log("Fetch Error! ", error.message);
//     return null;
//   }
// };

/**
 * Vì sao dùng Axios thay vì fetch()?
 * ------------------------------------------------------------
 * - Axios tự động chuyển đổi dữ liệu JSON (không cần JSON.parse/stringify)
 * - Hỗ trợ interceptor (fetch không có sẵn)
 * - Tự động ném lỗi (reject Promise) khi status code là 4xx/5xx
 *   (fetch KHÔNG tự làm điều này, phải tự kiểm tra response.ok)
 * - Hỗ trợ hủy request (Cancel Token / AbortController)
 * - Hỗ trợ timeout có sẵn
 * - Hoạt động đồng nhất trên cả trình duyệt và Node.js
 */
