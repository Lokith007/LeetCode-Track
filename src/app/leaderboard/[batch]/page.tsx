'use client';

import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Leaderboard from '../../components/LeaderBoard/Leaderboard';
import ContestLeaderboard from '../../components/LeaderBoard/ContestLeaderboard';

const GET_ALL_CONTESTS = gql`
  query GetAllContests($batch: String!) {
    allContests(batch: $batch)
  }
`;

type LeaderboardPageProps = {
  params: {
    batch: string;
  };
};

const LeaderboardPage = ({ params }: LeaderboardPageProps) => {
  const { batch } = params;
  const [view, setView] = useState<'dashboard' | 'contest'>('dashboard');

  const { data, loading, error } = useQuery(GET_ALL_CONTESTS, {
    variables: { batch },
  });
  console.log(data , error);
  

  return (
    <div className='p-4'>
      {/* Toggle Buttons */}
      <div className='mb-4 flex gap-2'>
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 rounded ${
            view === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('contest')}
          className={`px-4 py-2 rounded ${
            view === 'contest' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          Contest
        </button>
      </div>

      {/* Conditional Render */}
      {view === 'dashboard' ? (
        <Leaderboard batch={batch} />
      ) : loading ? (
        <p>Loading contests...</p>
      ) : error ? (
        <p>Error fetching contests.</p>
      ) : (
        <ContestLeaderboard batch={batch} contests={data.allContests} />
      )}
    </div>
  );
};

export default LeaderboardPage;
