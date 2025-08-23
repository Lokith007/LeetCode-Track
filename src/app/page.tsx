"use client"

import AddBatchCard from "./components/Home/AddBatchCard"
import BatchCard from "./components/Home/BatchCard"
import { Button } from "@/components/ui/button"
import { LogOut, User, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "./components/AuthProvider"
import { gql, useQuery } from "@apollo/client"
import { getBatchDisplayName, getBatchPriority } from "./data/data"
import QuickNavButtons from "./components/QuickNavButtons"
import { classifyBatchIntoDepartment } from "@/lib/utils"


// GraphQL query
const GET_ALL_BATCHES = gql`
  query GetAllBatches {
    allBatches {
      name
      secCount
    }
  }
`

// Type for batch data
interface Batch {
  name: string;
  secCount: number;
}

export default function HomePage() {
  const { userEmail, logout } = useAuth()
  const { data, loading, error } = useQuery(GET_ALL_BATCHES)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  // Extract names into an array of strings
  const batchNames = data?.allBatches?.map((batch: Batch) => batch.name) || []
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

      {/* Add Batch Card */}
      <div className="w-full max-w-6xl mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AddBatchCard />
        </div>
      </div>

      {/* All Batches Grid - Dynamically Generated */}
      <div className="w-full max-w-6xl space-y-8">
        {(() => {
                     // Dynamically classify batches into departments
           const departmentBatches = data?.allBatches?.reduce((acc: Record<string, Batch[]>, batch: Batch) => {
             const dept = classifyBatchIntoDepartment(batch.name);
             if (!acc[dept]) acc[dept] = [];
             acc[dept].push(batch);
             return acc;
           }, {}) || {};

            // Sort departments alphabetically for consistent display order
            const departmentOrder = Object.keys(departmentBatches).sort();

            return departmentOrder.map((dept) => {
              const batches = departmentBatches[dept];
              if (!batches || batches.length === 0) return null;
              
                // Sort the batches with hardcoded priority order
                const sortedBatches = batches.sort((a: Batch, b: Batch) => {
                  const aName = a.name;  // Use batch name directly
                  const bName = b.name;  // Use batch name directly
                  
                  // Hardcoded priority order: II first, everything else in any order
                  const getPriority = (name: string) => {
                    if (name.endsWith('II')) return 1;  // II batches first
                    return 2;  // Everything else gets same priority (any order)
                  };
                  
                  const aPriority = getPriority(aName);
                  const bPriority = getPriority(bName);
                  
                  return aPriority - bPriority;
                });
              


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
            );
          });
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
