"use client"

import AddBatchCard from "./components/Home/AddBatchCard"
import BatchCard from "./components/Home/BatchCard"
import { batches } from "./data/data"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useAuth } from "./components/AuthProvider"

export default function HomePage() {
  const { userEmail, logout } = useAuth()

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-[#121212] text-orange-400 py-12 px-4 font-sans">
      {/* Header with user info and logout */}
      <div className="w-full max-w-6xl mb-10 flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-400 flex items-center gap-2 drop-shadow">
          🏆 LeetCode Tracker
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-200">
            <User className="h-4 w-4 text-orange-400" />
            <span>{userEmail}</span>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="bg-[#1a1a1a] border border-orange-300 text-orange-300 hover:bg-gray-700 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4 " />
            Logout
          </Button>
        </div>
      </div>

      {/* Batch Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <AddBatchCard />
        {batches.map((batch) => (
          <BatchCard key={batch.name} batch={batch} />
        ))}
      </div>
    </main>
  )
}
