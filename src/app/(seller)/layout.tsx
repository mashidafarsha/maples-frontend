import SellerSidebar from "@/components/seller/Sidebar";


export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SellerSidebar/>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}