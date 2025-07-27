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
      className="cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 p-4 bg-gradient-to-br from-black to-gray-900 hover:from-gray-950 hover:to-black border border-green-600 group rounded-2xl"
    >
      <CardContent className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-gradient-to-r from-green-500 to-lime-500 rounded-lg p-2 shadow-md group-hover:scale-110 transition-transform duration-300">
            <Trophy className="h-5 w-5 text-black" />
          </div>
          <ArrowRight className="h-5 w-5 text-green-300 group-hover:text-green-400 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        <h2 className="text-xl font-bold text-green-200 group-hover:text-green-100 transition-colors mb-2">
          {batch.displayName}
        </h2>

        <div className="flex items-center text-green-400 text-sm">
          <Users className="h-4 w-4 mr-1" />
          <span>View leaderboard</span>
        </div>
      </CardContent>
    </Card>
  )
}
