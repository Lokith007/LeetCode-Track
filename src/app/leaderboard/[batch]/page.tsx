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
    <div className="p-6 min-h-screen bg-[#111111] text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-[#f59e0b] text-center">
        LeetCode Leaderboard - {batch}
      </h1>

      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => setView('dashboard')}
          className={`px-6 py-2 rounded font-semibold transition ${
            view === 'dashboard'
              ? 'bg-[#f59e0b] text-black'
              : 'bg-[#1f1f1f] text-[#f59e0b] border border-[#f59e0b] hover:bg-[#f59e0b90] hover:text-black'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('contest')}
          className={`px-6 py-2 rounded font-semibold transition ${
            view === 'contest'
              ? 'bg-[#f59e0b] text-black'
              : 'bg-[#1f1f1f] text-[#f59e0b] border border-[#f59e0b] hover:bg-[#f59e0b90] hover:text-black'
          }`}
        >
          Contest
        </button>
      </div>

      {view === 'dashboard' ? (
        <Leaderboard batch={batch} />
      ) : loading ? (
        <p className="text-[#f59e0b] text-center text-lg font-medium">
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
