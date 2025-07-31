'use client';
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';

const GET_STUDENTS = gql`
  query GetStudents($batch: String!) {
    students(batch: $batch) {
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

type LeaderboardProps = {
  batch: string;
  view: string;
  setView: any;
};

const Leaderboard = ({ batch, view, setView }: LeaderboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contests'>('dashboard');
  const [contestTab, setContestTab] = useState<'attended' | 'not-attended'>('attended');

  const { data, loading, error } = useQuery(GET_STUDENTS, {
    variables: { batch },
  });
  

  if (loading)
    return <p className="text-center p-8 text-[#fcd9b8] text-lg font-semibold">Loading...</p>;

  if (error)
    return <p className="text-center p-8 text-red-500 font-semibold">Error: {error.message}</p>;

  return (
    <div className="min-h-screen px-4 py-10 bg-[#121212] text-gray-200 space-y-10">

      {/* Tabs */}
      <div className="flex justify-start gap-4">
        {['dashboard', 'contests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'dashboard' | 'contests')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm ${activeTab === tab
              ? 'bg-[#fcd9b8] text-black'
              : 'bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700'
              }`}
          >
            {tab === 'dashboard' ? 'Dashboard' : 'Latest Contest'}
          </button>
        ))}
        <button
          onClick={() => setView("contest")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm
            bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700
              }`}
        >
          History Contests
        </button>
      </div>

      {activeTab === 'dashboard' && (
  <div className="space-y-6">
    {/* Search + Filter Row */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name or roll number..."
        className="w-full sm:w-1/3 px-4 py-2 rounded-md bg-[#1f1f1f] text-sm text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fcd9b8]"
      />

      {/* SDE filter buttons */}
      <div className="flex gap-2">
        {['All', 'SDE', 'Non-SDE'].map((type) => (
          <button
            key={type}
            className="px-4 py-2 rounded-lg text-sm font-semibold border shadow-sm bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700"
          >
            {type}
          </button>
        ))}
      </div>
    </div>

    {/* Leaderboard Cards */}
    <div className="space-y-4">
      {data.students.map((student: any, index: number) => (
        <div
          key={student.id}
          className="grid grid-cols-[0.5fr_2fr_1.2fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 items-center px-6 py-4 bg-[#1f1f1f] rounded-xl shadow-md border border-[#f59e0b40]  hover:border-orange-300"
        >
          <div className="text-center text-sm font-semibold text-gray-300">{index + 1}</div>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-full bg-[#fcd9b8] text-black font-bold flex items-center justify-center text-sm">
              {student.name[0]}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{student.name}</div>
              <div className="text-sm text-gray-400 truncate">@{student.rollNumber}</div>
            </div>
          </div>
          <div className="text-center text-sm text-gray-300 truncate">{student.rollNumber}</div>
          <div className="text-center text-sm text-gray-300">{student.section}</div>
          <div className="w-full p-2 rounded-xl shadow text-center space-y-1 bg-[#2a2a2a]">
            <div className="text-sm font-semibold text-[#fcd9b8]">
              {student.totalSolved ?? 0}
            </div>
            <div className="text-[11px] text-gray-400">Solved</div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-white font-medium">
              <div className="bg-green-500 rounded py-0.5">{student.easySolved ?? 0}</div>
              <div className="bg-yellow-500 rounded py-0.5">{student.mediumSolved ?? 0}</div>
              <div className="bg-red-500 rounded py-0.5">{student.hardSolved ?? 0}</div>
            </div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-[#fcd9b8] font-bold text-lg">{student.rating?.toFixed(2) ?? '-'}</div>
            <div className="text-xs text-gray-400">Rating</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-[#fcd9b8] font-medium">#{student.globalRanking ?? '-'}</div>
            <div className="text-xs text-gray-400">Rank</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-[#fcd9b8] font-semibold text-sm">{student.topPercentage ?? '-'}%</div>
            <div className="text-xs text-gray-400">Top %</div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

      {activeTab === 'contests' && (


        <div className="space-y-6">
          {/* Contest Sub-tabs */}
          <div className="flex items-center justify-between gap-4">
            {/* Contest Name */}
            <h1 className="text-xl text-[#fcd9b8] font-bold">
              {data.students[0].latestContests[0].title}
</h1>

            {/* Tabs Group */}
            <div className="flex gap-2">
              {['attended', 'not-attended'].map((tab) => {
                const isActive = contestTab === tab;

                const attendedCount = data.students.filter((s: any) =>
                  s.latestContests.some((c: any) => c.data.available)
                ).length;

                const notAttendedCount = data.students.length - attendedCount;

                return (
                  <button
                    key={tab}
                    onClick={() => setContestTab(tab as 'attended' | 'not-attended')}
                    className={`px-5 py-2 rounded-lg font-semibold text-sm border shadow-sm transition-all
            ${isActive
                        ? 'bg-[#fcd9b8] text-black'
                        : 'bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700'}
          `}
                  >
                    {tab === 'attended'
                      ? `Attended (${attendedCount})`
                      : `Not Attended (${notAttendedCount})`}
                  </button>
                );
              })}
            </div>
          </div>



          {/* Styled Leaderboard Cards */}
          <div className="space-y-4">
            {data.students
              .map((student: any) => {
                const contests = student.latestContests.filter((contest: any) =>
                  contestTab === 'attended' ? contest.data.available : !contest.data.available
                );
                const latest = contests[0];
                if (!latest) return null;

                const trend = latest.data.new_rating > latest.data.old_rating ? 'UP' : 'DOWN';

                return (
                  <div
                    key={student.id}
                    className="grid grid-cols-[1.5fr_repeat(6,1fr)] gap-4 items-center px-6 py-4 bg-[#1f1f1f] rounded-xl shadow-md border border-[#f59e0b40]  hover:border-orange-300"
                  >
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#fcd9b8] text-black font-bold flex items-center justify-center text-sm">
                        {student.name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-base">{student.name}</div>
                        <div className="text-sm text-gray-400">@{student.rollNumber}</div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                      <div className="font-bold text-lg">{latest.data.score ?? '-'}</div>
                      <div className="text-xs text-gray-400">Score</div>
                    </div>

                    {/* Old Rating */}
                    <div className="text-center">
                      <div className="font-bold text-lg">{latest.data.old_rating?.toFixed(2) ?? '-'}</div>
                      <div className="text-xs text-gray-400">Old Rating</div>
                    </div>

                    {/* Predicted Rating */}
                    <div className="text-center">
                      <div className="font-bold text-lg">{latest.data.new_rating?.toFixed(2) ?? '-'}</div>
                      <div className="text-xs text-gray-400">Predicted</div>
                    </div>

                    {/* Global Rank */}
                    <div className="text-center">
                      <div className="text-md font-medium text-[#fcd9b8]">
                        #{student.globalRanking ?? '-'}
                      </div>
                      <div className="text-xs text-gray-400">Rank</div>
                    </div>

                    {/* Solved Stats */}
                    <div className="w-full p-2 rounded-xl shadow text-center space-y-1">
                      <div className="text-sm font-semibold text-[#fcd9b8]">
                        {latest.data.solvedCount ?? 0}/4
                      </div>
                      <div className="text-[11px] text-gray-400">Solved</div>
                      <div className="grid grid-cols-3 gap-1 text-[10px] text-white font-medium">
                        <div className="bg-green-500 rounded py-1">{latest.data.easySolved ?? 0}</div>
                        <div className="bg-yellow-500 rounded py-1">{latest.data.mediumSolved ?? 0}</div>
                        <div className="bg-red-500 rounded py-1">{latest.data.hardSolved ?? 0}</div>
                      </div>
                    </div>

                    {/* Rating Trend */}
                    <div
                      className={`font-semibold text-sm text-center ${trend === 'UP' ? 'text-green-400' : 'text-red-400'
                        }`}
                    >
                      {trend === 'UP' ? '↑ UP' : '↓ DOWN'}
                    </div>
                  </div>

                );
              })}
          </div>
        </div>

      )}
    </div>
  );
};

export default Leaderboard;
