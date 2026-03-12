"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setCredentials } from "@/redux/slices/authSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { login } from "@/services/authService";
import { setCookie } from "cookies-next";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({ email, password });

      setCookie("token", data.accessToken, {
        maxAge: 15 * 60,
        path: "/",
        sameSite: "lax",
      });

      setCookie("refreshToken", data.refreshToken, {
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });

      setCookie("role", data.role, {
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      setCookie(
        "user",
        JSON.stringify({
          id: data._id,
          name: data.name,
          role: data.role,
        }),
        {
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        }
      );

      dispatch(
        setCredentials({
          user: { id: data._id, name: data.name, role: data.role },
          token: data.accessToken,
        })
      );

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "seller") {
        if (data.isApproved) {
          router.push("/seller/dashboard");
        } else {
          alert(
            "Your account is pending admin approval. Please contact support."
          );
        }
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      const msg =
        error.response?.data?.message ||
        "Login failed. Please check your credentials.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex w-1/2 bg-[#004aad] p-16 flex-col justify-between text-white relative"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="relative z-10">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-extrabold tracking-tight"
          >
            MapleSME <span className="text-blue-300">Portal</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-xl text-blue-100 max-w-md leading-relaxed"
          >
            The next generation of SME management. Unified, secure, and built
            for growth.
          </motion.p>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            {
              title: "Real-time Analytics",
              desc: "Monitor your growth as it happens.",
              icon: ArrowRight,
            },
            {
              title: "Enterprise Security",
              desc: "Your data is encrypted and safe.",
              icon: ShieldCheck,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.2 }}
              className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                <item.icon className="h-6 w-6 text-blue-200" />
              </div>
              <div>
                <p className="font-bold text-white">{item.title}</p>
                <p className="text-sm text-blue-100/80">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="relative z-10 text-sm text-blue-300/60">
          © 2026 MapleSME Digital Ecosystem.
        </p>
      </motion.div>

      {/* --- Right Side: Login Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-[#004aad]">MapleSME</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Welcome Back
            </h2>
            <p className="text-zinc-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@maplesme.com"
                  className="pl-11 h-14 rounded-xl border-zinc-200 focus:border-[#004aad] focus:ring-[#004aad]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password font-medium text-zinc-700">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#004aad] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-11 h-14 rounded-xl border-zinc-200 focus:border-[#004aad] focus:ring-[#004aad]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              className="w-full h-14 bg-[#004aad] hover:bg-[#003a8c] text-white font-bold rounded-xl shadow-lg transition-all text-lg"
              type="submit"
              disabled={loading}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loader" className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Verifying...
                  </motion.div>
                ) : (
                  <motion.span key="text">Sign In to Portal</motion.span>
                )}
              </AnimatePresence>
            </Button>
          </form>
          <p className="text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#004aad] font-bold hover:underline"
            >
              Create an Account
            </Link>
          </p>

          <p className="text-center text-sm text-zinc-500">
            Issues with access?{" "}
            <span className="text-[#004aad] font-bold cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
