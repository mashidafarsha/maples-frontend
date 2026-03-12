"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from 'swr';
import api from "@/utils/api";
import { 
  FileText, Download, Loader2, Calendar, 
  User, Building2, Search, ChevronLeft, ChevronRight 
} from "lucide-react";


function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function QuotationList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const limit = 10;

  
  const { data, isLoading, isValidating } = useSWR(
    `/quotations/all?page=${page}&limit=${limit}&search=${debouncedSearch}`, 
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  const quotes = data?.quotes || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  const handleDownload = async (id: string, num: string) => {
   
    const { downloadPDF } = await import("@/services/quotationService");
    await downloadPDF(id, num);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="relative w-full md:w-[450px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by Reference, Customer or Hotel..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            className="w-full pl-12 pr-12 py-4 bg-white border border-zinc-100 rounded-[1.2rem] text-sm outline-none shadow-sm focus:ring-4 ring-black/5 transition-all font-medium"
          />
          {isValidating && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-zinc-200" size={16} />}
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full">
          Total {totalItems} Records
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-xl shadow-zinc-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-50 text-[10px] uppercase tracking-[0.15em] text-zinc-400 font-black">
                <th className="p-6">Reference</th>
                <th className="p-6">Partner Details</th>
                <th className="p-6">Handled By</th>
                <th className="p-6">Generated On</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                // 🦴 Professional Skeleton Loaders
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-5 bg-zinc-100 rounded w-24" /></td>
                    <td className="p-6"><div className="h-5 bg-zinc-100 rounded w-40" /></td>
                    <td className="p-6"><div className="h-5 bg-zinc-100 rounded w-32" /></td>
                    <td className="p-6"><div className="h-5 bg-zinc-100 rounded w-20" /></td>
                    <td className="p-6 text-right"><div className="h-8 bg-zinc-100 rounded-lg w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                quotes.map((quote: any) => (
                  <tr key={quote._id} className="hover:bg-zinc-50/40 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-zinc-50 p-2.5 rounded-xl group-hover:bg-black group-hover:text-white transition-all duration-500">
                          <FileText size={18} />
                        </div>
                        <span className="font-mono text-sm font-black tracking-tighter italic">
                          {quote.quotationNumber}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-zinc-900 uppercase italic leading-none">{quote.customer.name}</span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 uppercase font-bold mt-1.5 tracking-tight">
                          <Building2 size={10} /> {quote.customer.hotelName || "Individual Partner"}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 shadow-inner">
                          <User size={14} className="text-zinc-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-zinc-800 uppercase tracking-tight">{quote.createdBy?.name || "System"}</span>
                          <span className="text-[9px] text-zinc-400 uppercase font-black">{quote.createdBy?.role || 'Admin'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] uppercase tracking-tighter">
                        <Calendar size={12} />
                        {new Date(quote.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => handleDownload(quote._id, quote.quotationNumber)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-[1rem] border border-zinc-100 bg-white hover:bg-black hover:text-white hover:border-black transition-all duration-500 shadow-sm active:scale-90"
                      >
                        <Download size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Optimized Pagination --- */}
        <div className="p-8 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center border-t border-zinc-100 gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">
            Displaying Page <span className="text-black">{page}</span> of <span className="text-black">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)} 
              className="p-3 border border-zinc-200 rounded-xl bg-white disabled:opacity-20 hover:border-black transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex gap-1.5 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl font-black text-[10px] transition-all ${
                    page === i + 1 ? 'bg-black text-white shadow-lg' : 'bg-white text-zinc-400 border border-zinc-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(p => p + 1)} 
              className="p-3 border border-zinc-200 rounded-xl bg-white disabled:opacity-20 hover:border-black transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}