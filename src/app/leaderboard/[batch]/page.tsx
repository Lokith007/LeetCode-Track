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
    <div className="min-h-screen p-6 bg-[#1a1a1a] text-gray-100">
      <h1 className="text-3xl font-extrabold mb-8 text-orange-400 text-center drop-shadow-md">
        🏆 LeetCode Leaderboard - {batch}
      </h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setView('dashboard')}
          className={`px-6 py-2 rounded-lg font-semibold transition shadow-md ${
            view === 'dashboard'
              ? 'bg-orange-400 text-white'
              : 'bg-[#1a1a1a] border border-orange-400 text-orange-300 hover:bg-gray-700'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('contest')}
          className={`px-6 py-2 rounded-lg font-semibold transition shadow-md ${
            view === 'contest'
              ? 'bg-orange-400 text-white'
              : 'bg-[#1a1a1a] border border-orange-400 text-orange-300 hover:bg-gray-700'
          }`}
        >
          Contest
        </button>
      </div>

      {view === 'dashboard' ? (
        <Leaderboard batch={batch} />
      ) : loading ? (
        <p className="text-orange-300 text-center text-lg font-medium">
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
