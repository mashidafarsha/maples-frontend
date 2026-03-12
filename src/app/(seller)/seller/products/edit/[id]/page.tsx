"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { getProductById, updateProduct } from "@/services/productService";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Loader2, ChevronLeft, X, Save, ImagePlus, Landmark, Package, Info } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SellerEditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
 
  const { data, isLoading: fetchingProduct, mutate } = useSWR(
    id ? `/products/${id}` : null, 
    () => getProductById(id as string),
    { revalidateOnFocus: false }
  );
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
  const [previews, setPreviews] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (data?.product) {
      const p = data.product;
      setFormData({
        name: p.name || "",
        price: p.price?.toString() || "",
        category: p.category?._id || p.category || "",
        stock: p.stock?.toString() || "",
        brand: p.brand || "",
        description: p.description || "",
      });
      
      setPreviews(p.images?.map((img: string) => ({ url: img, isExisting: true })) || []);
    }
  }, [data]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (previews.length + files.length > 5) return toast.error("Max 5 images allowed");
    
    const newFiles: File[] = [];
    const newPreviews: any[] = [];

    files.forEach(file => {
      newFiles.push(file);
      newPreviews.push({ url: URL.createObjectURL(file), isExisting: false, file });
    });

    setNewImages(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePreview = (index: number) => {
    const toRemove = previews[index];
    
    if (!toRemove.isExisting) {
      setNewImages(prev => prev.filter(img => img !== toRemove.file));
    }
    
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previews.length === 0) return toast.error("At least one image is required");
    
    setLoading(true);
    const dataToSend = new FormData();

   
    Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
    

    const existingImages = previews.filter(p => p.isExisting).map(p => p.url);
    dataToSend.append("existingImages", JSON.stringify(existingImages));

    newImages.forEach((file) => dataToSend.append("images", file));

    try {
      await updateProduct(id as string, dataToSend);
      toast.success("Product updated successfully! ✨");
      router.push("/seller/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-black" size={40} />
        <p className="font-bold text-gray-400 uppercase text-xs tracking-widest">Loading Details...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <Link href="/seller/products" className="flex items-center gap-2 text-gray-500 hover:text-black transition group">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-bold uppercase tracking-widest text-[10px]">Back to Inventory</span>
        </Link>
        <div className="flex items-center gap-2 text-zinc-300">
           <Info size={16} />
           <span className="text-[10px] font-bold uppercase tracking-tighter">Edit Mode Active</span>
        </div>
      </div>

      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Update <span className="text-gray-300">Product</span></h1>
        <p className="text-gray-400 font-medium mt-2 tracking-tight">Refining: <span className="text-black">{data?.product?.name}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Detail Editor */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-50 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Product Title</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 transition-all font-bold border-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Price (AED)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-none font-black text-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-none font-bold appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select Category</option>
                  {catData?.categories?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Brand</label>
                 <div className="relative">
                   <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input
                     value={formData.brand}
                     onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                     className="w-full p-5 pl-12 bg-gray-50 rounded-2xl outline-none border-none font-bold"
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Stock Level</label>
                 <div className="relative">
                   <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input
                     type="number"
                     value={formData.stock}
                     onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                     className="w-full p-5 pl-12 bg-gray-50 rounded-2xl outline-none border-none font-bold"
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-5 bg-gray-50 rounded-2xl outline-none border-none h-40 resize-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Media & Save */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-black p-8 rounded-[2.5rem] text-white">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-6 text-zinc-500">Media Management</h3>
             <div className="grid grid-cols-2 gap-3 mb-6">
                {previews.map((item, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/10">
                    <img src={item.url} className="object-cover w-full h-full" alt="preview" />
                    <button 
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X size={12} />
                    </button>
                    {item.isExisting && (
                      <div className="absolute bottom-2 left-2 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold uppercase">Stored</div>
                    )}
                  </div>
                ))}
                {previews.length < 5 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center hover:bg-zinc-900 transition-all gap-2"
                  >
                    <ImagePlus size={24} className="text-zinc-700" />
                  </button>
                )}
             </div>
             <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
             <p className="text-[9px] text-center font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900 py-3 rounded-xl border border-white/5">
                {previews.length} / 5 Images
             </p>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-sm flex justify-center items-center gap-3 hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span className="uppercase tracking-widest">Applying Changes...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span className="uppercase tracking-widest">Update Listing</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}