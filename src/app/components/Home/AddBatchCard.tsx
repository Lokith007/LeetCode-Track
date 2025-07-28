"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function AddBatchCard() {
  const handleClick = () => {
    alert("🔧 Add batch logic to be implemented")
  }

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center p-6 border-2 border-dashed border-[#f59e0b]/40 hover:border-[#f59e0b]/60 bg-gradient-to-br from-[#1e1e1e] to-[#111111] hover:from-[#1a1a1a] hover:to-[#0d0d0d] group rounded-2xl"
    >
      <CardContent className="flex flex-col items-center text-center">
        <div className="bg-[#f59e0b]/10 rounded-full p-3 shadow-md group-hover:shadow-lg transition-all duration-300 mb-3 group-hover:bg-[#f59e0b]/20">
          <Plus className="h-8 w-8 text-[#f59e0b]/80 group-hover:text-[#f59e0b] transition-transform group-hover:rotate-90 duration-300" />
        </div>
        <p className="text-[#f59e0b]/80 font-semibold text-lg group-hover:text-[#f59e0b] transition-colors">
          Add a Batch
        </p>
        <p className="text-gray-400 text-sm mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
          Create new batch
        </p>
      </CardContent>
    </Card>
  )
}


