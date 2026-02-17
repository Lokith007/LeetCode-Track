"use client";
import { GraduationCap, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import CsvUploader from "@/app/components/csvParser/csvParser";
import { use } from "react";
import { useRouter } from "next/navigation";
import QuickNavButtons from "../../../components/QuickNavButtons";
import { useQuery, gql } from "@apollo/client";
import { classifyBatchIntoDepartment } from "@/lib/utils";

const GET_BATCH_INFO = gql`
  query GetBatchInfo {
    allBatches {
      name
      secCount
    }
  }
`;

const LeetCodeSections = ({
  params,
}: {
  params: Promise<{ batch: string; section: string }>;
}) => {
  const { batch, section } = use(params);
  const router = useRouter(); // ✅ hook from App Router

  const { data: batchData } = useQuery(GET_BATCH_INFO);

  // Get the actual secCount for the current batch
  const currentBatchInfo = batchData?.allBatches?.find((b: any) => b.name === batch);
  const secCount = currentBatchInfo?.secCount || 1;

  // Get the department name from the batch using shared function
  const departmentName = classifyBatchIntoDepartment(batch);

  // Generate sections with proper naming
  const sections = Array.from({ length: secCount }, (_, i) => {
    const sectionLetter = String.fromCharCode(65 + i);

    // Special handling for different department types
    if (batch.startsWith('CYBER')) {
      return { name: `CS-${sectionLetter}` };  // CS-A, CS-B, CS-C, etc.
    } else {
      return { name: `${departmentName}-${sectionLetter}` }; // CSE-A, CSE-B, AIDS-A, AIDS-B, etc.
    }
  });

  const handleSectionClick = (sectionName?: string) => {
    const formatted = sectionName || "all";
    router.push(`/platform/${batch}/${formatted}`);
  };

  const isSDESection = (name: string, batchName: string) => {
    // Only check for SDE if it's exactly batch24-28
    if (batchName !== 'batch24-28') return false;

    const suffix = name.split("-")[1];
    return ["L", "M", "N", "O", "P", "Q"].includes(suffix);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 py-12 px-6 space-y-10">
      {/* Quick Navigation - At the very top */}
      <div className="w-full max-w-7xl mx-auto">
        <QuickNavButtons />
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center mb-2">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold tracking-tight text-orange-400">
              {batch.startsWith('CYBER') ? 'CS' : departmentName} Sections
            </h2>
            <p className="text-sm text-gray-400">
              Click on a section to explore its leaderboard
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {/* All Sections Card */}
          <Card
            onClick={() => handleSectionClick(undefined)}
            className="group cursor-pointer bg-[#1e1e1e] border border-orange-300 rounded-2xl p-5 transition hover:border-[#fcd9b8] hover:shadow-lg hover:scale-105"
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

          {/* Generated Sections */}
          {sections.map((section) => (
            <Card
              key={section.name}
              onClick={() => handleSectionClick(section.name)}
              className="group cursor-pointer bg-[#1e1e1e] border border-orange-300 rounded-2xl p-5 transition hover:border-[#fcd9b8] hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 rounded-full bg-gray-800 group-hover:bg-[#fcd9b8] transition-colors">
                  <GraduationCap className="h-6 w-6 text-[#fcd9b8] group-hover:text-gray-900 transition-colors" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-200 group-hover:text-[#fcd9b8]">
                    {section.name.replace('-', ' ')}
                  </h3>
                  <p className="text-xs text-gray-500">Leaderboard</p>
                  {isSDESection(section.name, batch) && (
                    <p className="text-[11px] font-medium text-orange-300 mt-1">
                      SDE
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="absolute right-5 bottom-5">
        <CsvUploader batch={batch} />
      </div>
    </div>
  );
};

export default LeetCodeSections;
