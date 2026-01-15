"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { productsAPI } from "@/lib/api/products"
import { categoriesAPI } from "@/lib/api/categories"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"]
const COLOR_OPTIONS = [
  "Red",
  "Blue",
  "Green",
  "Black",
  "White",
  "Yellow",
  "Orange",
  "Pink",
  "Purple",
  "Gray",
  "Brown",
  "Navy",
]

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("newest")
  const itemsPerPage = 10

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    subCategoryId: "",
    size: [],
    color: [],
    stock: "",
    image: "",
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productsAPI.getAll()
      setProducts(data.products || data || [])
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll()
      setCategories(data.categories || data || [])
    } catch (err) {
      console.error("Failed to fetch categories:", err)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    } else if (sortBy === "price_low") {
      return (a.price || 0) - (b.price || 0)
    } else if (sortBy === "price_high") {
      return (b.price || 0) - (a.price || 0)
    }
    return 0
  })

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleOpenModal = (product = null) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        name: product.name || product.title || "",
        description: product.description || "",
        price: product.price || "",
        subCategoryId: product.subCategoryId?._id || product.subCategoryId || product.category || "",
        size: product.size || [],
        color: product.color || [],
        stock: product.stock || "",
        image: product.image || "",
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        name: "",
        description: "",
        price: "",
        subCategoryId: "",
        size: [],
        color: [],
        stock: "",
        image: "",
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      subCategoryId: "",
      size: [],
      color: [],
      stock: "",
      image: "",
    })
  }

  const handleSizeToggle = (size) => {
    setFormData((prev) => ({
      ...prev,
      size: prev.size.includes(size) ? prev.size.filter((s) => s !== size) : [...prev.size, size],
    }))
  }

  const handleColorToggle = (color) => {
    setFormData((prev) => ({
      ...prev,
      color: prev.color.includes(color) ? prev.color.filter((c) => c !== color) : [...prev.color, color],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)

    const submitData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      subCategoryId: formData.subCategoryId,
      size: formData.size,
      color: formData.color,
      stock: Number(formData.stock),
      image: formData.image,
    }

    try {
      if (selectedProduct) {
        await productsAPI.update(selectedProduct._id || selectedProduct.id, submitData)
      } else {
        await productsAPI.create(submitData)
      }
      handleCloseModal()
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    setFormLoading(true)
    try {
      await productsAPI.delete(selectedProduct._id || selectedProduct.id)
      setIsDeleteOpen(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product")
    } finally {
      setFormLoading(false)
    }
  }

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => (
        <img
          src={row.image || "/placeholder.svg?height=40&width=40&query=product"}
          alt={row.name || row.title}
          className="h-10 w-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => row.name || row.title || "-",
    },
    {
      key: "price",
      label: "Price",
      render: (row) => `₹${Number(row.price).toLocaleString("en-IN")}`,
    },
    {
      key: "stock",
      label: "Stock",
      render: (row) => row.stock ?? "-",
    },
    {
      key: "category",
      label: "Category",
      render: (row) => row.subCategoryId?.name || row.category || "-",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-IN") : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            row.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {row.stock > 0 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedProduct(row)
              setIsDeleteOpen(true)
            }}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-gray-500">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-orange-500 hover:bg-orange-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Label htmlFor="sort">Sort by:</Label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value)
            setCurrentPage(1)
          }}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={paginatedProducts}
        loading={loading}
        error={error}
        emptyMessage="No products found. Add your first product!"
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? "Edit Product" : "Add Product"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload
            label="Product Image"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                required
              />
            </div>
            <div>
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="799"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subCategoryId">SubCategory</Label>
              <select
                id="subCategoryId"
                value={formData.subCategoryId}
                onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a subcategory</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name || cat.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="50"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <Label>Sizes</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    formData.size.includes(size)
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {formData.size.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">Selected: {formData.size.join(", ")}</p>
            )}
          </div>

          <div>
            <Label>Colors</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorToggle(color)}
                  className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                    formData.color.includes(color)
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
            {formData.color.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">Selected: {formData.color.join(", ")}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading} className="bg-orange-500 hover:bg-orange-600">
              {formLoading ? "Saving..." : selectedProduct ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name || selectedProduct?.title}"? This action cannot be undone.`}
        loading={formLoading}
      />
    </div>
  )
}
