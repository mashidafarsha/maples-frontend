"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import api from "@/utils/api";
import ProductCard from "@/components/ProductCard";
import { 
  ArrowRight, 
  ChevronRight, 
  Loader2, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Mail, 
  MapPin,
  Image as ImageIcon,
  Search
} from "lucide-react";
import Image from "next/image";
import banner from '../../public/images/banner.webp';
import QuotationForm from "@/components/QuotationForm";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");


  const { data: productsData, isLoading: pLoading } = useSWR("/products?limit=8", fetcher);
  const { data: categoriesData, isLoading: cLoading } = useSWR("/categories?limit=4", fetcher);

  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${searchQuery}`);
    }
  };

  return (
    <div className="bg-white">
      {/* 🚀 1. Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
  <div className="absolute inset-0 z-0">
    <Image 
      src={banner} 
      alt="Luxury Hotel Supplies Banner"
      fill 
      priority 
      className="object-cover"
      placeholder="blur"
      quality={90} 
    />

    <div className="absolute inset-0 bg-black/50" /> 
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white/10" />
  </div>
  
  <div className="container mx-auto px-6 relative z-10 text-white">
    <p className="text-zinc-300 uppercase tracking-[0.4em] font-black text-[10px] mb-4">
      Established 2005 • Premium Quality
    </p>
    <h1 className="text-6xl md:text-8xl font-serif italic tracking-tighter mb-8 leading-tight">
      Refined <br /> <span className="text-white/80">Hospitality</span>
    </h1>

  
    <form onSubmit={handleSearch} className="max-w-2xl relative group">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={20} />
      <input 
        type="text"
        placeholder="Search for linens, amenities, or furniture..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
       
        className="w-full bg-black/20 backdrop-blur-md border border-white/20 p-6 pl-16 rounded-full text-white placeholder:text-zinc-400 outline-none focus:bg-white focus:text-black focus:border-white transition-all shadow-2xl"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-lg">
        Search
      </button>
    </form>
  </div>
</section>

      {/* 🚀 2. Dynamic Categories Section */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Our Collections</p>
            <h2 className="text-4xl font-serif italic font-medium text-zinc-900">Curated Categories</h2>
          </div>
          <Link href="/categories" className="text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all border-b border-black pb-1">
            Browse All <ArrowRight size={14} />
          </Link>
        </div>

        {cLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-32">
            {categories.map((cat: any) => (
              <Link href={`/products?category=${cat._id}`} key={cat._id} className="group relative h-[450px] overflow-hidden cursor-pointer block rounded-3xl">
                {cat.image ? (
                  <img 
                    src={cat.image} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={cat.name}
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                    <ImageIcon size={48} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-all" />
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-xl font-bold uppercase tracking-tighter mb-1">{cat.name}</h3>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    View Items <ChevronRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 🚀 3. Featured Products */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-serif italic text-zinc-900">Trending Essentials</h2>
            <div className="h-[1px] flex-1 bg-zinc-100" />
          </div>
          
          {pLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
              {products.map((p: any) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 4. Quotation Section */}
      <section className="bg-zinc-50 py-32 rounded-[4rem] mx-4 mb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-4">Bulk Orders & Corporate Supply</p>
            <h2 className="text-5xl md:text-6xl font-serif italic text-zinc-900 leading-tight">Professional <br /> Digital Quotation</h2>
          </div>
          <div className="max-w-4xl mx-auto bg-white p-2 rounded-[3rem] shadow-2xl shadow-zinc-200/50">
            <QuotationForm />
          </div>
        </div>
      </section>

      {/* 🚀 5. Footer */}
      <footer className="bg-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <h3 className="text-3xl font-serif italic font-bold tracking-tight">Maples<span className="text-zinc-200">.</span></h3>
            <p className="text-gray-400 text-[11px] leading-relaxed tracking-wider font-medium uppercase">
              Premium hotel and hospitality furnishing solutions. Elevating global standards in luxury since 2005.
            </p>
            <div className="flex gap-6">
              <Instagram size={18} className="text-zinc-300 hover:text-black transition-colors cursor-pointer" />
              <Facebook size={18} className="text-zinc-300 hover:text-black transition-colors cursor-pointer" />
              <Linkedin size={18} className="text-zinc-300 hover:text-black transition-colors cursor-pointer" />
            </div>
          </div>

          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-8 text-zinc-900">Collections</h4>
            <ul className="space-y-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <li className="hover:text-black cursor-pointer transition-colors">Bed Linen</li>
              <li className="hover:text-black cursor-pointer transition-colors">Bath Supplies</li>
              <li className="hover:text-black cursor-pointer transition-colors">Room Accessories</li>
              <li className="hover:text-black cursor-pointer transition-colors">Furniture</li>
            </ul>
          </div>

          <div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-8 text-zinc-900">Legal</h4>
            <ul className="space-y-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <li className="hover:text-black cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-black cursor-pointer transition-colors">Terms of Use</li>
              <li className="hover:text-black cursor-pointer transition-colors">Shipping Policy</li>
            </ul>
          </div>

          <div className="bg-zinc-50 p-8 rounded-[2rem]">
            <h4 className="font-black uppercase text-[10px] tracking-[0.2em] mb-6 text-zinc-900">Connect</h4>
            <div className="space-y-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              <p className="flex items-center gap-3"><Mail size={14} className="text-zinc-900"/> sales@maplesme.com</p>
              <p className="flex items-center gap-3"><MapPin size={14} className="text-zinc-900"/> Dubai, UAE</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-gray-50 flex justify-between items-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
          <p>© 2026 Maples Hotel Supplies.</p>
          <p>Middle East • International</p>
        </div>
      </footer>
    </div>
  );
}