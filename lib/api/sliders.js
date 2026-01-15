import axiosInstance from "@/lib/axios"

export const slidersAPI = {
  getAll: async () => {
    const response = await axiosInstance.get("/api/sliders")
    return response.data
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/api/sliders/${id}`)
    return response.data
  },

  add: async (sliderData) => {
    const response = await axiosInstance.post("/api/sliders/add", sliderData)
    return response.data
  },
  // ✅ DELETE SLIDER
  delete: async (id) => {
    const res = await axiosInstance.delete(`/api/sliders/${id}`)
    return res.data
  }
}
