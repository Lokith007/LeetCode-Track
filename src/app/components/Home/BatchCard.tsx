"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trophy, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type BatchCardProps = {
  batch: {
    name: string
    displayName: string
  }
}

export default function BatchCard({ batch }: BatchCardProps) {
  const router = useRouter()

  return (
    <Card
      onClick={() => router.push(`/sections/${batch.name}`)}
      className="cursor-pointer transition-all duration-300 p-4 bg-[#1e1e1e] border border-orange-300 shadow-md rounded-2xl hover:shadow-lg hover:scale-105 hover:border-orange-300 hover:ring-2 hover:ring-orange-200 group"
    >
      <CardContent className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-orange-400 rounded-lg p-2 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-orange-300 group-hover:text-orange-200 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-200 group-hover:text-orange-200 transition-colors mb-2">
          {batch.displayName}
        </h2>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-gray-300 hover:text-orange-200 px-0 py-0 h-auto text-sm font-medium bg-transparent shadow-none"
        >
          <Users className="h-4 w-4 mr-1 text-orange-400" />
          View leaderboard
        </Button>
      </CardContent>
    </Card>
  )
}
