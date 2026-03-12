"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import useSWR from "swr";
import api from "@/utils/api";
import { Upload, X, Loader2, ChevronLeft, Plus, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    brand: "",
    description: "",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: catData } = useSWR("/categories", fetcher, {
    revalidateOnFocus: false, 
  });
  const categoryList = Array.isArray(catData) ? catData : catData?.categories || [];

 
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      return toast.error("Max 5 images allowed");
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
   
    e.target.value = "";
  };

  
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]); 
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Upload at least one image");
    if (loading) return;

    setLoading(true);
    setUploadProgress(0);
    
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    images.forEach((file) => data.append("images", file));

    try {
      await api.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / (p.total || 1));
          setUploadProgress(percent);
        },
      });

      toast.success("Product published! 🚀");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-white">
      {/* Navigation */}
      <Link href="/admin/products" className="flex items-center gap-2 text-slate-400 hover:text-black mb-8 transition-colors font-bold text-sm uppercase tracking-widest group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Back
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic italic-text">New Arrival</h1>
        <p className="text-slate-400 font-medium">Add fresh stock to your marketplace inventory.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: Drag & Drop Area */}
        <div className="lg:col-span-5">
          <div 
            className="sticky top-10 space-y-4"
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[4/5] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                ${previews.length === 0 ? 'bg-slate-50 border-slate-200 hover:border-black' : 'bg-white border-transparent'}`}
            >
              {previews.length === 0 ? (
                <div className="text-center p-6">
                  <div className="bg-white p-5 rounded-full shadow-sm inline-block mb-4 border border-slate-100">
                      <Upload className="text-slate-400" size={24} />
                  </div>
                  <p className="text-sm font-black uppercase tracking-widest">Select Product Images</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Max 5 photos • High Resolution</p>
                </div>
              ) : (
                <div className="w-full h-full p-3 grid grid-cols-2 gap-3">
                    {previews.map((src, i) => (
                      <div key={i} className={`relative rounded-3xl overflow-hidden shadow-sm group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                        <img src={src} className="object-cover w-full h-full transition-transform duration-700 hover:scale-110" alt="preview" />
                        <button 
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-2 right-2 bg-white/90 p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <div className="flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl hover:bg-slate-50 transition-colors">
                          <Plus size={20} className="text-slate-300" />
                      </div>
                    )}
                </div>
              )}
            </div>

            {loading && (
              <div className="bg-slate-900 text-white p-5 rounded-3xl">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span>Uploading to Assets</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full transition-all duration-300 shadow-[0_0_10px_white]" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>
          <input type="file" multiple hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
        </div>

        {/* RIGHT: Form Body */}
        <div className="lg:col-span-7">
          <div className="bg-slate-50/50 p-6 md:p-10 rounded-[3rem] border border-slate-100 space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Name</label>
              <input
                name="name"
                type="text"
                placeholder="Ex: Retro Sneakers Limited Edition"
                className="w-full p-4 bg-white rounded-2xl outline-none focus:ring-2 focus:ring-black/5 border border-slate-100 text-lg font-bold"
                required
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  placeholder="0.00"
                  className="w-full p-4 bg-white rounded-2xl outline-none border border-slate-100 font-bold text-lg"
                  required
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                <select 
                  name="category"
                  className="w-full p-4 bg-white rounded-2xl outline-none border border-slate-100 appearance-none font-bold text-slate-600"
                  required
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  {categoryList.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brand</label>
                <input
                  name="brand"
                  type="text"
                  placeholder="Ex: Adidas"
                  className="w-full p-4 bg-white rounded-2xl outline-none border border-slate-100 font-bold"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Units Available</label>
                <input
                  name="stock"
                  type="number"
                  placeholder="0"
                  className="w-full p-4 bg-white rounded-2xl outline-none border border-slate-100 font-bold"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Description</label>
              <textarea
                name="description"
                placeholder="Tell the story of this product..."
                rows={4}
                className="w-full p-4 bg-white rounded-2xl outline-none border border-slate-100 resize-none font-medium leading-relaxed"
                onChange={handleChange}
              ></textarea>
            </div>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-6 rounded-3xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-40 shadow-xl shadow-slate-100 uppercase tracking-widest"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Pushing to Live</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>List Product Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}