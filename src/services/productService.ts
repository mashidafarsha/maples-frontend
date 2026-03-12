import api from "@/utils/api";

export const getProducts = async (
  page = 1,
  search = "",
  category = "",
  limit = 10
) => {
  const response = await api.get("/products", {
    params: { page, search, category, limit },
  });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getSellerProducts = async (
  page = 1,
  search = "",
  category = ""
) => {
  const response = await api.get("/products/seller/my-products", {
    params: { page, search, category },
  });
  return response.data;
};

export const createProduct = async (formData: FormData) => {
  const response = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProduct = async (id: string, formData: FormData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (query: string, limit: number = 5) => {
  const response = await api.get(`/products?search=${query}&limit=${limit}`);
  return response.data;
};
