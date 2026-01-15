import axiosInstance from "@/lib/axios"

export const productsAPI = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/products")
    return response.data
  },

  create: async (productData) => {
    const response = await axiosInstance.post("/api/products", productData)
    return response.data
  },

  update: async (productId, productData) => {
    const response = await axiosInstance.put(`/api/products/${productId}`, productData)
    return response.data
  },

  delete: async (productId) => {
    const response = await axiosInstance.delete(`/api/products/${productId}`)
    return response.data
  },

  deleteAll: async () => {
    const response = await axiosInstance.delete("/api/products/delete/all")
    return response.data
  },
}
