"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux"; 
import { logout } from "@/redux/slices/authSlice"; 
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  LogOut,
  Store
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/seller/dashboard" },
  { name: "My Products", icon: Package, href: "/seller/products" },
  { name: "Add Product", icon: PlusCircle, href: "/seller/products/add" },
  { name: "Orders", icon: ShoppingBag, href: "/seller/orders" },
  { name: "Analytics", icon: BarChart3, href: "/seller/analytics" },
];

export default function SellerSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();

  // 🚀 Logout function
  const handleLogout = () => {
    dispatch(logout());
    
    router.push("/login");
  };

  return (
    <div className="w-72 h-screen sticky top-0 bg-white border-r border-gray-100 p-6 flex flex-col justify-between">
      <div>
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="bg-black p-2 rounded-xl text-white">
            <Store size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic">
            Seller <span className="text-gray-400 text-xs block -mt-1 not-italic tracking-normal">Central</span>
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                  isActive 
                  ? "bg-black text-white shadow-lg shadow-black/10" 
                  : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <item.icon size={22} className={isActive ? "text-white" : "group-hover:scale-110 transition-transform"} />
                <span className="font-bold text-sm tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        <Link 
          href="/seller/settings"
          className="flex items-center gap-4 px-4 py-4 text-gray-400 hover:text-black transition-all font-bold text-sm"
        >
          <Settings size={22} />
          Settings
        </Link>
        
        {/* 🚀 Logout Button */}
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-4 px-4 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-all active:scale-95 outline-none"
        >
          <LogOut size={22} />
          Sign Out
        </button>
      </div>
    </div>
  );
}