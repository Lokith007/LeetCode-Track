"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Trophy, ArrowRight } from "lucide-react"

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
      onClick={() => router.push(`/leaderboard/${batch.name}`)}
      className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 p-4 bg-gradient-to-br from-[#1e1e1e] to-[#111111] hover:from-[#1a1a1a] hover:to-[#0d0d0d] border border-[#f59e0b]/40 group rounded-2xl"
    >
      <CardContent className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-[#f59e0b]/20 rounded-lg p-2 shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Trophy className="h-5 w-5 text-[#f59e0b]" />
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#f59e0b] group-hover:translate-x-1 transition-all duration-300" />
        </div>

        <h2 className="text-xl font-semibold text-gray-200 group-hover:text-[#f59e0b]/90 transition-colors mb-2">
          {batch.displayName}
        </h2>

        <div className="flex items-center text-gray-400 text-sm group-hover:text-[#f59e0b]/80 transition-colors">
          <Users className="h-4 w-4 mr-1" />
          <span>View leaderboard</span>
        </div>
      </CardContent>
    </Card>
  )
}
