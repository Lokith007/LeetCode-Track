"use client"

import AddBatchCard from "./components/Home/AddBatchCard"
import BatchCard from "./components/Home/BatchCard"
import { batches } from "./data/data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useAuth } from "./components/AuthProvider"

export default function HomePage() {
  const { userEmail, logout } = useAuth()

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-12 px-4">
      {/* Header with user info and logout */}
      <div className="w-full max-w-5xl mb-8 flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 flex items-center gap-2">
          <span role="img" aria-label="trophy">🏆</span> LeetCode Tracker
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{userEmail}</span>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <AddBatchCard />
        {batches.map((batch) => (
          <BatchCard key={batch.name} batch={batch} />
        ))}
      </div>
    </main>
  )
}
