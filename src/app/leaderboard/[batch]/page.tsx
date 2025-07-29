'use client';

import { use, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Leaderboard from '../../components/LeaderBoard/Leaderboard';
import ContestLeaderboard from '../../components/LeaderBoard/ContestLeaderboard';

const GET_ALL_CONTESTS = gql`
  query GetAllContests($batch: String!) {
    allContests(batch: $batch)
  }
`;

const LeaderboardPage = ({ params }: { params: Promise<{ batch: string }> }) => {
  const { batch } = use(params);
  const [view, setView] = useState<'dashboard' | 'contest'>('dashboard');

  const { data, loading, error } = useQuery(GET_ALL_CONTESTS, {
    variables: { batch },
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-white via-blue-50 to-indigo-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-center drop-shadow">
        LeetCode Leaderboard - {batch}
      </h1>

      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setView('dashboard')}
          className={`px-6 py-2 rounded-lg font-semibold transition shadow-md ${
            view === 'dashboard'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-indigo-400 text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('contest')}
          className={`px-6 py-2 rounded-lg font-semibold transition shadow-md ${
            view === 'contest'
              ? 'bg-indigo-600 text-white'
              : 'bg-white border border-indigo-400 text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          Contest
        </button>
      </div>

      {view === 'dashboard' ? (
        <Leaderboard batch={batch} />
      ) : loading ? (
        <p className="text-indigo-600 text-center text-lg font-medium">
          Loading contests...
        </p>
      ) : error ? (
        <p className="text-red-500 text-center">Error fetching contests.</p>
      ) : (
        <ContestLeaderboard batch={batch} contests={data.allContests} />
      )}
    </div>
  );
};

export default LeaderboardPage;
