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
