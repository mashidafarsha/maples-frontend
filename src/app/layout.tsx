import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import AuthInit from "@/components/AuthInit";
import Header from "@/components/Header"; // 👈 ഹെഡർ ഇമ്പോർട്ട് ചെയ്യുക
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maples | Luxury Hotel Supplies",
  description: "High-speed premium hospitality solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AuthInit>
           
            <Header /> 
            
            <main>
              {children}
              <Toaster 
          position="top-center" 
          reverseOrder={false} 
        />
            </main>
          </AuthInit>
        </Providers>
      </body>
    </html>
  );
}