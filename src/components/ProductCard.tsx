"use client";
import { Eye, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { RootState } from "@/redux/store"; 
import { addToCart } from "@/services/cartService"; 
import { setCart } from "../redux/slices/cartSlice"; 
import Image from "next/image";
import toast from "react-hot-toast";

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();
  const dispatch = useDispatch(); 
  
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart"); 
      router.push("/login");
      return;
    }

    setLoading(true);
 
    const toastId = toast.loading("Adding to cart..."); 

    try {
      const data = await addToCart(product._id, 1);
      
      if (data.success) {
        dispatch(setCart(data.cart.items)); 
  
        toast.success(`${product.name} added to cart!`, { id: toastId });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message, { id: toastId }); // 4. Error Toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group flex flex-col cursor-pointer bg-white">
      {/* Product Image Section */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#f9f9f9]">
      <Image
  src={product.images?.[0]}
  alt={product.name}
  fill
  className="object-cover group-hover:scale-105 transition-transform duration-1000"
/>
        
        {/* Overlay Buttons */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
            <button 
              onClick={handleCartClick}
              disabled={loading}
              className="bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-all shadow-sm flex items-center justify-center"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingCart size={18} />
              )}
            </button>
            <Link href={`/products/${product._id}`}>
              <div className="bg-white text-black p-3 rounded-full hover:bg-black hover:text-white transition-all shadow-sm">
                <Eye size={18} />
              </div>
            </Link>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="py-4 space-y-1">
        <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
          {product.brand}
        </p>
        <h3 className="text-sm font-medium text-zinc-900 truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <p className="font-serif italic text-lg">
            AED {product.price.toLocaleString()}
          </p>
          <button className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-0.5 hover:text-gray-500 transition-colors">
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
}