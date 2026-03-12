import { AdminSidebar } from "@/components/admin-sidebar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b bg-white flex items-center px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="font-semibold text-zinc-700 uppercase tracking-wider text-sm">
            MapleSME Management System
          </h1>
        </header>
        <div className="p-8">
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </div>
      </main>
    </div>
  );
}