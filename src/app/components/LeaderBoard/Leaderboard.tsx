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
    return <p className="p-8 text-indigo-600 font-medium text-lg">Loading...</p>;

  if (error)
    return <p className="p-8 text-red-500 font-semibold">Error: {error.message}</p>;

  return (
    <div className="p-6 min-h-screen bg-white text-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Leaderboard - {batch}
      </h2>

      {/* Main Tabs */}
      <div className="mb-6 flex gap-4 justify-center">
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition-all border border-indigo-300 shadow-sm focus:outline-none ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold transition-all border border-indigo-300 shadow-sm focus:outline-none ${
            activeTab === 'contests'
              ? 'bg-indigo-600 text-white shadow-md scale-105'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
          onClick={() => setActiveTab('contests')}
        >
          Latest Contests
        </button>
      </div>

      {/* DASHBOARD TABLE */}
      {activeTab === 'dashboard' && (
        <div className="overflow-auto rounded-lg shadow-md border border-indigo-200">
          <table className="min-w-full text-sm bg-white text-gray-800">
            <thead className="bg-indigo-100 text-indigo-700 text-xs uppercase sticky top-0">
              <tr>
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Reg Number</th>
                <th className="px-4 py-3">Section</th>
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
                  className={`transition-all duration-150 hover:bg-indigo-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-blue-50'
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

      {/* LATEST CONTESTS TABLE */}
      {activeTab === 'contests' && (
        <div>
          {/* Sub-tabs */}
          <div className="mb-4 flex gap-4 justify-center">
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition-all border border-indigo-300 shadow-sm focus:outline-none ${
                contestTab === 'attended'
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
              onClick={() => setContestTab('attended')}
            >
              Attended
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition-all border border-indigo-300 shadow-sm focus:outline-none ${
                contestTab === 'not-attended'
                  ? 'bg-indigo-600 text-white shadow-md scale-105'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
              onClick={() => setContestTab('not-attended')}
            >
              Not Attended
            </button>
          </div>

          {/* Contest Table */}
          <div className="overflow-auto rounded-lg shadow-md border border-indigo-200">
            <table className="min-w-full text-sm text-gray-800 bg-white">
              <thead className="bg-indigo-100 text-indigo-700 text-xs uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Reg Number</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Old Rating</th>
                  <th className="px-4 py-3">New Rating</th>
                  <th className="px-4 py-3">Solved</th>
                  <th className="px-4 py-3">Easy</th>
                  <th className="px-4 py-3">Medium</th>
                  <th className="px-4 py-3">Hard</th>
                  <th className="px-4 py-3">Attended</th>
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
                        className={`transition-all duration-150 hover:bg-indigo-50 ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'
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
