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
      <h2 className="text-3xl font-bold mb-6 text-green-400">Contest Leaderboard - {batch}</h2>

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
      ) : tab === 'attended' ? (
        <div className="grid gap-4">
          {leaderboard.participants.map((p: any) => (
            <div
  key={p.id}
  className="bg-gray-900 rounded-lg p-4 border border-green-700 shadow hover:bg-green-800 hover:text-black transition-all"
>
  <p>
    <span className="text-green-400 font-semibold">Name:</span>{' '}
    <span className="text-green-200">{p.name}</span>
  </p>
  <p>
    <span className="text-green-400 font-semibold">Username:</span>{' '}
    <span className="text-green-200">{p.leetcodeUsername}</span>
  </p>
  <p>
    <span className="text-green-400 font-semibold">Rating:</span>{' '}
    <span className="text-green-200">{p.rating}</span>
  </p>
  <p>
    <span className="text-green-400 font-semibold">Ranking:</span>{' '}
    <span className="text-green-200">{p.contestRanking}</span>
  </p>
  <p>
    <span className="text-green-400 font-semibold">Problems Solved:</span>{' '}
    <span className="text-green-200">
      {p.contest.problemsSolved}/{p.contest.totalProblems}
    </span>
  </p>
  <p>
    <span className="text-green-400 font-semibold">Trend:</span>{' '}
    <span className="text-green-200">{p.contest.trendDirection}</span>
  </p>
</div>

          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {leaderboard.nonParticipants.map((np: any) => (
            <div key={np.id} className="bg-gray-900 rounded-lg p-4 border border-green-700 shadow hover:bg-green-800 hover:text-black transition-all">
              <p><span className="text-green-400 font-semibold">Name:</span> {np.name}</p>
              <p><span className="text-green-400 font-semibold">Username:</span> {np.leetcodeUsername}</p>
              <p><span className="text-green-400 font-semibold">Rating:</span> {np.rating}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard;
