"use client";

import { useState, useMemo, useEffect } from "react";
import useSWR from 'swr';
import api from "@/utils/api";
import { 
  CheckCircle, XCircle, Search, Users, 
  ChevronLeft, ChevronRight, UserCheck, 
  UserMinus, Mail, Hash, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from 'sweetalert2';


function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function VendorManagement() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500); 
  const limit = 10;


  const { data, mutate, isLoading, isValidating } = useSWR(
    `/admin/vendors?page=${page}&limit=${limit}&search=${debouncedSearch}`, 
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  const vendors = data?.vendors || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;


  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    const actionText = currentStatus ? "Revoke Access" : "Approve Vendor";
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `${actionText} for this vendor?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#ef4444' : '#000000',
      confirmButtonText: `Yes, ${actionText}`,
      borderRadius: '24px',
      customClass: { popup: 'rounded-[2rem] font-sans' }
    });

    if (!result.isConfirmed) return;

   
    const optimisticData = {
      ...data,
      vendors: vendors.map((v: any) => v._id === id ? { ...v, isApproved: !currentStatus } : v)
    };
    mutate(optimisticData, false); 

    try {
      await api.patch(`/admin/vendors/${id}/approve`, { isApproved: !currentStatus });
      
      Swal.fire({
        title: 'Updated!',
        text: currentStatus ? 'Access has been revoked.' : 'Vendor has been approved.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        borderRadius: '20px'
      });
    } catch (error) {
      mutate(); 
      toast.error("Operation failed. Try again.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black uppercase italic flex items-center gap-3">
            <Users size={32} strokeWidth={3}/> Partners
          </h1>
          <p className="text-slate-400 font-medium mt-1">Total {totalItems} vendors registered.</p>
        </div>

        <div className="relative group w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search name or email..." 
            value={searchInput}
            className="pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none w-full shadow-sm focus:ring-4 ring-black/5 transition-all font-bold"
            onChange={(e) => {
               setSearchInput(e.target.value);
               setPage(1); 
            }}
          />
          {isValidating && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-slate-200" size={18} />}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-50">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-8 py-6">Vendor Info</th>
                <th className="px-8 py-6">Current Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                // Skeleton Loaders
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-7"><div className="h-6 bg-slate-100 rounded-lg w-2/3" /></td>
                    <td className="px-8 py-7"><div className="h-6 bg-slate-100 rounded-full w-24" /></td>
                    <td className="px-8 py-7 text-right"><div className="h-10 bg-slate-100 rounded-xl w-32 ml-auto" /></td>
                  </tr>
                ))
              ) : (
                vendors.map((vendor: any) => (
                  <tr key={vendor._id} className="group hover:bg-slate-50/40 transition-all">
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase tracking-tight text-base italic">{vendor.name}</span>
                        <span className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5 tracking-tight"><Mail size={12} /> {vendor.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      {vendor.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase border border-green-100">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase border border-amber-100">
                          <XCircle size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-7 text-right">
                      <button
                        onClick={() => handleToggleApprove(vendor._id, vendor.isApproved)}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                          vendor.isApproved 
                          ? "bg-slate-50 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-100" 
                          : "bg-black text-white hover:bg-slate-800 shadow-lg shadow-black/10"
                        }`}
                      >
                        {vendor.isApproved ? "Revoke Access" : "Approve Account"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center border-t border-slate-50 gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Page <span className="text-black">{page}</span> of <span className="text-black">{totalPages}</span>
          </p>
          
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-4 border border-slate-200 rounded-2xl bg-white disabled:opacity-30 hover:border-black transition-all shadow-sm">
              <ChevronLeft size={18} />
            </button>
            
            <div className="flex gap-2 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                    page === i + 1 ? 'bg-black text-white scale-110' : 'bg-white text-slate-400 border border-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-4 border border-slate-200 rounded-2xl bg-white disabled:opacity-30 hover:border-black transition-all shadow-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}