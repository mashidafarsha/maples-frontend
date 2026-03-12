"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, UserCheck, Loader2, ArrowRight } from "lucide-react";
import { register } from "@/services/authService";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Default role
  });
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* --- Left Side: Branding (Login പേജിന് സമാനമായത്) --- */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-1/2 bg-[#004aad] p-16 flex-col justify-between text-white relative"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight">
            MapleSME <span className="text-blue-300">Portal</span>
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-md leading-relaxed">
            Join the fastest growing SME ecosystem. Create your account and
            start scaling today.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <UserCheck className="text-blue-200" />
            <p className="text-sm">Verified Business Profiles</p>
          </div>
        </div>
        <p className="relative z-10 text-sm text-blue-300/60">
          © 2026 MapleSME Digital Ecosystem.
        </p>
      </motion.div>

      {/* --- Right Side: Register Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-zinc-900">Create Account</h2>
            <p className="text-zinc-500 mt-2">
              Join us and start your journey.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="pl-11 h-12"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-11 h-12"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <select
                id="role"
                className="w-full h-12 rounded-xl border border-zinc-200 bg-white px-3 focus:ring-2 focus:ring-[#004aad] outline-none transition-all"
                value={formData.role}
                onChange={handleChange as any}
              >
                <option value="user">Customer / Buyer</option>
                <option value="seller">Seller / Merchant</option>
              </select>
              {formData.role === "seller" && (
                <p className="text-xs text-amber-600 font-medium">
                  Note: Seller accounts require admin approval.
                </p>
              )}
            </div>

            <Button
              className="w-full h-12 bg-[#004aad] hover:bg-[#003a8c] text-white rounded-xl font-bold transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#004aad] font-bold hover:underline"
            >
              Login here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
