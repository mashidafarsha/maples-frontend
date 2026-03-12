"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown, Package, LayoutDashboard } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const pathname = usePathname();

  const { user, isAuthenticated } = useSelector((state: any) => state.auth || {});
  const cartState = useSelector((state: any) => state.cart);
  const items = cartState?.items || [];
  const cartCount = items.length;

  // മൊബൈൽ മെനു തുറക്കുമ്പോൾ സ്ക്രോളിംഗ് തടയാൻ
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  // അഡ്മിൻ, സെല്ലർ, ലോഗിൻ പേജുകളിൽ ഹെഡർ കാണിക്കണ്ട
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  return (
    <nav className="fixed w-full z-[100] bg-white border-b border-zinc-100 py-4 shadow-sm text-black">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* 1. Logo */}
        <Link href="/" className="z-[101]" onClick={() => setIsMobileMenuOpen(false)}>
          <h1 className="text-2xl font-serif italic font-bold tracking-tight text-black">
            Maples<span className="text-zinc-300">.</span>
          </h1>
        </Link>

        {/* 2. Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="/products" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-60 transition-opacity">Collections</Link>
          
          {isAuthenticated && user?.role !== 'seller' && (
            <Link href="/orders" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-60 transition-opacity flex items-center gap-2">
              <Package size={12} strokeWidth={2.5} />
              My Orders
            </Link>
          )}

          {isAuthenticated && user?.role === 'seller' && (
            <Link href="/seller/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:opacity-60 transition-opacity flex items-center gap-2">
              <LayoutDashboard size={12} strokeWidth={2.5} />
              Seller Dashboard
            </Link>
          )}
        </div>

        {/* 3. Right Side Icons */}
        <div className="flex items-center gap-4 md:gap-6 z-[101]">
          
          {/* Desktop User Menu */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest outline-none"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 border border-zinc-200 text-black font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={12} className={`transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-[-1]" onClick={() => setIsUserMenuOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-4 w-52 bg-white border border-zinc-100 shadow-2xl rounded-2xl py-3 text-black"
                      >
                        <div className="px-6 py-2 mb-2 border-b border-zinc-50">
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Role</p>
                          <p className="text-[11px] font-bold uppercase text-emerald-600">{user?.role}</p>
                        </div>
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                          <User size={14} /> Profile
                        </Link>
                        <button 
                          onClick={() => { dispatch(logout()); setIsUserMenuOpen(false); }}
                          className="w-full text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                          <LogOut size={14} /> Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1">
                Login
              </Link>
            )}
          </div>

          {/* 🛒 Cart Icon */}
          <Link href="/cart" className="relative transition-transform hover:scale-110 active:scale-95 text-black">
            <ShoppingBag size={20} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 -mr-2 text-black" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* 4. Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4 }}
            className="fixed inset-0 bg-white z-[90] md:hidden flex flex-col pt-32 px-10 gap-8"
          >
            {isAuthenticated && (
              <div className="flex flex-col items-start gap-3 mb-4 border-b border-zinc-100 pb-6">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-2xl font-bold text-black border border-zinc-200">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Logged in as</p>
                  <p className="text-xl font-bold text-black uppercase">{user?.name}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic text-black">Collections</Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest text-zinc-500">Profile</Link>
                  {user?.role === 'seller' ? (
                    <Link href="/seller/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest text-emerald-600">Seller Dashboard</Link>
                  ) : (
                    <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold uppercase tracking-widest text-black">My Orders</Link>
                  )}
                  <button 
                    onClick={() => { dispatch(logout()); setIsMobileMenuOpen(false); }}
                    className="text-left text-xl font-bold uppercase tracking-widest text-red-500 mt-4 flex items-center gap-2"
                  >
                    Logout <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="inline-block bg-black text-white text-center py-4 font-black uppercase text-[12px] tracking-widest mt-4">
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}