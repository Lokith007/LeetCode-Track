'use client';
import client from '@/lib/apollo-client';
import { gql, useQuery } from '@apollo/client';
import {  useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  student: Student;
  latest: Student['latestContests'][0];
  trend: 'UP' | 'DOWN';
  copied: boolean;
  score: number;
  oldRating: number;
  newRating: number;
  solvedCount: number;
  globalRanking: number;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  rating: number;
  globalRanking: number;
  topPercentage: number;
  section: string;
  attendedContestsCount: number;
  latestContests: Array<{
    title: string;
    data: {
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
  }>;
}

const GET_PAGINATED_STUDENTS = gql`
  query PaginatedStudents($batch: String!, $section: String, $limit: Int, $cursor: String) {
    paginatedStudents(batch: $batch, section: $section, limit: $limit, cursor: $cursor) {
      students {
        id
        name
        rollNumber
        totalSolved
        easySolved
        mediumSolved
        hardSolved
        rating
        globalRanking
        topPercentage
        section
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
      nextCursor
    }
  }
`;


type LeaderboardProps = {
  batch: string;
  section: string;
  setView: (view: 'dashboard' | 'contest') => void;
};

const Leaderboard = ({ batch, setView, section }: LeaderboardProps) => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'contests'>('dashboard');
  const [contestTab, setContestTab] = useState<'attended' | 'not-attended'>('attended');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'SDE' | 'Non-SDE'>('All');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);

  const [fetchLoading, setFetchLoading] = useState(false);
  

  
  const { loading, error, fetchMore, data } = useQuery(GET_PAGINATED_STUDENTS, {
    variables: {
      batch,
      section: section === 'All' ? null : section,
      limit: 20,
      cursor: null,
    },
    onCompleted: (data) => {
      setStudents(data.paginatedStudents.students);
      setNextCursor(data.paginatedStudents.nextCursor);
  
      // This ensures pagination logic is synced
      setPage(0);
      setCursorHistory([null]); // First page always starts at null
    },
  });
  
  const handlePageChange = async (pageIndex: number) => {
    let cursor = cursorHistory[pageIndex];
    if (pageIndex === cursorHistory.length && nextCursor) {
      cursor = nextCursor;
      setCursorHistory([...cursorHistory, nextCursor]);
    }
    setFetchLoading(true);
  
    fetchMore({
      variables: {
        batch,
        section: section === 'All' ? null : section,
        limit: 20,
        cursor,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        const newStudents = fetchMoreResult.paginatedStudents.students;
        const newCursor = fetchMoreResult.paginatedStudents.nextCursor;
  
        setStudents(newStudents);
        setNextCursor(newCursor);
  
        // Update cursor history only if it's a new page
        if (cursorHistory.length === pageIndex + 1 && newCursor) {
          setCursorHistory([...cursorHistory, newCursor]);
        }
  
        setPage(pageIndex);
        setFetchLoading(false);
        return fetchMoreResult;
      },
    });
  };
  



  const SDE_SECTIONS = ['CSE-L', 'CSE-M', 'CSE-N', 'CSE-O', 'CSE-P', 'CSE-Q'];

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  const exportLatestContestData = async () => {
    let allStudents: Student[] = [];
    let currentCursor: string | null = null;

    // Fetch all paginated data
    while (true) {
      const { data } = await client.query({
        query: GET_PAGINATED_STUDENTS,
        variables: {
          batch,
          section: section === 'All' ? null : section,
          limit: 100, // you can adjust the batch size
          cursor: currentCursor,
        },
        fetchPolicy: 'network-only', // ensures fresh fetch
      });

      const newStudents = data.paginatedStudents.students;
      const nextCursor = data.paginatedStudents.nextCursor;

      allStudents = [...allStudents, ...newStudents];

      if (!nextCursor) break;
      currentCursor = nextCursor;
    }

    const exportData = allStudents
      .filter((student: Student) => {
        const studentSection = student.section?.toUpperCase() ?? '';
        const isSDE = SDE_SECTIONS.includes(studentSection);

        const sectionMatch =
          !section || section.toLowerCase() === 'all' || studentSection === section.toUpperCase();
        if (!sectionMatch) return false;
        if (filter === 'SDE' && !isSDE) return false;
        if (filter === 'Non-SDE' && isSDE) return false;
        return true;
      })
      .map((student: Student) => {
        const contests = student.latestContests.filter((contest) =>
          contestTab === 'attended'
            ? contest.data.attempted || contest.data.available
            : !contest.data.attempted && !contest.data.available
        );
        const latest = contests[0];
        if (!latest) return null;

        const trend = latest.data.new_rating > latest.data.old_rating ? 'UP' : 'DOWN';

        return {
          Name: student.name,
          RollNumber: student.rollNumber,
          Section: student.section,
          Score: latest.data.score,
          OldRating: latest.data.old_rating,
          NewRating: latest.data.new_rating,
          Copied: latest.data.copied ? 'Yes' : 'No',
          Rank: student.globalRanking,
          Solved: latest.data.solvedCount,
          EasySolved: latest.data.easySolved,
          MediumSolved: latest.data.mediumSolved,
          HardSolved: latest.data.hardSolved,
          Trend: trend,
        };
      })
      .filter(Boolean);

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LatestContest');
    XLSX.writeFile(workbook, 'LatestContestLeaderboard.xlsx');
  };


  if (loading)
    return <div className="mt-6 flex justify-center">
      <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
    </div>;

  if (error)
    return <p className="text-center p-8 text-red-500 font-semibold">Error: {error.message}</p>;

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




  return (
    <div className="min-h-screen px-4 py-10 bg-[#121212] text-gray-200 space-y-10">
      <button
        onClick={() => { router.back(); }}
        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm
            bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700
              }`}
      >
        {"<-"}
      </button>
      {/* Tabs */}
      <div className="flex justify-start gap-4">
        {["dashboard", "contests"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as "dashboard" | "contests")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm ${
              activeTab === tab
                ? "bg-[#fcd9b8] text-black"
                : "bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {tab === "dashboard" ? "Dashboard" : "Latest Contest"}
          </button>
        ))}
        <button
          onClick={() => setView("contest")}
          className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          History Contests
        </button>
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Filter */}
          {(section === 'All' || section === 'all') && (
            <div className="flex justify-end gap-4">
              <div className="flex gap-2">
                {['All', 'SDE', 'Non-SDE'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as 'All' | 'SDE' | 'Non-SDE')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border shadow-sm ${filter === type
                      ? 'bg-[#fcd9b8] text-black'
                      : 'bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Cards */}
          <div className="space-y-4">
            {filteredStudents.map((student: Student, index: number) => (
              <div
                key={student.id}
                className="grid grid-cols-[0.5fr_2fr_1.2fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 bg-[#1f1f1f] rounded-xl shadow-md border border-[#f59e0b40]"
              >
                <div className="text-center text-sm font-semibold text-gray-300">
                  {page * 20 + (index + 1)}
                </div>
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#fcd9b8] text-black font-bold flex items-center justify-center text-sm">
                    {student.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-base truncate">
                      {student.name}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      @{student.rollNumber}
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-300 truncate">
                  {student.rollNumber}
                </div>
                <div className="text-center text-sm text-gray-300">
                  {student.section}
                </div>
                <div className="w-full p-2 rounded-xl shadow text-center space-y-1 bg-[#2a2a2a]">
                  <div className="text-sm font-semibold text-[#fcd9b8]">
                    {student.totalSolved ?? 0}
                  </div>
                  <div className="text-[11px] text-gray-400">Solved</div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-white font-medium">
                    <div className="bg-green-500 rounded py-0.5">
                      {student.easySolved ?? 0}
                    </div>
                    <div className="bg-yellow-500 rounded py-0.5">
                      {student.mediumSolved ?? 0}
                    </div>
                    <div className="bg-red-500 rounded py-0.5">
                      {student.hardSolved ?? 0}
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-[#fcd9b8] font-bold text-lg">
                    {student.rating?.toFixed(2) ?? "-"}
                  </div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-[#fcd9b8] font-medium">
                    #{student.globalRanking ?? "-"}
                  </div>
                  <div className="text-xs text-gray-400">Rank</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-[#fcd9b8] font-semibold text-sm">
                    {student.topPercentage ?? "-"}%
                  </div>
                  <div className="text-xs text-gray-400">Top %</div>
                </div>
              </div>
            ))}
          </div>
          {students.length > 0 && (
            <div className="flex justify-center mt-6 gap-2">
              {cursorHistory.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !fetchLoading && handlePageChange(index)}
                  disabled={fetchLoading}
                  className={`px-3 py-1.5 rounded border text-sm font-semibold transition-all duration-200 
          ${
            page === index
              ? "bg-[#fcd9b8] text-black"
              : "bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700"
          } 
          ${fetchLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {fetchLoading && page === index ? (
                    <svg
                      className="animate-spin h-4 w-4 mx-auto"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
              ))}

              {nextCursor && (
                <button
                  onClick={() => !fetchLoading && handlePageChange(page + 1)}
                  disabled={fetchLoading}
                  className="px-3 py-1.5 rounded border text-sm font-semibold bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 mx-auto"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                      />
                    </svg>
                  ) : (
                    "Next →"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "contests" && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-xl text-[#fcd9b8] font-bold">
                {students[0]?.latestContests?.[0]?.title ?? "Latest Contest"}
              </h1>
              <button
                onClick={exportLatestContestData}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-300 border border-gray-700 hover:bg-gray-700"
              >
                Export to Excel
              </button>
            </div>

            {/* Filter Options */}
            {(section === 'All' || section === 'all') && (
              <div className="flex gap-2">
                {['All', 'SDE', 'Non-SDE'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type as 'All' | 'SDE' | 'Non-SDE')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border shadow-sm ${filter === type
                      ? 'bg-[#fcd9b8] text-black'
                      : 'bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Contest Tab Controls */}
          <div className="flex items-center justify-end gap-4">
            <div className="flex gap-2">
              {["attended", "not-attended"].map((tab) => {
                const isActive = contestTab === tab;
                const attendedCount = students.filter((s: Student) =>
                  s.latestContests.some((c) => c.data.attempted)
                ).length;
                const notAttendedCount = students.length - attendedCount;

                return (
                  <button
                    key={tab}
                    onClick={() =>
                      setContestTab(tab as "attended" | "not-attended")
                    }
                    className={`px-5 py-2 rounded-lg font-semibold text-sm border shadow-sm transition-all ${
                      isActive
                        ? "bg-[#fcd9b8] text-black"
                        : "bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700"
                    }`}
                  >
                    {tab === "attended"
                      ? `Attended (${attendedCount})`
                      : `Not Attended (${notAttendedCount})`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-[1.5fr_repeat(7,0.8fr)] gap-4 items-center px-6 py-3 bg-[#2a2a2a] rounded-xl shadow-md border border-[#f59e0b40] text-sm font-semibold text-gray-300">
            <div>Name</div>
            <div
              className="cursor-pointer hover:text-[#fcd9b8] transition-colors text-center"
              onClick={() => handleSort("score")}
            >
              Score {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="cursor-pointer hover:text-[#fcd9b8] transition-colors text-center"
              onClick={() => handleSort("oldRating")}
            >
              Old Rating{" "}
              {sortBy === "oldRating" && (sortOrder === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="cursor-pointer hover:text-[#fcd9b8] transition-colors text-center"
              onClick={() => handleSort("newRating")}
            >
              Predicted{" "}
              {sortBy === "newRating" && (sortOrder === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="cursor-pointer hover:text-[#fcd9b8] transition-colors text-center"
              onClick={() => handleSort("copied")}
            >
              Code {sortBy === "copied" && (sortOrder === "asc" ? "↑" : "↓")}
            </div>
            <div
              className="cursor-pointer hover:text-[#fcd9b8] transition-colors text-center"
              onClick={() => handleSort("globalRanking")}
            >
              Rank{" "}
              {sortBy === "globalRanking" && (sortOrder === "asc" ? "↑" : "↓")}
            </div>
            <div className="text-center">Solved</div>
            <div className="text-center">Trend</div>
          </div>

          <div className="space-y-4">
            {students
              .filter((student: Student) => {
                const studentSection = student.section?.toUpperCase() ?? "";
                const isSDE = SDE_SECTIONS.includes(studentSection);

                const sectionMatch =
                  !section ||
                  section.toLowerCase() === "all" ||
                  studentSection === section.toUpperCase();

                if (!sectionMatch) return false;
                if (filter === "SDE" && !isSDE) return false;
                if (filter === "Non-SDE" && isSDE) return false;

                return true;
              })
              .map((student: Student): LeaderboardEntry | null => {
                const contests = student.latestContests.filter((contest) =>
                  contestTab === "attended"
                    ? contest.data.attempted || contest.data.available
                    : !contest.data.attempted && !contest.data.available
                );

                const latest = contests[0];
                if (!latest) return null;

                const trend: "UP" | "DOWN" =
                  latest.data.new_rating > latest.data.old_rating
                    ? "UP"
                    : "DOWN";

                return {
                  student,
                  latest,
                  trend,
                  copied: latest.data.copied,
                  score: latest.data.score,
                  oldRating: latest.data.old_rating,
                  newRating: latest.data.new_rating,
                  solvedCount: latest.data.solvedCount,
                  globalRanking: student.globalRanking,
                };
              })
              .filter((entry): entry is LeaderboardEntry => entry !== null)
              .sort((a, b) => {
                if (!sortBy) return 0;

                let aValue: any = a[sortBy as keyof LeaderboardEntry];
                let bValue: any = b[sortBy as keyof LeaderboardEntry];

                if (sortBy === "copied") {
                  aValue = aValue ? 1 : 0;
                  bValue = bValue ? 1 : 0;
                }

                if (typeof aValue === "number" && typeof bValue === "number") {
                  return sortOrder === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
                }

                return 0;
              })
              .map((item) => {
                const { student, latest, trend } = item;

                return (
                  <div
                    key={student.id}
                    className="grid grid-cols-[1.5fr_repeat(7,0.8fr)] gap-4 items-center px-6 py-4 bg-[#1f1f1f] rounded-xl shadow-md border border-[#f59e0b40]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fcd9b8] text-black font-bold flex items-center justify-center text-sm">
                        {student.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          @{student.rollNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {latest.data.score ?? "-"}
                      </div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>

                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {latest.data.old_rating?.toFixed(2) ?? "-"}
                      </div>
                      <div className="text-xs text-gray-400">Old Rating</div>
                    </div>

                    <div className="text-center">
                      <div className="font-bold text-lg">
                        {latest.data.new_rating?.toFixed(2) ?? "-"}
                      </div>
                      <div className="text-xs text-gray-400">Predicted</div>
                    </div>
                    <div className="text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          latest.data.attempted
                            ? latest.data.copied
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {latest.data.attempted
                          ? latest.data.copied
                            ? "Copied"
                            : "Original"
                          : "Unknown"}
                      </span>

                      <div className="text-xs text-gray-400 mt-1">Code</div>
                    </div>

                    <div className="text-center">
                      <div className="text-md font-medium text-[#fcd9b8]">
                        #{student.globalRanking ?? "-"}
                      </div>
                      <div className="text-xs text-gray-400">Rank</div>
                    </div>

                    <div className="w-full p-2 rounded-xl shadow text-center space-y-1">
                      <div className="text-sm font-semibold text-[#fcd9b8]">
                        {latest.data.solvedCount ?? 0}/4
                      </div>
                      <div className="text-[11px] text-gray-400">Solved</div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-white font-medium">
                        <div className="bg-green-500 rounded py-1">
                          {latest.data.easySolved ?? 0}
                        </div>
                        <div className="bg-yellow-500 rounded py-1">
                          {latest.data.mediumSolved ?? 0}
                        </div>
                        <div className="bg-red-500 rounded py-1">
                          {latest.data.hardSolved ?? 0}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`font-semibold text-sm text-center ${
                        trend === "UP" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {trend === "UP" ? "↑ UP" : "↓ DOWN"}
                    </div>
                  </div>
                );
              })}
          </div>
          {students.length > 0 && (
            <div className="flex justify-center mt-6 gap-2">
              {cursorHistory.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !fetchLoading && handlePageChange(index)}
                  disabled={fetchLoading}
                  className={`px-3 py-1.5 rounded border text-sm font-semibold transition-all duration-200 
          ${
            page === index
              ? "bg-[#fcd9b8] text-black"
              : "bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700"
          } 
          ${fetchLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {fetchLoading && page === index ? (
                    <svg
                      className="animate-spin h-4 w-4 mx-auto"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
              ))}

              {nextCursor && (
                <button
                  onClick={() => !fetchLoading && handlePageChange(page + 1)}
                  disabled={fetchLoading}
                  className="px-3 py-1.5 rounded border text-sm font-semibold bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fetchLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 mx-auto"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"
                      />
                    </svg>
                  ) : (
                    "Next →"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
