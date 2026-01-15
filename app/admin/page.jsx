"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import axios from "axios"

import { useAuth } from "@/context/auth-context"
import {
  Package,
  ShoppingCart,
  ImageIcon,
  TrendingUp,
  Users,
} from "lucide-react"

import { ordersAPI } from "@/lib/api/orders"
import { productsAPI } from "@/lib/api/products"
import { slidersAPI } from "@/lib/api/sliders"

export default function AdminDashboard() {
  const { user } = useAuth()

  const [counts, setCounts] = useState({
    products: "--",
    orders: "--",
    sliders: "--",
    users: "--",
    revenue: "--",
  })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [
          ordersData,
          productsData,
          slidersData,
          usersRes,
        ] = await Promise.all([
          ordersAPI.getAll().catch(() => ({ orders: [] })),
          productsAPI.getAll().catch(() => ({ products: [] })),
          slidersAPI.getAll().catch(() => ({ sliders: [] })),
          axios
            .get("https://testandroidapi.onrender.com/api/auth/users")
            .catch(() => ({ data: { users: [] } })),
        ])

        const orders = ordersData.orders || ordersData || []
        const products = productsData.products || productsData || []
        const sliders = slidersData.sliders || slidersData || []
        const users = usersRes.data.users || []

        const revenue = orders.reduce(
          (sum, order) =>
            sum + (order.totalAmount || order.total || 0),
          0
        )

        setCounts({
          products: products.length,
          orders: orders.length,
          sliders: sliders.length,
          users: users.length,
          revenue: `₹${revenue.toLocaleString("en-IN")}`,
        })
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      }
    }

    fetchCounts()
  }, [])

  const stats = [
    {
      label: "Products",
      value: counts.products,
      icon: Package,
      href: "/admin/products",
      color: "bg-blue-500",
    },
    {
      label: "Orders",
      value: counts.orders,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-green-500",
    },
    {
      label: "Sliders",
      value: counts.sliders,
      icon: ImageIcon,
      href: "/admin/sliders",
      color: "bg-purple-500",
    },
    {
      label: "Users",
      value: counts.users,
      icon: Users,
      href: "/admin/users",
      color: "bg-indigo-500",
    },
    {
      label: "Revenue",
      value: counts.revenue,
      icon: TrendingUp,
      href: "#",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here is what is happening with your store today.
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg ${stat.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            View Orders
          </Link>
          <Link
            href="/admin/sliders"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Manage Sliders
          </Link>
          <Link
            href="/admin/users"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            View Users
          </Link>
        </div>
      </div>
    </div>
  )
}
