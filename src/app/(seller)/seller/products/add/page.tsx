"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { Loader2, Upload, ChevronLeft, X, ImagePlus, Landmark, Package, Save } from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SellerAddProduct() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const { data: catData } = useSWR("/categories", fetcher, { revalidateOnFocus: false });
  const categoryList = Array.isArray(catData) ? catData : catData?.categories || [];
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({ 
    name: "", 
    price: "", 
    category: "", 
    stock: "0", 
    brand: "", 
    description: "" 
  });

  // 1. Optimized Image Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    const validFiles: File[] = [];
    selectedFiles.forEach((file) => {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is too large (>2MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (images.length + validFiles.length > 5) {
      return toast.error("Maximum 5 images allowed");
    }
    
    setImages((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = ""; // Reset input
  };

  // 2. Memory Cleanup (Removing Previews)
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

 
  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) return toast.error("Upload at least one image");
    if (loading) return;

    setLoading(true);
    setUploadProgress(0);
    
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
    images.forEach(img => dataToSend.append("images", img));

    try {
      
      await api.post("/products", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / (p.total || 1));
          setUploadProgress(percent);
        },
      });

      toast.success("Product Published Successfully! 🚀");
      router.push("/seller/products");
      router.refresh();
    } catch (err: any) {
      console.error("Submission Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white min-h-screen">
      <Link href="/seller/products" className="flex items-center gap-2 text-gray-400 mb-8 font-bold text-[10px] tracking-widest uppercase hover:text-black transition-all group">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </Link>
      
      <div className="mb-10">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter">
          Add New <span className="text-gray-300">Listing</span>
        </h1>
        <p className="text-gray-400 font-medium">Create a new product for your store</p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: FORM DATA */}
        <div className="lg:col-span-7 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Product Name</label>
            <input 
              className="w-full p-5 bg-white rounded-2xl outline-none font-bold focus:ring-4 ring-black/5 transition-all border border-slate-100" 
              placeholder="e.g. Luxury Sofa" 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Price (₹)</label>
              <input 
                type="number" 
                className="w-full p-5 bg-white rounded-2xl outline-none font-black text-xl border border-slate-100" 
                placeholder="0.00" 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Category</label>
              <select 
                className="w-full p-5 bg-white rounded-2xl outline-none font-bold appearance-none cursor-pointer border border-slate-100" 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                required
              >
                <option value="">Choose Category</option>
                {categoryList.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Brand</label>
              <div className="relative">
                <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  className="w-full p-5 pl-12 bg-white rounded-2xl outline-none font-bold border border-slate-100" 
                  placeholder="Brand name" 
                  onChange={e => setFormData({...formData, brand: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Inventory Stock</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="number" 
                  className="w-full p-5 pl-12 bg-white rounded-2xl outline-none font-bold border border-slate-100" 
                  placeholder="Qty" 
                  onChange={e => setFormData({...formData, stock: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Description</label>
            <textarea 
              className="w-full p-5 bg-white rounded-2xl outline-none h-40 font-medium border border-slate-100 resize-none" 
              placeholder="Tell customers about your product..." 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required
            />
          </div>
        </div>

        {/* RIGHT: MEDIA & SUBMIT */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-black p-8 rounded-[2.5rem] text-white shadow-2xl sticky top-6">
            <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex justify-between">
              Media <span>{previews.length}/5</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-zinc-900">
                  <img src={url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="upload-preview" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(i)} 
                    className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-xl z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} color="white"/>
                  </button>
                </div>
              ))}
              
              {previews.length < 5 && (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="aspect-square rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:bg-white/5 transition-all gap-2"
                >
                  <ImagePlus size={24} className="text-gray-500" />
                  <span className="text-[8px] font-black uppercase text-gray-500">Add Photo</span>
                </button>
              )}
            </div>
            
            <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
            
            {loading && (
              <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                  <span>Uploading to Assets</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading} 
              className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-widest flex justify-center items-center gap-3 transition-all
                ${loading 
                  ? "bg-zinc-800 text-gray-500 cursor-not-allowed" 
                  : "bg-white text-black hover:bg-zinc-200 active:scale-95 shadow-xl shadow-white/5"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Pushing Live</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}