"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { Loader2, Download, CheckCircle, Search, Plus, Minus, Trash2 } from "lucide-react";
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

  // 🚀 സെർച്ച് കൂടുതൽ വേഗത്തിലാക്കാൻ കുറഞ്ഞ Debounce Time
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // limit 5 എന്നത് സജഷൻസിന് അനുയോജ്യമാണ്
        const data = await searchProducts(searchQuery, 5);
        setSuggestions(data.products || []);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200); // 300ms ൽ നിന്ന് 200ms ആക്കി കുറച്ചു

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
        <section className="space-y-8">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-900 block mb-4">01. Select Products</label>
            <div className="relative">
              <div className="relative group">
                <input 
                  type="text" 
                  value={searchQuery}
                  placeholder="Search products..."
                  className="w-full border border-zinc-200 p-4 pl-12 rounded-xl outline-none focus:border-black transition-all shadow-sm"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={18} className="animate-spin text-zinc-400" />
                  </div>
                )}
              </div>
              
              {/* Suggestions Dropdown - Improved Design */}
              {suggestions.length > 0 && (
                <div className="absolute z-20 w-full bg-white border border-zinc-200 shadow-2xl rounded-xl mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {suggestions.map((p: any) => (
                    <button 
                      key={p._id} 
                      onClick={() => addItem(p)} 
                      className="w-full text-left p-4 hover:bg-zinc-50 flex justify-between items-center border-b border-zinc-50 last:border-0 transition-colors group"
                    >
                      <div>
                        <p className="font-semibold text-sm text-zinc-900">{p.name}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">{p.brand}</p>
                      </div>
                      <Plus size={16} className="text-zinc-300 group-hover:text-black transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Items List */}
          <div className="space-y-4">
            {selectedItems.map(item => (
              <div key={item._id} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-100 animate-in zoom-in-95 duration-200">
                <div className="flex-1">
                  <p className="font-bold text-sm text-zinc-900">{item.name}</p>
                  <p className="text-xs text-zinc-500">AED {item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-2 py-1 shadow-sm">
                    <button className="hover:text-red-500 transition-colors" onClick={() => setSelectedItems(prev => prev.map(i => i._id === item._id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))}><Minus size={14}/></button>
                    <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                    <button className="hover:text-green-600 transition-colors" onClick={() => setSelectedItems(prev => prev.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i))}><Plus size={14}/></button>
                  </div>
                  <button onClick={() => setSelectedItems(prev => prev.filter(i => i._id !== item._id))} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {selectedItems.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-zinc-100 rounded-2xl">
                <p className="text-zinc-300 text-sm italic">No items selected yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Recipient Details Form */}
        <section className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm h-fit">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-900 block mb-8">02. Recipient Details</label>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: "Full Name", key: "name", type: "text" },
              { label: "Email Address", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "text" },
              { label: "Hotel/Company", key: "hotelName", type: "text" }
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400">{field.label}</label>
                <input 
                  required={field.key !== 'hotelName'} 
                  type={field.type}
                  className="w-full border border-zinc-200 p-3 rounded-lg outline-none focus:border-black transition-all text-sm text-zinc-900 bg-zinc-50 focus:bg-white" 
                  onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                />
              </div>
            ))}
            <button 
              disabled={loading || selectedItems.length === 0}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm mt-6 hover:bg-zinc-800 transition-all shadow-lg disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={18}/> Processing</span> : "Generate Quote"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}