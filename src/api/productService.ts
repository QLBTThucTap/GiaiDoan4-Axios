import database from "../../db.json";
import type { ApiResponse } from "./axiosClient";

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

const STORAGE_KEY = "product-management-products";
const initialProducts = database.products as Product[];

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadProducts(): Product[] {
  const storedProducts = localStorage.getItem(STORAGE_KEY);

  if (storedProducts) {
    try {
      return JSON.parse(storedProducts) as Product[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const products = initialProducts.map((product) => ({ ...product }));
  saveProducts(products);
  return products;
}

const productService = {
  // db.json cung cấp dữ liệu ban đầu; localStorage lưu thay đổi trên trình duyệt.
  getAll: async (
    params: ProductQueryParams = {},
  ): Promise<ApiResponse<Product[]>> => {
    const products = loadProducts();
    const search = params.search?.trim().toLocaleLowerCase("vi-VN") || "";
    const filteredProducts = products.filter((product) => {
      const matchesSearch =
        !search ||
        [product.name, product.description, product.category].some((value) =>
          value?.toLocaleLowerCase("vi-VN").includes(search),
        );
      const matchesCategory =
        !params.category || product.category === params.category;

      return matchesSearch && matchesCategory;
    });
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

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const product = loadProducts().find((item) => item.id === id);

    if (!product) {
      throw { status: 404, message: "Không tìm thấy sản phẩm." };
    }

    return { success: true, data: product };
  },

  create: async (data: ProductPayload): Promise<ApiResponse<Product>> => {
    const products = loadProducts();
    const product: Product = {
      ...data,
      id: products.reduce((largestId, item) => Math.max(largestId, item.id), 0) + 1,
    };

    saveProducts([...products, product]);
    return { success: true, data: product };
  },

  update: async (
    id: number,
    data: ProductPayload,
  ): Promise<ApiResponse<Product>> => {
    const products = loadProducts();
    const productIndex = products.findIndex((item) => item.id === id);

    if (productIndex === -1) {
      throw { status: 404, message: "Không tìm thấy sản phẩm." };
    }

    const product: Product = { id, ...data };
    products[productIndex] = product;
    saveProducts(products);
    return { success: true, data: product };
  },

  remove: async (id: number): Promise<ApiResponse<null>> => {
    const products = loadProducts();
    const remainingProducts = products.filter((product) => product.id !== id);

    if (remainingProducts.length === products.length) {
      throw { status: 404, message: "Không tìm thấy sản phẩm." };
    }

    saveProducts(remainingProducts);
    return { success: true, data: null };
  },
};

export default productService;
