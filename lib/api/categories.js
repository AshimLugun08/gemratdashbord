import api from "../axios"

export const categoriesAPI = {
  getAll: () => api.get("/api/categories").then((res) => res.data),
}
