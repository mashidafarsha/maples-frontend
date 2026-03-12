"use client";

import { LayoutDashboard, Users, ShoppingCart, Settings, LogOut, Tags, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"; // 👈 useRouter ആഡ് ചെയ്തു
import { useDispatch } from "react-redux"; // 👈 useDispatch ആഡ് ചെയ്തു
import { logout } from "@/redux/slices/authSlice"; // 👈 ലോഗൗട്ട് ആക്ഷൻ ഇമ്പോർട്ട് ചെയ്തു
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Vendors", href: "/admin/vendors", icon: Users },
  { name: "Categories", href: "/admin/categories", icon: Tags },
  { name: "Quotations", href: "/admin/quotations", icon: FileText },
  { name: "Products", href: "/admin/products", icon: ShoppingCart },
  { name: "Settings", href: "/admin/", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

 
  const handleLogout = () => {
    dispatch(logout());

    router.push("/login");
  };

  return (
    <div className="w-64 bg-[#004aad] text-white min-h-screen p-4 flex flex-col">
      <div className="mb-10 mt-4 px-4">
        <h1 className="text-xl font-extrabold tracking-tighter">MAPLE<span className="text-blue-300">SME</span></h1>
        <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-1">Management Suite</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              pathname === item.href 
                ? "bg-white text-[#004aad] shadow-lg" 
                : "text-blue-100 hover:bg-white/10"
            )}
          >
            <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-[#004aad]" : "text-blue-300 group-hover:text-white")} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* 🚀 Sign Out Button */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-4 py-3 w-full text-blue-200 hover:text-white hover:bg-red-500/20 rounded-xl transition-all outline-none"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}