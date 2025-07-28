"use client"

import AddBatchCard from "./components/Home/AddBatchCard"
import BatchCard from "./components/Home/BatchCard"
import { batches } from "./data/data"

export default function HomePage() {
  return (
    <main className="p-6 min-h-screen bg-[#111111]">
      <h1 className="text-3xl font-bold mb-6 text-center text-[#f59e0b]">🏆 LeetCode Tracker</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <AddBatchCard />
        {batches.map((batch) => (
          <BatchCard key={batch.name} batch={batch} />
        ))}
      </div>
    </main>
  )
}
