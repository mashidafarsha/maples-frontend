import api from "@/utils/api";

export const placeOrder = async (shippingData: any) => {
  const response = await api.post("/orders/place", { shippingAddress: shippingData });
  return response.data;
};



export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};