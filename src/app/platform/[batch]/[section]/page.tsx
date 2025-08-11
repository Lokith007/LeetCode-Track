"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const params = useParams(); // { batch: '...', section: '...' }

  const { batch, section } = params as { batch: string; section: string };

  const handleClick = (platform: string) => {
    router.push(`/leaderboard/${batch}/${section}/${platform}`);
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center gap-8 ">
      {/* LeetCode Card */}
      <div
        onClick={() => handleClick("leetcode")}
        className="cursor-pointer p-6 w-56 h-40 rounded-2xl bg-orange-50 border border-orange-200 shadow-md flex flex-col items-center justify-center hover:scale-105 hover:shadow-lg hover:border-orange-300 transition-all duration-200"
      >
        <span className="text-xl font-bold text-orange-600">LeetCode</span>
        <p className="text-sm text-orange-400 mt-2">Practice & Compete</p>
      </div>

      {/* CodeChef Card */}
      <div
        onClick={() => handleClick("codechef")}
        className="cursor-pointer p-6 w-56 h-40 rounded-2xl bg-gray-100 border border-gray-300 shadow-md flex flex-col items-center justify-center hover:scale-105 hover:shadow-lg hover:border-gray-400 transition-all duration-200"
      >
        <span className="text-xl font-bold text-gray-700">CodeChef</span>
        <p className="text-sm text-gray-500 mt-2">Sharpen Skills</p>
      </div>
    </div>
  );
};

export default Page;
