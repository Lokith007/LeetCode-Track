'use client';

import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

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
    <div className="bg-[#111111] min-h-screen p-6 text-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-[#f59e0b]">
        Contest Leaderboard - {batch}
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <select
          value={selectedContest}
          onChange={(e) => setSelectedContest(e.target.value)}
          className="bg-[#1f1f1f] text-[#f59e0b] px-4 py-2 rounded border border-[#f59e0b40] shadow"
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
            className={`px-4 py-2 rounded border font-semibold transition ${
              tab === 'attended'
                ? 'bg-[#f59e0b] text-black'
                : 'bg-[#1f1f1f] text-[#f59e0b] border-[#f59e0b] hover:bg-[#f59e0b90] hover:text-black'
            }`}
          >
            Attended
          </button>
          <button
            onClick={() => setTab('notAttended')}
            className={`px-4 py-2 rounded border font-semibold transition ${
              tab === 'notAttended'
                ? 'bg-[#f59e0b] text-black'
                : 'bg-[#1f1f1f] text-[#f59e0b] border-[#f59e0b] hover:bg-[#f59e0b90] hover:text-black'
            }`}
          >
            Not Attended
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[#f59e0b] text-lg font-medium">Loading leaderboard...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : !leaderboard ? (
        <p className="text-gray-400">No data available.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow-lg">
          <table className="min-w-full text-sm text-left text-gray-200 bg-[#1f1f1f] border border-[#f59e0b40]">
            <thead className="text-xs uppercase bg-[#2d2d2d] text-[#f59e0b]">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Rating</th>
                {tab === 'attended' && (
                  <>
                    <th className="px-4 py-3">Ranking</th>
                    <th className="px-4 py-3">Solved</th>
                    <th className="px-4 py-3">Trend</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(tab === 'attended'
                ? leaderboard.participants
                : leaderboard.nonParticipants
              ).map((user: any, index: number) => (
                <tr
                  key={user.id}
                  className="border-t border-[#2c2c2c] hover:bg-[#333] hover:text-white transition-all duration-200"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.leetcodeUsername}</td>
                  <td className="px-4 py-3">{user.rating}</td>
                  {tab === 'attended' && user.contest && (
                    <>
                      <td className="px-4 py-3">{user.contestRanking}</td>
                      <td className="px-4 py-3">
                        {user.contest.problemsSolved}/{user.contest.totalProblems}
                      </td>
                      <td className="px-4 py-3">{user.contest.trendDirection}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard;
