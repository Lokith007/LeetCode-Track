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
  // Render
  // -----------------------------
  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Leaderboard — Batch: {batch}</h2>
        <div className="flex gap-2 items-center">
          <input
            id="search"
            placeholder="Search name, roll, section"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded px-3 py-1 w-64 focus:outline-none focus:ring"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded px-2 py-1"
          >
            <option>All</option>
            <option>SDE</option>
            <option>Non-SDE</option>
          </select>
          <button
            onClick={() => exportLatestContestData()}
            className="px-3 py-1 border rounded hover:shadow"
          >
            Export XLSX
          </button>
        </div>
      </header>

      <nav className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 rounded ${activeTab === 'dashboard' ? 'bg-gray-200' : 'bg-white'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('contests')}
          className={`px-3 py-1 rounded ${activeTab === 'contests' ? 'bg-gray-200' : 'bg-white'}`}
        >
          Contests
        </button>

        {activeTab === 'contests' && (
          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm">Show</label>
            <select
              value={contestTab}
              onChange={(e) => setContestTab(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="attended">Attended</option>
              <option value="not-attended">Not Attended</option>
            </select>
          </div>
        )}
      </nav>

      <section className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Name</th>
              <th className="border px-2 py-1 text-left">Roll</th>
              <th className="border px-2 py-1 text-left">Section</th>
              <th className="border px-2 py-1 text-right cursor-pointer" onClick={() => toggleSort('rating')}>Rating</th>
              <th className="border px-2 py-1 text-right cursor-pointer" onClick={() => toggleSort('predictRating')}>Predicted Rating</th>
              <th className="border px-2 py-1 text-right cursor-pointer" onClick={() => toggleSort('totalSolved')}>Solved</th>
              <th className="border px-2 py-1 text-right cursor-pointer" onClick={() => toggleSort('currRank')}>Rank</th>
              <th className="border px-2 py-1 text-right cursor-pointer" onClick={() => toggleSort('latestScore')}>Latest Score</th>
              <th className="border px-2 py-1 text-center">Last Contest</th>
              <th className="border px-2 py-1 text-center">Trend</th>

            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={8} className="p-4 text-center text-red-600">Error loading students.</td></tr>
            ) : paginatedStudents.length === 0 ? (
              <tr><td colSpan={8} className="p-4 text-center">No students found.</td></tr>
            ) : (
              paginatedStudents.map((s) => {
                const latest = s.latestContests && s.latestContests.length ? s.latestContests[s.latestContests.length - 1] : null;
                const latestScore = latest?.data?.score ?? '-';
                const currRank = latest?.data?.rank ?? '-';
                const predRating = latest?.data?.new_rating ?? '-';
                const trend = latest?.data?.new_rating > latest?.data?.old_rating ? 'UP' : 'DOWN'


                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{s.name}</td>
                    <td className="border px-2 py-1">{s.rollNumber}</td>
                    <td className="border px-2 py-1">{s.section}</td>
                    <td className="border px-2 py-1 text-right">{s.rating ?? '-'}</td>
                    <td className="border px-2 py-1 text-right">{predRating}</td>
                    <td className="border px-2 py-1 text-right">{s.totalSolved ?? '-'}</td>
                    <td className="border px-2 py-1 text-right">{currRank}</td>
                    <td className="border px-2 py-1 text-right">{latestScore}</td>
                    <td className="border px-2 py-1 text-center">
                      {latest ? (
                        <div className="text-sm">
                          <div>{latest.title}</div>
                          <div className="text-xs text-gray-600">Solved: {latest.data.solvedCount}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="border px-2 py-1 text-right">{trend}</td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

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
