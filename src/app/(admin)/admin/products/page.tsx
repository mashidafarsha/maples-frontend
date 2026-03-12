"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import api from "@/utils/api";
import { 
  Plus, Search, Trash2, Edit3, 
  ChevronLeft, ChevronRight, Filter 
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { deleteProduct } from "@/services/productService";
import { getCategories } from "@/services/categoryService"; 
// @ts-ignore
import Swal from "sweetalert2";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [page, setPage] = useState(1);

  // Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);


  const { data, isLoading, mutate } = useSWR(
    `/products?page=${page}&limit=10&search=${debouncedSearch}&category=${selectedCategory}`,
    fetcher,
    { keepPreviousData: true }
  );


  const { data: catData } = useSWR("/categories", () => getCategories(1, "", 100));
  const categories = catData?.categories || [];

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  
  const handleDelete = async (id: string) => {
 
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      borderRadius: "15px",
      customClass: {
        popup: 'rounded-2xl shadow-xl',
        title: 'text-xl font-bold text-slate-800',
        confirmButton: 'px-6 py-2 rounded-lg font-semibold',
        cancelButton: 'px-6 py-2 rounded-lg font-semibold'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProduct(id);
          mutate(); 
          
        
          Swal.fire({
            title: "Deleted!",
            text: "Your product has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          toast.error("Error deleting product");
        }
      }
    });
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Management</h1>
          <p className="text-slate-500 text-sm">Review and manage your store inventory.</p>
        </div>
        <Link href="/admin/products/add">
          <button className="bg-[#004aad] text-white px-5 py-2.5 rounded-lg flex gap-2 items-center hover:bg-[#003a8c] transition-all shadow-md font-semibold text-sm">
            <Plus size={18} /> Add Product
          </button>
        </Link>
      </div>

      {/* --- Filter & Search Bar --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, brand or seller..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#004aad] transition-all text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

    
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1); 
            }}
            className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-[#004aad] focus:border-[#004aad] block w-full p-2 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[13px] uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price (AED)</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
               [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/50"></td>
                </tr>
              ))
            ) : products.length > 0 ? (
              products.map((product: any) => (
                <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                        <Image 
                          src={product.images[0]?.replace('/upload/', '/upload/w_200,c_fill,f_auto,q_auto/')} 
                          alt="" fill sizes="48px" className="object-cover" 
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                    {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-black uppercase px-2 py-1 rounded ${
                      product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {product.stock} In Stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/edit/${product._id}`}>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-600">
                          <Edit3 size={18} />
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                  No products found...
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500 font-medium">
            Page <span className="text-slate-900">{page}</span> of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-40"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}