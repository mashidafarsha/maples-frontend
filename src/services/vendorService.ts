import api from "@/utils/api";


export const getAllVendors = async (page = 1, limit = 10, search = "") => {
  const response = await api.get(`/admin/vendors`, {
    params: {
      page,
      limit,
      search
    }
  });
 
  return response.data; 
};

export const toggleVendorApproval = async (id: string, isApproved: boolean) => {
  const response = await api.patch(`/admin/vendors/${id}/approve`, { isApproved });
  return response.data;
};