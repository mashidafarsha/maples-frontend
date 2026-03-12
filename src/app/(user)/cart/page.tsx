"use client";
import { useEffect, useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setCart as updateReduxCart } from "@/redux/slices/cartSlice";
import { getCart, updateCartQuantity, removeFromCart } from "@/services/cartService";

export default function CartPage() {
  const dispatch = useDispatch();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data.cart);
     
      dispatch(updateReduxCart(data.cart.items));
    } catch (error) {
      console.error("Error fetching cart", error);
    } finally {
      setLoading(false);
    }
  };


  
  const handleUpdateQty = async (productId: string, action: 'increment' | 'decrement') => {
    if (!cart) return;

    const originalCart = { ...cart };
    
  
    const updatedItems = cart.items.map((item: any) => {
      if (item.product._id === productId) {
        const newQty = action === 'increment' ? item.quantity + 1 : item.quantity - 1;
        if (newQty < 1) return item; 
        return { ...item, quantity: newQty };
      }
      return item;
    });

    const newTotal = updatedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    setCart({ ...cart, items: updatedItems, totalPrice: newTotal });
    dispatch(updateReduxCart(updatedItems));

    try {
      await updateCartQuantity(productId, action);
    } catch (error) {
      setCart(originalCart); 
      dispatch(updateReduxCart(originalCart.items));
    }
  };

  const handleRemove = async (productId: string) => {
    const originalCart = { ...cart };
    const updatedItems = cart.items.filter((item: any) => item.product._id !== productId);
    const newTotal = updatedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    setCart({ ...cart, items: updatedItems, totalPrice: newTotal });
    dispatch(updateReduxCart(updatedItems));

    try {
      await removeFromCart(productId);
    } catch (error) {
      setCart(originalCart);
      dispatch(updateReduxCart(originalCart.items));
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-zinc-200" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Loading Bag</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="bg-zinc-50 p-10 rounded-full">
          <ShoppingBag size={60} strokeWidth={1} className="text-zinc-300" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif italic">Your bag is empty</h2>
          <p className="text-zinc-400 text-xs uppercase tracking-widest">Discover our new arrivals</p>
        </div>
        <Link href="/products" className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 md:p-12 lg:p-20 animate-in fade-in duration-700">
      <div className="mb-16">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Review Items</p>
        <h1 className="text-5xl md:text-6xl font-serif italic">Shopping Bag</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* 📦 Items List */}
        <div className="lg:col-span-7 space-y-12">
          {cart.items.map((item: any) => (
            <div key={item.product._id} className="flex flex-col sm:flex-row gap-8 group pb-12 border-b border-zinc-100 last:border-0">
              {/* Image Box */}
           
<div className="w-full sm:w-40 h-52 bg-[#f9f9f9] overflow-hidden relative rounded-sm">
  <img 
    src={item.product?.images?.[0] || item.product?.image || "/placeholder.png"} 
    alt={item.product?.name} 
    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
    onError={(e) => {
      (e.target as HTMLImageElement).src = "/placeholder.png"; 
    }}
  />
</div>
              
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-zinc-900 tracking-tight">{item.product.name}</h3>
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{item.product.brand}</p>
                  </div>
                  <button onClick={() => handleRemove(item.product._id)} className="p-2 hover:bg-red-50 text-zinc-300 hover:text-red-500 rounded-full transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="mt-auto pt-8 flex justify-between items-end">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quantity</p>
                    <div className="flex items-center border border-zinc-200 rounded-full px-5 py-2 gap-8 w-fit bg-white shadow-sm">
                      <button onClick={() => handleUpdateQty(item.product._id, 'decrement')} className="text-zinc-400 hover:text-black transition-colors"><Minus size={14} /></button>
                      <span className="text-sm font-black w-4 text-center select-none">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product._id, 'increment')} className="text-zinc-400 hover:text-black transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-2xl font-serif italic text-zinc-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 💳 Order Summary */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-32 bg-zinc-50 p-10 md:p-14 rounded-[2rem] space-y-10">
            <h3 className="font-black uppercase text-[10px] tracking-[0.3em] text-zinc-400 border-b border-zinc-200 pb-6">Summary</h3>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Subtotal</span>
                <span className="font-bold text-lg">₹{cart.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Delivery</span>
                <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Free</span>
              </div>
              
              <div className="pt-10 border-t border-zinc-200 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-widest">Total</span>
                <div className="text-right">
                  <span className="text-4xl font-serif italic block">₹{cart.totalPrice.toLocaleString()}</span>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">VAT Included</p>
                </div>
              </div>
            </div>
            
            <Link href="/checkout" className="block pt-4">
              <button className="w-full bg-black text-white py-6 rounded-2xl font-black text-[11px] tracking-[0.3em] uppercase hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 shadow-xl shadow-zinc-200 active:scale-95">
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </Link>

            <div className="flex items-center justify-center gap-3 pt-4 text-zinc-400">
               <ShieldCheck size={16} />
               <span className="text-[9px] font-bold uppercase tracking-widest">Secure Checkout Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}