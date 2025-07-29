'use client';

import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { ArrowUpRight, ArrowDownRight, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ContestLeaderboardProps = {
  batch: string;
  contests: string[];
};

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

const ContestLeaderboard = ({ batch, contests }: ContestLeaderboardProps) => {
  const [selectedContest, setSelectedContest] = useState(contests[0]);
  const [tab, setTab] = useState<'attended' | 'notAttended'>('attended');

  const { data, loading, error } = useQuery(GET_CONTEST_STATUS_LEADERBOARD, {
    variables: { batch, title: selectedContest },
  });

  const leaderboard = data?.contestStatusLeaderboard;

  return (
    <div className="p-6 space-y-6 bg-[#1a1a1a] border border-orange-300 rounded-lg min-h-screen text-gray-900">
      <h2 className="text-3xl font-bold text-center text-orange-400">
        Contest Leaderboard - {batch}
      </h2>

      {/* Contest Selector + Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <select
          value={selectedContest}
          onChange={(e) => setSelectedContest(e.target.value)}
          className="text-orange-400 px-4 py-2 border border-orange-300 rounded-lg bg-[#1a1a1a] shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {contests.map((contest) => (
            <option key={contest} value={contest}>
              {contest}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setTab('attended')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all border border-orange-300 shadow-sm focus:outline-none ${
              tab === 'attended'
                ? 'bg-orange-400 text-white shadow-md scale-105'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            Attended ({leaderboard?.participants?.length || 0})
          </button>
          <button
            onClick={() => setTab('notAttended')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all border border-orange-300 shadow-sm focus:outline-none ${
              tab === 'notAttended'
                ? 'bg-orange-500 text-white shadow-md scale-105'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            Not Attended ({leaderboard?.nonParticipants?.length || 0})
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-orange-600 font-medium">Loading leaderboard...</p>
      ) : error ? (
        <p className="text-red-500 font-medium">Error: {error.message}</p>
      ) : !leaderboard ? (
        <p className="text-gray-500">No data available.</p>
      ) : tab === 'attended' ? (
        <div className="space-y-4">
          {leaderboard.participants.map((user: any) => (
            <div
              key={user.id}
              className="bg-gradient-to-br from-white via-gray-50 to-orange-100 p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-200 text-orange-700 font-bold">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">@{user.leetcodeUsername}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 items-center text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{Number(user.rating).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="font-semibold text-gray-900">#{user.contestRanking}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">
                      {user.contest.problemsSolved}/{user.contest.totalProblems}
                    </p>
                    <p className="text-xs text-gray-500">Solved</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {user.contest.trendDirection === 'UP' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-600">{user.contest.trendDirection}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="overflow-x-auto p-0 border border-orange-200">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-orange-100 border-b text-orange-700 text-xs uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Name</th>
                <th className="px-4 py-3 text-left font-bold">Username</th>
                <th className="px-4 py-3 text-left font-bold">Rating</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.nonParticipants.map((user: any, idx: number) => (
                <tr
                  key={user.id}
                  className={`transition-all duration-150 hover:bg-orange-50 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
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
