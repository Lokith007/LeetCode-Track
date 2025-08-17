'use client';

import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

const GET_STUDENTS = gql`
  query GetStudents($batch: String!) {
    students(batch: $batch) {
      id
      name
      rollNumber
      section
      codeforcesUsername
      codeforces {
        avatar
        contribution
        currentRating
        friendOfCount
        handle
        maxRating
        problemStats {
          difficultyBreakdown {
            easySolved
            hardSolved
            legendarySolved
            mediumSolved
            totalSolved
            veryHardSolved
          }
        }
        rank
        ratingChange
        recentContests {
          attended
          contestId
          contestName
          duration
          startTime
          userPerformance {
            division
            newRating
            oldRating
            rank
            ratingChange
            wasEligible
          }
        }
        titlePhoto
      }
    }
  }
`;

interface DifficultyBreakdown {
  easySolved: number;
  hardSolved: number;
  legendarySolved: number;
  mediumSolved: number;
  totalSolved: number;
  veryHardSolved: number;
}

interface ProblemStats {
  difficultyBreakdown: DifficultyBreakdown;
}

interface UserPerformance {
  division: number;
  newRating: number;
  oldRating: number;
  rank: number;
  ratingChange: number;
  wasEligible: boolean;
}

interface RecentContest {
  attended: boolean;
  contestId: number;
  contestName: string;
  duration: number;
  startTime: number;
  userPerformance: UserPerformance;
}

interface CodeforcesData {
  avatar: string;
  contribution: number;
  currentRating: number;
  friendOfCount: number;
  handle: string;
  maxRating: number;
  problemStats: ProblemStats;
  rank: string;
  ratingChange: number;
  recentContests: RecentContest[];
  titlePhoto: string;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: string;
  codeforcesUsername: string;
  codeforces?: CodeforcesData | null;
}

type LeaderboardProps = {
  batch: string;
  section: string;
};

