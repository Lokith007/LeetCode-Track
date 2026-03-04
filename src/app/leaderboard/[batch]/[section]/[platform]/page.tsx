'use client';

import { use, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Leaderboard from '../../../../components/LeaderBoard/Leaderboard';
import ContestLeaderboard from '../../../../components/LeaderBoard/ContestLeaderboard';
import CodeChefPage from '@/app/components/LeaderBoard/CodeChefPage';
import CodeForcesPage from '@/app/components/LeaderBoard/CodeForcesPage';
import QuickNavButtons from '@/app/components/QuickNavButtons';

const GET_ALL_CONTESTS = gql`
  query GetAllContests($batch: String!) {
    allContests(batch: $batch)
  }
`;

const GET_BATCH_INFO = gql`
  query GetBatchInfo($batch: String!) {
    allBatches {
      name
      secCount
    }
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

  const { data: batchData } = useQuery(GET_BATCH_INFO);

  // Get the secCount for the current batch
  const currentBatchInfo = batchData?.allBatches?.find((b: any) => b.name === batch);
  const secCount = currentBatchInfo?.secCount || 1;

  return (
    platform === 'codeforces' ? (
      <CodeForcesPage batch={batch} section={section} />
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
