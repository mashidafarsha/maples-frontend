"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { setCredentials } from "@/redux/slices/authSlice";
import { setCart } from "@/redux/slices/cartSlice"; 
import { getCookie } from "cookies-next";
import api from "@/utils/api"; 

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getCookie("token");
    const userCookie = getCookie("user");

    if (token && userCookie) {
      try {
        const userData = JSON.parse(userCookie as string);

        dispatch(
          setCredentials({
            user: userData,
            token: token as string,
          })
        );

        const fetchUserCart = async () => {
          try {
            const res = await api.get("/cart"); 
            if (res.data.success) {
              dispatch(setCart(res.data.cart.items)); 
            }
          } catch (err) {
            console.error("Error fetching cart on refresh:", err);
          }
        };

        fetchUserCart();


        if (userData.role === "seller" && pathname === "/login") {
          router.push("/seller/dashboard");
        }
        
        if (userData.role === "admin" && pathname === "/login") {
          router.push("/admin/dashboard");
        }

      } catch (err) {
        console.error("Auth initialization failed", err);
      }
    }
  }, [dispatch, router, pathname]);

  return <>{children}</>;
}