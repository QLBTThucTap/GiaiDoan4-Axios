# 🚀 React + Axios Master Guide & Demo Project

Link demo dự án: https://qlbtthuctap.github.io/GiaiDoan4-Axios/#/login

Dự án mẫu tổng hợp kiến thức và thực hành về **Axios**, **RESTful API Architecture**, **Interceptors**, **Authentication**, **Protected Route**, **Zustand Persist**, và cách tích hợp vào **React**.

---

## 📚 MỤC LỤC

1. [Vì sao sử dụng Axios thay vì Fetch API?](#1-vì-sao-sử-dụng-axios-thay-vì-fetch-api)
2. [Cấu trúc Thư mục Dự án](#2-cấu-trúc-thư-mục-dự-án)
3. [Axios Instance (`axios.create`)](#3-axios-instance-axioscreate)
4. [Interceptors (Bộ chặn Request & Response)](#4-interceptors-bộ-chặn-request--response)
5. [Lưu ý quan trọng: Bẫy `undefined` khi dùng Response Interceptor](#5-lưu-ý-quan-trọng-bẫy-undefined-khi-dùng-response-interceptor)
6. [Chuẩn RESTful API & Các HTTP Methods (CRUD)](#6-chuẩn-restful-api--các-http-methods-crud)
7. [Xử lý Lỗi chuẩn trong Axios](#7-xử-lý-lỗi-chuẩn-trong-axios)
8. [Tích hợp Axios vào React Component (`App.jsx`)](#8-tích-hợp-axios-vào-react-component-appjsx)
9. [Lưu trạng thái đăng nhập với Zustand Persist](#9-lưu-trạng-thái-đăng-nhập-với-zustand-persist)

---

## 1. Vì sao sử dụng Axios thay vì Fetch API?

| Tính năng                   | Axios                                      | Fetch API (Native JS)                               |
| :-------------------------- | :----------------------------------------- | :-------------------------------------------------- |
| **Chuyển đổi dữ liệu JSON** | Tự động parse JSON (`response.data`)       | Phải gọi thủ công `await response.json()`           |
| **Bắt lỗi HTTP (4xx, 5xx)** | Tự động reject Promise ➔ Nhảy vào `catch`  | KHÔNG tự reject ➔ Phải tự check `if (!response.ok)` |
| **Interceptors**            | Hỗ trợ can thiệp Request/Response toàn cục | Không có sẵn, phải tự viết wrapper                  |
| **Timeout (Thời gian chờ)** | Hỗ trợ cấu hình `timeout: 10000` đơn giản  | Phải kết hợp với `AbortController` phức tạp         |
| **Cấu hình dùng chung**     | Dễ dàng tạo nhiều Instance độc lập         | Phải truyền option lặp đi lặp lại                   |

---

## 2. Cấu trúc Thư mục Dự án

```text
src/
├── api/
│   ├── authService.ts       # Xử lý yêu cầu đăng nhập
│   └── axiosClient.ts       # Axios instance và tự động gắn token
├── components/
│   └── ProtectedRoute.jsx   # Chặn route khi chưa đăng nhập
├── pages/
│   ├── LoginPage.jsx        # Trang đăng nhập
│   └── ProductsPage.jsx     # Trang quản lý sản phẩm
├── stores/
│   └── authStore.ts         # Zustand store lưu token và user
├── HTTP/
│   ├── Instance.jsx     # Cấu hình Axios Instance + Interceptors (Request & Response)
│   ├── http.jsx         # Các hàm gọi API cụ thể cho dữ liệu Post
│   └── httpMethods.jsx  # Code mẫu chuẩn RESTful API & 5 phương thức HTTP (CRUD)
├── App.jsx                  # Khai báo các route của ứng dụng
└── main.tsx                 # Entry point và HashRouter
```

---

## 3. Axios Instance (`axios.create`)

Thay vì dùng `axios.get()` hoặc `axios.post()` trực tiếp với URL dài lặp đi lặp lại, ta tạo một **Instance** độc lập với cấu hình mặc định:

```javascript
import axios from "axios";

export const Instance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com/posts/",
  timeout: 10000, // Quá 10s không phản hồi sẽ hủy request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

---

## 4. Interceptors (Bộ chặn Request & Response)

Interceptors là các **trạm kiểm soát tự động** can thiệp vào quá trình gửi và nhận request.

### 📤 Request Interceptor: Chạy TRƯỚC khi request rời khỏi trình duyệt

Dùng để gắn token xác thực (JWT), log thông tin request,...

```javascript
Instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Bắt buộc phải return config
  },
  (error) => Promise.reject(error),
);
```

### 📥 Response Interceptor: Chạy NGAY KHI nhận được phản hồi từ Server

Dùng để bóc tách dữ liệu gốc, bắt lỗi tập trung (vd: tự động logout khi bị 401).

```javascript
Instance.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp response.data để nơi gọi không phải viết response.data lặp lại
    return response.data;
  },
  (error) => {
    // Tập trung xử lý lỗi Server (4xx, 5xx), Mạng, Timeout
    return Promise.reject(error);
  },
);
```

---

## 5. Lưu ý quan trọng: Bẫy `undefined` khi dùng Response Interceptor

> [!CAUTION]
> **Lỗi thường gặp:** Khi Response Interceptor đã `return response.data;`, kết quả trả về từ `await Instance.get(...)` **chính là Object dữ liệu JSON**, chứ **KHÔNG CÒN** là Object Response của Axios.

### ❌ Cách viết bị LỖI (`undefined`):

```javascript
// Do Interceptor đã trả về data bài viết { id: 1, title: '...' }
const response = await Instance.get("/1");

console.log(response.status); // ❌ undefined (vì Bài viết không có trường status)
console.log(response.data); // ❌ undefined (vì Bài viết không có trường data)
console.log(response.headers); // ❌ undefined (vì Bài viết không có trường headers)
```

### ✅ Cách viết ĐÚNG:

```javascript
// Đặt tên biến là data cho đúng bản chất
const data = await Instance.get("/1");

console.log("Dữ liệu nhận được:", data); // ✅ Object bài viết { id, title, body }
return data;
```

---

## 6. Chuẩn RESTful API & Các HTTP Methods (CRUD)

| Method     |  Safe?   | Idempotent? |    Has Body?     |     Status Code kỳ vọng     | Mục đích sử dụng                     |
| :--------- | :------: | :---------: | :--------------: | :-------------------------: | :----------------------------------- |
| **GET**    |  ✅ Có   |    ✅ Có    |     ❌ Không     |          `200 OK`           | Đọc / Lấy dữ liệu                    |
| **POST**   | ❌ Không |  ❌ Không   |      ✅ Có       |        `201 Created`        | Tạo mới tài nguyên                   |
| **PUT**    | ❌ Không |    ✅ Có    | ✅ Có (Toàn bộ)  |          `200 OK`           | Ghi đè / Thay thế TOÀN BỘ tài nguyên |
| **PATCH**  | ❌ Không | ❌ Không\*  | ✅ Có (Một phần) |          `200 OK`           | Cập nhật MỘT PHẦN tài nguyên         |
| **DELETE** | ❌ Không |    ✅ Có    |     ❌ Không     | `200 OK` / `204 No Content` | Xóa tài nguyên                       |

- **Safe**: Không làm thay đổi trạng thái dữ liệu trên Server.
- **Idempotent**: Gọi 1 lần hay gọi N lần liên tiếp với cùng dữ liệu thì trạng thái cuối cùng trên Server là như nhau.

---

## 7. Xử lý Lỗi chuẩn trong Axios

Axios chia các trường hợp lỗi thành 3 cấp độ rõ ràng trong khối `catch`:

```javascript
try {
  const data = await Instance.get("/1");
  return data;
} catch (error) {
  if (error.response) {
    // 1. Server phản hồi nhưng trả về mã lỗi 4xx, 5xx (vd: 404, 401, 500)
    console.error(
      "🔴 Server Error:",
      error.response.status,
      error.response.data,
    );
  } else if (error.request) {
    // 2. Request đã gửi nhưng KHÔNG nhận được phản hồi (Mất mạng, Timeout, CORS)
    console.error("🟡 Network Error / Timeout:", error.request);
  } else {
    // 3. Lỗi xảy ra khi thiết lập Request
    console.error("🔵 Request Config Error:", error.message);
  }
  return null;
}
```

---

## 8. Tích hợp Axios vào React Component (`App.jsx`)

Khi gọi API trong React Component, luôn quản lý 3 trạng thái: **Dữ liệu (`data`)**, **Đang tải (`loading`)**, và **Lỗi (`error`)**.

```jsx
import React, { useEffect, useState } from "react";
import { getPost } from "./HTTP/http";

const App = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPost()
      .then((data) => {
        if (data) setPost(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div>
      {post ? (
        <>
          <h3>Tiêu đề: {post.title}</h3>
          <p>Nội dung: {post.body}</p>
        </>
      ) : (
        <p>Không thể tải dữ liệu bài viết.</p>
      )}
    </div>
  );
};

export default App;
```

---

## 9. Lưu trạng thái đăng nhập với Zustand Persist

### Vì sao cần `persist`?

State React thông thường sẽ mất khi người dùng tải lại trang. Middleware `persist` của Zustand đồng bộ một phần state vào `localStorage` hoặc `sessionStorage`, sau đó tự động khôi phục state khi ứng dụng khởi động lại.

Trong dự án này, `persist` được dùng để lưu:

- `token`: xác định người dùng đã đăng nhập.
- `user`: thông tin người dùng đang đăng nhập.

Các action như `setAuth` và `logout` không được lưu vì chúng được tạo lại khi store khởi động.

### Cài đặt

```bash
npm install zustand
```

### Tạo Authentication Store

File `src/stores/authStore.ts`:

```ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "../api/authService";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
```

Ý nghĩa các tùy chọn:

| Tùy chọn     | Ý nghĩa                                                               |
| :----------- | :-------------------------------------------------------------------- |
| `name`       | Tên khóa được tạo trong Web Storage. Dự án sử dụng `auth-storage`.    |
| `storage`    | Chọn nơi lưu state. Có thể đổi `localStorage` thành `sessionStorage`. |
| `partialize` | Chỉ định những trường được lưu, tránh lưu action hoặc state tạm thời. |

### Lưu phiên sau khi đăng nhập

Sau khi API trả về token và user, gọi action `setAuth`:

```jsx
const setAuth = useAuthStore((state) => state.setAuth);

const response = await authService.login(username, password);
setAuth(response.data.token, response.data.user);
navigate("/products", { replace: true });
```

Zustand sẽ tạo dữ liệu tương tự sau trong `localStorage`:

```json
{
  "state": {
    "token": "demo-admin-token",
    "user": {
      "id": 1,
      "name": "Lã Ngọc Huyền",
      "username": "admin"
    }
  },
  "version": 0
}
```

### Bảo vệ route bằng `ProtectedRoute`

File `src/components/ProtectedRoute.jsx` đọc token trực tiếp từ store. Nếu không có token, người dùng được chuyển về trang đăng nhập:

```jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
```

Áp dụng component vào route cần đăng nhập:

```jsx
<Route
  path="/products"
  element={
    <ProtectedRoute>
      <ProductsPage />
    </ProtectedRoute>
  }
/>
```

### Gắn token vào Axios request

Zustand cho phép đọc store bên ngoài React component bằng `getState()`:

```ts
axiosClient.interceptors.request.use((request) => {
  const token = useAuthStore.getState().token;

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});
```

Khi server trả về `401 Unauthorized`, có thể xóa phiên đăng nhập tập trung:

```ts
if (error.response?.status === 401) {
  useAuthStore.getState().logout();
}
```

### LocalStorage và SessionStorage

| Loại lưu trữ     | Khi nào dữ liệu bị xóa?                                                  | Trường hợp phù hợp             |
| :--------------- | :----------------------------------------------------------------------- | :----------------------------- |
| `localStorage`   | Tồn tại sau khi đóng và mở lại trình duyệt, cho đến khi bị xóa thủ công. | Chức năng “Ghi nhớ đăng nhập”. |
| `sessionStorage` | Bị xóa khi đóng tab hoặc kết thúc phiên trình duyệt.                     | Phiên đăng nhập tạm thời.      |

Muốn chuyển sang `sessionStorage`, chỉ cần sửa:

```ts
storage: createJSONStorage(() => sessionStorage),
```

> [!WARNING]
> `ProtectedRoute` chỉ bảo vệ việc điều hướng ở frontend, không thay thế kiểm tra quyền trên backend. Dữ liệu trong Web Storage có thể bị người dùng sửa và có thể bị đọc nếu ứng dụng tồn tại lỗ hổng XSS. Dự án hiện sử dụng token demo; ứng dụng thực tế cần backend phát hành, xác minh và kiểm soát thời hạn JWT.

Tài liệu tham khảo: [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/reference/middlewares/persist).

---
