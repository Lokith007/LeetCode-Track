'use client';

import { use, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Leaderboard from '../../../components/LeaderBoard/Leaderboard';
import ContestLeaderboard from '../../../components/LeaderBoard/ContestLeaderboard';

const GET_ALL_CONTESTS = gql`
  query GetAllContests($batch: String!) {
    allContests(batch: $batch)
  }
`;

const LeaderboardPage = ({
  params,
}: {
  params: Promise<{ batch: string; section: string }>;
}) => {
  const { batch, section } = use(params);
  const [view, setView] = useState<'dashboard' | 'contest'>('dashboard');

  const { data, loading, error } = useQuery(GET_ALL_CONTESTS, {
    variables: { batch },
  });

  return (
    <div className="min-h-screen bg-[#121212] text-gray-300 px-6 py-10 space-y-10">
      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto">
        {view === 'dashboard' ? (
          <Leaderboard
            batch={batch}
            section={section}
            view={view}
            setView={setView}
          />
        ) : loading ? (
          <p className="text-center text-[#fcd9b8] text-lg font-medium">
            Loading contests...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 font-medium">
            Error fetching contests.
          </p>
        ) : (
          <ContestLeaderboard
            batch={batch}
            section={section}
            contests={data.allContests}
            view={view}
            setView={setView}
          />
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
