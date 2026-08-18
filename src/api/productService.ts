import axiosClient, { type ApiResponse } from "./axiosClient";

export type ProductCategory = "Phone" | "Laptop" | "Tablet";

export interface Product {
  id: number;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stock: number;
}

// Dữ liệu gửi lên khi tạo/sửa sản phẩm (chưa có id)
export type ProductPayload = Omit<Product, "id">;

export interface ProductQueryParams {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

const productService = {
  // GET /api/products?search=...&page=1&pageSize=10
  getAll: async (
    params: ProductQueryParams = {},
  ): Promise<ApiResponse<Product[]>> => {
    const products = (await axiosClient.get("/products")) as unknown as Product[];
    const search = params.search?.trim().toLocaleLowerCase("vi-VN") || "";
    const filteredProducts = search
      ? products.filter((product) =>
          [product.name, product.description, product.category].some((value) =>
            value?.toLocaleLowerCase("vi-VN").includes(search),
          ),
        )
      : products;
    const page = params.page || 1;
    const pageSize = params.pageSize || filteredProducts.length;
    const start = (page - 1) * pageSize;

    return {
      success: true,
      data: filteredProducts.slice(start, start + pageSize),
      total: filteredProducts.length,
      page,
      pageSize,
    };
  },

  // GET /api/products/5
  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const product = (await axiosClient.get(
      `/products/${id}`,
    )) as unknown as Product;
    return { success: true, data: product };
  },

  // POST /api/products
  create: async (data: ProductPayload): Promise<ApiResponse<Product>> => {
    const product = (await axiosClient.post(
      "/products",
      data,
    )) as unknown as Product;
    return { success: true, data: product };
  },

  // PUT /api/products/5
  update: async (
    id: number,
    data: ProductPayload,
  ): Promise<ApiResponse<Product>> => {
    const product = (await axiosClient.put(
      `/products/${id}`,
      data,
    )) as unknown as Product;
    return { success: true, data: product };
  },

  // DELETE /api/products/5
  remove: async (id: number): Promise<ApiResponse<null>> => {
    await axiosClient.delete(`/products/${id}`);
    return { success: true, data: null };
  },
};

export default productService;
