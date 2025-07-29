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
      onClick={() => router.push(`/leaderboard/${batch.name}`)}
      className="cursor-pointer transition-all duration-300 p-4 bg-white/80 backdrop-blur-md border border-indigo-200 shadow-lg rounded-2xl hover:shadow-2xl hover:scale-105 hover:border-indigo-400 hover:ring-2 hover:ring-indigo-200 group"
    >
      <CardContent className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="bg-gradient-to-r from-indigo-400 to-blue-300 rounded-lg p-2 shadow-md group-hover:scale-110 transition-transform duration-300">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        <h2 className="text-xl font-bold text-indigo-700 group-hover:text-indigo-900 transition-colors mb-2">
          {batch.displayName}
        </h2>
        <Button variant="ghost" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 px-0 py-0 h-auto text-sm font-medium bg-transparent shadow-none">
          <Users className="h-4 w-4 mr-1" />
          View leaderboard
        </Button>
      </CardContent>
    </Card>
  )
}
