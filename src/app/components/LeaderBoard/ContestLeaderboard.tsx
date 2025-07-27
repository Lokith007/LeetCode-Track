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
    variables: {
      batch,
      title: selectedContest,
    },
  });

  const leaderboard = data?.contestStatusLeaderboard;

  return (
    <div>
      <h2 className='text-xl font-bold mb-4'>Contest Leaderboard</h2>

      {/* Dropdown */}
      <select
        value={selectedContest}
        onChange={(e) => setSelectedContest(e.target.value)}
        className='mb-4 p-2 border rounded'
      >
        {contests.map((contest) => (
          <option key={contest} value={contest}>
            {contest}
          </option>
        ))}
      </select>

      {/* Tabs */}
      <div className='flex gap-2 mb-4'>
        <button
          onClick={() => setTab('attended')}
          className={`px-4 py-2 rounded ${
            tab === 'attended' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Attended
        </button>
        <button
          onClick={() => setTab('notAttended')}
          className={`px-4 py-2 rounded ${
            tab === 'notAttended' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Not Attended
        </button>
      </div>

      {/* Data Display */}
      {loading ? (
        <p>Loading leaderboard...</p>
      ) : error ? (
        <p>Error fetching leaderboard.</p>
      ) : !leaderboard ? (
        <p>No data available.</p>
      ) : tab === 'attended' ? (
        <div className='space-y-2'>
          {leaderboard.participants.map((p: any) => (
            <div key={p.id} className='border p-3 rounded shadow'>
              <p><strong>Name:</strong> {p.name}</p>
              <p><strong>Username:</strong> {p.leetcodeUsername}</p>
              <p><strong>Rating:</strong> {p.rating}</p>
              <p><strong>Ranking:</strong> {p.contestRanking}</p>
              <p><strong>Problems Solved:</strong> {p.contest.problemsSolved}/{p.contest.totalProblems}</p>
              <p><strong>Trend:</strong> {p.contest.trendDirection}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className='space-y-2'>
          {leaderboard.nonParticipants.map((np: any) => (
            <div key={np.id} className='border p-3 rounded shadow'>
              <p><strong>Name:</strong> {np.name}</p>
              <p><strong>Username:</strong> {np.leetcodeUsername}</p>
              <p><strong>Rating:</strong> {np.rating}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard;
