"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import QuickNavButtons from "@/app/components/QuickNavButtons";
import { useQuery, gql } from "@apollo/client";

const GET_BATCH_INFO = gql`
  query GetBatchInfo {
    allBatches {
      name
      secCount
    }
  }
`;

const Page = () => {
  const router = useRouter();
  const params = useParams(); // { batch: '...', section: '...' }

  const { batch, section } = params as { batch: string; section: string };

  const { data: batchData } = useQuery(GET_BATCH_INFO);

  // Get the actual secCount for the current batch
  const currentBatchInfo = batchData?.allBatches?.find((b: any) => b.name === batch);
  const secCount = currentBatchInfo?.secCount || 1;

  const handleClick = (platform: string) => {
    router.push(`/leaderboard/${batch}/${section}/${platform}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f] p-8">
      {/* Quick Navigation */}
      <div className="w-full max-w-7xl mx-auto mb-12">
        <QuickNavButtons currentBatch={batch} secCount={secCount} />
      </div>

      {/* Platform Dashboard Cards */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col items-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Platform Dashboards</h2>
          <p className="text-gray-400">View overall rankings and statistics</p>
        </div>
        <div className="flex items-center justify-center gap-8 flex-wrap max-w-5xl mx-auto">
          {/* CodeForces Card */}
          <div
            onClick={() => handleClick("codeforces")}
            className="group cursor-pointer p-6 w-56 h-44 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-blue-300 transition-all duration-200"
          >
            <span className="text-2xl font-bold text-blue-700 mb-2">CodeForces</span>
            <p className="text-sm text-blue-600 text-center font-medium">Competitive Dashboard</p>
          </div>

          {/* Weekly Contest Card */}
          <div
            onClick={() => router.push(`/weekly-contest/${batch}/${section}/codeforces`)}
            className="group cursor-pointer p-6 w-56 h-44 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-red-300 transition-all duration-200"
          >
            <span className="text-2xl font-bold text-red-700 mb-2">Weekly Contest</span>
            <p className="text-sm text-red-600 text-center font-medium">Codeforces Weekly</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
