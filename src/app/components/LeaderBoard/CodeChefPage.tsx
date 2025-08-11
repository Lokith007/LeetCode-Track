'use client';

import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';
import Image from 'next/image';

const GET_PAGINATED_STUDENTS = gql`
  query PaginatedStudents($batch: String!, $section: String, $limit: Int, $cursor: String) {
    paginatedStudents(batch: $batch, section: $section, limit: $limit, cursor: $cursor) {
      students {
        id
        name
        rollNumber
        totalSolved
        codechefData {
          countryFlag
          countryName
          countryRank
          currentRating
          globalRank
          highestRating
          name
          profile
          stars
        }
      }
      nextCursor
    }
  }
`;

interface CodechefData {
  countryFlag: string;
  countryName: string;
  countryRank: number;
  currentRating: number;
  globalRank: number;
  highestRating: number;
  name: string;
  profile:string;
  stars: string;
}

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  codechefData?: CodechefData | null;
}

type LeaderboardProps = {
  batch: string;
  section: string;
};

export default function Leaderboard({ batch, section }: LeaderboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const { loading, fetchMore } = useQuery(GET_PAGINATED_STUDENTS, {
    variables: { batch, section: section === 'All' ? null : section, limit: 12, cursor: null },
    onCompleted: (data) => {
      setStudents(data.paginatedStudents.students);
      setNextCursor(data.paginatedStudents.nextCursor);
    },
  });

  const handleLoadMore = () => {
    if (!nextCursor) return;
    setFetchLoading(true);
    fetchMore({
      variables: {
        batch,
        section: section === 'All' ? null : section,
        limit: 12,
        cursor: nextCursor,
      },
      updateQuery: (_, { fetchMoreResult }) => {
        if (!fetchMoreResult) return _;
        setStudents((prev) => [...prev, ...fetchMoreResult.paginatedStudents.students]);
        setNextCursor(fetchMoreResult.paginatedStudents.nextCursor);
        setFetchLoading(false);
        return fetchMoreResult;
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100 px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-orange-400 drop-shadow-md">
        CodeChef Leaderboard
      </h1>

      {loading && students.length === 0 ? (
        <p className="text-gray-300">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {students.map((student) => {
            const cc = student.codechefData;
            return (
              <div
                key={student.id}
                className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-700 hover:border-orange-400 transition-all"
              >
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  <Image
                    src={cc?.profile || '/default-profile.png'}
                    alt="Profile"
                    width={56}
                    height={56}
                    className="rounded-full border-2 border-gray-500 shadow-md"
                  />
                </div>

                <h2 className="text-lg font-semibold text-gray-100 text-center">{student.name}</h2>
                <p className="text-sm text-gray-400 text-center mb-4">
                  Roll: <span className="text-orange-300">{student.rollNumber}</span>
                </p>

                {cc ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-semibold text-gray-300">Current Rating:</span>{' '}
                      <span className="text-orange-300">{cc.currentRating}</span>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-300">Highest Rating:</span>{' '}
                      {cc.highestRating}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-300">Global Rank:</span>{' '}
                      {cc.globalRank}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-300">Country Rank:</span>{' '}
                      {cc.countryRank}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-300">Stars:</span>{' '}
                      {cc.stars}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center">
                    No CodeChef data available
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {nextCursor && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={fetchLoading}
            className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-orange-500 text-white font-semibold transition-all disabled:opacity-50"
          >
            {fetchLoading ? 'Loading...' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}
