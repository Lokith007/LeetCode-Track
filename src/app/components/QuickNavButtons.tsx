"use client"

import { Button } from "@/components/ui/button"
import { Home, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface QuickNavButtonsProps {
  currentBatch?: string;
  currentSection?: string;
  secCount?: number;
}

export default function QuickNavButtons({ currentBatch, currentSection, secCount }: QuickNavButtonsProps) {
  const router = useRouter();
  
  return (
    <div className="flex justify-start items-center mb-2">
      {/* All Navigation Buttons Grouped on Left */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.back()}
          className="bg-[#1a1a1a] border-orange-300 text-orange-300 hover:bg-orange-900 hover:text-orange-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Link href="/">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#1a1a1a] border-orange-300 text-orange-300 hover:bg-orange-900 hover:text-orange-200 transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        {currentBatch && (
          <Link href={`/sections/${currentBatch}/${secCount || 1}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-[#1a1a1a] border-orange-300 text-orange-300 hover:bg-orange-900 hover:text-orange-200 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Back to Sections
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
