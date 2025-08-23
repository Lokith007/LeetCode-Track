'use client';

import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: string;
  codeforcesUsername?: string;
  codeforces?: any;
}

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

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-10">
        <div className="w-full max-w-7xl mx-auto text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300 text-lg">Loading CodeForces data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white px-6 py-10">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-200 mb-2">CodeForces Leaderboard</h1>
          <p className="text-blue-300">Batch: {batch} • Section: {section}</p>
        </div>
        
        {/* Student Cards */}
        {sectionFiltered.length > 0 ? (
          <div className="grid gap-4">
            {sectionFiltered.map((student, index) => (
              <div key={student.id} className="p-6 rounded-xl bg-slate-800/50 border border-blue-600/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                    <p className="text-blue-300">@{student.rollNumber} • {student.section}</p>
                  </div>
                  {student.codeforces && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">{student.codeforces.currentRating || '—'}</div>
                      <div className="text-sm text-blue-300">Rating</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-blue-200 mb-2">No Students Found</h3>
            <p className="text-blue-300">No students are registered for CodeForces in this batch/section.</p>
          </div>
        )}

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
