'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

type BatchCardProps = {
  batch: {
    name: string;
    displayName: string;
  };
};

export default function BatchCard({ batch }: BatchCardProps) {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/leaderboard/${batch.name}`)}
      className="cursor-pointer hover:shadow-lg transition-all p-4"
    >
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-800">{batch.displayName}</h2>
        <p className="text-gray-500 text-sm mt-1">Click to view leaderboard</p>
      </CardContent>
    </Card>
  );
}
