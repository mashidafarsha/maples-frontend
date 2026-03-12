"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RootState } from "@/redux/store";

export default function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: string }) {
  const { user, token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else if (role && user?.role !== role) {
      router.push("/"); // Permission illenkil home-ilekku
    }
  }, [token, user, role, router]);

  return token ? <>{children}</> : null;
}