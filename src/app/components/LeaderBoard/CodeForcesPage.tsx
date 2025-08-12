'use client';

import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';

const GET_PAGINATED_STUDENTS = gql`
  query PaginatedStudents($batch: String!, $section: String, $limit: Int, $cursor: String) {
    paginatedStudents(batch: $batch, section: $section, limit: $limit, cursor: $cursor) {
      students {
        id
        name
        rollNumber
        section
        codeforcesData {
          handle
          rating
          maxRating
          rank
          maxRank
          contribution
          friendOfCount
          titlePhoto
          avatar
          registrationTime
          lastOnlineTime
          organization
          country
          city
          solvedProblems
          participatedContests
        }
      }
      nextCursor
    }
  }
`;

interface CodeforcesData {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contribution: number;
  friendOfCount: number;
  titlePhoto: string;
  avatar: string;
  registrationTime: string;
  lastOnlineTime: string;
  organization: string;
  country: string;
  city: string;
  solvedProblems: number;
  participatedContests: number;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: string;
  codeforcesData?: CodeforcesData | null;
}

type LeaderboardProps = {
  batch: string;
  section: string;
};

export default function Leaderboard({ batch, section }: LeaderboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'analytics'>('overview');
  const [filter, setFilter] = useState<'All' | 'SDE' | 'Non-SDE'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<string[]>(['']);

  const SDE_SECTIONS = ['CSE-O', 'CSE-C', 'CSE-AI', 'CSE-AIML', 'CSE-CY', 'CSE-DS'];

  const { loading, fetchMore } = useQuery(GET_PAGINATED_STUDENTS, {
    variables: { batch, section: section === 'All' ? null : section, limit: 20, cursor: null },
    onCompleted: (data) => {
      setStudents(data.paginatedStudents.students);
      setNextCursor(data.paginatedStudents.nextCursor);
      setCursorHistory(['', data.paginatedStudents.nextCursor].filter(Boolean));
    },
  });

  const handlePageChange = async (pageIndex: number) => {
    if (pageIndex === page) return;
    
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

      const newStudents = data.paginatedStudents.students;
      const newNextCursor = data.paginatedStudents.nextCursor;

      setStudents((prev) => [...prev, ...newStudents]);
      setNextCursor(newNextCursor);
      setPage(pageIndex);
      setCursorHistory((prev) => [...prev, newNextCursor].filter(Boolean));
    } catch (error) {
      console.error('Error fetching more data:', error);
    } finally {
      setFetchLoading(false);
    }
  };

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
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const studentSection = student.section?.toUpperCase() ?? '';
    const isSDE = SDE_SECTIONS.includes(studentSection);

    const sectionMatch =
      !section || section.toLowerCase() === 'all' || studentSection === section.toUpperCase();

    if (!sectionMatch) return false;
    if (filter === 'SDE' && !isSDE) return false;
    if (filter === 'Non-SDE' && isSDE) return false;

    return matchesSearch;
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
      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            CodeForces Performance Hub
          </h1>
          <p className="text-slate-300 text-lg">
            Track your competitive programming excellence
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center gap-2 bg-slate-800/50 p-2 rounded-2xl backdrop-blur-sm">
          {[
            { key: 'overview', label: 'Overview', icon: '🏆' },
            { key: 'performance', label: 'Performance', icon: '📊' },
            { key: 'analytics', label: 'Analytics', icon: '📈' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
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
              {filteredStudents.map((student: Student, index: number) => {
                const cf = student.codeforcesData;
                return (
                  <div
                    key={student.id}
                    className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Rank & Avatar */}
                      <div className="lg:col-span-2 flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                          {page * 20 + (index + 1)}
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-500">
                          {student.name[0]}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="lg:col-span-3 space-y-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          @{student.rollNumber}
                        </p>
                        <span className="inline-block px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-300">
                          {student.section}
                        </span>
                      </div>

                      {/* CodeForces Handle */}
                      <div className="lg:col-span-2 text-center space-y-2">
                        <div className="text-lg font-bold text-blue-400">
                          {cf?.handle || "—"}
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Handle
                        </p>
                      </div>

                      {/* Current Rating */}
                      <div className="lg:col-span-2 text-center space-y-2">
                        <div className={`text-2xl font-bold ${cf?.rating ? getRatingColor(cf.rating) : 'text-slate-400'}`}>
                          {cf?.rating?.toLocaleString() || "—"}
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Rating
                        </p>
                      </div>

                      {/* Max Rating */}
                      <div className="lg:col-span-2 text-center space-y-2">
                        <div className={`text-xl font-semibold ${cf?.maxRating ? getRatingColor(cf.maxRating) : 'text-slate-400'}`}>
                          {cf?.maxRating?.toLocaleString() || "—"}
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Max Rating
                        </p>
                      </div>

                      {/* Rank */}
                      <div className="lg:col-span-1 text-center space-y-2">
                        <div className={`text-sm font-medium ${cf?.rank ? getRankColor(cf.rank) : 'text-slate-400'}`}>
                          {cf?.rank || "—"}
                        </div>
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Rank
                        </p>
                      </div>
                    </div>

                    {/* Additional Info Row */}
                    {cf && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-cyan-400">
                            {cf.solvedProblems || 0}
                          </div>
                          <p className="text-xs text-slate-400">Problems Solved</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-400">
                            {cf.participatedContests || 0}
                          </div>
                          <p className="text-xs text-slate-400">Contests</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-yellow-400">
                            {cf.contribution || 0}
                          </div>
                          <p className="text-xs text-slate-400">Contribution</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-purple-400">
                            {cf.friendOfCount || 0}
                          </div>
                          <p className="text-xs text-slate-400">Friends</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {students.length > 0 && (
              <div className="flex justify-center gap-2 pt-6">
                {cursorHistory.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => !fetchLoading && handlePageChange(index)}
                    disabled={fetchLoading}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      page === index
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                    } ${fetchLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {fetchLoading && page === index ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      index + 1
                    )}
                  </button>
                ))}

                {nextCursor && (
                  <button
                    onClick={() => !fetchLoading && handlePageChange(page + 1)}
                    disabled={fetchLoading}
                    className="px-4 py-2 rounded-lg font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetchLoading ? (
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Next →"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "performance" && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-semibold text-white mb-2">Performance Analytics</h3>
            <p className="text-slate-400">Detailed performance metrics coming soon...</p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-2xl font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-slate-400">Deep insights and trends coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
