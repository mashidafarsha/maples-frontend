"use client";
import { useEffect, useState } from "react";
import { getMyOrders } from "@/services/orderService";
import { FileDown, Package, Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'processing': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-zinc-100 text-zinc-600 border-zinc-200';
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-zinc-900" size={24} strokeWidth={1} />
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Loading Archive</p>
    </div>
  );

  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12 lg:py-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-serif italic mb-2 tracking-tighter">My Orders.</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Order history and invoices</p>
        </div>
        <Link href="/" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-all">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Studio
        </Link>
      </header>

      {orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="h-96 flex flex-col items-center justify-center border border-zinc-100 rounded-[2rem] bg-[#fafafa]"
        >
          <Package size={40} strokeWidth={1} className="text-zinc-300 mb-6" />
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">No acquisitions found</p>
          <Link href="/" className="mt-4 text-[10px] underline underline-offset-4 font-bold uppercase tracking-tighter hover:text-zinc-500">Start Shopping</Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {orders.map((order, index) => (
            <motion.div 
              key={order._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white border border-zinc-100 rounded-3xl p-8 hover:shadow-2xl hover:shadow-zinc-100 transition-all duration-500"
            >
              <div className="flex flex-col md:flex-row justify-between gap-8">
                {/* Info Section */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] px-3 py-1 rounded-full border font-black uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                      ID: {order._id.slice(-8)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 mb-1">
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-GB', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                      })}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      {order.items?.length} {order.items?.length === 1 ? 'Object' : 'Objects'} collected
                    </p>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex -space-x-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="w-10 h-14 rounded-md border-2 border-white bg-zinc-100 overflow-hidden shadow-sm">
                        <img 
                          src={item.product?.images?.[0] || "/placeholder.png"} 
                          alt="" 
                          className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Action Section */}
                <div className="flex flex-row md:flex-col justify-between items-end md:text-right border-t md:border-t-0 pt-6 md:pt-0 border-zinc-50">
                  <div>
                    <p className="text-2xl font-serif italic text-zinc-900">₹{order.totalPrice?.toLocaleString() || "0"}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Grand Total</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.invoiceUrl && (
                      <a 
                        href={`${BASE_URL}${order.invoiceUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-700 transition-all text-[9px] font-bold uppercase tracking-widest shadow-xl shadow-zinc-200"
                      >
                        Invoice <FileDown size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <footer className="mt-20 text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.5em] text-zinc-300">End of records</p>
      </footer>
    </div>
  );
}