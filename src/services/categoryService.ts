import api from "@/utils/api";

export const getCategories = async (page = 1, search = "", limit = 10) => {
  const response = await api.get(`/categories`, {
    params: { page, search, limit },
  });

  return response.data;
};

export const createCategory = async (categoryData: {
  name: string;
  description?: string;
}) => {
  const response = await api.post("/categories", categoryData);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};
