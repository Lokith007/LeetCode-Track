'use client';

import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ArrowUpRight, ArrowDownRight, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

const GET_CONTEST_STATUS_LEADERBOARD = gql`
  query GetContestStatusLeaderboard($batch: String!, $title: String!) {
    contestStatusLeaderboard(batch: $batch, title: $title) {
      participants {
        id
        name
        leetcodeUsername
        rating
        contestRanking
        contest {
          problemsSolved
          totalProblems
          trendDirection
        }
      }
      nonParticipants {
        id
        name
        leetcodeUsername
        rating
      }
    }
  }
`;

type ContestLeaderboardProps = {
  batch: string;
  contests: string[];
  section: string;
  setView: (view: 'dashboard' | 'contest') => void;
};

const ContestLeaderboard = ({ batch, contests, setView}: ContestLeaderboardProps) => {
  const [selectedContest, setSelectedContest] = useState(contests[0]);
  const [viewMode, setViewMode] = useState<'attended' | 'notAttended'>('attended');

  const { data, loading, error } = useQuery(GET_CONTEST_STATUS_LEADERBOARD, {
    variables: { batch, title: selectedContest },
  });

  const leaderboard = data?.contestStatusLeaderboard;

  return (
    <div className="min-h-screen p-6  text-gray-100 space-y-6 rounded-xl   shadow">
         <button
            onClick={() => setView("dashboard")}
            className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm border text-sm
            bg-[#1f1f1f] border-gray-700 text-gray-300 hover:bg-gray-700
              }`}
          >
            {"<-"}
          </button>
      <h2 className="text-3xl font-extrabold text-center text-orange-300">
        📊 Contest Leaderboard - {batch}
      </h2>

      {/* Top Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <select
          value={selectedContest}
          onChange={(e) => setSelectedContest(e.target.value)}
          className="w-full md:w-auto px-4 py-2 rounded-md bg-[#2a2a2a] text-orange-300 border border-gray-700 focus:outline-none "
        >
          {contests.map((contest) => (
            <option key={contest} value={contest}>
              {contest}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {(['attended', 'notAttended'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2 rounded-lg font-semibold border transition-all ${
                viewMode === mode
                  ? 'bg-[#fcd9b8] text-black'
                        : 'bg-[#1f1f1f] text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              {mode === 'attended'
                ? `Attended (${leaderboard?.participants?.length || 0})`
                : `Not Attended (${leaderboard?.nonParticipants?.length || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / Error / No Data */}
      {loading ? (
        <div className="mt-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
      ) : error ? (
        <p className="text-center text-red-500 font-semibold">Error: {error.message}</p>
      ) : !leaderboard ? (
        <p className="text-center text-gray-400">No data available.</p>
      ) : viewMode === 'attended' ? (
        <div className="space-y-4">
        {leaderboard.participants.map((user: { id: string; name: string; leetcodeUsername: string; rating: number; contestRanking: number; contest: { problemsSolved: number; totalProblems: number; trendDirection: string } }) => (
          <div
            key={user.id}
            className="bg-[#2c2c2c] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between shadow border border-[#f59e0b40] hover:border-orange-300 transition-all"
          >
            {/* Left: Avatar + Name */}
            <div className="flex items-center gap-4 w-full sm:w-1/3">
              <div className="bg-orange-200 text-black font-bold rounded-full w-12 h-12 flex items-center justify-center text-xl">
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-white font-semibold text-base truncate">{user.name}</p>
                <p className="text-gray-400 text-sm truncate">@{user.leetcodeUsername}</p>
              </div>
            </div>
      
            {/* Middle: Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mt-4 sm:mt-0 w-full sm:w-2/3 text-center">
              <div>
                <p className="font-bold text-white text-lg">{Number(user.rating).toFixed(2)}</p>
                <p className="text-gray-400 text-xs">Rating</p>
              </div>
              <div className="flex justify-center items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="font-semibold text-white text-sm">#{user.contestRanking}</span>
              </div>
              <div>
                <p className="font-bold text-white text-lg">
                  {user.contest.problemsSolved}/{user.contest.totalProblems}
                </p>
                <p className="text-gray-400 text-xs">Solved</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                {user.contest.trendDirection === 'UP' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-400">{user.contest.trendDirection}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      ) : (
        <Card className="overflow-x-auto border border-gray-700 bg-[#2a2a2a] rounded-xl">
          <table className="min-w-full text-sm text-left text-gray-100">
            <thead className="bg-[#333] text-orange-300 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.nonParticipants.map((user: { id: string; name: string; leetcodeUsername: string; rating: number }, index: number) => (
                <tr
                  key={user.id}
                  className={`transition-all hover:bg-gray-700 ${
                    index % 2 === 0 ? 'bg-[#2a2a2a]' : 'bg-[#1f1f1f]'
                  }`}
                >
                  <td className="px-4 py-2 font-medium">{user.name}</td>
                  <td className="px-4 py-2">@{user.leetcodeUsername}</td>
                  <td className="px-4 py-2">{Number(user.rating).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default ContestLeaderboard;