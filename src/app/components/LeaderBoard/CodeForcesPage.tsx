'use client';

import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

const GET_PAGINATED_STUDENTS = gql`
  query PaginatedStudents($batch: String!, $section: String, $limit: Int, $cursor: String) {
    paginatedStudents(batch: $batch, section: $section, limit: $limit, cursor: $cursor) {
      students {
        id
        name
        rollNumber
        section
        codeforcesUsername
        codeforces {
          avatar
          contribution
          currentRating
          friendOfCount
          handle
          maxRating
          problemStats {
            difficultyBreakdown {
              easySolved
              hardSolved
              legendarySolved
              mediumSolved
              totalSolved
              veryHardSolved
            }
          }
          rank
          ratingChange
          recentContests {
            attended
            contestId
            contestName
            duration
            startTime
            userPerformance {
              division
              newRating
              oldRating
              rank
              ratingChange
              wasEligible
            }
          }
          titlePhoto
        }
      }
      nextCursor
    }
  }
`;

export default function Leaderboard({ batch, section }: { batch: string; section: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const { loading, fetchMore } = useQuery(GET_PAGINATED_STUDENTS, {
    variables: { batch, section, limit: 10, cursor: null },
    onCompleted: (data) => {
      setStudents(data.paginatedStudents.students);
      setCursor(data.paginatedStudents.nextCursor);
      setHasMore(!!data.paginatedStudents.nextCursor);
    },
    fetchPolicy: 'cache-and-network',
  });

  const loadMore = async () => {
    if (!hasMore || !cursor) return;
    const { data } = await fetchMore({
      variables: { batch, section, limit: 10, cursor },
    });

    setStudents((prev) => [...prev, ...data.paginatedStudents.students]);
    setCursor(data.paginatedStudents.nextCursor);
    setHasMore(!!data.paginatedStudents.nextCursor);
  };

  // your same filtering + sorting logic here
  const sectionFiltered = useMemo(() => {
    return students.filter((s) => {
      const sec = s.section?.toUpperCase() ?? '';
      return !section || section.toLowerCase() === 'all' || sec === section.toUpperCase();
    });
  }, [students, section]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* existing UI ... */}
        <div className="grid gap-4">
          {sectionFiltered.map((student) => (
            <div key={student.id} className="p-4 rounded-xl bg-slate-800/50">
              {student.name} ({student.rollNumber})
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
