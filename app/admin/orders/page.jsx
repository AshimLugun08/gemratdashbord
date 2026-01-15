"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { ordersAPI } from "@/lib/api/orders"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Loader } from "@/components/ui/loader"

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"]

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0)
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      console.log("[v0] Orders API response:", data)
      setOrders(data.orders || data || [])
    } catch (err) {
      console.log("[v0] Orders fetch error:", err)
      setError(err.response?.data?.message || "Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

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
      fetchOrders()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status")
    } finally {
      setStatusUpdating(null)
    }
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
      render: (row) => <span className="font-mono text-sm">{(row._id || row.id)?.slice(-8)}</span>,
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => row.userId?.name || row.user?.name || row.customerName || "N/A",
    },
    {
      key: "total",
      label: "Total",
      render: (row) => formatPrice(row.totalAmount || row.total),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <select
            value={row.status || "pending"}
            onChange={(e) => handleStatusChange(row._id || row.id, e.target.value)}
            disabled={statusUpdating === (row._id || row.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(row.status)}`}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: "date",
      label: "Date",
      render: (row) => new Date(row.createdAt || row.date).toLocaleDateString(),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-gray-500">Manage customer orders and update their status</p>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} error={error} emptyMessage="No orders found." />

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
          <div className="flex h-40 items-center justify-center">
            <Loader size="lg" />
          </div>
        ) : orderDetails || selectedOrder ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-medium">
                  {(orderDetails?._id || selectedOrder?._id || selectedOrder?.id)?.slice(-8)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(orderDetails?.status || selectedOrder?.status)}`}
                >
                  {(orderDetails?.status || selectedOrder?.status || "pending").charAt(0).toUpperCase() +
                    (orderDetails?.status || selectedOrder?.status || "pending").slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">
                  {orderDetails?.userId?.name ||
                    selectedOrder?.userId?.name ||
                    orderDetails?.user?.name ||
                    selectedOrder?.customerName ||
                    "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-medium">
                  {formatPrice(
                    orderDetails?.totalAmount ||
                      selectedOrder?.totalAmount ||
                      orderDetails?.total ||
                      selectedOrder?.total,
                  )}
                </p>
              </div>
            </div>

            {(orderDetails?.items || selectedOrder?.items) && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Items</h4>
                <div className="space-y-2">
                  {(orderDetails?.items || selectedOrder?.items).map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.productId?.image || item.image || "/placeholder.svg?height=40&width=40&query=product"
                          }
                          alt={item.productId?.name || item.title || item.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{item.productId?.name || item.title || item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedOrder(null)
                  setOrderDetails(null)
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Unable to load order details</p>
        )}
      </Modal>
    </div>
  )
}
