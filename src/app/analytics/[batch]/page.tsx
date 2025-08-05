"use client"

import { useQuery, gql } from "@apollo/client"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Trophy, Users, Target, TrendingUp, Calendar, Award, Activity, BarChart, PieChart, LineChart } from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js'
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
)

const GET_BATCH_ANALYTICS = gql`
  query GetBatchAnalytics($batch: String!) {
    getBatchAnalytics(batch: $batch) {
      batch
      averageRating
      sections
      recentContests
    }
  }
`



export default function BatchAnalyticsPage() {
  const params = useParams()
  const batch = params.batch as string

  const { data: batchData, loading: batchLoading, error: batchError } = useQuery(GET_BATCH_ANALYTICS, {
    variables: { batch },
    skip: !batch
  })



  if (batchLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading Analytics...</div>
      </div>
    )
  }

  if (batchError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">
          Error loading analytics: {batchError?.message}
        </div>
      </div>
    )
  }

  const batchAnalytics = batchData?.getBatchAnalytics

  if (!batchAnalytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Batch not found</div>
      </div>
    )
  }

  // Prepare chart data for sections - sorted by rating
  const sections = Object.entries(batchAnalytics.sections || {})
    .map(([name, data]: [string, any]) => ({ name, rating: data?.averageRating || 0 }))
    .sort((a, b) => b.rating - a.rating) // Sort by rating descending
  
  const sectionNames = sections.map(section => section.name)
  const sectionRatings = sections.map(section => section.rating)

  // Section-wise rating chart
  const sectionRatingData = {
    labels: sectionNames,
    datasets: [
      {
        label: 'Average Rating',
        data: sectionRatings,
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }



  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-400 rounded-lg p-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-orange-300">
            Analytics - {batch}
          </h1>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#1e1e1e] border-orange-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-300">
                <Target className="h-5 w-5" />
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{Math.round(batchAnalytics.averageRating)}</div>
              <div className="text-gray-400 text-sm">Overall batch rating</div>
            </CardContent>
          </Card>

          <Card className="bg-[#1e1e1e] border-blue-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <Users className="h-5 w-5" />
                Total Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{Object.keys(batchAnalytics.sections || {}).length}</div>
              <div className="text-gray-400 text-sm">Number of sections</div>
            </CardContent>
          </Card>
        </div>

        {/* Section Rating Chart */}
        <Card className="bg-[#1e1e1e] border-orange-300 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-300">
              <BarChart className="h-5 w-5" />
              Section-wise Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar 
              data={sectionRatingData} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    labels: {
                      color: '#f3f4f6'
                    }
                  }
                },
                scales: {
                  y: {
                    ticks: {
                      color: '#9ca3af'
                    },
                    grid: {
                      color: '#374151'
                    }
                  },
                  x: {
                    ticks: {
                      color: '#9ca3af'
                    },
                    grid: {
                      color: '#374151'
                    }
                  }
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Section Details - Sorted by Rating */}
        {sections && sections.length > 0 && (
          <Card className="bg-[#1e1e1e] border-gray-600 mb-8">
            <CardHeader>
              <CardTitle className="text-orange-300">Section Details (Sorted by Rating)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section, index) => (
                  <Card key={section.name} className="bg-[#2a2a2a] border-gray-500 hover:border-orange-300 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">{section.name}</CardTitle>
                        <Badge variant="secondary" className="bg-orange-500 text-white">
                          #{index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rating:</span>
                          <span className="text-white font-semibold">{Math.round(section.rating)}</span>
                        </div>
                        <Progress value={Math.min((section.rating / 2000) * 100, 100)} className="mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

                 {/* Recent Contests */}
         {batchAnalytics.recentContests && Object.keys(batchAnalytics.recentContests).length > 0 && (
           <Card className="bg-[#1e1e1e] border-gray-600 mb-8">
             <CardHeader>
               <CardTitle className="text-orange-300">Recent Contests</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {Object.entries(batchAnalytics.recentContests).map(([contestName, contestData]: [string, any]) => (
                   <Card key={contestName} className="bg-[#2a2a2a] border-gray-500">
                     <CardHeader className="pb-2">
                       <CardTitle className="text-sm text-white">{contestName}</CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="text-gray-400 text-sm">
                         Contest data available
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}
      </div>
    </div>
  )
} 