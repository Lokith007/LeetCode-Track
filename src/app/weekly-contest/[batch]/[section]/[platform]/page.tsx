'use client';

import { use, useState, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Trophy, Users, Search, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import QuickNavButtons from '@/app/components/QuickNavButtons';
import { getBatchDisplayName } from '@/app/data/data';

// --- Codeforces Queries ---
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

const GET_BATCH_INFO = gql`
  query GetBatchInfo {
    allBatches {
      name
      secCount
    }
  }
`;

export default function WeeklyContestPage({
    params,
}: {
    params: Promise<{ batch: string; section: string; platform: string }>;
}) {
    const { batch, section, platform } = use(params);
    const [selectedContestId, setSelectedContestId] = useState<string>('');

    const { data: batchData } = useQuery(GET_BATCH_INFO);
    const currentBatchInfo = batchData?.allBatches?.find((b: any) => b.name === batch);
    const secCount = currentBatchInfo?.secCount || 1;

    const [manualContestId, setManualContestId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'attended' | 'notAttended'>('attended');

    // --- Codeforces Logic ---
    const { data: pastCfData } = useQuery(GET_PAST_CF_CONTESTS, {
        skip: platform !== 'codeforces',
    });

    const { data: cfLeaderboardData, loading: cfLoading, error: cfError } = useQuery(GET_CF_LEADERBOARD, {
        variables: { batch, contestId: parseInt(selectedContestId) || 0 },
        skip: platform !== 'codeforces' || !selectedContestId || selectedContestId === '0',
    });

    const pastContests = useMemo(() => {
        if (platform === 'codeforces') return pastCfData?.allCodeforcesContests || [];
        return [];
    }, [platform, pastCfData]);

    const loading = cfLoading;
    const error = cfError;

    const handleManualGo = () => {
        if (manualContestId) {
            setSelectedContestId(manualContestId);
        }
    };

    const renderParticipants = () => {
        if (platform === 'codeforces' && cfLeaderboardData) {
            const data = cfLeaderboardData.codeforcesContestLeaderboard;
            return (
                <div className="space-y-4">
                    <div className="hidden md:grid md:grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1fr_1fr] gap-4 items-center px-6 py-4 bg-[#1f1f1f] rounded-lg border border-orange-500/20 text-orange-200 font-bold uppercase text-xs tracking-wider">
                        <div>Rank</div>
                        <div>Name</div>
                        <div>Roll Number</div>
                        <div>Handle</div>
                        <div className="text-center">Points</div>
                        <div className="text-center">Solved</div>
                    </div>
                    {data.participants
                        .filter((p: any) =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.handle.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((p: any) => (
                            <div key={p.handle} className="grid md:grid-cols-[0.5fr_2fr_1.5fr_1.5fr_1fr_1fr] gap-4 items-center px-6 py-4 bg-[#1a1a1a] rounded-lg border border-gray-800 hover:border-orange-500/40 transition-all">
                                <div className="text-orange-400 font-bold">#{p.rank}</div>
                                <div className="text-white font-medium">{p.name}</div>
                                <div className="text-gray-400">{p.rollNumber}</div>
                                <div className="text-purple-400">@{p.handle}</div>
                                <div className="text-center text-green-400 font-bold">{p.points}</div>
                                <div className="text-center text-blue-400">{p.solvedCount}/{data.totalProblems}</div>
                            </div>
                        ))}
                </div>
            );
        }

        return <div className="text-center py-20 text-gray-500">No data available for this platform yet.</div>;
    };

    const renderNonParticipants = () => {
        if (platform === 'codeforces' && cfLeaderboardData) {
            const data = cfLeaderboardData.codeforcesContestLeaderboard;
            return (
                <div className="space-y-4">
                    <div className="grid grid-cols-[2fr_1fr] gap-4 items-center px-6 py-4 bg-[#1f1f1f] rounded-lg border border-orange-500/20 text-orange-200 font-bold uppercase text-xs tracking-wider">
                        <div>Name</div>
                        <div>Roll Number</div>
                    </div>
                    {data.nonParticipants
                        .filter((p: any) =>
                            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((p: any) => (
                            <div key={p.rollNumber} className="grid grid-cols-[2fr_1fr] gap-4 items-center px-6 py-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                                <div className="text-white font-medium">{p.name}</div>
                                <div className="text-gray-400">{p.rollNumber}</div>
                            </div>
                        ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-[#121212] text-gray-300 py-12 px-6">
            <div className="w-full max-w-7xl mx-auto space-y-8">
                {/* Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <QuickNavButtons currentBatch={batch} currentSection={section} secCount={secCount} />
                    <Link href={`/leaderboard/${batch}/${section}/${platform}`}>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] border border-orange-400/40 text-orange-400 hover:bg-orange-500/10 transition-all text-sm">
                            <LayoutDashboard size={18} />
                            Full Leaderboard
                        </button>
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200 flex items-center justify-center gap-3">
                        <Trophy size={40} className="text-orange-400" />
                        Weekly Contest Leaderboard
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {platform.toUpperCase()} • {getBatchDisplayName(batch)} • {section.toUpperCase()}
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Contest Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Select Recent Contest</label>
                            <select
                                value={selectedContestId}
                                onChange={(e) => setSelectedContestId(e.target.value)}
                                className="w-full bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                            >
                                <option value="">Choose a contest...</option>
                                {pastContests.map((c: any) => (
                                    <option key={c.contestId} value={c.contestId}>
                                        {c.contestName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Manual ID */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Manual Contest ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g. 2065"
                                    value={manualContestId}
                                    onChange={(e) => setManualContestId(e.target.value)}
                                    className="flex-1 bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                                />
                                <button
                                    onClick={handleManualGo}
                                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Go
                                </button>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Search Student</label>
                            <div className="relative">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Name, roll, handle..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#121212] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <div className="flex bg-[#121212] p-1 rounded-xl border border-gray-800">
                            <button
                                onClick={() => setViewMode('attended')}
                                className={`px-8 py-2 rounded-lg font-bold transition-all ${viewMode === 'attended' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Attended
                            </button>
                            <button
                                onClick={() => setViewMode('notAttended')}
                                className={`px-8 py-2 rounded-lg font-bold transition-all ${viewMode === 'notAttended' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-white'}`}
                            >
                                Not Attended
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 animate-pulse">Fetching tournament data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-[#1a1a1a] rounded-2xl border border-red-500/20">
                        <p className="text-red-400 font-bold text-xl">Oops! Error loading leaderboard.</p>
                        <p className="text-gray-500 mt-2">{error.message}</p>
                    </div>
                ) : selectedContestId ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {viewMode === 'attended' ? renderParticipants() : renderNonParticipants()}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-[#1a1a1a] rounded-3xl border border-dashed border-gray-800">
                        <Users size={64} className="mx-auto text-gray-700 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">Ready to track?</h3>
                        <p className="text-gray-600 mt-2">Pick a contest from the list above or enter an ID manually.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
