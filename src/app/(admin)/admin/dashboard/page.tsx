"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Revenue", value: "AED 4,25,000", icon: DollarSign, color: "text-emerald-600" },
    { title: "Active Vendors", value: "24", icon: Users, color: "text-blue-600" },
    { title: "Total Orders", value: "156", icon: ShoppingCart, color: "text-orange-600" },
    { title: "Growth Rate", value: "+12.5%", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-1"
      >
        <h2 className="text-2xl font-bold tracking-tight text-[#004aad]">Enterprise Overview</h2>
        <p className="text-zinc-500 text-sm">Welcome back, Admin. Here is what's happening today.</p>
      </motion.div>

      {/* Stats Cards (Bento Style) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Area (Placeholder for Charts/Tables) */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm bg-white p-6 min-h-[300px] flex items-center justify-center border-dashed border-2">
           <p className="text-zinc-400 italic">Sales Graph Component will be here</p>
        </Card>
        <Card className="col-span-3 border-none shadow-sm bg-white p-6 min-h-[300px] flex items-center justify-center border-dashed border-2">
           <p className="text-zinc-400 italic">Recent Activity Feed</p>
        </Card>
      </div>
    </div>
  );
}