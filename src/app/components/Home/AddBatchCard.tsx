"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AddBatchCard() {
  const handleClick = () => {
    alert("🔧 Add batch logic to be implemented")
  }

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer flex items-center justify-center p-6 border-2 border-dashed border-orange-400 bg-[#1a1a1a] rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 hover:border-orange-300 hover:ring-2 hover:ring-orange-200 group"
    >
      <CardContent className="flex flex-col items-center text-center">
        <Button
          variant="outline"
          size="icon"
          className="bg-gray-900 border border-orange-400 text-orange-300 rounded-full p-3 shadow-sm group-hover:shadow-md transition-all duration-300 mb-3 group-hover:bg-gray-800 group-hover:text-orange-200"
        >
          <Plus className="h-8 w-8 transition-transform group-hover:rotate-90 duration-300" />
        </Button>
        <p className="text-orange-300 font-bold text-lg group-hover:text-orange-200 transition-colors">
          Add a Batch
        </p>
        <p className="text-orange-400 text-sm mt-1 opacity-70 group-hover:opacity-90 transition-opacity">
          Create new batch
        </p>
      </CardContent>
    </Card>
  )
}


