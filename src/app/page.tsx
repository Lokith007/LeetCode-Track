"use client"

import AddBatchCard from "./components/Home/AddBatchCard"
import BatchCard from "./components/Home/BatchCard"
import { Button } from "@/components/ui/button"
import { LogOut, User, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "./components/AuthProvider"
import { gql, useQuery } from "@apollo/client"

// GraphQL query
const GET_ALL_BATCHES = gql`
  query GetAllBatches {
    allBatches {
      name
      secCount
    }
  }
`

export default function HomePage() {
  const { userEmail, logout } = useAuth()
  const { data, loading, error } = useQuery(GET_ALL_BATCHES)
  console.log(data?.allBatches[0].secCount);

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-[#121212] text-orange-400 py-12 px-4 font-sans">
      {/* Header with user info and logout */}
      <div className="w-full max-w-6xl mb-10 flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-400 flex items-center gap-2 drop-shadow">
          🏆 LeetCode Tracker
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/analytics">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#1a1a1a] border border-orange-300 text-orange-300 hover:bg-gray-700 flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics Dashboard
            </Button>
          </Link>
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
        {loading && <p className="text-gray-400">Loading batches...</p>}
        {error && <p className="text-red-400">Error loading batches 😢</p>}
        {data?.allBatches?.map((batch: { name: string; secCount: number }) => (
          <BatchCard key={batch.name} batch={batch.name} secCount={batch.secCount} />
        ))}
      </div>
      <a
        href="https://bot-leetcode.onrender.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 blinking"
      >
        <button className="bg-orange-300 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2 text-sm font-semibold">
          🧠 Try AI Assistant
        </button>
      </a>


    </main>
  )
}
