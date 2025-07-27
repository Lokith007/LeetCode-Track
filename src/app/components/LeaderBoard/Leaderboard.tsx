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
      attendedContestsCount
      recentContests {
        ranking
        problemsSolved
      }
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

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Leaderboard for {batch}</h1>
      <ul className="space-y-4">
      
        {// eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.students.map((student: any) => (
          <li key={student.id} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{student.name}</h2>
            <p className="text-gray-600">Roll No: {student.rollNumber}</p>
            <p className="mt-2">Total Solved: {student?.totalSolved}</p>
            <p>Easy: {student?.easySolved}</p>
            <p>Medium: {student?.mediumSolved}</p>
            <p>Hard: {student?.hardSolved}</p>
            <p>Rating: {student?.rating}</p>
            <p>GlobalRanking: {student?.globalRanking}</p>
            <p>Percentage: {student?.topPercentage}</p>



          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
