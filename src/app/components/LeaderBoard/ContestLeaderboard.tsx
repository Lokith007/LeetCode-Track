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
          startTime
          title
          ranking
          rating
          problemsSolved
          totalProblems
          trendDirection
          finishTimeInSeconds
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
    <div className="bg-black min-h-screen p-6 text-green-300">
      <h2 className="text-3xl font-bold mb-6 text-green-400">
        Contest Leaderboard - {batch}
      </h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <select
          value={selectedContest}
          onChange={(e) => setSelectedContest(e.target.value)}
          className="bg-green-900 text-green-200 px-4 py-2 rounded shadow border border-green-600"
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
                ? 'bg-green-600 text-black'
                : 'bg-black text-green-300 border-green-700 hover:bg-green-800 hover:text-black'
            }`}
          >
            Attended
          </button>
          <button
            onClick={() => setTab('notAttended')}
            className={`px-4 py-2 rounded border font-semibold transition ${
              tab === 'notAttended'
                ? 'bg-green-600 text-black'
                : 'bg-black text-green-300 border-green-700 hover:bg-green-800 hover:text-black'
            }`}
          >
            Not Attended
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-green-400 text-lg font-medium">Loading leaderboard...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : !leaderboard ? (
        <p>No data available.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow-lg">
          <table className="min-w-full text-sm text-left text-green-200 bg-gray-900 border border-green-600">
            <thead className="text-xs uppercase bg-green-700 text-black">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Rating</th>
                {tab === 'attended' && (
                  <>
                    <th className="px-4 py-3">Ranking</th>
                    <th className="px-4 py-3">Problems Solved</th>
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
                  className="border-t border-green-800 hover:bg-green-800 hover:text-black transition-all duration-200"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.leetcodeUsername}</td>
                  <td className="px-4 py-3">{user.rating}</td>
                  {tab === 'attended' && (
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
