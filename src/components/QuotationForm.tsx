"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { Loader2, Download, CheckCircle, Search, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { searchProducts } from "@/services/productService";
import { requestQuotation, downloadPDF } from "@/services/quotationService";

export default function QuotationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [quoteResponse, setQuoteResponse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); 
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", hotelName: "",
  });

  useEffect(() => {
    const token = getCookie("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const data = await searchProducts(searchQuery, 5);
          setSuggestions(data.products || []);
        } catch (err) {
          setSuggestions([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addItem = (product: any) => {
    if (!selectedItems.find(i => i._id === product._id)) {
      setSelectedItems([...selectedItems, { ...product, quantity: 1 }]);
    }
    setSearchQuery("");
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert("Please add products");
    setLoading(true);
    try {
      const data = await requestQuotation({
        customer: formData,
        items: selectedItems.map(i => ({ productId: i._id, quantity: i.quantity }))
      });
      setQuoteResponse(data.quote);
    } catch (error: any) {
      alert("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn === false) {
    return (
      <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <button onClick={() => router.push("/login")} className="bg-black text-white px-8 py-3 rounded-lg font-bold">Sign In</button>
      </div>
    );
  }

  if (quoteResponse) return (
    <div className="max-w-md mx-auto py-40 px-6 text-center">
      <CheckCircle size={50} className="text-green-500 mx-auto mb-6" />
      <h3 className="text-2xl font-bold mb-2">Quotation Generated</h3>
      <p className="text-gray-500 mb-8">Ref: {quoteResponse.quotationNumber}</p>
      <button onClick={() => downloadPDF(quoteResponse._id, quoteResponse.quotationNumber)} className="w-full bg-black text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 mb-4">
        <Download size={18} /> Download PDF
      </button>
      <button onClick={() => { setQuoteResponse(null); setSelectedItems([]); }} className="text-gray-400 font-bold text-sm">Create Another</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-20 lg:py-32">
      <header className="mb-16">
        <h1 className="text-4xl font-serif italic font-bold text-zinc-900">Quotation Studio</h1>
        <p className="text-zinc-500 mt-2">Select products and provide your details.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        
        {/* Step 1: Search & Selection */}
        <section className="space-y-8">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-900 block mb-4">01. Select Products</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                placeholder="Search products..."
                className="w-full border border-zinc-200 p-4 rounded-xl outline-none focus:border-black transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && <Loader2 size={18} className="animate-spin absolute right-4 top-4 text-zinc-400" />}
              
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-zinc-200 shadow-xl rounded-xl mt-2 overflow-hidden">
                  {suggestions.map((p: any) => (
                    <div key={p._id} onClick={() => addItem(p)} className="p-4 hover:bg-zinc-50 cursor-pointer flex justify-between items-center border-b border-zinc-50 last:border-0 transition-colors">
                      <span className="font-medium text-sm text-zinc-900">{p.name}</span>
                      <Plus size={16} className="text-zinc-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {selectedItems.map(item => (
              <div key={item._id} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                <div>
                  <p className="font-bold text-sm text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">AED {item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1">
                    <button onClick={() => setSelectedItems(prev => prev.map(i => i._id === item._id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))}><Minus size={14}/></button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => setSelectedItems(prev => prev.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i))}><Plus size={14}/></button>
                  </div>
                  <button onClick={() => setSelectedItems(prev => prev.filter(i => i._id !== item._id))} className="text-zinc-300 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {selectedItems.length === 0 && <p className="text-zinc-300 text-sm italic py-10 text-center border-2 border-dashed border-zinc-100 rounded-xl">No items selected.</p>}
          </div>
        </section>

        {/* Step 2: Form */}
        <section className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-900 block mb-8">02. Recipient Details</label>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Full Name</label>
              <input required className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-black text-sm text-zinc-900" onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Email Address</label>
              <input required type="email" className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-black text-sm text-zinc-900" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Phone</label>
              <input required className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-black text-sm text-zinc-900" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-zinc-500">Hotel/Company</label>
              <input className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-black text-sm text-zinc-900" onChange={e => setFormData({...formData, hotelName: e.target.value})} />
            </div>
            <button 
              disabled={loading || selectedItems.length === 0}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm mt-4 hover:bg-zinc-800 transition-all disabled:bg-zinc-200"
            >
              {loading ? "Processing..." : "Generate Quote"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}