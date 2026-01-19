import axios from "../axios"

// Example categoriesAPI update
export const categoriesAPI = {
  getAll: () => axios.get('/api/categories').then(res => res.data),
  getSubCategories: (categoryId) => axios.get(`/api/subcategories/${categoryId}`).then(res => res.data),
};