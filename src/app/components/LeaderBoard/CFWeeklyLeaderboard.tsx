'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { Trophy, Users, Star, Hash, Plus, ChevronRight, Search, Layout } from 'lucide-react';

const GET_CF_LEADERBOARD = gql`
  query GetCFLeaderboard($batch: String!, $contestId: Int!) {
    codeforcesContestLeaderboard(batch: $batch, contestId: $contestId) {
      contestId
      contestName
      totalProblems
      participants {
        name
        rollNumber
        handle
        rank
        points
        solvedCount
      }
      nonParticipants {
        name
        rollNumber
      }
    }
  }
`;

const GET_PAST_CF_CONTESTS = gql`
  query GetPastCFContests {
    allCodeforcesContests {
      contestId
      contestName
    }
  }
`;

interface CFWeeklyLeaderboardProps {
    batch: string;
    section: string;
}

export default function CFWeeklyLeaderboard({ batch, section }: CFWeeklyLeaderboardProps) {
    const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
    const [newContestId, setNewContestId] = useState<string>('');
    const [viewMode, setViewMode] = useState<'participants' | 'nonParticipants'>('participants');
    const [searchQuery, setSearchQuery] = useState('');

    const { data: pastContestsData, loading: loadingPast } = useQuery(GET_PAST_CF_CONTESTS);

    const [getLeaderboard, { data: leaderboardData, loading: loadingLeaderboard, error }] = useLazyQuery(GET_CF_LEADERBOARD);

    const pastContests = pastContestsData?.allCodeforcesContests || [];

    const handleFetchLeaderboard = useCallback((id: number) => {
        setSelectedContestId(id);
        getLeaderboard({ variables: { batch, contestId: id } });
    }, [batch, getLeaderboard]);

    useEffect(() => {
        if (pastContests.length > 0 && !selectedContestId) {
            handleFetchLeaderboard(pastContests[0].contestId);
        }
    }, [pastContests, selectedContestId, handleFetchLeaderboard]); // Changed from useMemo to useEffect

    const handleAddNewContest = () => {
        const id = parseInt(newContestId);
        if (!isNaN(id)) {
            handleFetchLeaderboard(id);
            setNewContestId('');
        }
    };

    const leaderboard = leaderboardData?.codeforcesContestLeaderboard;

    const filteredParticipants = useMemo(() => {
        if (!leaderboard?.participants) return [];
        return leaderboard.participants.filter((p: any) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.handle.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [leaderboard, searchQuery]);

    const filteredNonParticipants = useMemo(() => {
        if (!leaderboard?.nonParticipants) return [];
        return leaderboard.nonParticipants.filter((p: any) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [leaderboard, searchQuery]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#1a1a1a]/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Trophy className="text-blue-400 w-8 h-8" />
                        Codeforces Weekly Tournament
                    </h2>
                    <p className="text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {batch} • {section === 'all' ? 'All Sections' : `Section ${section}`}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#2a2a2a] p-1 rounded-2xl border border-white/5">
                        <input
                            type="number"
                            placeholder="Enter Contest ID"
                            value={newContestId}
                            onChange={(e) => setNewContestId(e.target.value)}
                            className="bg-transparent px-4 py-2 w-40 focus:outline-none text-white text-sm"
                        />
                        <button
                            onClick={handleAddNewContest}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Fetch
                        </button>
                    </div>

                    <select
                        value={selectedContestId || ''}
                        onChange={(e) => handleFetchLeaderboard(parseInt(e.target.value))}
                        className="bg-[#2a2a2a] text-white px-4 py-3 rounded-2xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[200px] text-sm"
                    >
                        <option value="" disabled>Select Past Contest</option>
                        {pastContests.map((c: any) => (
                            <option key={c.contestId} value={c.contestId}>
                                {c.contestName} ({c.contestId})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            {!selectedContestId ? (
                <div className="flex flex-col items-center justify-center py-20 bg-[#1a1a1a]/30 rounded-3xl border border-dashed border-white/10">
                    <Layout className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-400">Select or enter a contest to view results</h3>
                    <p className="text-gray-500 mt-2">Historical contest data will appear here</p>
                </div>
            ) : loadingLeaderboard ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 mt-4 animate-pulse">Analyzing contest results...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
                    <p className="text-red-400 font-medium">Failed to load leaderboard data</p>
                    <p className="text-red-300/60 text-sm mt-1">{error.message}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Contest Info Header */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-6 rounded-3xl border border-blue-500/20">
                            <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Contest Name</span>
                            <p className="text-xl font-bold mt-1 text-white truncate">{leaderboard?.contestName}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-purple-500/20">
                            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Total Problems</span>
                            <p className="text-3xl font-bold mt-1 text-white">{leaderboard?.totalProblems}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-3xl border border-green-500/20">
                            <span className="text-green-400 text-sm font-semibold uppercase tracking-wider">Participation</span>
                            <p className="text-3xl font-bold mt-1 text-white">{leaderboard?.participants.length} / {leaderboard?.participants.length + leaderboard?.nonParticipants.length}</p>
                        </div>
                    </div>

                    {/* Search & Tabs */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1a1a1a]/50 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setViewMode('participants')}
                                className={`px-6 py-2 rounded-xl transition-all text-sm font-medium ${viewMode === 'participants' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Participants
                            </button>
                            <button
                                onClick={() => setViewMode('nonParticipants')}
                                className={`px-6 py-2 rounded-xl transition-all text-sm font-medium ${viewMode === 'nonParticipants' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                Non-Participants
                            </button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#0f0f0f] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-64 transition-all"
                            />
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-[#1a1a1a]/50 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl">
                        {viewMode === 'participants' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">CodeForces Handle</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-center">Score</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-center">Solved</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredParticipants.map((p: any) => (
                                            <tr key={p.handle} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${p.rank === 1 ? 'bg-yellow-500 text-black' :
                                                        p.rank === 2 ? 'bg-gray-300 text-black' :
                                                            p.rank === 3 ? 'bg-amber-600 text-black' :
                                                                'bg-white/10 text-white'
                                                        }`}>
                                                        {p.rank}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{p.name}</p>
                                                        <p className="text-xs text-gray-500">{p.rollNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a
                                                        href={`https://codeforces.com/profile/${p.handle}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                                    >
                                                        {p.handle}
                                                        <ChevronRight className="w-3 h-3" />
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold text-white">{p.points}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20">
                                                        {p.solvedCount}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5">
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">#</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Student Name</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Roll Number</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right italic">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredNonParticipants.map((p: any, idx: number) => (
                                            <tr key={p.rollNumber} className="hover:bg-red-500/5 transition-colors group">
                                                <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4 text-white font-medium">{p.name}</td>
                                                <td className="px-6 py-4 text-gray-400">{p.rollNumber}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-red-400/60 text-xs font-semibold px-2 py-1 rounded border border-red-500/20">Absent</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {(viewMode === 'participants' ? filteredParticipants.length : filteredNonParticipants.length) === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-gray-500">No students matching your search criteria</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
