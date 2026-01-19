"use client"

import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { User as UserIcon, ArrowUpAZ, ArrowDownAZ } from "lucide-react"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("asc") // asc | desc

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "https://testandroidapi.onrender.com/api/auth/users"
      )
      setUsers(res.data.users)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // SEARCH + SORT
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const term = searchTerm.toLowerCase()
        return (
          user._id?.toLowerCase().includes(term) ||
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toString().includes(term)
        )
      })
      .sort((a, b) => {
        if (!a.name || !b.name) return 0
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      })
  }, [users, searchTerm, sortOrder])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 animate-pulse font-medium">
          Loading users...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage registered users</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
            {filteredUsers.length} Total
          </div>
        </div>
      </div>

      {/* SEARCH & SORT */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by ID, name, email or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none"
        />

        <button
          onClick={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {sortOrder === "asc" ? (
            <>
              <ArrowUpAZ className="h-4 w-4" />
              A → Z
            </>
          ) : (
            <>
              <ArrowDownAZ className="h-4 w-4" />
              Z → A
            </>
          )}
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {user.phone || "N/A"}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
