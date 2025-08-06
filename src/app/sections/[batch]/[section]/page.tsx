"use client";
import { GraduationCap, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import CsvUploader from "@/app/components/csvParser/csvParser";
import { use } from "react";
import { useRouter } from "next/navigation";

const LeetCodeSections = ({
  params,
}: {
  params: Promise<{ batch: string; section: string }>;
}) => {
  const { batch, section } = use(params);
  const router = useRouter(); // ✅ hook from App Router

  const cseSections = Array.from({ length: parseInt(section) }, (_, i) => ({
    name: `CSE ${String.fromCharCode(65 + i)}`,
  }));
  console.log(cseSections);

  const handleSectionClick = (sectionName?: string) => {
    const formatted = sectionName ? sectionName.replace(/\s+/g, "-") : "all";
    router.push(`/leaderboard/${batch}/${formatted}`);
  };

  const isSDESection = (name: string) => {
    const suffix = name.split(" ")[1];
    return ["L", "M", "N", "O", "P", "Q"].includes(suffix);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 py-12 px-4 sm:px-6 lg:px-12 space-y-10">
      <div className="flex items-center justify-between space-y-0 mb-2">
        <button
          onClick={() => {
            router.back();
          }}
          className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm
            bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          {"<-"}
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-3xl font-bold tracking-tight text-orange-400">
            CSE Sections
          </h2>
          <p className="text-sm text-gray-400">
            Click on a section to explore its leaderboard
          </p>
        </div>
        {/* Empty div for spacing on the right */}
        <div style={{ width: "96px" }}></div>
      </div><br />  

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
        {cseSections.map((section) => (
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
                  {section.name}
                </h3>
                <p className="text-xs text-gray-500">Leaderboard</p>
                {isSDESection(section.name) && (
                  <p className="text-[11px] font-medium text-orange-300 mt-1">
                    SDE
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="absolute right-5 bottom-5">
        <CsvUploader batch={batch} />
      </div>
    </div>
  );
};

export default LeetCodeSections;
