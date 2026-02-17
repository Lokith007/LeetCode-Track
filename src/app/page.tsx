"use client"

import AddBatchCard from "./components/Home/AddBatchCard"
import BatchCard from "./components/Home/BatchCard"
import { Button } from "@/components/ui/button"
import { User, BarChart3 } from "lucide-react"
import Link from "next/link"
import { gql, useQuery } from "@apollo/client"
import { getBatchDisplayName, getBatchPriority } from "./data/data"
import QuickNavButtons from "./components/QuickNavButtons"
import { classifyBatchIntoDepartment } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// GraphQL queries
const GET_ALL_BATCHES = gql`
  query GetAllBatches {
    allBatches {
      name
      secCount
    }
  }
`

const GET_ADMIN_BATCHES = gql`
  query GetAdminBatches($admin: String!) {
    getAdminBatches(admin: $admin)
  }
`

// Type for batch data
interface Batch {
  name: string
  secCount: number
}

export default function HomePage() {
  const { data: allBatchesData, loading: loadingAll, error: errorAll } = useQuery(GET_ALL_BATCHES)
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()

  // second query (depends on email)
  const { data: adminBatchesData, loading: loadingAdmin, error: errorAdmin } = useQuery(
    GET_ADMIN_BATCHES,
    {
      variables: { admin: email ?? "" },
      skip: !email, // run only if email is set
    }
  )

  useEffect(() => {
    const storedEmail = localStorage.getItem("adminEmail")
    if (!storedEmail) {
      router.push("/signin")
    } else {
      setEmail(storedEmail)
    }
  }, [router])

  if (loadingAll || loadingAdmin) return <p>Loading...</p>
  if (errorAll) return <p>Error: {errorAll.message}</p>
  if (errorAdmin) return <p>Error: {errorAdmin.message}</p>

  // filter: only keep batches assigned to this admin
  const adminBatchNames: string[] = adminBatchesData?.getAdminBatches || []
  const allBatches: Batch[] = allBatchesData?.allBatches || []

  // Super admin gets to see everything
  const filteredBatches = email === "pavithras@citchennai.net"
    ? allBatches
    : allBatches.filter((batch) => adminBatchNames.includes(batch.name))

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-[#121212] text-orange-400 py-12 px-4 font-sans">
      {/* Header with user info and logout */}
      <div className="w-full max-w-6xl mb-10 flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-400 flex items-center gap-2 drop-shadow">
          🏆 Competitive Programming Tracker
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/analytic">
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
            <span>{email}</span>
            <button
              onClick={() => {
                localStorage.removeItem("adminEmail")
                router.push("/signin")
              }}
              className="ml-2 px-3 py-1 rounded-md bg-orange-400 text-white text-xs font-semibold hover:bg-orange-500 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Add Batch Card (for super admin only) */}
      {email === "pavithras@citchennai.net" && (
        <div className="w-full max-w-6xl mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AddBatchCard />
          </div>
        </div>
      )}

      {/* All Batches Grid - Dynamically Generated */}
      <div className="w-full max-w-6xl space-y-8">
        {(() => {
          // Dynamically classify only the filtered batches
          const departmentBatches =
            filteredBatches.reduce((acc: Record<string, Batch[]>, batch: Batch) => {
              const dept = classifyBatchIntoDepartment(batch.name)
              if (!acc[dept]) acc[dept] = []
              acc[dept].push(batch)
              return acc
            }, {}) || {}

          // Sort departments: CSE first
          const departmentOrder = Object.keys(departmentBatches).sort((a, b) => {
            if (a === "CSE") return -1
            if (b === "CSE") return 1
            return 0
          })

          return departmentOrder.map((dept) => {
            const batches = departmentBatches[dept]
            if (!batches || batches.length === 0) return null

            const sortedBatches = batches.sort((a: Batch, b: Batch) => {
              const aPriority = getBatchPriority(a.name)
              const bPriority = getBatchPriority(b.name)
              if (aPriority !== bPriority) return aPriority - bPriority

              const aDisplay = getBatchDisplayName(a.name)
              const bDisplay = getBatchDisplayName(b.name)
              if (aDisplay.length !== bDisplay.length) return aDisplay.length - bDisplay.length
              return aDisplay.localeCompare(bDisplay)
            })

            return (
              <div key={dept} className="space-y-4">
                <h2 className="text-2xl font-bold text-orange-400">{dept}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sortedBatches.map((batch: Batch) => (
                    <BatchCard
                      key={batch.name}
                      batch={batch.name}
                      displayName={getBatchDisplayName(batch.name)}
                      secCount={batch.secCount}
                    />
                  ))}
                </div>
              </div>
            )
          })
        })()}
      </div>

      <a
        href="https://bot-leetcode.onrender.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50"
      >
        <button className="bg-orange-300 text-white px-4 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2 text-sm font-semibold">
          🧠 Try AI Assistant
        </button>
      </a>
    </main>
  )
}
