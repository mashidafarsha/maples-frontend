"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/utils/api";
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Loader2,
  PlusCircle,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function SellerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);

  // AUTH PROTECTION: Only redirect if NOT authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: stats, isLoading } = useSWR(
    isAuthenticated && user?.role === "seller" ? "/seller/stats" : null, 
    fetcher
  );

  if (!isAuthenticated || isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="animate-spin text-zinc-200" size={45} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Verifying Seller Account</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Revenue",
      value: `AED${stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "+12.5%"
    },
    {
      title: "Orders Received",
      value: stats?.totalOrders || "0",
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "New Orders"
    },
    {
      title: "Active Products",
      value: stats?.totalProducts || "0",
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: "In Stock"
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Seller Control Panel</p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
              Seller <span className="text-zinc-200">Overview</span>
            </h1>
            <p className="text-zinc-500 font-medium mt-4">Welcome back, {user?.name || "Partner"}.</p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/" className="flex items-center gap-3 border-2 border-zinc-100 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all">
               Visit Home
            </Link>
            <Link href="/seller/add-product" className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200">
              <PlusCircle size={16} /> Add Product
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div key={i} className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm hover:shadow-2xl transition-all group">
              <div className="flex justify-between items-start mb-8">
                <div className={`${card.bg} ${card.color} w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon size={26} />
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full italic">
                  {card.trend}
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{card.title}</p>
              <h2 className="text-4xl font-black text-zinc-900">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* Orders & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 bg-zinc-50 rounded-[3.5rem] p-10 border border-zinc-100/50">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black uppercase tracking-tight italic">Recent Activity</h3>
              <Link href="/seller/orders" className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1">View All Orders</Link>
            </div>
            
            <div className="space-y-4">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-transparent hover:border-zinc-200 transition-all shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="bg-zinc-50 p-4 rounded-2xl text-zinc-400">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase">Order #{order._id.slice(-6)}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">AED {order.totalPrice}</p>
                      <span className="text-[9px] font-black uppercase text-white bg-black px-3 py-1 rounded-full">{order.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-[2.5rem]">
                  <p className="text-zinc-400 font-bold italic uppercase tracking-widest text-xs">Waiting for orders...</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
               <TrendingUp className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-125 transition-transform duration-1000" size={250} />
               <div className="relative z-10">
                 <h3 className="text-3xl font-black mb-4 leading-[1.1] italic">Market <br/> Leader.</h3>
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 leading-loose">Store health is optimal.</p>
                 <button className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:invert transition-all flex items-center gap-2">
                   Analytics <ArrowUpRight size={14} />
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}