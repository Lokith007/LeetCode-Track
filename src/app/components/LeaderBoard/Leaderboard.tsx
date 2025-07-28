'use client';

import { gql, useQuery } from '@apollo/client';

const GET_STUDENTS = gql`
  query GetStudents($batch: String!) {
    students(batch: $batch) {
      id
      name
      rollNumber
      totalSolved
      easySolved
      mediumSolved
      hardSolved
      rating
      globalRanking
      topPercentage
    }
  }
`;

type LeaderboardProps = {
  batch: string;
};

const Leaderboard = ({ batch }: LeaderboardProps) => {
  const { data, loading, error } = useQuery(GET_STUDENTS, {
    variables: { batch },
  });

  if (loading)
    return <p className="p-8 text-orange-300 font-medium text-lg">Loading...</p>;

  if (error)
    return <p className="p-8 text-red-500 font-semibold">Error: {error.message}</p>;

  return (
    <div className="p-4 bg-[#111111] min-h-screen">
      <h2 className="text-3xl font-bold text-[#f59e0b] mb-6">
        Leaderboard - {batch}
      </h2>
      <div className="overflow-auto rounded-lg shadow-lg">
        <table className="min-w-full text-sm text-left text-gray-200 bg-[#1f1f1f] border border-[#f59e0b40]">
          <thead className="text-xs uppercase bg-[#2d2d2d] text-[#f59e0b]">
            <tr>
              <th className="px-4 py-3">S.No</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Reg Number</th>
              <th className="px-4 py-3">Total Solved</th>
              <th className="px-4 py-3">Easy</th>
              <th className="px-4 py-3">Medium</th>
              <th className="px-4 py-3">Hard</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Global Rank</th>
              <th className="px-4 py-3">Top %</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((student: any, index: number) => (
              <tr
                key={student.id}
                className="border-t border-[#2c2c2c] hover:bg-[#333] hover:text-white transition-all duration-200"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{student.name}</td>
                <td className="px-4 py-3">{student.rollNumber}</td>
                <td className="px-4 py-3">{student.totalSolved}</td>
                <td className="px-4 py-3">{student.easySolved}</td>
                <td className="px-4 py-3">{student.mediumSolved}</td>
                <td className="px-4 py-3">{student.hardSolved}</td>
                <td className="px-4 py-3">{student.rating}</td>
                <td className="px-4 py-3">{student.globalRanking}</td>
                <td className="px-4 py-3">{student.topPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
