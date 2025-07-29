'use client';
import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';

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
      section
      attendedContestsCount
      latestContests {
        title
        data {
          score
          rank
          solvedCount
          easySolved
          mediumSolved
          hardSolved
          available
          new_rating
          old_rating
          savedAt
        }
      }
    }
  }
`;

type LeaderboardProps = {
  batch: string;
};

const Leaderboard = ({ batch }: LeaderboardProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contests'>('dashboard');
  const [contestTab, setContestTab] = useState<'attended' | 'not-attended'>('attended');

  const { data, loading, error } = useQuery(GET_STUDENTS, {
    variables: { batch },
  });

  if (loading)
    return <p className="p-8 text-orange-600 font-medium text-lg">Loading...</p>;

  if (error)
    return <p className="p-8 text-red-500 font-semibold">Error: {error.message}</p>;

  return (
    <div className="p-6 min-h-screen bg-[#1a1a1a] border border-orange-300 rounded-lg text-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-center text-orange-400">
        Leaderboard - {batch}
      </h2>

      {/* Main Tabs */}
      <div className="mb-6 flex gap-4 justify-center">
        {['dashboard', 'contests'].map((tab) => (
          <button
            key={tab}
            className={`px-6 py-2 rounded-lg font-semibold transition-all border border-gray-300 shadow-sm focus:outline-none ${
              activeTab === tab
                ? 'bg-orange-400 text-white shadow-md scale-105'
                : 'bg-[#1a1a1a] text-orange-400 hover:bg-orange-100'
            }`}
            onClick={() => setActiveTab(tab as 'dashboard' | 'contests')}
          >
            {tab === 'dashboard' ? 'Dashboard' : 'Latest Contests'}
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="overflow-auto rounded-lg shadow-md border  border-gray-200">
          <table className="min-w-full text-sm bg-white text-gray-800">
            <thead className="bg-orange-100 text-orange-700 text-xs uppercase sticky top-0">
              <tr>
                {[
                  'S.No', 'Name', 'Reg Number', 'Section', 'Total Solved',
                  'Easy', 'Medium', 'Hard', 'Rating', 'Global Rank', 'Top %'
                ].map((header) => (
                  <th key={header} className="px-4 py-3">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.students.map((student: any, index: number) => (
                <tr
                  key={student.id}
                  className={`transition-all duration-150 hover:bg-orange-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                  }`}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td className="px-4 py-2">{student.rollNumber}</td>
                  <td className="px-4 py-2">{student.section}</td>
                  <td className="px-4 py-2">{student.totalSolved}</td>
                  <td className="px-4 py-2">{student.easySolved}</td>
                  <td className="px-4 py-2">{student.mediumSolved}</td>
                  <td className="px-4 py-2">{student.hardSolved}</td>
                  <td className="px-4 py-2">{student.rating}</td>
                  <td className="px-4 py-2">{student.globalRanking}</td>
                  <td className="px-4 py-2">{student.topPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Latest Contests */}
      {activeTab === 'contests' && (
        <div>
          <div className="mb-4 flex gap-4 justify-center">
            {['attended', 'not-attended'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-2 rounded-lg font-semibold transition-all border border-gray-300 shadow-sm focus:outline-none ${
                  contestTab === tab
                    ? 'bg-orange-500 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-orange-600 hover:bg-orange-100'
                }`}
                onClick={() => setContestTab(tab as 'attended' | 'not-attended')}
              >
                {tab === 'attended' ? 'Attended' : 'Not Attended'}
              </button>
            ))}
          </div>

          <div className="overflow-auto rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full text-sm text-gray-800 bg-white">
              <thead className="bg-orange-100 text-orange-700 text-xs uppercase sticky top-0">
                <tr>
                  {[
                    'Name', 'Reg Number', 'Score', 'Rank', 'Old Rating',
                    'New Rating', 'Solved', 'Easy', 'Medium', 'Hard', 'Attended'
                  ].map((head) => (
                    <th key={head} className="px-4 py-3">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.students.flatMap((student: any) =>
                  student.latestContests
                    .filter((contest: any) =>
                      contestTab === 'attended'
                        ? contest.data.available
                        : !contest.data.available
                    )
                    .map((contest: any, idx: number) => (
                      <tr
                        key={`${student.id}-${idx}-${contestTab}`}
                        className={`transition-all duration-150 hover:bg-orange-50 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                        }`}
                      >
                        <td className="px-4 py-2">{student.name}</td>
                        <td className="px-4 py-2">{student.rollNumber}</td>
                        <td className="px-4 py-2">{contest.data.score ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.rank ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.old_rating ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.new_rating ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.solvedCount ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.easySolved ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.mediumSolved ?? '-'}</td>
                        <td className="px-4 py-2">{contest.data.hardSolved ?? '-'}</td>
                        <td className="px-4 py-2">
                          {contest.data.available ? '✅' : '❌'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
