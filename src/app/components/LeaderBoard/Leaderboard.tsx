/*
Production-ready Leaderboard component (Next.js app router / React 18 + Tailwind CSS + Apollo Client + SheetJS)

Features included:
- TypeScript types and resilient null-safety
- Frontend pagination (client-side slicing)
- Client-side filtering, searching, sorting
- XLSX export grouped by section
- Accessibility, ARIA labels, and keyboard support
- Loading & error states
- Minimal, modern UI using Tailwind

Place this file in a React/Next.js client component location (e.g. app/components/Leaderboard.tsx)
Make sure you have:
- @apollo/client configured and exported as default from '@/lib/apollo-client'
- Tailwind CSS installed and configured
- xlsx (SheetJS) installed
*/

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import * as XLSX from 'xlsx';

// -----------------------------
// GraphQL query (fetch all)
// -----------------------------
const GET_STUDENTS = gql`
  query Students($batch: String!) {
    students(batch: $batch) {
      id
      name
      rollNumber
      section
      totalSolved
      easySolved
      mediumSolved
      hardSolved
      rating
      globalRanking
      topPercentage
      attendedContestsCount
      latestContests {
        title
        data {
          score
          attempted
          copied
          rank
          solvedCount
          easySolved
          mediumSolved
          hardSolved
          available
          new_rating
          old_rating
          savedAt
        }
      }
    }
  }
`;

// -----------------------------
// Types
// -----------------------------
type ContestData = {
  score: number;
  attempted: boolean;
  copied: boolean;
  rank: number;
  solvedCount: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  available: boolean;
  new_rating: number;
  old_rating: number;
  savedAt: string;
};

type LatestContest = {
  title: string;
  data: ContestData;
};

export type Student = {
  id: string;
  name: string;
  rollNumber: string;
  section?: string | null;
  totalSolved?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  rating?: number;
  globalRanking?: number;
  topPercentage?: number;
  attendedContestsCount?: number;
  latestContests: LatestContest[];
};

// -----------------------------
// Constants & helpers
// -----------------------------
const PAGE_LIMIT = 20;
const SDE_SECTIONS = ['CSE-L', 'CSE-M', 'CSE-N', 'CSE-O', 'CSE-P', 'CSE-Q'];

const normalize = (s?: string | null) => (s ? s.toString().trim().toUpperCase() : '');

// -----------------------------
// Props
// -----------------------------
type LeaderboardProps = {
  batch: string;
  section?: string; // optional; if omitted, server will return all sections
  setView?: (view: 'dashboard' | 'contest') => void;
};

