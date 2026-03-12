"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import useSWR from 'swr';
import api from "@/utils/api";
import { Trash2, Plus, Loader2, Search, ChevronLeft, ChevronRight, Image as ImageIcon, X, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";


function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function CategoryPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

 
  const handleSearch = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
      setPage(1);
    }, 500),
    []
  );

  const { data, isLoading, mutate } = useSWR(
    `/categories?page=${page}&search=${searchTerm}&limit=10`, 
    fetcher,
    { keepPreviousData: true } 
  );

  const categories = data?.categories || [];
  const totalPages = data?.totalPages || 1;

 
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (preview) URL.revokeObjectURL(preview);
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
 
    if (image && image.size > 2 * 1024 * 1024) {
      return toast.error("Image too large! Use below 2MB for speed.");
    }

    if (!name.trim() || !image) return toast.error("Name and Image are required");

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("image", image);

    try {
     
      const uploadToast = toast.loading("Uploading to cloud...");

      const response = await api.post("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
     
      toast.dismiss(uploadToast);
      toast.success("Added instantly! ⚡");

      setName("");
      setDescription("");
      setImage(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
    
      mutate(); 

    } catch (err: any) {
      toast.error("Upload failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
  
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this category!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#000000', 
      cancelButtonColor: '#f87171',
      confirmButtonText: 'Yes, delete it!',
      // borderRadius: '20px',
      customClass: {
        popup: 'rounded-[2rem] font-sans',
        confirmButton: 'rounded-xl px-6 py-3',
        cancelButton: 'rounded-xl px-6 py-3'
      }
    });

    if (result.isConfirmed) {
     
      const updatedCategories = categories.filter((c: any) => c._id !== id);
      mutate({ ...data, categories: updatedCategories }, false);

      try {
        await api.delete(`/categories/${id}`);
        
  
        Swal.fire({
          title: 'Deleted!',
          text: 'The category has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          // borderRadius: '20px',
        });
      } catch (err) {
        mutate();
        toast.error("Deletion failed");
      }
    }
  };
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-[#fafafa]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-black uppercase italic">Structure</h1>
          <p className="text-slate-400 font-medium mt-1">Organize your marketplace hierarchy.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-black transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Find a category..." 
            className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none w-full md:w-80 shadow-sm focus:ring-4 ring-black/5 transition-all font-bold"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Form */}
        <div className="lg:col-span-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-8">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <LayoutGrid size={20}/> New Entry
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity</label>
                <input
                  type="text"
                  className="w-full p-4 bg-slate-50 border border-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 ring-black/5 transition-all font-bold"
                  placeholder="e.g. Streetwear"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visual Preview</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-black transition-all bg-slate-50"
                >
                  {preview ? (
                    <>
                      <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <X className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto text-slate-300" size={28} />
                      <p className="text-[10px] font-black uppercase mt-2 text-slate-400">Select Image</p>
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
              </div>

              <button 
                disabled={isSubmitting} 
                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:bg-slate-200 mt-4"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirm & Save"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-50">
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <th className="px-8 py-6 text-center w-24">Visual</th>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-6"><div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto" /></td>
                        <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-1/2" /></td>
                        <td className="px-8 py-6 text-right"><div className="h-8 bg-slate-100 rounded-xl w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : categories.map((cat: any) => (
                    <tr key={cat._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105 mx-auto">
                          <img src={cat.image} className="w-full h-full object-cover" alt="" loading="lazy" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight text-base">{cat.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.description || 'Global Category'}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDelete(cat._id)} 
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-8 bg-slate-50/30 flex justify-between items-center border-t border-slate-50">
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-3 border border-slate-200 rounded-xl bg-white disabled:opacity-20 hover:border-black transition-all">
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center px-4 font-black text-xs uppercase tracking-tighter">
                   Page {page} of {totalPages}
                </div>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-3 border border-slate-200 rounded-xl bg-white disabled:opacity-20 hover:border-black transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}