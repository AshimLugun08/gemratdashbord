import axiosInstance from "@/lib/axios"

export const authAPI = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    })
    return response.data
  },
}
