"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"

const CLOUDINARY_CLOUD_NAME = "du5ghkse1"
const CLOUDINARY_UPLOAD_PRESET = "android"
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export function ImageUpload({ value, onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      onChange(data.secure_url)
    } catch (err) {
      setError("Failed to upload image. Please try again.")
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      {value ? (
        <div className="relative">
          <img
            src={value || "/placeholder.svg"}
            alt="Uploaded"
            className="h-40 w-full rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white shadow-md hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            uploading ? "border-orange-300 bg-orange-50" : "border-gray-300 hover:border-orange-500 hover:bg-orange-50"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="mt-2 text-sm text-gray-500">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to upload image</p>
              <p className="text-xs text-gray-400">Max size: 5MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
