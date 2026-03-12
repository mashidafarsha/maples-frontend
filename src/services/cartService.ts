import api from "@/utils/api";

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await api.post("/cart/add", { productId, quantity });
  return response.data;
};


export const updateCartQuantity = async (productId: string, action: 'increment' | 'decrement') => {
  const response = await api.patch("/cart/update-quantity", { productId, action });
  return response.data;
};


export const removeFromCart = async (productId: string) => {
  const response = await api.delete(`/cart/remove/${productId}`);
  return response.data;
};