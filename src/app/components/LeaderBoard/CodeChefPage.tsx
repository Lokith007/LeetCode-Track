'use client';

import { gql, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import QuickNavButtons from '../QuickNavButtons';

const GET_PAGINATED_STUDENTS = gql`
  query PaginatedStudents($batch: String!, $section: String, $limit: Int, $cursor: String) {
    paginatedStudents(batch: $batch, section: $section, limit: $limit, cursor: $cursor) {
      students {
        id
        name
        rollNumber
        section
        codechefData {
          countryFlag
          countryName
          countryRank
          currentRating
          globalRank
          highestRating
          name
          profile
          stars
          ratingData {
            code
            color
            end_date
            getday
            getmonth
            getyear
            name
            penalised_in
            rank
            rating
            reason
          }
        }
      }
      nextCursor
    }
  }
`;

interface RatingData {
  code: string;
  color: string;
  end_date: string;
  getday: number;
  getmonth: number;
  getyear: number;
  name: string;
  penalised_in: string | null;
  rank: number | null;
  rating: number | null;
  reason: string | null;
}

interface CodechefData {
  countryFlag: string;
  countryName: string;
  countryRank: number;
  currentRating: number;
  globalRank: number;
  highestRating: number;
  name: string;
  profile: string;
  stars: string;
  ratingData?: RatingData[];
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: string;
  codechefData?: CodechefData | null;
}

type LeaderboardProps = {
  batch: string;
  section: string;
};

export default function Leaderboard({ batch, section }: LeaderboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<string[]>(['']);
  const [activeTab, setActiveTab] = useState<'profile' | 'contest'>('profile');
  const [selectedContest, setSelectedContest] = useState<string>('');
  const [attendanceFilter, setAttendanceFilter] = useState<'attended' | 'not-attended'>('attended');

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

  const sectionFiltered = useMemo(() => {
    return students.filter((s) => {
      const sec = s.section?.toUpperCase() ?? '';
      return !section || section.toLowerCase() === 'all' || sec === section.toUpperCase();
    });
  }, [students, section]);

  // Sort by CodeChef contest rating (currentRating) descending for profile tab
  const sortedStudents = useMemo(() => {
    return [...sectionFiltered].sort((a, b) => {
      const ra = a.codechefData?.currentRating ?? -Infinity;
      const rb = b.codechefData?.currentRating ?? -Infinity;
      return rb - ra;
    });
  }, [sectionFiltered]);

  const toDate = (r: RatingData) => {
    if (r.getyear && r.getmonth && r.getday) {
      return new Date(r.getyear, r.getmonth - 1, r.getday).getTime();
    }
    return new Date(r.end_date).getTime();
  };

  const allContestOptions = useMemo(() => {
    const map = new Map<string, number>();
    sectionFiltered.forEach((s) => {
      s.codechefData?.ratingData?.forEach((rd) => {
        const t = toDate(rd);
        const prev = map.get(rd.name);
        if (!prev || t > prev) map.set(rd.name, t);
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name).slice(0, 5);
  }, [sectionFiltered]);

  useEffect(() => {
    if (!selectedContest && allContestOptions.length > 0) {
      setSelectedContest(allContestOptions[0]);
    }
  }, [allContestOptions, selectedContest]);

  const contestRows = useMemo(() => {
    if (!selectedContest) return [] as Array<{ student: Student; entry?: RatingData }>;

    const attended: Array<{ student: Student; entry: RatingData }> = [];
    const notAttended: Array<{ student: Student; entry?: RatingData }> = [];

    sectionFiltered.forEach((student) => {
      const entry = student.codechefData?.ratingData?.find((rd) => rd.name === selectedContest);
      if (entry) attended.push({ student, entry });
      else notAttended.push({ student });
    });

    if (attendanceFilter === 'attended') {
      attended.sort((a, b) => (b.entry.rating ?? -Infinity) - (a.entry.rating ?? -Infinity));
      return attended;
    }
    // not-attended view: sort by current rating desc
    notAttended.sort(
      (a, b) => (b.student.codechefData?.currentRating ?? -Infinity) - (a.student.codechefData?.currentRating ?? -Infinity)
    );
    return notAttended;
  }, [sectionFiltered, selectedContest, attendanceFilter]);

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-10">
        <div className="mt-6 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white px-6 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Quick Navigation */}
        <QuickNavButtons currentBatch={batch} currentSection={section} />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-200 mb-2">CodeChef Leaderboard</h1>
          <p className="text-purple-300">Batch: {batch} • Section: {section}</p>
        </div>
        
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
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
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
          <div className="grid gap-4">
            {sortedStudents.map((student: Student, index: number) => {
            const cc = student.codechefData;
            return (
              <div
                key={student.id}
                  className="group bg-[#1b1430]/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-600/30 hover:border-fuchsia-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-fuchsia-500/10"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Rank & Name */}
                    <div className="lg:col-span-4 flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {index + 1 + page * 20}
                      </div>
                      <div>
                        <div className="text-white text-lg font-semibold flex items-center gap-2">
                          {student.name}
                          {cc?.stars && <span className="text-fuchsia-300 text-base">{cc.stars}</span>}
                        </div>
                        <div className="text-slate-300/70 text-sm">@{student.rollNumber} • {student.section}</div>
                      </div>
                    </div>

                    {/* Current Rating */}
                    <div className="lg:col-span-3 text-center space-y-1">
                      <div className="text-pink-400 text-2xl font-extrabold">{cc?.currentRating?.toLocaleString() ?? '—'}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Contest Rating</div>
                </div>

                    {/* Highest Rating */}
                    <div className="lg:col-span-2 text-center space-y-1">
                      <div className="text-yellow-300 text-xl font-semibold">{cc?.highestRating?.toLocaleString() ?? '—'}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Highest</div>
                    </div>

                    {/* Global/Country Rank */}
                    <div className="lg:col-span-2 text-center space-y-1">
                      <div className="text-cyan-300 text-xl font-semibold">#{cc?.globalRank?.toLocaleString() ?? '—'}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Global Rank</div>
                    </div>
                    <div className="lg:col-span-1 text-center space-y-1">
                      <div className="text-emerald-300 text-lg font-medium">#{cc?.countryRank?.toLocaleString() ?? '—'}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide">Country</div>
                    </div>
                  </div>
              </div>
            );
          })}
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
                  className="px-4 py-2 rounded-xl bg-slate-800/70 border border-slate-600 text-slate-200 focus:outline-none focus:border-purple-400"
                >
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
                        ? 'bg-[#fcd9b8] text-black'
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
                  className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center px-6 py-4 bg-[#1b1430]/80 rounded-xl shadow-md border border-purple-600/30"
                >
                  <div className="lg:col-span-4 flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-base truncate flex items-center gap-2">
                        {row.student.name}
                        {row.student.codechefData?.stars && (
                          <span className="text-fuchsia-300 text-sm">{row.student.codechefData.stars}</span>
                        )}
                      </div>
                      <div className="text-sm text-slate-300/70 truncate">@{row.student.rollNumber} • {row.student.section}</div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-pink-400 font-extrabold text-lg">{row.entry?.rating ?? '—'}</div>
                    <div className="text-xs text-slate-400">Rating</div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-yellow-300 font-medium">{row.entry?.rank ? `#${row.entry.rank}` : '—'}</div>
                    <div className="text-xs text-slate-400">Rank</div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-pink-300 font-medium">{row.student.codechefData?.currentRating ?? '—'}</div>
                    <div className="text-xs text-slate-400">Current</div>
                  </div>
                  <div className="lg:col-span-2 text-center">
                    <div className="text-yellow-300 font-medium">{row.student.codechefData?.highestRating ?? '—'}</div>
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

        {/* Pagination */}
        {sectionFiltered.length > 0 && (
          <div className="flex justify-center gap-2 pt-6">
            {cursorHistory.map((_, index) => (
              <button
                key={index}
                onClick={() => !fetchLoading && handlePageChange(index)}
                disabled={fetchLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === index
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                } ${fetchLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  'Next →'
                )}
          </button>
            )}
        </div>
      )}
      </div>
    </div>
  );
}
