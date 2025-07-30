'use client'

import { useRouter } from 'next/navigation'
import { GraduationCap, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'

const cseSections = Array.from({ length: 17 }, (_, i) => ({
  name: `CSE ${String.fromCharCode(65 + i)}`, // CSE A → CSE Q
}))

const LeetCodeSections = () => {
  const router = useRouter()

  const handleSectionClick = (sectionName?: string) => {
    const currentPath = window.location.pathname
    const batchMatch = currentPath.match(/\/leaderboard\/([^\/]+)/)
    const batch = batchMatch ? batchMatch[1] : 'batch24-28'

    if (sectionName) {
      const formatted = sectionName.replace(/\s+/g, '-')
      router.push(`/leaderboard/${batch}/${formatted}`)
    } else {
      router.push(`/leaderboard/${batch}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 py-12 px-4 sm:px-6 lg:px-12 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-orange-400">
          CSE Sections
        </h2>
        <p className="text-sm text-gray-400">
          Click on a section to explore its leaderboard
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {/* All Sections Card */}
        <Card
          onClick={() => handleSectionClick(undefined)}
          className="group cursor-pointer bg-[#121212] border border-orange-300 rounded-2xl p-5 transition hover:border-[#fcd9b8] hover:shadow-lg hover:scale-105"
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-gray-800 group-hover:bg-[#fcd9b8] transition-colors">
              <Users className="h-6 w-6 text-[#fcd9b8] group-hover:text-gray-900 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-200 group-hover:text-[#fcd9b8]">
                All Sections
              </h3>
              <p className="text-xs text-gray-500">Entire Batch</p>
            </div>
          </div>
        </Card>

        {/* Individual CSE Sections */}
        {cseSections.map((section) => (
          <Card
            key={section.name}
            onClick={() => handleSectionClick(section.name)}
            className="group cursor-pointer bg-[#121212] border border-orange-300 rounded-2xl p-5 transition hover:border-[#fcd9b8] hover:shadow-lg hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-3 rounded-full bg-gray-800 group-hover:bg-[#fcd9b8] transition-colors">
                <GraduationCap className="h-6 w-6 text-[#fcd9b8] group-hover:text-gray-900 transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-200 group-hover:text-[#fcd9b8]">
                  {section.name}
                </h3>
                <p className="text-xs text-gray-500">Leaderboard</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default LeetCodeSections
