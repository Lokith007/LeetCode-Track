'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function AddBatchCard() {
  const handleClick = () => {
    alert('🔧 Add batch logic to be implemented');
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer hover:shadow-xl transition-all flex items-center justify-center p-6 border-2 border-dashed border-gray-300"
    >
      <CardContent className="flex flex-col items-center text-center">
        <Plus className="h-8 w-8 text-gray-500 mb-2" />
        <p className="text-gray-700 font-medium">Add a Batch</p>
      </CardContent>
    </Card>
  );
}
