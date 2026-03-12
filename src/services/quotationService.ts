import api from "@/utils/api";


export const requestQuotation = async (data: { customer: any; items: any[] }) => {
  const response = await api.post("/quotations/generate", data);
  return response.data;
};


export const downloadPDF = async (quoteId: string, quoteNumber: string) => {
  try {
    const response = await api.get(`/quotations/download/${quoteId}`, {
      responseType: "blob", 
    });
    
   
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Maples-Quote-${quoteNumber}.pdf`);
    
    document.body.appendChild(link);
    link.click();
    
   
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
  }
};



export const getAllQuotations = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/quotations/all", {
    params: { page, limit, search }
  });
  return response.data; 
};