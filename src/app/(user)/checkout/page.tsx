"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ArrowLeft, Truck, ShieldCheck, Lock } from "lucide-react";
import { placeOrder } from "@/services/orderService";
import { getCart } from "@/services/cartService";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [address, setAddress] = useState({
    address: "",
    city: "",
    pincode: "",
    phone: ""
  });

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const data = await getCart();
        setCart(data.cart);
      } catch (error) {
        console.error("Error fetching cart", error);
      } finally {
        setFetchingCart(false);
      }
    };
    fetchCartData();
  }, []);

  const calculatedTotal = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items?.length) return;
    setLoading(true);
    try {
      const response = await placeOrder(address);
      if (response.success) {
        setOrderSuccess(true);
        setTimeout(() => router.push("/"), 3000);
      }
    } catch (error: any) {
      alert("Order failed: " + (error.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCart) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-300" size={24} strokeWidth={1} />
    </div>
  );

  if (orderSuccess) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white space-y-6">
      <CheckCircle2 size={60} strokeWidth={1} className="text-zinc-900" />
      <div className="text-center">
        <h1 className="text-2xl font-serif italic mb-1">Order Received.</h1>
        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400">Processing your selection...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-6 py-12 lg:py-20">
        
        {/* Top Minimal Nav */}
        <div className="flex justify-between items-center mb-16">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-black transition-all">
            <ArrowLeft size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Bag</span>
          </button>
          <div className="flex items-center gap-2 text-zinc-400">
            <Lock size={12} /> <span className="text-[9px] font-bold uppercase tracking-widest italic">Encrypted</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Information Section (Left) */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="text-2xl font-serif italic mb-10 tracking-tight">Delivery Details</h2>
            
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              <div className="space-y-1 group">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">Street Address</label>
                <input required className="w-full border-b border-zinc-100 py-2 outline-none text-[13px] tracking-tight focus:border-black transition-all bg-transparent" 
                  onChange={(e) => setAddress({ ...address, address: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-12">
                <div className="space-y-1 group">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">City</label>
                  <input required className="w-full border-b border-zinc-100 py-2 outline-none text-[13px] tracking-tight focus:border-black transition-all bg-transparent" 
                    onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="space-y-1 group">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">Pincode</label>
                  <input required className="w-full border-b border-zinc-100 py-2 outline-none text-[13px] tracking-tight focus:border-black transition-all bg-transparent" 
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1 group pb-4">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 group-focus-within:text-black transition-colors">Phone</label>
                <input required type="tel" className="w-full border-b border-zinc-100 py-2 outline-none text-[13px] tracking-tight focus:border-black transition-all bg-transparent" 
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
              </div>

              <div className="pt-4">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Payment Method</p>
                <div className="flex items-center gap-4 p-4 border border-zinc-100 rounded-sm bg-zinc-50/50">
                  <Truck size={16} strokeWidth={1} className="text-zinc-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Cash on Delivery</span>
                </div>
              </div>
            </form>
          </div>

          {/* Summary Section (Right) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-sm shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 pb-4 border-b border-zinc-50">Collection</h3>
              
              <div className="max-h-[280px] overflow-y-auto space-y-6 mb-10 pr-2">
                {cart?.items.map((item: any) => (
                  <div key={item.product._id} className="flex gap-4 items-center">
                    <div className="w-12 h-16 bg-zinc-50 rounded-sm overflow-hidden flex-shrink-0">
                      <img src={item.product.images?.[0]} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold uppercase tracking-tight truncate">{item.product.name}</h4>
                      <p className="text-[9px] text-zinc-400 mt-0.5 italic font-serif">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-zinc-50 space-y-3">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{calculatedTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Total</span>
                  <span className="text-2xl font-serif italic text-zinc-900">₹{calculatedTotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                form="checkout-form"
                disabled={loading || !cart?.items?.length} 
                className="w-full bg-zinc-900 text-white py-4 mt-8 rounded-sm font-bold text-[9px] tracking-[0.3em] uppercase hover:bg-black transition-all active:scale-[0.98] disabled:bg-zinc-200 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <>Complete Order <ShieldCheck size={12} /></>}
              </button>
            </div>
            
            <p className="text-[8px] text-center text-zinc-400 uppercase tracking-[0.2em] px-10 leading-relaxed">
              By completing your order, you agree to our terms of service and private curating policy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}