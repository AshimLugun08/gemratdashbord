"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { slidersAPI } from "@/lib/api/sliders"
import { DataTable } from "@/components/ui/data-table"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { Loader } from "@/components/ui/loader"

export default function SlidersPage() {
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedSlider, setSelectedSlider] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  })

  /* ---------------- FETCH SLIDERS ---------------- */
  const fetchSliders = async () => {
    try {
      setLoading(true)
      const data = await slidersAPI.getAll()
      setSliders(data || [])
    } catch {
      setError("Failed to load sliders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  /* ---------------- ADD SLIDER ---------------- */
  const handleAddSlider = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.image) {
      setError("Name and image are required")
      return
    }

    try {
      setFormLoading(true)
      setError(null)

      await slidersAPI.add(formData)

      setIsAddOpen(false)
      setFormData({ name: "", description: "", image: "" })
      fetchSliders()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add slider")
    } finally {
      setFormLoading(false)
    }
  }

  /* ---------------- DELETE SLIDER ---------------- */
  const handleDeleteSlider = async () => {
    if (!selectedSlider) return

    try {
      await slidersAPI.delete(selectedSlider._id)
      setIsDeleteOpen(false)
      setSelectedSlider(null)
      fetchSliders()
    } catch {
      setError("Failed to delete slider")
    }
  }

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    {
      key: "image",
      label: "Preview",
      render: (row) => (
        <img
          src={row.image}
          alt={row.name}
          className="h-16 w-32 rounded-lg object-cover"
        />
      )
    },
    {
      key: "name",
      label: "Name"
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {row.description || "—"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => {
            setSelectedSlider(row)
            setIsDeleteOpen(true)
          }}
          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )
    }
  ]

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sliders</h1>
          <p className="text-gray-500">Manage homepage sliders</p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Slider
        </Button>
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={sliders}
        loading={loading}
        error={error}
        emptyMessage="No sliders found"
      />

      {/* ADD MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false)
          setFormData({ name: "", description: "", image: "" })
        }}
        title="Add Slider"
        size="md"
      >
        <form onSubmit={handleAddSlider} className="space-y-4">
          <ImageUpload
            label="Slider Image"
            value={formData.image}
            onChange={(url) =>
              setFormData({ ...formData, image: url })
            }
          />

          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={formLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {formLoading ? "Adding..." : "Add Slider"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Slider"
        size="sm"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this slider?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDeleteOpen(false)}
          >
            Cancel
          </Button>

          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleDeleteSlider}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
