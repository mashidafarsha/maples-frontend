"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Loader2, Upload, ChevronLeft, X, Save, Info } from "lucide-react";
import Link from "next/link";
import { updateProduct } from "@/services/productService";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 1. Parallel Fetching (SWR uses cache, so it's fast)
  const { data, isLoading: fetchingProduct } = useSWR(`/products/${id}`, fetcher, {
    revalidateOnFocus: false 
  });
  const { data: catData } = useSWR("/categories", fetcher, { revalidateOnFocus: false });

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    brand: "",
    description: "",
  });
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<any[]>([]); // { url: string, isExisting: boolean }
  const [loading, setLoading] = useState(false);

  // 2. Efficiently Load Data
  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setFormData({
        name: p.name || "",
        price: p.price || "",
        category: p.category?._id || p.category || "",
        stock: p.stock || 0,
        brand: p.brand || "",
        description: p.description || "",
      });
    
      setPreviews(p.images.map((img: string) => ({ url: img, isExisting: true })) || []);
    }
  }, [data]);

  // 3. Handle Image Selection with Cleanup (To avoid memory leaks)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }

    setNewImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
      file 
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    const itemToRemove = previews[index];
    
    if (!itemToRemove.isExisting) {
      URL.revokeObjectURL(itemToRemove.url);
      setNewImages((prev) => prev.filter((f) => f !== itemToRemove.file));
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 4. Optimized Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
  
    try {
      const dataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
      
    
      if (newImages.length > 0) {
        newImages.forEach((file) => dataToSend.append("images", file));
      }

     
      const remainingExistingImages = previews
        .filter(p => p.isExisting)
        .map(p => p.url);
      dataToSend.append("existingImages", JSON.stringify(remainingExistingImages));
  
      await updateProduct(id as string, dataToSend);
      
      toast.success("Product updated! 🚀");
      router.push("/admin/products");
      router.refresh(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p className="text-slate-500 font-medium animate-pulse">Syncing Details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/admin/products" className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors">
          <ChevronLeft size={20} /> 
          <span className="font-bold text-xs uppercase tracking-widest">Inventory</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
           <Info size={14} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Product Editor</span>
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic text-slate-900">Edit Product</h1>
        <p className="text-slate-400 mt-2">Currently Editing: <span className="text-blue-600 font-bold underline decoration-blue-200">{data?.product?.name}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Section: Visuals */}
        <div className="lg:col-span-5">
          <div className="bg-slate-50 p-6 rounded-[2rem] sticky top-8 border border-slate-100">
             <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-2">Product Gallery</label>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
                {previews.map((item, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-200 bg-white">
                    <img src={item.url} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" alt="preview" />
                    <button 
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                    {!item.isExisting && (
                      <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>
                    )}
                  </div>
                ))}
                
                {previews.length < 5 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 transition-all gap-2 text-slate-400 hover:text-blue-500"
                  >
                    <Upload size={24} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Upload</span>
                  </button>
                )}
             </div>
             <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
          </div>
        </div>

        {/* Right Section: Core Data */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border-2 border-slate-50 p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-500/30 transition-all font-bold text-slate-800"
                placeholder="Ex: Wireless Headphones"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">AED</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-4 pl-8 bg-slate-50 rounded-xl outline-none font-black text-lg text-slate-800 border-none"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-4 bg-slate-50 rounded-xl outline-none border-none font-bold text-slate-700 appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Category</option>
                  {catData?.categories?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Brand</label>
                 <input
                   value={formData.brand}
                   onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                   className="w-full p-4 bg-slate-50 rounded-xl outline-none border-none font-bold text-slate-700"
                   placeholder="Brand name"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Stock Level</label>
                 <input
                   type="number"
                   value={formData.stock}
                   onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                   className="w-full p-4 bg-slate-50 rounded-xl outline-none border-none font-bold text-slate-700"
                   placeholder="Qty"
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 bg-slate-50 rounded-xl outline-none border-none h-32 resize-none font-medium text-slate-600 leading-relaxed"
                placeholder="Briefly describe the product..."
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm flex justify-center items-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span className="uppercase tracking-[0.2em]">Updating...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span className="uppercase tracking-[0.2em]">Save Product</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}