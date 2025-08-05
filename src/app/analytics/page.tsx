"use client"

import { useQuery, gql } from "@apollo/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Trophy, Users, Target, TrendingUp, Calendar, Award, Activity, BarChart, PieChart, LineChart, Info, TrendingDown, Star, Zap } from "lucide-react"
import Link from "next/link"
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

const GET_ALL_ANALYTICS = gql`
  query GetAllAnalytics {
    getAllAnalytics {
      averageRating
      averageSolved
      batch
      consistency
      latestContest
      participationRate
      recentContests
      sectionWiseTotalSolved
      sections
      top10Contributors
      updatedAt
    }
  }
`

export default function AnalyticsDashboard() {
  const { data, loading, error } = useQuery(GET_ALL_ANALYTICS)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-orange-400 text-xl">Loading Analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading analytics: {error.message}</div>
      </div>
    )
  }

  const analytics = data?.getAllAnalytics || []

  // Prepare chart data
  const batchNames = analytics.map((item: any) => item.batch)
  const averageRatings = analytics.map((item: any) => Math.round(item.averageRating))
  const averageSolved = analytics.map((item: any) => parseFloat(item.averageSolved.toFixed(2)))
  const participationRates = analytics.map((item: any) => parseFloat(item.participationRate.toFixed(1)))

  // Bar chart data for average ratings
  const ratingChartData = {
    labels: batchNames,
    datasets: [
      {
        label: 'Average Rating',
        data: averageRatings,
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderColor: 'rgba(251, 146, 60, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Bar chart data for average solved problems
  const solvedChartData = {
    labels: batchNames,
    datasets: [
      {
        label: 'Average Solved Problems',
        data: averageSolved,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Bar chart for participation rates
  const participationChartData = {
    labels: batchNames,
    datasets: [
      {
        label: 'Participation Rate (%)',
        data: participationRates,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  // Calculate overall statistics
  const totalBatches = analytics.length
  const overallAverageRating = Math.round(analytics.reduce((sum: number, item: any) => sum + item.averageRating, 0) / totalBatches)
  const overallAverageSolved = parseFloat((analytics.reduce((sum: number, item: any) => sum + item.averageSolved, 0) / totalBatches).toFixed(2))
  const overallParticipationRate = parseFloat((analytics.reduce((sum: number, item: any) => sum + item.participationRate, 0) / totalBatches).toFixed(1))

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-400 rounded-lg p-2">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-orange-300">
              Analytics Dashboard
            </h1>
            <Badge variant="secondary" className="bg-orange-500 text-white">
              {totalBatches} Batches
            </Badge>
          </div>

        {/* Overall Statistics with Tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1e1e1e] border-orange-300 hover:border-orange-200 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-300">
                <Target className="h-5 w-5" />
                Overall Average Rating
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400 hover:text-orange-300" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average rating across all batches</p>
                  </TooltipContent>
                </UITooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                {overallAverageRating}
                <Star className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-gray-400 text-sm">Across all batches</div>
              <Progress value={Math.min((overallAverageRating / 2000) * 100, 100)} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-[#1e1e1e] border-green-300 hover:border-green-200 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Trophy className="h-5 w-5" />
                Average Solved Problems
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400 hover:text-green-300" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average problems solved per student</p>
                  </TooltipContent>
                </UITooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                {overallAverageSolved}
                <Zap className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-gray-400 text-sm">Problems per student</div>
              <Progress value={Math.min((overallAverageSolved / 5) * 100, 100)} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-[#1e1e1e] border-blue-300 hover:border-blue-200 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <Users className="h-5 w-5" />
                Participation Rate
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400 hover:text-blue-300" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average participation rate across batches</p>
                  </TooltipContent>
                </UITooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white flex items-center gap-2">
                {overallParticipationRate}%
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-gray-400 text-sm">Average participation</div>
              <Progress value={overallParticipationRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Interactive Tabs for Analytics */}
        <Tabs defaultValue="overview" className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-[#2a2a2a]">
            <TabsTrigger value="overview" className="text-orange-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              📊 Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-green-300 data-[state=active]:bg-green-500 data-[state=active]:text-white">
              🏆 Performance
            </TabsTrigger>
            <TabsTrigger value="consistency" className="text-blue-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📈 Consistency
            </TabsTrigger>
            <TabsTrigger value="students" className="text-purple-300 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              👥 Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Batch Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analytics.map((batch: any, index: number) => (
                <Card key={index} className="bg-[#1e1e1e] border-orange-300 hover:border-orange-200 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-orange-300 font-bold">{batch.batch}</CardTitle>
                      <Badge variant="secondary" className="bg-orange-500 text-white">
                        #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="text-2xl font-bold text-white">{Math.round(batch.averageRating)}</div>
                        <div className="text-gray-400 text-sm">Rating</div>
                        <Progress value={Math.min((batch.averageRating / 2000) * 100, 100)} className="mt-2" />
                      </div>
                      <div className="text-center p-3 bg-[#2a2a2a] rounded-lg">
                        <div className="text-2xl font-bold text-white">{batch.averageSolved.toFixed(2)}</div>
                        <div className="text-gray-400 text-sm">Solved</div>
                        <Progress value={Math.min((batch.averageSolved / 5) * 100, 100)} className="mt-2" />
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[#2a2a2a] rounded-lg">
                      <div className="text-xl font-bold text-white">{batch.participationRate.toFixed(1)}%</div>
                      <div className="text-gray-400 text-sm">Participation</div>
                      <Progress value={batch.participationRate} className="mt-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Latest Contest:</span>
                      <span className="text-white font-medium">{batch.latestContest}</span>
                    </div>
                    <Link href={`/analytics/${batch.batch}`}>
                      <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors font-medium">
                        View Full Analytics
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Bar Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Average Rating Bar Chart */}
              <Card className="bg-[#1e1e1e] border-orange-300 hover:border-orange-200 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-300">
                    <BarChart className="h-5 w-5" />
                    Average Rating by Batch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar 
                    data={ratingChartData} 
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

              {/* Average Solved Bar Chart */}
              <Card className="bg-[#1e1e1e] border-green-300 hover:border-green-200 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-300">
                    <BarChart className="h-5 w-5" />
                    Average Solved Problems by Batch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar 
                    data={solvedChartData} 
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
            </div>

            {/* Participation Rate Bar Chart */}
            <Card className="bg-[#1e1e1e] border-blue-300 hover:border-blue-200 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <BarChart className="h-5 w-5" />
                  Participation Rate by Batch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Bar 
                  data={participationChartData} 
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
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.map((batch: any, index: number) => (
                <Card key={index} className="bg-[#1e1e1e] border-green-300 hover:border-green-200 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-green-300">
                        <Trophy className="h-5 w-5" />
                        {batch.batch} Performance
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        #{index + 1}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {batch.sections && Object.keys(batch.sections).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(batch.sections).map(([sectionName, sectionData]: [string, any]) => (
                          <div key={sectionName} className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#3a3a3a] transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-semibold text-lg">{sectionName}</h4>
                              <Badge variant="outline" className="text-green-300 border-green-300">
                                {Math.round(sectionData.averageRating)} Rating
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-white font-bold text-lg">{Math.round(sectionData.averageRating)}</div>
                                <div className="text-gray-400 text-xs">Rating</div>
                                <Progress 
                                  value={Math.min((sectionData.averageRating / 2000) * 100, 100)} 
                                  className="mt-1 h-1"
                                />
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold text-lg">{sectionData.averageSolved?.toFixed(2) || 'N/A'}</div>
                                <div className="text-gray-400 text-xs">Solved</div>
                                <Progress 
                                  value={Math.min((sectionData.averageSolved / 5) * 100, 100)} 
                                  className="mt-1 h-1"
                                />
                              </div>
                              <div className="text-center">
                                <div className="text-white font-bold text-lg">{sectionData.participationRate?.toFixed(1) || 'N/A'}%</div>
                                <div className="text-gray-400 text-xs">Participation</div>
                                <Progress 
                                  value={sectionData.participationRate || 0} 
                                  className="mt-1 h-1"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400">No section data available</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consistency" className="space-y-6">
            <Card className="bg-[#1e1e1e] border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-300">
                  <TrendingUp className="h-5 w-5" />
                  Class-wise Consistency Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.map((batch: any, index: number) => (
                    <div key={index} className="bg-[#2a2a2a] rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="bg-blue-500 text-white">
                            {batch.batch}
                          </Badge>
                          <h3 className="text-white font-semibold">Consistency Metrics</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">{batch.consistency?.length || 0}</div>
                          <div className="text-gray-400 text-sm">Active Students</div>
                        </div>
                      </div>
                      
                      {batch.consistency && batch.consistency.length > 0 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {batch.consistency.slice(0, 9).map((student: any, studentIndex: number) => (
                              <Card key={studentIndex} className="bg-[#3a3a3a] border-blue-500">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-white font-semibold truncate">
                                      {student.name || `Student ${studentIndex + 1}`}
                                    </div>
                                    <Badge variant="outline" className="text-blue-300 border-blue-300">
                                      {student.streak || 0} 🔥
                                    </Badge>
                                  </div>
                                  {student.section && (
                                    <div className="text-gray-400 text-sm">
                                      Section: {student.section}
                                    </div>
                                  )}
                                  <div className="mt-2">
                                    <Progress 
                                      value={Math.min(((student.streak || 0) / 10) * 100, 100)} 
                                      className="h-2"
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          
                          {batch.consistency.length > 9 && (
                            <div className="text-center">
                              <Badge variant="outline" className="text-blue-300 border-blue-300">
                                +{batch.consistency.length - 9} more students
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.map((batch: any, index: number) => (
                <Card key={index} className="bg-[#1e1e1e] border-purple-300 hover:border-purple-200 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-purple-300">
                        <Users className="h-5 w-5" />
                        {batch.batch} Students
                      </CardTitle>
                      <Badge variant="secondary" className="bg-purple-500 text-white">
                        {batch.consistency?.length || 0} Students
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {batch.consistency && batch.consistency.length > 0 ? (
                      <div className="space-y-4">
                        {/* Top Performers by Streak */}
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            Top Performers (by Streak)
                          </h4>
                          <div className="space-y-2">
                            {batch.consistency
                              .filter((student: any) => student.streak && student.streak > 0)
                              .sort((a: any, b: any) => (b.streak || 0) - (a.streak || 0))
                              .slice(0, 5)
                              .map((student: any, studentIndex: number) => (
                                <div key={studentIndex} className="flex items-center justify-between p-2 bg-[#3a3a3a] rounded-lg hover:bg-[#4a4a4a] transition-colors">
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-yellow-300 border-yellow-300">
                                      #{studentIndex + 1}
                                    </Badge>
                                    <div>
                                      <div className="text-white font-medium">{student.name || `Student ${studentIndex + 1}`}</div>
                                      {student.section && (
                                        <div className="text-gray-400 text-xs">{student.section}</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                                      {student.streak} 🔥
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Section-wise Breakdown */}
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <BarChart className="h-4 w-4 text-blue-400" />
                            Section-wise Breakdown
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(
                              batch.consistency.reduce((acc: any, student: any) => {
                                const section = student.section || 'Unknown';
                                if (!acc[section]) {
                                  acc[section] = { count: 0, totalStreak: 0, students: [] };
                                }
                                acc[section].count++;
                                acc[section].totalStreak += student.streak || 0;
                                acc[section].students.push(student);
                                return acc;
                              }, {})
                            ).map(([section, data]: [string, any]) => (
                              <div key={section} className="flex items-center justify-between p-2 bg-[#3a3a3a] rounded-lg">
                                <div>
                                  <div className="text-white font-medium">{section}</div>
                                  <div className="text-gray-400 text-xs">{data.count} students</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-white font-medium">{Math.round(data.totalStreak / data.count)}</div>
                                  <div className="text-gray-400 text-xs">avg streak</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* All Students List */}
                        <div className="bg-[#2a2a2a] rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-400" />
                            All Students ({batch.consistency.length})
                          </h4>
                          <div className="max-h-40 overflow-y-auto space-y-1">
                            {batch.consistency.slice(0, 10).map((student: any, studentIndex: number) => (
                              <div key={studentIndex} className="flex items-center justify-between p-2 bg-[#3a3a3a] rounded text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="text-white truncate">{student.name || `Student ${studentIndex + 1}`}</div>
                                  {student.section && (
                                    <Badge variant="outline" className="text-gray-400 border-gray-400 text-xs">
                                      {student.section}
                                    </Badge>
                                  )}
                                </div>
                                <Badge variant="outline" className="text-purple-300 border-purple-300 text-xs">
                                  {student.streak || 0} 🔥
                                </Badge>
                              </div>
                            ))}
                            {batch.consistency.length > 10 && (
                              <div className="text-center py-2">
                                <Badge variant="outline" className="text-purple-300 border-purple-300">
                                  +{batch.consistency.length - 10} more students
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400">No student data available</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card className="bg-[#1e1e1e] border-gray-600">
              <CardHeader>
                <CardTitle className="text-orange-300">Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {analytics.map((batch: any, index: number) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-gray-700">
                      <AccordionTrigger className="text-white hover:text-orange-300">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-orange-500 text-white">
                            {batch.batch}
                          </Badge>
                          <span>Average Rating: {Math.round(batch.averageRating)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#2a2a2a] rounded-lg">
                          <div>
                            <div className="text-white font-semibold">Average Solved</div>
                            <div className="text-orange-300">{batch.averageSolved.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-white font-semibold">Participation Rate</div>
                            <div className="text-green-300">{batch.participationRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-white font-semibold">Latest Contest</div>
                            <div className="text-blue-300">{batch.latestContest}</div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link href={`/analytics/${batch.batch}`}>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors">
                              View Full Analytics
                            </button>
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}