'use client';

import { use, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Leaderboard from '../../../../components/LeaderBoard/Leaderboard';
import ContestLeaderboard from '../../../../components/LeaderBoard/ContestLeaderboard';
import CodeChefPage from '@/app/components/LeaderBoard/CodeChefPage';
import CodeForcesPage from '@/app/components/LeaderBoard/CodeForcesPage';

const GET_ALL_CONTESTS = gql`
  query GetAllContests($batch: String!) {
    allContests(batch: $batch)
  }
`;

const LeaderboardPage = ({
  params,
}: {
  params: Promise<{ batch: string; section: string; platform: string }>;
}) => {
  const { batch, section, platform } = use(params);
  const [view, setView] = useState<'dashboard' | 'contest'>('dashboard');

  const { data, loading, error } = useQuery(GET_ALL_CONTESTS, {
    variables: { batch },
  });

  return (
    platform === 'leetcode' ? (
      <div className="min-h-screen bg-[#121212] text-gray-300 px-6 py-10 space-y-10">
        {/* Main Content */}
        <div className="w-full max-w-7xl mx-auto">
          {view === 'dashboard' ? (
            <Leaderboard
              batch={batch}
              section={section}
              setView={setView}
            />
          ) : loading ? (
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 font-medium">
              Error fetching contests.
            </p>
          ) : (
            <ContestLeaderboard
              batch={batch}
              section={section}
              contests={data.allContests}
              setView={setView}
            />
          )}
        </div>
      </div>
    ) : platform === 'codechef' ? (
      <>
        <CodeChefPage batch={batch} section={section}/>
      </>
    ) : platform === 'codeforces' ? (
      <>
        <CodeForcesPage batch={batch} section={section}/>
      </>
    ) : (
      <div className="min-h-screen bg-[#121212] text-gray-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Platform Not Found</h1>
          <p className="text-gray-400">The requested platform is not supported.</p>
        </div>
      </div>
    )
  );
};

export default LeaderboardPage;
