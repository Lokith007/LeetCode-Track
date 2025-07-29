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
    <div className="min-h-screen bg-[#121212] text-gray-300 px-6 py-10 space-y-10">
  

      {/* View Switch Tabs */}
      {/* <div className="flex justify-start gap-4">
        <button
          onClick={() => setView('dashboard')}
          className={`px-5 py-2 rounded-md font-medium transition-all duration-200 text-sm shadow-sm border ${
            view === 'dashboard'
              ? 'bg-[#fcd9b8] text-black'
              : 'bg-[#1e1e1e] text-gray-300 border-gray-600 hover:bg-gray-800'
          }`}
        >
          Dashboard View
        </button>
        <button
          onClick={() => setView('contest')}
          className={`px-5 py-2 rounded-md font-medium transition-all duration-200 text-sm shadow-sm border ${
            view === 'contest'
              ? 'bg-[#fcd9b8] text-black'
              : 'bg-[#1e1e1e] text-gray-300 border-gray-600 hover:bg-gray-800'
          }`}
        >
          Contest View
        </button>
      </div> */}

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto">
        {view === 'dashboard' ? (
          <Leaderboard batch={batch} view={view} setView={setView} />
        ) : loading ? (
          <p className="text-center text-[#fcd9b8] text-lg font-medium">Loading contests...</p>
        ) : error ? (
          <p className="text-center text-red-500 font-medium">Error fetching contests.</p>
        ) : (
          <ContestLeaderboard batch={batch} contests={data.allContests} view={view} setView={setView} />
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
