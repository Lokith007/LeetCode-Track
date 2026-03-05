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

      {/* Platform Cards */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-8 flex-wrap max-w-4xl mx-auto">
          {/* LeetCode Card */}
          <div
            onClick={() => handleClick("leetcode")}
            className="group cursor-pointer p-6 w-48 h-40 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 shadow-lg flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-orange-300 transition-all duration-200"
          >
            <span className="text-xl font-bold text-orange-700 mb-2">LeetCode</span>
            <p className="text-sm text-orange-600 text-center">Practice & Compete</p>
          </div>

          {/* CodeChef Card */}
          <div
            onClick={() => handleClick("codechef")}
            className="group cursor-pointer p-6 w-48 h-40 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-lg flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-purple-300 transition-all duration-200"
          >
            <span className="text-xl font-bold text-purple-700 mb-2">CodeChef</span>
            <p className="text-sm text-purple-600 text-center">Sharpen Skills</p>
          </div>

          {/* CodeForces Card */}
          <div
            onClick={() => handleClick("codeforces")}
            className="group cursor-pointer p-6 w-48 h-40 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-blue-300 transition-all duration-200"
          >
            <span className="text-xl font-bold text-blue-700 mb-2">CodeForces</span>
            <p className="text-sm text-blue-600 text-center">Compete & Excel</p>
          </div>

          <div
            onClick={() => handleClick("hackerrank")}
            className="group cursor-pointer p-6 w-48 h-40 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg flex flex-col items-center justify-center hover:scale-105 hover:shadow-xl hover:border-green-300 transition-all duration-200"
          >
            <span className="text-xl font-bold text-green-700 mb-2">HackerRank</span>
            <p className="text-sm text-green-600 text-center">Solve & Learn</p>
          </div>
        </div>
      </div>

      {/* Weekly Tournaments */}
      <div className="w-full max-w-7xl mx-auto mt-20 mb-8">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-12 h-1 bg-orange-500 rounded-full mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Weekly Tournaments</h2>
          <p className="text-sm text-gray-400">Track real-time performance in recent weekly contests</p>
        </div>

        <div className="flex items-center justify-center gap-6 flex-wrap max-w-6xl mx-auto">
          {/* CodeForces Weekly */}
          <div
            onClick={() => handleClick("codeforces-weekly")}
            className="group relative cursor-pointer p-6 w-[280px] h-32 rounded-2xl bg-[#0f0f0f]/80 backdrop-blur-sm border border-blue-500/20 shadow-lg flex flex-col items-start justify-center hover:border-blue-500/60 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute -right-4 top-4 opacity-5 group-hover:opacity-[0.15] transition-opacity flex gap-1">
              {/* Decorative bar shape */}
              <div className="w-6 h-24 bg-blue-500 rounded-sm"></div>
              <div className="w-6 h-16 bg-blue-500 rounded-sm mt-8"></div>
              <div className="w-6 h-20 bg-blue-500 rounded-sm mt-4"></div>
            </div>
            <span className="text-xs font-bold tracking-widest text-blue-500 mb-2 z-10">CODEFORCES</span>
            <span className="text-xl font-bold text-white mb-auto z-10">Weekly Clash</span>
            <span className="text-xs font-medium text-blue-500 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity mt-3 z-10">
              View Leaderboard <span className="ml-1 text-lg leading-none">→</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
