"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useSWR, { preload } from "swr";
import { getSellerProducts, deleteProduct } from "@/services/productService";
import api from "@/utils/api";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  PackageSearch, 
  Loader2, 
  Search, 
  Filter, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const fetcher = (url: string) => api.get(url).then((res) => res.data);


const ProductCard = ({ p, onDelete }: { p: any; onDelete: (id: string) => void }) => (
  <div className="group bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative">
    <div className="relative h-56 w-full mb-5 rounded-[1.8rem] overflow-hidden bg-gray-100">
      <img 
        src={p.images[0]} 
        alt={p.name} 
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
      />
      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase backdrop-blur-md ${p.stock <= 5 ? 'bg-red-500 text-white' : 'bg-white/80 text-black'}`}>
        Stock: {p.stock}
      </div>
      {p.stock <= 5 && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg animate-bounce border-2 border-white">
          <AlertTriangle size={16} />
        </div>
      )}
    </div>
    
    <div className="space-y-1 mb-4 px-1">
      <h3 className="font-bold text-xl truncate">{p.name}</h3>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{p.category?.name || "General"}</span>
        <span className="text-[10px] font-black uppercase text-black bg-gray-100 px-2 py-0.5 rounded">{p.brand}</span>
      </div>
    </div>
    
    <div className="flex justify-between items-center pt-5 border-t border-gray-50">
      <span className="font-black text-2xl">AED {p.price.toLocaleString()}</span>
      <div className="flex gap-1">
        <Link href={`/seller/products/edit/${p._id}`}>
          <button className="p-3 hover:bg-black hover:text-white rounded-xl transition-all"><Edit3 size={18} /></button>
        </Link>
        <button onClick={() => onDelete(p._id)} className="p-3 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
      </div>
    </div>
  </div>
);

export default function SellerProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data: catData } = useSWR("/categories", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, mutate, isValidating } = useSWR(
    [`/products/seller/my-products`, page, debouncedSearch, category],
    () => getSellerProducts(page, debouncedSearch, category),
    { 
      keepPreviousData: true, 
      revalidateOnFocus: false,
      dedupingInterval: 10000 
    }
  );

  useEffect(() => {
    if (data?.totalPages && page < data.totalPages) {
      const nextPage = page + 1;
      preload([`/products/seller/my-products`, nextPage, debouncedSearch, category], 
      () => getSellerProducts(nextPage, debouncedSearch, category));
    }
  }, [page, data, debouncedSearch, category]);

  const products = useMemo(() => data?.products || [], [data]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const previousData = data;
    try {
      mutate({ ...data, products: products.filter((p: any) => p._id !== id) }, false); 
      await deleteProduct(id);
      toast.success("Removed from inventory");
    } catch (err) {
      toast.error("Failed to delete");
      mutate(previousData); 
    }
  }, [data, products, mutate]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">My <span className="text-gray-300">Inventory</span></h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Manage Listings & Stock</p>
        </div>
        <Link href="/seller/products/add">
          <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex gap-2 hover:bg-zinc-800 transition-all shadow-xl active:scale-95">
            <Plus size={20} /> Add New Listing
          </button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by product name..."
            className="w-full p-5 pl-14 bg-white border border-gray-100 rounded-[1.8rem] outline-none focus:ring-4 focus:ring-black/5 font-bold transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isValidating && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-gray-200" size={18} />}
        </div>

        <div className="md:col-span-4 relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select
            value={category}
            className="w-full p-5 pl-14 bg-white border border-gray-100 rounded-[1.8rem] outline-none font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-black/5 shadow-sm"
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {catData?.categories?.map((c: any) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading && products.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black" size={40} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <PackageSearch size={64} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No products found</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity ${isValidating ? 'opacity-70' : 'opacity-100'}`}>
          {products.map((p: any) => (
            <ProductCard key={p._id} p={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* 🔥 Updated Pagination with Icons */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-10">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)} 
            className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm disabled:opacity-20 hover:bg-black hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((num) => (
              <button 
                key={num} 
                onClick={() => setPage(num)}
                className={`w-12 h-12 rounded-2xl font-black transition-all shadow-sm ${
                  page === num 
                    ? 'bg-black text-white scale-110 shadow-lg' 
                    : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button 
            disabled={page >= data.totalPages} 
            onClick={() => setPage(p => p + 1)} 
            className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm disabled:opacity-20 hover:bg-black hover:text-white transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}