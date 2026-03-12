"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { Loader2, Search, ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";

function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const routerSearch = searchParams.get("search") || "";
  const routerCategory = searchParams.get("category") || "";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(routerSearch);
  const limit = 12;

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }
      
      params.set("page", "1"); 

      if (params.toString() !== searchParams.toString()) {
        router.push(`/products?${params.toString()}`, { scroll: false });
      }
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, router, searchParams]);

  
  useEffect(() => {
    setSearchInput(routerSearch);
    setPage(1);
  }, [routerSearch, routerCategory]);

  const { data, isLoading, isValidating } = useSWR(
    `/products?page=${page}&limit=${limit}&search=${routerSearch}&category=${routerCategory}`,
    (url: string) => api.get(url).then((res) => res.data),
    { 
      keepPreviousData: true,
      revalidateOnFocus: false 
    }
  );

  const products = data?.products || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* 🚀 Header Section */}
      <div className="pt-36 pb-20 bg-zinc-50 rounded-b-[4rem]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-3">
                {routerSearch ? `Discover Results` : routerCategory ? `Exclusive Collection` : `All Essentials`}
              </p>
              <h1 className="text-6xl md:text-7xl font-serif italic text-zinc-900 leading-tight tracking-tighter">
                {routerSearch ? `"${routerSearch}"` : `The Maples Collection`}
              </h1>

              {/* 🔍 Smart Search Bar */}
              <div className="mt-10 relative max-w-md group">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full bg-white border border-zinc-200 py-4 pl-12 pr-10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                />
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isValidating ? 'text-black animate-pulse' : 'text-zinc-400'}`} size={18} />
                
                {searchInput && (
                  <button 
                    onClick={() => {setSearchInput(""); router.push('/products')}}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-4 px-6 rounded-full border border-zinc-100 shadow-sm text-xs font-bold uppercase tracking-widest text-zinc-400">
              <LayoutGrid size={16} className="text-black" />
              <span className="text-black">{data?.totalItems || 0}</span> Products
            </div>
          </div>
        </div>
      </div>

      {/* 🛍️ Product Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20 mb-20">
        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-4">
                <div className="bg-zinc-100 aspect-square rounded-[2rem]"></div>
                <div className="h-4 bg-zinc-100 rounded w-2/3"></div>
                <div className="h-4 bg-zinc-100 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`transition-opacity duration-300 ${isValidating ? 'opacity-50' : 'opacity-100'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
              {products.map((p: any) => (
                <div key={p._id} className="group hover:-translate-y-1 transition-transform duration-300 relative">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {/* 🔢 Pagination */}
            {totalPages > 1 && (
              <div className="mt-28 flex justify-center items-center gap-3 bg-zinc-50 p-3 rounded-full border border-zinc-100 w-fit mx-auto shadow-sm">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-4 bg-white rounded-full hover:bg-zinc-100 disabled:opacity-30 transition-all shadow"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                     <button
                       key={num}
                       onClick={() => setPage(num)}
                       className={`w-11 h-11 rounded-full text-xs font-black uppercase transition-all ${
                         page === num ? "bg-black text-white shadow-xl scale-110" : "hover:bg-white text-zinc-400"
                       }`}
                     >
                       {num}
                     </button>
                   ))}
                </div>
                <button 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-4 bg-white rounded-full hover:bg-zinc-100 disabled:opacity-30 transition-all shadow"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-40 bg-zinc-50 rounded-[3rem] border border-zinc-100">
            <Search className="mx-auto text-zinc-200 mb-8" size={70} strokeWidth={1} />
            <h3 className="text-3xl font-serif italic text-zinc-900 mb-3 leading-tight">We couldn't find <br /> matching items</h3>
            <p className="text-zinc-400 text-xs uppercase tracking-widest font-bold max-w-xs mx-auto leading-loose">Try adjusting your search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex flex-col items-center justify-center font-black uppercase tracking-widest text-zinc-300 gap-3"><Loader2 className="animate-spin" /> Loading Maples...</div>}>
      <ProductList />
    </Suspense>
  );
}