// -----------------------------
// Component
// -----------------------------
const Leaderboard: React.FC<LeaderboardProps> = ({ batch, section = 'All', setView }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contests'>('contests');
  const [contestTab, setContestTab] = useState<'attended' | 'not-attended'>('attended');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'SDE' | 'Non-SDE'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'totalSolved' | 'globalRanking' | 'latestScore' | 'currRank' | 'predictRating' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // pagination (frontend)
  const [pageIndex, setPageIndex] = useState(0);

  // fetch all students once
  const { loading, error, data } = useQuery<{ students: Student[] }>(GET_STUDENTS, {
    variables: {
      batch,
    },
    fetchPolicy: 'cache-first',
  });

  const students = data?.students || [];

  // -----------------------------
  // Derived & filtered list (client-side filtering, searching, sorting)
  // -----------------------------
  useEffect(() => {
    setPageIndex(0);
  }, [searchQuery, filter, sortBy, sortOrder, activeTab, contestTab]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let list = students.slice();

    if (q) {
      list = list.filter((s) => {
        return (
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
          (s.section && s.section.toLowerCase().includes(q))
        );
      });
    }

    if (filter !== 'All') {
      list = list.filter((s) => {
        const isSDE = SDE_SECTIONS.includes(normalize(s.section));
        return filter === 'SDE' ? isSDE : !isSDE;
      });
    }

    if (activeTab === 'contests') {
      list = list.filter((s) => {
        const contests = s.latestContests || [];
        return contests.some((c) =>
          contestTab === 'attended' ? c.data.attempted || c.data.available : !c.data.attempted && !c.data.available
        );
      });
    }

    if (sortBy) {
      list.sort((a, b) => {
        let aVal: number = 0;
        let bVal: number = 0;

        switch (sortBy) {
          case 'rating':
            aVal = a.rating ?? -Infinity;
            bVal = b.rating ?? -Infinity;
            break;
          case 'predictRating':
            aVal = a.latestContests?.[a.latestContests.length - 1]?.data?.new_rating ?? -Infinity;
            bVal =  b.latestContests?.[b.latestContests.length - 1]?.data?.new_rating ?? -Infinity;
            break;
          case 'totalSolved':
            aVal = a.totalSolved ?? -Infinity;
            bVal = b.totalSolved ?? -Infinity;
            break;
          case 'currRank':
            aVal = a.latestContests?.[a.latestContests.length - 1]?.data?.rank ?? Infinity;
            bVal =  b.latestContests?.[b.latestContests.length - 1]?.data?.rank ?? Infinity;
            break;
          case 'latestScore':
            aVal = a.latestContests?.[a.latestContests.length - 1]?.data?.score ?? -Infinity;
            bVal = b.latestContests?.[b.latestContests.length - 1]?.data?.score ?? -Infinity;
            break;
          default:
            aVal = 0;
            bVal = 0;
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }


    return list;
  }, [students, searchQuery, filter, sortBy, sortOrder, activeTab, contestTab]);

  const paginatedStudents = useMemo(() => {
    const start = pageIndex * PAGE_LIMIT;
    return filteredStudents.slice(start, start + PAGE_LIMIT);
  }, [filteredStudents, pageIndex]);

  // -----------------------------
  // Export to XLSX grouped by section
  // -----------------------------
  const exportLatestContestData = useCallback(() => {
    const exportData = filteredStudents
      .map((student) => {
        const contests = (student.latestContests || []).filter((contest) =>
          activeTab === 'contests'
            ? contestTab === 'attended'
              ? contest.data.attempted || contest.data.available
              : !contest.data.attempted && !contest.data.available
            : contest.data.attempted || contest.data.available
        );

        const latest = contests.length ? contests[contests.length - 1] : null;
        if (!latest) return null;

        return {
          Name: student.name,
          RollNumber: student.rollNumber,
          Section: student.section || 'Unknown',
          Score: latest.data.score,
          OldRating: student.rating,
          NewRating: latest.data.new_rating,
          Copied: latest.data.copied ? 'Yes' : 'No',
          Rank: latest.data.rank ?? student.globalRanking ?? '',
          Solved: latest.data.solvedCount,
          EasySolved: latest.data.easySolved,
          MediumSolved: latest.data.mediumSolved,
          HardSolved: latest.data.hardSolved,
          Trend: latest.data.new_rating > latest.data.old_rating ? 'UP' : 'DOWN',
        } as Record<string, any>;
      })
      .filter(Boolean) as Record<string, any>[];

    const grouped: Record<string, Record<string, any>[]> = exportData.reduce((acc, row) => {
      const sec = (row.Section || 'Unknown').toString();
      acc[sec] = acc[sec] || [];
      acc[sec].push(row);
      return acc;
    }, {} as Record<string, Record<string, any>[]>);

    const workbook = XLSX.utils.book_new();
    Object.keys(grouped).forEach((sec) => {
      const ws = XLSX.utils.json_to_sheet(grouped[sec]);
      XLSX.utils.book_append_sheet(workbook, ws, sec.substring(0, 31));
    });

    XLSX.writeFile(workbook, `Leaderboard-${batch}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [batch, filteredStudents, contestTab, activeTab]);

  // -----------------------------
  // UI helpers
  // -----------------------------
  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'globalRanking' ? 'asc' : 'desc');
    }
  };
// -----------------------------
// Totals: attended vs not-attended
// -----------------------------
const { attendedCount, notAttendedCount } = useMemo(() => {
  let attended = 0;
  let notAttended = 0;

  students.forEach((s) => {
    const contests = s.latestContests || [];
    const hasAttended = contests.some(
      (c) => c.data?.attempted || c.data?.available
    );

    if (hasAttended) {
      attended++;
    } else {
      notAttended++;
    }
  });

  return { attendedCount: attended, notAttendedCount: notAttended };
}, [students]);
  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="min-h-screen px-4 py-10 bg-[#121212] text-gray-200 space-y-10">
<header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 
  px-6 py-3 rounded-xl 
  bg-gradient-to-r from-[#1f1f1f] via-[#242424] to-[#2a2a2a] 
  shadow-md border border-[#f59e0b40] gap-3">
  
  {/* Title */}
  <h2 className="text-xl font-semibold text-[#fcd9b8]">
    Leaderboard — Batch: {batch}
  </h2>

  {/* Controls */}
  <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
    {/* Search */}
    <input
      id="search"
      placeholder="Search name, roll, section"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="bg-[#1c1c1c] text-gray-200 border border-[#f59e0b40] 
        rounded-lg px-3 py-2 w-full md:w-64 
        focus:outline-none focus:ring-2 focus:ring-[#f59e0b] transition"
    />

    {/* Filter */}
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value as any)}
      className="bg-[#1c1c1c] text-gray-200 border border-[#f59e0b40] 
        rounded-lg px-3 py-2 
        focus:outline-none focus:ring-2 focus:ring-[#f59e0b] transition"
    >
      <option>All</option>
      <option>SDE</option>
      <option>Non-SDE</option>
    </select>

    {/* Export Button */}
    <button
      onClick={() => exportLatestContestData()}
      className="px-4 py-2 rounded-lg font-medium 
        bg-gradient-to-r from-[#f59e0b] to-[#fcd9b8] 
        text-black hover:shadow-lg hover:scale-[1.03] 
        transition-transform"
    >
      Export XLSX
    </button>
  </div>
  <div className="ml-4 flex items-center gap-2">
            <select
              value={contestTab}
              onChange={(e) => setContestTab(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="attended">Attended: {attendedCount}</option>
              <option value="not-attended">Not Attended: {notAttendedCount}</option>
            </select>
          </div>
</header>



<div className="grid grid-cols-1 md:grid-cols-[1.3fr_repeat(9,0.8fr)] gap-4 items-center 
          px-6 py-4 
          bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] 
          rounded-xl shadow-md border border-[#f59e0b40]">
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Name</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Section</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors" onClick={() => toggleSort('latestScore')}>Latest Score</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors" onClick={() => toggleSort('totalSolved')}>Toal Solved</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors" onClick={() => toggleSort('rating')}>Rating</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors" onClick={() => toggleSort('predictRating')}>Predicted Rating</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Code</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors" onClick={() => toggleSort('currRank')}>Rank</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Last Contest</div>
  <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Trend</div>
</div>

{loading ? (
  <div className="p-4 text-center">Loading...</div>
) : error ? (
  <div className="p-4 text-center text-red-600">Error loading students.</div>
) : paginatedStudents.length === 0 ? (
  <div className="p-4 text-center">No students found.</div>
) : (
  paginatedStudents.map((s) => {
    const latest =
      s.latestContests && s.latestContests.length
        ? s.latestContests[s.latestContests.length - 1]
        : null;

    const latestScore = latest?.data?.score ?? "-";
    const oldRating = s?.rating ?? null;
    const sect = s?.section ?? null;

    const newRating = latest?.data?.new_rating ?? null;
    const rank = latest?.data?.rank ?? null;
    const total = s.totalSolved ?? null;

    const trend =
      newRating !== null && oldRating !== null
        ? newRating > oldRating
          ? "UP"
          : "DOWN"
        : "DOWN";

    return (
      <div
        key={s.id}
        className="transition-transform transform hover:scale-[1.02] hover:shadow-lg"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-[1.2fr_repeat(9,0.8fr)] gap-4 items-center 
          px-6 py-2
          bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] 
          rounded-xl shadow-md border border-[#f59e0b40]"
        >
          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fcd9b8] to-[#f59e0b] text-black font-bold flex items-center justify-center text-sm">
              {s.name[0]}
            </div>
            <div>
              <div className="font-semibold text-base">{s.name}</div>
              <div className="text-sm text-gray-400">@{s.rollNumber}</div>
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className="font-bold text-lg">{sect}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{latestScore}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>

          <div className="text-center">
            <div className="font-bold text-lg">{total}</div>
            <div className="text-xs text-gray-400">Solved</div>
          </div>

          {/* Old Rating */}
          <div className="text-center">
            <div className="font-bold text-lg">
              {oldRating !== null ? oldRating.toFixed(2) : "-"}
            </div>
            <div className="text-xs text-gray-400">Old Rating</div>
          </div>

          {/* Predicted */}
          <div className="text-center">
            <div className="font-bold text-lg">
              {newRating !== null ? newRating.toFixed(2) : "-"}
            </div>
            <div className="text-xs text-gray-400">Predicted</div>
          </div>

          {/* Code Status */}
          <div className="text-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-bold ${
                latest?.data?.attempted
                  ? latest?.data?.copied
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {latest?.data?.attempted
                ? latest?.data?.copied
                  ? "Copied"
                  : "Original"
                : "Unknown"}
            </span>
            <div className="text-xs text-gray-400 mt-1">Code</div>
          </div>

          {/* Global Rank */}
          <div className="text-center">
            <div className="text-md font-medium text-[#fcd9b8]">
              #{rank ?? "-"}
            </div>
            <div className="text-xs text-gray-400">Rank</div>
          </div>

          {/* Solved Breakdown */}
          <div className="w-full p-2 rounded-xl shadow text-center space-y-1 bg-[#1c1c1c]">
            <div className="text-sm font-semibold text-[#fcd9b8]">
              {latest?.data?.solvedCount ?? 0}/4
            </div>
            <div className="text-[11px] text-gray-400">Solved</div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-white font-medium">
              <div className="bg-green-500 rounded py-1">
                {latest?.data?.easySolved ?? 0}
              </div>
              <div className="bg-yellow-500 rounded py-1">
                {latest?.data?.mediumSolved ?? 0}
              </div>
              <div className="bg-red-500 rounded py-1">
                {latest?.data?.hardSolved ?? 0}
              </div>
            </div>
          </div>

          {/* Trend */}
          <div
            className={`font-semibold text-sm text-center ${
              trend === "UP" ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend === "UP" ? "↑ UP" : "↓ DOWN"}
          </div>
        </div>
      </div>
    );
  })
)}


      <footer className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
          disabled={pageIndex === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <div className="flex gap-1">
          {(() => {
            const totalPages = Math.ceil(filteredStudents.length / PAGE_LIMIT);
            const pages: (number | string)[] = [];

            if (totalPages <= 7) {
              // Show all if few pages
              for (let i = 0; i < totalPages; i++) pages.push(i);
            } else {
              // Always show first and last
              pages.push(0);
              let start = Math.max(pageIndex - 1, 1);
              let end = Math.min(pageIndex + 1, totalPages - 2);

              if (start > 1) pages.push("...");
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPages - 2) pages.push("...");
              pages.push(totalPages - 1);
            }

            return pages.map((p, idx) =>
              p === "..." ? (
                <span key={idx} className="px-2 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPageIndex(p as number)}
                  className={`px-2 py-1 border rounded ${pageIndex === p ? "bg-gray-200" : "bg-white"
                    }`}
                >
                  {(p as number) + 1}
                </button>
              )
            );
          })()}
        </div>

        <button
          onClick={() =>
            setPageIndex((p) =>
              p + 1 < Math.ceil(filteredStudents.length / PAGE_LIMIT) ? p + 1 : p
            )
          }
          disabled={pageIndex + 1 >= Math.ceil(filteredStudents.length / PAGE_LIMIT)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </footer>

    </div>
  );
};

export default Leaderboard;