export default function Leaderboard({ batch, section }: LeaderboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'contest'>('profile');
  const [filter, setFilter] = useState<'All' | 'SDE' | 'Non-SDE'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContest, setSelectedContest] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<'attended' | 'not-attended'>('attended');

  const SDE_SECTIONS = ['CSE-O', 'CSE-C', 'CSE-AI', 'CSE-AIML', 'CSE-CY', 'CSE-DS'];

  const { loading } = useQuery(GET_STUDENTS, {
    variables: { batch },
    onCompleted: (data) => {
      setStudents(data.students);
    },
  });

  const sectionFiltered = useMemo(() => {
    return students.filter((s) => {
      const sec = s.section?.toUpperCase() ?? '';
      return !section || section.toLowerCase() === 'all' || sec === section.toUpperCase();
    });
  }, [students, section]);

  // Sort by current rating descending for profile tab
  const sortedStudents = useMemo(() => {
    return [...sectionFiltered].sort((a, b) => {
      const ra = a.codeforces?.currentRating ?? -Infinity;
      const rb = b.codeforces?.currentRating ?? -Infinity;
      return rb - ra;
    });
  }, [sectionFiltered]);

  const allContestOptions = useMemo(() => {
    const map = new Map<string, number>();
    sectionFiltered.forEach((s) => {
      s.codeforces?.recentContests?.forEach((rc) => {
        if (rc.attended) {
          const t = rc.startTime;
          const prev = map.get(rc.contestName);
          if (!prev || t > prev) map.set(rc.contestName, t);
        }
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 5); // Limit to 5 contests
  }, [sectionFiltered]);

  const contestRows = useMemo(() => {
    if (!selectedContest) return [] as Array<{ student: Student; entry?: RecentContest }>;

    const attended: Array<{ student: Student; entry: RecentContest }> = [];
    const notAttended: Array<{ student: Student; entry?: RecentContest }> = [];

    sectionFiltered.forEach((student) => {
      const entry = student.codeforces?.recentContests?.find((rc) => rc.contestName === selectedContest);
      if (entry && entry.attended) attended.push({ student, entry });
      else notAttended.push({ student });
    });

    if (attendanceFilter === 'attended') {
      attended.sort((a, b) => (b.entry.userPerformance.newRating ?? -Infinity) - (a.entry.userPerformance.newRating ?? -Infinity));
      return attended;
    }
    // not-attended view: sort by current rating desc
    notAttended.sort(
      (a, b) => (b.student.codeforces?.currentRating ?? -Infinity) - (a.student.codeforces?.currentRating ?? -Infinity)
    );
    return notAttended;
  }, [sectionFiltered, selectedContest, attendanceFilter]);

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-10">
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter((student: Student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.codeforcesUsername.toLowerCase().includes(searchQuery.toLowerCase());

    const studentSection = student.section?.toUpperCase() ?? '';
    const isSDE = SDE_SECTIONS.includes(studentSection);

    const sectionMatch =
      !section || section.toLowerCase() === 'all' || studentSection === section.toUpperCase();

    if (!sectionMatch) return false;
    if (filter === 'SDE' && !isSDE) return false;
    if (filter === 'Non-SDE' && isSDE) return false;

    return matchesSearch;
  });

  const sortedFilteredStudents = [...filteredStudents].sort((a, b) => {
    const ra = a.codeforces?.currentRating ?? -Infinity;
    const rb = b.codeforces?.currentRating ?? -Infinity;
    return rb - ra;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return 'text-red-500'; // International Grandmaster
    if (rating >= 2100) return 'text-red-400'; // International Master
    if (rating >= 1900) return 'text-orange-500'; // Master
    if (rating >= 1600) return 'text-purple-500'; // Expert
    if (rating >= 1400) return 'text-blue-500'; // Specialist
    if (rating >= 1200) return 'text-green-500'; // Pupil
    if (rating >= 1000) return 'text-gray-400'; // Newbie
    return 'text-gray-500';
  };

  const getRankColor = (rank: string) => {
    const rankLower = rank.toLowerCase();
    if (rankLower.includes('grandmaster')) return 'text-red-500';
    if (rankLower.includes('master')) return 'text-orange-500';
    if (rankLower.includes('expert')) return 'text-purple-500';
    if (rankLower.includes('specialist')) return 'text-blue-500';
    if (rankLower.includes('pupil')) return 'text-green-500';
    if (rankLower.includes('newbie')) return 'text-gray-400';
    return 'text-blue-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Nav bar */}
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search participants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 px-4 py-3 pl-10 rounded-xl bg-slate-800/50 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 backdrop-blur-sm"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filters */}
              {(section === 'All' || section === 'all') && (
                <div className="flex gap-2">
                  {['All', 'SDE', 'Non-SDE'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type as 'All' | 'SDE' | 'Non-SDE')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        filter === type
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard Grid */}
            <div className="grid gap-4">
              {sortedFilteredStudents.map((student: Student, index: number) => {
                const cf = student.codeforces;
                return (
                  <div
                    key={student.id}
                    className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Rank & Name */}
                      <div className="lg:col-span-4 flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
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
                          {cf?.currentRating?.toLocaleString() ?? '—'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Contest Rating</div>
                      </div>

                      {/* Highest Rating */}
                      <div className="lg:col-span-2 text-center space-y-1">
                        <div className={`text-cyan-300 text-xl font-semibold ${cf?.maxRating ? getRatingColor(cf.maxRating) : ''}`}>
                          {cf?.maxRating?.toLocaleString() ?? '—'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Highest</div>
                      </div>

                      {/* Rank */}
                      <div className="lg:col-span-2 text-center space-y-1">
                        <div className={`text-blue-300 text-xl font-semibold ${cf?.rank ? getRankColor(cf.rank) : 'text-slate-400'}`}>
                          {cf?.rank || '—'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Rank</div>
                      </div>
                      <div className="lg:col-span-1 text-center space-y-1">
                        <div className="text-cyan-400 text-lg font-medium">
                          {cf?.problemStats?.difficultyBreakdown?.totalSolved ?? '—'}
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wide">Solved</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contest Tab */}
        {activeTab === 'contest' && (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <select
                  value={selectedContest}
                  onChange={(e) => setSelectedContest(e.target.value)}
                  className="px-4 py-2 rounded-xl bg-slate-800/70 border border-slate-600 text-slate-200 focus:outline-none focus:border-blue-400"
                >
                  <option value="">Select Contest</option>
                  {allContestOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                {(['attended', 'not-attended'] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setAttendanceFilter(key)}
                    className={`px-5 py-2 rounded-xl font-medium text-sm transition-all ${
                      attendanceFilter === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800/70 text-slate-200 hover:bg-slate-700/70'
                    }`}
                  >
                    {key === 'attended' ? 'Attended' : 'Not Attended'}
                  </button>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="grid gap-3">
              {contestRows.map((row, index) => (
                <div
                  key={row.student.id}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 py-4 bg-slate-800/30 rounded-xl shadow-md border border-slate-700/50"
                >
                  <div className="lg:col-span-4 flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-base truncate flex items-center gap-2">
                        {row.student.name}
                        <span className="text-blue-300 text-sm">⭐</span>
                      </div>
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
              {contestRows.length === 0 && (
                <div className="text-center text-slate-400 py-10">No data for the selected contest.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
