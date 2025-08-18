'use client';

import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

const GET_PAGINATED_STUDENTS = gql`
  query PaginatedStudents($batch: String!, $section: String, $limit: Int, $cursor: String) {
    paginatedStudents(batch: $batch, section: $section, limit: $limit, cursor: $cursor) {
      students {
        id
        name
        rollNumber
        section
        codeforcesUsername
        codeforces {
          handle
          currentRating
          maxRating
          rank
          friendOfCount
          contribution
          problemStats {
            difficultyBreakdown {
              easySolved
              mediumSolved
              hardSolved
              veryHardSolved
              legendarySolved
              totalSolved
            }
          }

          recentContests {
            attended
            contestId
            contestName
            startTime
            userPerformance {

              newRating
              oldRating
              rank
              ratingChange
              division

              wasEligible
            }
          }
          titlePhoto
        }
      }
      nextCursor
    }
  }
`;

export default function Leaderboard({ batch, section }: { batch: string; section: string }) {
  const [students, setStudents] = useState<any[]>([]);
  // Replace simple cursor with LeetCode-like pagination state
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<string[]>(['']);

  // New UI state
  const [activeTab, setActiveTab] = useState<'profile' | 'contest'>('profile');
  const [selectedContest, setSelectedContest] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<'attended' | 'not-attended'>('attended');
  const [filter, setFilter] = useState<'All' | 'SDE' | 'Non-SDE'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const SDE_SECTIONS = ['CSE-O', 'CSE-C', 'CSE-AI', 'CSE-AIML', 'CSE-CY', 'CSE-DS'];

  const { loading, fetchMore } = useQuery(GET_PAGINATED_STUDENTS, {
    variables: { batch, section: section === 'All' ? null : section, limit: 20, cursor: null },
    onCompleted: (data) => {
      setStudents(data.paginatedStudents.students);
      setNextCursor(data.paginatedStudents.nextCursor);
      setCursorHistory(['', data.paginatedStudents.nextCursor].filter(Boolean));
      setPage(0);

    },
    fetchPolicy: 'cache-and-network',
  });

  const handlePageChange = async (pageIndex: number) => {
    if (pageIndex === page) return;

    // Backwards: just move the page index; we already have cached pages
    if (pageIndex < page) {
      setPage(pageIndex);
      return;
    }

    if (!nextCursor) return;

    setFetchLoading(true);
    try {
      const { data } = await fetchMore({
        variables: {
          batch,
          section: section === 'All' ? null : section,
          limit: 20,
          cursor: nextCursor,
        },
      });

      const newStudents = data.paginatedStudents.students as any[];
      const newNextCursor = data.paginatedStudents.nextCursor as string | null;

      setStudents((prev) => [...prev, ...newStudents]);
      setNextCursor(newNextCursor);
      setPage(pageIndex);
      setCursorHistory((prev) => [...prev, newNextCursor].filter(Boolean));
    } finally {
      setFetchLoading(false);
    }
  };


  const sectionFiltered = useMemo(() => {
    return students
      .filter((s) => {
        const sec = s.section?.toUpperCase() ?? '';
        const sectionMatch = !section || section.toLowerCase() === 'all' || sec === section.toUpperCase();
        if (!sectionMatch) return false;
        const isSDE = SDE_SECTIONS.includes(sec);
        if (filter === 'SDE') return isSDE;
        if (filter === 'Non-SDE') return !isSDE;
        return true;
      })
      .filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.rollNumber.toLowerCase().includes(q) ||
          s.codeforcesUsername?.toLowerCase().includes(q)
        );
      });
  }, [students, section, filter, searchQuery]);

  // Sort by current rating descending for profile tab
  const sortedByRating = useMemo(() => {
    return [...sectionFiltered].sort((a, b) => {
      const ra = a.codeforces?.currentRating ?? -Infinity;
      const rb = b.codeforces?.currentRating ?? -Infinity;
      return rb - ra;
    });
  }, [sectionFiltered]);

  // Contest options (latest 5)
  const contestOptions = useMemo(() => {
    const map = new Map<string, number>();
    sectionFiltered.forEach((s: any) => {
      s.codeforces?.recentContests?.forEach((rc: any) => {
        if (!rc?.contestName) return;
        const t = rc.startTime ?? 0;
        const prev = map.get(rc.contestName);
        if (!prev || t > prev) map.set(rc.contestName, t);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 5);
  }, [sectionFiltered]);

  const contestRows = useMemo(() => {
    if (!selectedContest) return [] as Array<{ student: any; entry?: any }>;
    const attended: Array<{ student: any; entry: any }> = [];
    const notAttended: Array<{ student: any; entry?: any }> = [];
    sectionFiltered.forEach((student: any) => {
      const entry = student.codeforces?.recentContests?.find((rc: any) => rc.contestName === selectedContest);
      if (entry?.attended) attended.push({ student, entry });
      else notAttended.push({ student });
    });
    if (attendanceFilter === 'attended') {
      attended.sort((a, b) => (b.entry?.userPerformance?.newRating ?? -Infinity) - (a.entry?.userPerformance?.newRating ?? -Infinity));
      return attended;
    }
    notAttended.sort((a, b) => (b.student.codeforces?.currentRating ?? -Infinity) - (a.student.codeforces?.currentRating ?? -Infinity));
    return notAttended;
  }, [sectionFiltered, selectedContest, attendanceFilter]);

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-500';
    if (rating >= 2100) return 'text-red-400';
    if (rating >= 1900) return 'text-orange-500';
    if (rating >= 1600) return 'text-purple-500';
    if (rating >= 1400) return 'text-blue-500';
    if (rating >= 1200) return 'text-green-500';
    if (rating >= 1000) return 'text-gray-400';
    return 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex justify-center gap-2 bg-slate-800/50 p-2 rounded-2xl backdrop-blur-sm">
          {[
            { key: 'profile', label: 'Profile', icon: '👤' },
            { key: 'contest', label: 'Contest', icon: '🏁' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'profile' | 'contest')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile view */}
        {activeTab === 'profile' && (
          <>
            <div className="grid gap-4">
              {sortedByRating.map((student: any, index: number) => {
                const cf = student.codeforces;
                return (
                  <div key={student.id} className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Rank & Name */}
                      <div className="lg:col-span-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {page * 20 + (index + 1)}
                        </div>
                        <div>
                          <div className="text-white text-lg font-semibold flex items-center gap-2">
                            {student.name}
                            <span className="text-blue-300 text-base">⭐</span>
                          </div>
                          <div className="text-slate-300/70 text-sm">@{student.rollNumber} • {student.section}</div>
                        </div>
                      </div>
                      {/* Current Rating */}
                      <div className="lg:col-span-3 text-center space-y-1">
                        <div className={`text-blue-400 text-2xl font-extrabold ${cf?.currentRating ? getRatingColor(cf.currentRating) : ''}`}>
                          {cf?.currentRating ?? '—'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Contest Rating</div>
                      </div>
                      {/* Highest */}
                      <div className="lg:col-span-2 text-center space-y-1">
                        <div className={`text-cyan-300 text-xl font-semibold ${cf?.maxRating ? getRatingColor(cf.maxRating) : ''}`}>
                          {cf?.maxRating ?? '—'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Highest</div>
                      </div>
                      {/* Rank */}
                      <div className="lg:col-span-2 text-center space-y-1">
                        <div className="text-blue-300 text-xl font-semibold">{cf?.rank ?? '—'}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Rank</div>
                      </div>
                      {/* Solved */}
                      <div className="lg:col-span-1 text-center space-y-1">
                        <div className="text-cyan-400 text-lg font-medium">{cf?.problemStats?.difficultyBreakdown?.totalSolved ?? '—'}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Solved</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {students.length > 0 && (
              <div className="flex justify-center mt-6 gap-2">
                {cursorHistory.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => !fetchLoading && handlePageChange(index)}
                    disabled={fetchLoading}
                    className={`px-3 py-1.5 rounded border text-sm font-semibold transition-all duration-200 ${
                      page === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300 border-gray-700 hover:bg-slate-700'
                    } ${fetchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}

                {nextCursor && (
                  <button
                    onClick={() => !fetchLoading && handlePageChange(page + 1)}
                    disabled={fetchLoading}
                    className="px-3 py-1.5 rounded border text-sm font-semibold bg-slate-800 text-slate-300 border-gray-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchLoading ? 'Loading…' : 'Next →'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Contest view */}
        {activeTab === 'contest' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <select value={selectedContest} onChange={(e) => setSelectedContest(e.target.value)} className="px-4 py-2 rounded-xl bg-slate-800/70 border border-slate-600 text-slate-200 focus:outline-none focus:border-blue-400">
                  <option value="">Select Contest</option>
                  {contestOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                {(['attended', 'not-attended'] as const).map((key) => (
                  <button key={key} onClick={() => setAttendanceFilter(key)} className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${attendanceFilter === key ? 'bg-blue-500 text-white' : 'bg-slate-800/70 text-slate-200 hover:bg-slate-700/70'}`}>
                    {key === 'attended' ? 'Attended' : 'Not Attended'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 mt-4">
              {contestRows.map((row, index) => (
                <div key={row.student.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 py-4 bg-slate-800/30 rounded-xl shadow-md border border-slate-700/50">
                  <div className="lg:col-span-4 flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm">{page * 20 + (index + 1)}</div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-base truncate flex items-center gap-2">{row.student.name}<span className="text-blue-300 text-sm">⭐</span></div>
                      <div className="text-sm text-slate-300/70 truncate">@{row.student.rollNumber} • {row.student.section}</div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-blue-400 font-extrabold text-lg">{row.entry?.userPerformance?.newRating ?? '—'}</div>
                    <div className="text-xs text-slate-400">Rating</div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-cyan-300 font-medium">{row.entry?.userPerformance?.rank ? `#${row.entry.userPerformance.rank}` : '—'}</div>
                    <div className="text-xs text-slate-400">Rank</div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-blue-300 font-medium">{row.student.codeforces?.currentRating ?? '—'}</div>
                    <div className="text-xs text-slate-400">Current</div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-cyan-300 font-medium">{row.student.codeforces?.maxRating ?? '—'}</div>
                    <div className="text-xs text-slate-400">Highest</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination controls for contest view */}
            {students.length > 0 && (
              <div className="flex justify-center mt-6 gap-2">
                {cursorHistory.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => !fetchLoading && handlePageChange(index)}
                    disabled={fetchLoading}
                    className={`px-3 py-1.5 rounded border text-sm font-semibold transition-all duration-200 ${
                      page === index
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300 border-gray-700 hover:bg-slate-700'
                    } ${fetchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}

                {nextCursor && (
                  <button
                    onClick={() => !fetchLoading && handlePageChange(page + 1)}
                    disabled={fetchLoading}
                    className="px-3 py-1.5 rounded border text-sm font-semibold bg-slate-800 text-slate-300 border-gray-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchLoading ? 'Loading…' : 'Next →'}
                  </button>
                )}
              </div>
            )}
          </>

        )}
      </div>
    </div>
  );
}
