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
      className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center p-6 border-2 border-dashed border-green-400 hover:border-green-500 bg-gradient-to-br from-black to-gray-900 hover:from-gray-950 hover:to-black group rounded-2xl"
    >
      <CardContent className="flex flex-col items-center text-center">
        <div className="bg-green-100 rounded-full p-3 shadow-lg group-hover:shadow-2xl transition-all duration-300 mb-3 group-hover:bg-green-200">
          <Plus className="h-8 w-8 text-green-600 group-hover:text-green-700 transition-transform group-hover:rotate-90 duration-300" />
        </div>
        <p className="text-green-300 font-bold text-lg group-hover:text-green-400 transition-colors">
          Add a Batch
        </p>
        <p className="text-green-200 text-sm mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
          Create new batch
        </p>
      </CardContent>
    </Card>
  )
}

