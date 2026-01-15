import axiosInstance from "@/lib/axios"

export const ordersAPI = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/orders")
    return response.data
  },

  getByUser: async (userId) => {
    const response = await axiosInstance.get(`/api/orders/user/${userId}`)
    return response.data
  },

  getDetails: async (orderId) => {
    const response = await axiosInstance.get(`/api/orders/details/${orderId}`)
    return response.data
  },

  updateStatus: async (orderId, status) => {
    const response = await axiosInstance.put("/api/orders/status", {
      orderId,
      status,
    })
    return response.data
  },
}
