"use client"

import { useState, useEffect, useMemo } from "react"
import { Eye, Search, Filter, ArrowUpDown, Calendar, RefreshCcw, XCircle } from "lucide-react"
import { ordersAPI } from "@/lib/api/orders"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const statusOptions = ["all", "pending", "processing", "shipped", "delivered", "cancelled"]

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0)
}

export default function OrdersPage() {
  // Data States
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Filter & Sort States
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" })
  const [sortBy, setSortBy] = useState("newest")
  
  // Modal & Detail States
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ordersAPI.getAll()
      setOrders(data.orders || data || [])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // --- Core Filtering & Sorting Logic ---
  const processedOrders = useMemo(() => {
    let result = [...orders]

    // 1. Search Filter (ID or Customer Name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(o => 
        (o._id || o.id || "").toLowerCase().includes(term) ||
        (o.userId?.name || o.user?.name || o.customerName || "").toLowerCase().includes(term)
      )
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter)
    }

    // 3. Date Range Filter
    if (dateFilter.start) {
      result = result.filter(o => new Date(o.createdAt) >= new Date(dateFilter.start))
    }
    if (dateFilter.end) {
      const endDate = new Date(dateFilter.end)
      endDate.setHours(23, 59, 59)
      result = result.filter(o => new Date(o.createdAt) <= endDate)
    }

    // 4. Sorting Logic
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      const priceA = a.totalAmount || a.total || 0
      const priceB = b.totalAmount || b.total || 0

      if (sortBy === "newest") return dateB - dateA
      if (sortBy === "oldest") return dateA - dateB
      if (sortBy === "amount_high") return priceB - priceA
      if (sortBy === "amount_low") return priceA - priceB
      return 0
    })

    return result
  }, [orders, searchTerm, statusFilter, dateFilter, sortBy])

  const handleViewDetails = async (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
    setDetailsLoading(true)
    try {
      const details = await ordersAPI.getDetails(order._id || order.id)
      setOrderDetails(details)
    } catch (err) {
      setOrderDetails(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId)
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      // Update local state for immediate feedback
      setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId) ? { ...o, status: newStatus } : o))
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status")
    } finally {
      setStatusUpdating(null)
    }
  }

  const resetFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setDateFilter({ start: "", end: "" })
    setSortBy("newest")
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const columns = [
    {
      key: "orderId",
      label: "Order ID",
      render: (row) => <span className="font-mono text-sm">{(row._id || row.id)?.slice(-8).toUpperCase()}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => row.userId?.name || row.user?.name || row.customerName || "N/A",
    },
    {
      key: "total",
      label: "Total",
      render: (row) => <span className="font-semibold">{formatPrice(row.totalAmount || row.total)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <select
          value={row.status || "pending"}
          onChange={(e) => handleStatusChange(row._id || row.id, e.target.value)}
          disabled={statusUpdating === (row._id || row.id)}
          className={`rounded-full border-none px-3 py-1 text-xs font-bold ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-orange-500 ${getStatusColor(row.status)}`}
        >
          {statusOptions.filter(s => s !== "all").map((status) => (
            <option key={status} value={status}>
              {status.toUpperCase()}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.createdAt || row.date).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
      }),
    },
      {
    key: "shippingAddress",
    label: "Shipping Address",
    render: (row) => (
      <span className="text-sm text-gray-700 line-clamp-2 max-w-260px block">
        {row.shippingAddress || row.address || "N/A"}
      </span>
    ),
  },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="rounded-lg p-2 text-orange-600 transition-colors hover:bg-orange-50"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-1 text-gray-500">Track and update customer order statuses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} className="flex gap-2">
            <RefreshCcw className="h-4 w-4" /> Refresh
          </Button>
          {(searchTerm || statusFilter !== "all" || dateFilter.start) && (
             <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-600 hover:text-red-700">
                <XCircle className="mr-2 h-4 w-4" /> Clear Filters
             </Button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Order ID or Name..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500">Status</Label>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2 lg:col-span-1">
          <Label className="text-xs font-bold uppercase text-gray-500">Date Range</Label>
          <div className="flex gap-2">
            <Input type="date" value={dateFilter.start} onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})} className="text-xs" />
            <Input type="date" value={dateFilter.end} onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})} className="text-xs" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-gray-500">Sort By</Label>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount: High to Low</option>
              <option value="amount_low">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <DataTable 
        columns={columns} 
        data={processedOrders} 
        loading={loading} 
        error={error} 
        emptyMessage="No orders found matching your criteria." 
      />

      {/* Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
          setOrderDetails(null)
        }}
        title="Order Details"
        size="lg"
      >
        {detailsLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : orderDetails || selectedOrder ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                <p className="font-mono text-sm">
                  {(orderDetails?._id || selectedOrder?._id || selectedOrder?.id)?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getStatusColor(orderDetails?.status || selectedOrder?.status)}`}>
                  {(orderDetails?.status || selectedOrder?.status || "pending").toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Customer</p>
                <p className="font-medium">{orderDetails?.userId?.name || selectedOrder?.customerName || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Grand Total</p>
                <p className="font-bold text-orange-600">
                  {formatPrice(orderDetails?.totalAmount || selectedOrder?.totalAmount)}
                </p>
              </div>
            </div>

            {/* Item List */}
            <div>
              <h4 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
                Order Items <span className="text-xs font-normal bg-gray-200 px-2 rounded-full">{(orderDetails?.items || selectedOrder?.items)?.length}</span>
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {(orderDetails?.items || selectedOrder?.items)?.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productId?.image || item.image || "/placeholder.svg?height=40&width=40"}
                        alt="product"
                        className="h-12 w-12 rounded object-cover border"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.productId?.name || item.name}</p>
                        <p className="text-xs text-gray-500">Quantity: <span className="font-bold">{item.quantity}</span></p>
                      </div>
                    </div>
                    <p className="font-bold text-sm">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsModalOpen(false)}>Close Panel</Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">Unable to load details.</div>
        )}
      </Modal>
    </div>
  )
}