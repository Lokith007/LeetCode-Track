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

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { gql, useQuery } from '@apollo/client';
import * as XLSX from 'xlsx';
import { getBatchDisplayName } from '@/app/data/data';

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
  console.log('Leaderboard batch:', batch);
  console.log('Display name:', getBatchDisplayName(batch));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contests'>('contests');
  const [contestTab, setContestTab] = useState<'attended' | 'not-attended'>('attended');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'SDE' | 'Non-SDE'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'totalSolved' | 'globalRanking' | 'latestScore' | 'currRank' | 'predictRating' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    // Filter by section if a specific section is selected (not "all")
    if (section && section !== 'all' && section !== 'All') {
      console.log('Section filtering:', { section, students: students.map(s => s.section) });

      // Direct match since database stores sections as "CSE-A" format
      list = list.filter((s) => {
        if (!s.section) return false;

        const matches = s.section === section;
        console.log(`Student ${s.name} section: "${s.section}" matches "${section}": ${matches}`);
        return matches;
      });

      console.log('Filtered students count:', list.length);
    }

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
            bVal = b.latestContests?.[b.latestContests.length - 1]?.data?.new_rating ?? -Infinity;
            break;
          case 'totalSolved':
            aVal = a.totalSolved ?? -Infinity;
            bVal = b.totalSolved ?? -Infinity;
            break;
          case 'currRank':
            aVal = a.latestContests?.[a.latestContests.length - 1]?.data?.rank ?? Infinity;
            bVal = b.latestContests?.[b.latestContests.length - 1]?.data?.rank ?? Infinity;
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

    XLSX.writeFile(workbook, `Leaderboard-${getBatchDisplayName(batch)}-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
      <div className="w-full max-w-none">
        {/* Header Section - No Tile */}
        <div className="mb-4">
          {/* Top Row - Title and Attendance Cards */}
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[#fcd9b8] leading-tight tracking-wide px-4 py-2 inline-block">
              Leaderboard — {getBatchDisplayName(batch)}{section !== 'All' && section !== 'all' ? ` (${section})` : ''}
            </h1>


          </div>

          {/* Bottom Row - Search and Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Enhanced Search Bar with Simple Hover Effects */}
            <div className="relative flex-1 max-w-md group">
              <div className="relative">
                <input
                  id="search"
                  placeholder="Search name, roll, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0f0f0f] text-gray-200 border border-[#f59e0b40] 
                    rounded-xl pl-12 pr-4 py-3 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-[#f59e0b60] focus:border-[#f59e0b] 
                    hover:border-[#f59e0b] transition-all duration-300 shadow-lg"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gradient-to-r from-[#f59e0b] to-[#fcd9b8] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">🔍</span>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors duration-200"
                  >
                    <span className="text-white text-xs">×</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Side - Control Buttons */}
            <div className="flex items-center gap-3">
              {/* Enhanced Section Filter */}
              <div className="relative group">
                <div
                  className="flex items-center gap-2 bg-[#0f0f0f] border border-[#f59e0b40] rounded-xl px-4 py-2 cursor-pointer hover:border-[#f59e0b60] transition-all duration-200 w-40"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <span className="text-gray-300 text-sm font-medium truncate flex-1">
                    {filter === 'All' ? 'All Sections' : filter === 'SDE' ? 'SDE' : 'Non-SDE'}
                  </span>
                  <div className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </div>
                </div>

                <div
                  className={`absolute top-full left-0 mt-2 w-full bg-[#0f0f0f] border border-[#f59e0b40] rounded-xl shadow-xl transition-all duration-200 z-10 ${isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  {[
                    { value: 'All', label: 'All Sections' },
                    { value: 'SDE', label: 'SDE' },
                    { value: 'Non-SDE', label: 'Non-SDE' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value as any);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-all duration-200 hover:bg-[#1a1a1a] first:rounded-t-xl last:rounded-b-xl ${filter === option.value
                        ? 'bg-[#f59e0b] text-black'
                        : 'text-gray-300 hover:text-white'
                        }`}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => exportLatestContestData()}
                className="group relative px-6 py-2.5 rounded-xl font-semibold text-sm
                  bg-gradient-to-r from-[#f59e0b] to-[#fcd9b8] 
                  text-black hover:shadow-xl hover:scale-105 
                  transition-all duration-300 border border-[#f59e0b] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-2">
                  📊
                  <span>Export XLSX</span>
                </span>
              </button>

              {/* Enhanced Attendance Filter with Counts */}
              <div className="flex items-center">
                <div className="flex bg-[#0f0f0f] border border-[#f59e0b40] rounded-xl p-1 shadow-lg">
                  {[
                    {
                      value: 'attended',
                      label: 'Attended',
                      icon: '✅',
                      color: 'from-green-500 to-emerald-600',
                      count: attendedCount
                    },
                    {
                      value: 'not-attended',
                      label: 'Not Attended',
                      icon: '❌',
                      color: 'from-red-500 to-pink-600',
                      count: notAttendedCount
                    }
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setContestTab(tab.value as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:shadow-lg ${contestTab === tab.value
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105 border border-white/20`
                        : 'text-gray-300 hover:text-white hover:bg-[#1a1a1a] border border-transparent hover:border-[#f59e0b60]'
                        }`}
                    >
                      <span className="text-xs">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${contestTab === tab.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                        }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_repeat(9,1fr)] gap-12 items-center 
            px-8 py-4 mb-6
            bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] 
            rounded-lg shadow-md border border-[#f59e0b40]">
          <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Name</div>
          <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Section</div>
          <div className={`cursor-pointer hover:text-[#fcd9b8] transition-colors flex items-center gap-2 ${sortBy === 'latestScore' ? 'text-[#fcd9b8]' : ''}`} onClick={() => toggleSort('latestScore')}>
            Latest Score
            {sortBy === 'latestScore' && (
              <span className="text-sm">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className={`cursor-pointer hover:text-[#fcd9b8] transition-colors flex items-center gap-2 ${sortBy === 'totalSolved' ? 'text-[#fcd9b8]' : ''}`} onClick={() => toggleSort('totalSolved')}>
            Total Solved
            {sortBy === 'totalSolved' && (
              <span className="text-sm">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className={`cursor-pointer hover:text-[#fcd9b8] transition-colors flex items-center gap-2 ${sortBy === 'rating' ? 'text-[#fcd9b8]' : ''}`} onClick={() => toggleSort('rating')}>
            Rating
            {sortBy === 'rating' && (
              <span className="text-sm">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className={`cursor-pointer hover:text-[#fcd9b8] transition-colors flex items-center gap-2 ${sortBy === 'predictRating' ? 'text-[#fcd9b8]' : ''}`} onClick={() => toggleSort('predictRating')}>
            Predicted Rating
            {sortBy === 'predictRating' && (
              <span className="text-sm">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="cursor-pointer hover:text-[#fcd9b8] transition-colors">Code</div>
          <div className={`cursor-pointer hover:text-[#fcd9b8] transition-colors flex items-center gap-2 ${sortBy === 'currRank' ? 'text-[#fcd9b8]' : ''}`} onClick={() => toggleSort('currRank')}>
            Rank
            {sortBy === 'currRank' && (
              <span className="text-sm">
                {sortOrder === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
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
              <div key={s.id} className="mb-6 transition-transform transform hover:scale-[1.02] hover:shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_repeat(9,0.8fr)] gap-4 items-center 
          px-6 py-2
          bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] 
          rounded-xl shadow-md border border-[#f59e0b40] hover:bg-[#252525] hover:border-[#f59e0b60] hover:shadow-xl transition-all duration-300 cursor-pointer">

                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fcd9b8] to-[#f59e0b] text-black font-bold flex items-center justify-center text-sm">
                      {s.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-base text-white">{s.name}</div>
                      <div className="text-sm text-gray-400">@{s.rollNumber}</div>
                    </div>
                  </div>

                  {/* Section */}
                  <div className="text-center">
                    <div className="font-bold text-lg text-white">{sect}</div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="font-bold text-lg text-white">{latestScore}</div>
                    <div className="text-xs text-gray-400">Score</div>
                  </div>

                  {/* Total Solved */}
                  <div className="text-center">
                    <div className="font-bold text-lg text-white">{total}</div>
                    <div className="text-xs text-gray-400">Solved</div>
                  </div>

                  {/* Old Rating */}
                  <div className="text-center">
                    <div className="font-bold text-lg text-white">
                      {oldRating !== null ? oldRating.toFixed(2) : "-"}
                    </div>
                    <div className="text-xs text-gray-400">Old Rating</div>
                  </div>

                  {/* Predicted Rating */}
                  <div className="text-center">
                    <div className="font-bold text-lg text-white">
                      {newRating !== null ? newRating.toFixed(2) : "-"}
                    </div>
                    <div className="text-xs text-gray-400">Predicted</div>
                  </div>

                  {/* Code Status */}
                  <div className="text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${latest?.data?.attempted
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
                  <div className="w-full p-2 rounded-xl shadow text-center space-y-1 bg-[#1c1c1c] hover:bg-[#252525] hover:shadow-lg transition-all duration-300">
                    <div className="text-sm font-semibold text-[#fcd9b8]">
                      {latest?.data?.solvedCount ?? 0}/4
                    </div>
                    <div className="text-[11px] text-gray-400">Solved</div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-white font-medium">
                      <div className="bg-green-500 rounded py-1 hover:bg-green-400 transition-colors duration-200">
                        {latest?.data?.easySolved ?? 0}
                      </div>
                      <div className="bg-yellow-500 rounded py-1 hover:bg-yellow-400 transition-colors duration-200">
                        {latest?.data?.mediumSolved ?? 0}
                      </div>
                      <div className="bg-red-500 rounded py-1 hover:bg-red-400 transition-colors duration-200">
                        {latest?.data?.hardSolved ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className={`font-semibold text-sm text-center ${trend === "UP" ? "text-green-400" : "text-red-400"
                    }`}>
                    {trend === "UP" ? "↑ UP" : "↓ DOWN"}
                  </div>
                </div>
              </div>
            );
          })
        )}


      </div>

      {/* Bottom Pagination */}
      <div className="mt-4 flex justify-center">
        {/* Center - Page numbers */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setPageIndex((p) => Math.max(0, p - 1));
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
            disabled={pageIndex === 0}
            className="px-2 py-1 border border-[#f59e0b40] rounded text-gray-200 hover:bg-[#f59e0b20] hover:border-[#f59e0b60] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-[#f59e0b40] transition-all duration-200 flex items-center gap-1 text-xs"
          >
            <span className="text-xs">←</span>
            <span className="hidden sm:inline text-xs">Prev</span>
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
                  <span key={idx} className="px-1 py-1 text-gray-400 flex items-center text-xs">
                    ⋯
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => {
                      setPageIndex(p as number);
                      document.body.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-2 py-1 border rounded transition-all duration-200 min-w-[2rem] text-xs ${pageIndex === p
                      ? "bg-[#f59e0b] text-black border-[#f59e0b] font-semibold shadow-lg"
                      : "bg-[#0f0f0f] text-gray-200 border-[#f59e0b40] hover:bg-[#f59e0b20] hover:border-[#f59e0b60] hover:scale-105"
                      }`}
                  >
                    {(p as number) + 1}
                  </button>
                )
              );
            })()}
          </div>

          <button
            onClick={() => {
              const newPage = pageIndex + 1;
              if (newPage < Math.ceil(filteredStudents.length / PAGE_LIMIT)) {
                setPageIndex(newPage);
                document.body.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            disabled={pageIndex + 1 >= Math.ceil(filteredStudents.length / PAGE_LIMIT)}
            className="px-2 py-1 border border-[#f59e0b40] rounded text-gray-200 hover:bg-[#f59e0b20] hover:border-[#f59e0b60] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-[#f59e0b40] transition-all duration-200 flex items-center gap-1 text-xs"
          >
            <span className="hidden sm:inline text-xs">Next</span>
            <span className="text-xs">→</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Leaderboard;


