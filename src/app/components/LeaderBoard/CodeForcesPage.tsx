'use client';

import { gql, useQuery } from '@apollo/client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBatchDisplayName } from '../../data/data';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  section: string;
  codeforcesUsername?: string;
  codeforces?: any;
}

const GET_STUDENTS = gql`
  query Students($batch: String!) {
    students(batch: $batch) {
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
  }
`;

export default function Leaderboard({ batch, section }: { batch: string; section: string }) {
  const router = useRouter();
  const { loading, data } = useQuery(GET_STUDENTS, {
    variables: { batch },
    fetchPolicy: 'cache-and-network',
  });

  const students = data?.students || [];
  
  // Debug logging
  console.log('🔍 Debug Info:');
  console.log('Batch:', batch);
  console.log('Section:', section);
  console.log('Students count:', students.length);
  console.log('Students data:', students);
  console.log('Loading state:', loading);

  // View state
  const [currentView, setCurrentView] = useState<'dashboard' | 'contest'>('dashboard');

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const PAGE_LIMIT = 20;

  // Sorting state
  const [sortBy, setSortBy] = useState<'currentRating' | 'maxRating' | 'problemsSolved' | 'newRating' | 'oldRating' | 'ratingChange'>('newRating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown state
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Attendance filter state
  const [attendanceFilter, setAttendanceFilter] = useState<'attended' | 'not-attended'>('attended');

  // Eligibility filter state
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'only-eligible'>('all');

  // Get all available contests for contest leaderboard
  const getAllContests = () => {
    // Get contests from any student (they all have the same recentContests data)
    const studentWithContests = students.find((s: any) => s.codeforces?.recentContests?.length > 0);
    
    if (!studentWithContests?.codeforces?.recentContests) {
      return [];
    }
    
    // Get past 5 contests (already sorted by start time, newest first)
    const allContests = studentWithContests.codeforces.recentContests
      .slice(0, 5);
    
    return allContests;
  };

  const allContests = getAllContests();
  const [selectedContestId, setSelectedContestId] = useState<number | null>(allContests[0]?.contestId || null);
  
  // Get selected contest data
  const selectedContest = allContests.find((c: any) => c.contestId === selectedContestId) || allContests[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownOpen && !(event.target as Element).closest('.group')) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sortDropdownOpen]);

  // Filter students by section and search query
  const sectionFiltered = useMemo(() => {
    let filtered = students.filter((s: any) => {
      const sec = s.section?.toUpperCase() ?? '';
      return !section || section.toLowerCase() === 'all' || sec === section.toUpperCase();
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((s: any) => {
        return (
          s.name?.toLowerCase().includes(query) ||
          s.section?.toLowerCase().includes(query) ||
          s.rollNumber?.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [students, section, searchQuery]);

  // Sort students based on selected criteria
  const sortedStudents = useMemo(() => {
    let sorted = [...sectionFiltered];
    
    sorted.sort((a, b) => {
      let aValue: number, bValue: number;
      
      switch (sortBy) {
        case 'currentRating':
          aValue = a.codeforces?.currentRating ?? 0;
          bValue = b.codeforces?.currentRating ?? 0;
          break;
        case 'maxRating':
          aValue = a.codeforces?.maxRating ?? 0;
          bValue = b.codeforces?.maxRating ?? 0;
          break;
        case 'problemsSolved':
          aValue = a.codeforces?.problemStats?.difficultyBreakdown?.totalSolved ?? 0;
          bValue = b.codeforces?.problemStats?.difficultyBreakdown?.totalSolved ?? 0;
          break;
        case 'newRating':
          // For contest view, use newRating from the selected contest
          if (currentView === 'contest' && selectedContest) {
            const contestA = a.codeforces?.recentContests?.find((c: any) => c.contestId === selectedContest.contestId);
            const contestB = b.codeforces?.recentContests?.find((c: any) => c.contestId === selectedContest.contestId);
            aValue = contestA?.userPerformance?.newRating ?? 0;
            bValue = contestB?.userPerformance?.newRating ?? 0;
          } else {
            aValue = a.codeforces?.currentRating ?? 0;
            bValue = b.codeforces?.currentRating ?? 0;
          }
          break;
        case 'oldRating':
          // For contest view, use oldRating from the selected contest
          if (currentView === 'contest' && selectedContest) {
            const contestA = a.codeforces?.recentContests?.find((c: any) => c.contestId === selectedContest.contestId);
            const contestB = b.codeforces?.recentContests?.find((c: any) => c.contestId === selectedContest.contestId);
            aValue = contestA?.userPerformance?.oldRating ?? 0;
            bValue = contestB?.userPerformance?.oldRating ?? 0;
          } else {
            aValue = a.codeforces?.currentRating ?? 0;
            bValue = b.codeforces?.currentRating ?? 0;
          }
          break;
        case 'ratingChange':
          // For contest view, use ratingChange from the selected contest
          if (currentView === 'contest' && selectedContest) {
            const contestA = a.codeforces?.recentContests?.find((c: any) => c.contestId === selectedContest.contestId);
            const contestB = b.codeforces?.recentContests?.find((c: any) => c.contestId === selectedContest.contestId);
            aValue = contestA?.userPerformance?.ratingChange ?? 0;
            bValue = contestB?.userPerformance?.ratingChange ?? 0;
          } else {
            aValue = a.codeforces?.currentRating ?? 0;
            bValue = b.codeforces?.currentRating ?? 0;
          }
          break;
        default:
          aValue = a.codeforces?.currentRating ?? 0;
          bValue = b.codeforces?.currentRating ?? 0;
      }
      
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
    
    return sorted;
  }, [sectionFiltered, sortBy, sortOrder, currentView, selectedContest]);

  // Paginate students
  const paginatedStudents = useMemo(() => {
    const startIndex = pageIndex * PAGE_LIMIT;
    return sortedStudents.slice(startIndex, startIndex + PAGE_LIMIT);
  }, [sortedStudents, pageIndex]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedStudents.length / PAGE_LIMIT);

  // Reset page when filters change
  useEffect(() => {
    setPageIndex(0);
  }, [section, searchQuery, sortBy, sortOrder]);

  // Get contest participants
  const getContestParticipants = () => {
    if (!selectedContest) return [];
    
    return students
      .map((s: any) => {
        const contest = s.codeforces?.recentContests?.find((c: any) => 
          c.contestId === selectedContest.contestId
        );
        return {
          ...s,
          contestData: contest
        };
      })
      .filter((s: any) => s.contestData) // Only include students with contest data
      .filter((s: any) => {
        if (attendanceFilter === 'attended') {
          return s.contestData?.attended === true;
        } else {
          return s.contestData?.attended === false;
        }
      })
      .filter((s: any) => {
        if (eligibilityFilter === 'only-eligible') {
          return s.contestData?.userPerformance?.wasEligible === true;
        } else {
          return true; // 'all' - no filtering
        }
      })
      .sort((a: any, b: any) => (b.contestData?.userPerformance?.newRating || 0) - (a.contestData?.userPerformance?.newRating || 0));
  };

  const contestParticipants = getContestParticipants();

  // Count attended and not attended students for the selected contest
  const getAttendanceCounts = () => {
    if (!selectedContest) return { attended: 0, notAttended: 0 };
    
    const allStudentsInContest = students
      .map((s: any) => {
        const contest = s.codeforces?.recentContests?.find((c: any) => 
          c.contestId === selectedContest.contestId
        );
        return {
          ...s,
          contestData: contest
        };
      })
      .filter((s: any) => s.contestData); // Only include students with contest data

    const attended = allStudentsInContest.filter((s: any) => s.contestData?.attended === true).length;
    const notAttended = allStudentsInContest.filter((s: any) => s.contestData?.attended === false).length;
    
    return { attended, notAttended };
  };

  const attendanceCounts = getAttendanceCounts();

  // Filter contest participants by search query
  const filteredContestParticipants = useMemo(() => {
    if (!searchQuery.trim()) {
      return contestParticipants;
    }
    
    const query = searchQuery.trim().toLowerCase();
    return contestParticipants.filter((student: any) => {
      return (
        student.name?.toLowerCase().includes(query) ||
        student.section?.toLowerCase().includes(query) ||
        student.rollNumber?.toLowerCase().includes(query)
      );
    });
  }, [contestParticipants, searchQuery, attendanceFilter, eligibilityFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1b1430] to-[#0f0a1f] flex items-center justify-center">
        <div className="text-purple-400 text-xl">Loading CodeForces data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1b1430] to-[#0f0a1f] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation Buttons */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#1b1430] border border-orange-500/60 text-orange-400 hover:bg-orange-600/20 hover:border-orange-400 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1b1430] border border-orange-500/60 text-orange-400 text-sm hover:bg-orange-600/20 hover:border-orange-400 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
          
          <button
            onClick={() => router.push(`/sections/${batch}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1b1430] border border-orange-500/60 text-orange-400 text-sm hover:bg-orange-600/20 hover:border-orange-400 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Back to Sections
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          {currentView === 'contest' ? (
            // Contest view - header and contest selection in same row
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                CodeForces Leaderboard (Contest)
              </h1>
              <div className="flex flex-col items-end gap-1">
                <span className="text-purple-200 text-sm font-medium">Select Contest:</span>
                <select
                  value={selectedContestId || ''}
                  onChange={(e) => setSelectedContestId(Number(e.target.value))}
                  className="px-4 py-2 rounded-md bg-[#1b1430] border border-purple-500/40 text-white text-sm hover:border-purple-400/60 hover:bg-[#2a1f4a] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200 min-w-[200px]"
                >
                  {allContests.map((contest: any) => {
                    const contestDate = new Date(contest.startTime).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    return (
                      <option key={contest.contestId} value={contest.contestId}>
                        {contest.contestName} ({contestDate})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          ) : (
            // Dashboard view - left-aligned header
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-4">
                CodeForces Leaderboard
              </h1>
            </div>
          )}
          
          <p className="text-left text-purple-200 text-lg">
            {getBatchDisplayName(batch)} • {section === 'all' ? 'All Sections' : section}
          </p>
        </div>

        {currentView === 'dashboard' ? (
          // Dashboard View
          <>
            {/* Controls Row */}
            <div className="flex items-center justify-center gap-3 mb-3">
              {/* View Toggle Buttons */}
              <div className="bg-[#1b1430] rounded-lg p-1 border border-purple-600/30">
                                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:shadow-xl"
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => setCurrentView('contest')}
                    className="px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-600/20 hover:shadow-md"
                  >
                    🏆 Contest
                  </button>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, section, or roll"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pr-8 pl-3 py-2 rounded-md bg-[#1b1430] border border-purple-500/40 text-white placeholder-purple-300/70 hover:border-purple-400/60 hover:bg-[#2a1f4a] focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200 text-sm"
                />
                <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ maxWidth: '16px', maxHeight: '16px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-1">
                <span className="text-purple-200 text-xs font-medium">Sort by:</span>
                <div 
                  className="relative group"
                  onMouseEnter={() => setSortDropdownOpen(true)}
                  onMouseLeave={() => setSortDropdownOpen(false)}
                >
                  <button 
                    className="px-2 py-2 rounded-md bg-[#1b1430] border border-purple-500/40 text-white text-xs hover:bg-[#2a1f4a] hover:border-purple-400/60 hover:shadow-md focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200 min-w-[100px] flex items-center justify-between"
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  >
                    {sortBy === 'currentRating' ? 'Current Rating' : sortBy === 'maxRating' ? 'Max Rating' : 'Problems Solved'}
                    <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {sortDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-[#1b1430] border border-purple-500/40 rounded-md shadow-lg z-10">
                      <div 
                        className="px-2 py-1 text-white text-xs hover:bg-purple-600/20 cursor-pointer transition-colors"
                        onClick={() => {
                          setSortBy('currentRating');
                          setPageIndex(0);
                          setSortDropdownOpen(false);
                        }}
                      >
                        Current Rating
                      </div>
                      <div 
                        className="px-2 py-1 text-white text-xs hover:bg-purple-600/20 cursor-pointer transition-colors"
                        onClick={() => {
                          setSortBy('maxRating');
                          setPageIndex(0);
                          setSortDropdownOpen(false);
                        }}
                      >
                        Max Rating
                      </div>
                      <div 
                        className="px-2 py-1 text-white text-xs hover:bg-purple-600/20 cursor-pointer transition-colors"
                        onClick={() => {
                          setSortBy('problemsSolved');
                          setPageIndex(0);
                          setSortDropdownOpen(false);
                        }}
                      >
                        Problems Solved
                      </div>

                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Button */}
              <div className="flex items-center gap-1">
                <span className="text-purple-200 text-xs font-medium">Order:</span>
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setPageIndex(0);
                  }}
                  className="px-2 py-2 rounded-md bg-[#1b1430] border border-purple-500/40 text-white text-xs hover:bg-purple-600/20 hover:border-purple-400 hover:shadow-md transition-all duration-200 flex items-center gap-1 min-w-[100px] justify-center"
                >
                  {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSortBy('currentRating');
                  setSortOrder('desc');
                  setPageIndex(0);
                }}
                className="px-2 py-2 rounded-md bg-purple-600/20 border border-purple-400/50 text-purple-200 text-xs hover:bg-purple-600/30 hover:border-purple-400 hover:shadow-md transition-all duration-200"
              >
                Reset
              </button>
            </div>
        
            {/* Header Row */}
            <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center 
              px-6 py-4 mb-4
              bg-gradient-to-br from-[#3d2a6b] via-[#3d2a6b] to-[#3d2a6b] 
              rounded-lg shadow-md border border-purple-400">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8"></div>
                <div className="cursor-pointer hover:text-purple-200 transition-colors font-bold text-sm text-white">Name</div>
              </div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">Section</div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">Rating</div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">Max Rating</div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">Total</div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                Easy
              </div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                Med
              </div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                Hard
              </div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                Very Hard
              </div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white group relative">
                Legend
                <svg className="w-3 h-3 text-purple-200 cursor-help ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-black/90 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 max-w-xs">
                  <div className="font-semibold mb-2">Difficulty Breakdown:</div>
                  <div className="space-y-1 text-xs">
                    <div><span className="text-green-400">Easy:</span> Difficulty Rating &lt; 1200</div>
                    <div><span className="text-yellow-400">Medium:</span> Difficulty Rating 1200-1599</div>
                    <div><span className="text-red-400">Hard:</span> Difficulty Rating 1600-1999</div>
                    <div><span className="text-red-500">Very Hard:</span> Difficulty Rating 2000-2399</div>
                    <div><span className="text-purple-400">Legendary:</span> Difficulty Rating ≥ 2400</div>
                  </div>
                </div>
              </div>
              <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white"></div>
            </div>

            {/* Search Results Info */}
            {searchQuery.trim() && (
              <div className="text-center mb-4">
                <p className="text-purple-200 text-sm">
                  Found <span className="font-semibold text-purple-300">{sectionFiltered.length}</span> student{sectionFiltered.length !== 1 ? 's' : ''} 
                  {sectionFiltered.length !== students.length && (
                    <span> out of <span className="font-semibold text-purple-300">{students.length}</span> total</span>
                  )}
                </p>
              </div>
            )}

            {/* Student Cards */}
            {paginatedStudents.length > 0 ? (
              <div className="space-y-8">
                {paginatedStudents.map((student, index) => (
                  <div key={student.id} className="hidden md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-6 items-center 
                    px-10 py-2
                    bg-gradient-to-br from-[#1b1430] via-[#1b1430] to-[#1b1430] 
                    rounded-lg shadow-md border border-purple-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.01] hover:bg-gradient-to-br hover:from-[#2a1f4a] hover:via-[#2a1f4a] hover:to-[#2a1f4a]">
                    
                    {/* Name and Icon */}
                    <div className="flex items-center gap-3 group cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-semibold text-white text-base group-hover:text-purple-200 transition-colors duration-200">{student.name}</div>
                        <div className="text-purple-300 text-sm group-hover:text-purple-200 transition-colors duration-200">{student.rollNumber || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Section */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-purple-200 text-base font-medium group-hover:text-purple-100 transition-colors duration-200">{student.section}</div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Section</div>
                    </div>

                    {/* Current Rating */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-white text-lg font-medium group-hover:text-purple-200 transition-colors duration-200">
                        {student.codeforces?.currentRating || 'N/A'}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Rating</div>
                    </div>

                    {/* Max Rating */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-purple-300 text-lg font-medium group-hover:text-purple-200 transition-colors duration-200">
                        {student.codeforces?.maxRating || 'N/A'}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Max Rating</div>
                    </div>

                    {/* Total Problems */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-blue-300 text-lg font-medium group-hover:text-blue-200 transition-colors duration-200">
                        {student.codeforces?.problemStats?.difficultyBreakdown?.totalSolved || 0}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Total</div>
                    </div>

                    {/* Easy Problems */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-green-400 text-lg font-medium group-hover:text-green-300 transition-colors duration-200">
                        {student.codeforces?.problemStats?.difficultyBreakdown?.easySolved || 0}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Easy</div>
                    </div>

                    {/* Medium Problems */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-yellow-400 text-lg font-medium group-hover:text-yellow-300 transition-colors duration-200">
                        {student.codeforces?.problemStats?.difficultyBreakdown?.mediumSolved || 0}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Med</div>
                    </div>

                    {/* Hard Problems */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-red-400 text-lg font-medium group-hover:text-red-300 transition-colors duration-200">
                        {student.codeforces?.problemStats?.difficultyBreakdown?.hardSolved || 0}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Hard</div>
                    </div>

                    {/* Very Hard Problems */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-red-500 text-lg font-medium group-hover:text-red-400 transition-colors duration-200">
                        {student.codeforces?.problemStats?.difficultyBreakdown?.veryHardSolved || 0}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Very Hard</div>
                    </div>

                    {/* Legendary Problems */}
                    <div className="text-center group cursor-pointer">
                      <div className="text-purple-400 text-lg font-medium group-hover:text-purple-300 transition-colors duration-200">
                        {student.codeforces?.problemStats?.difficultyBreakdown?.legendarySolved || 0}
                      </div>
                      <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Legend</div>
                    </div>
                    
                    {/* Empty column to match contest layout */}
                    <div className="text-center"></div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="text-center py-12">
                <div className="text-purple-300 text-lg">No Students Found</div>
                <div className="text-purple-400 text-sm mt-2">Try adjusting your search or filters</div>
          </div>
        )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                  disabled={pageIndex === 0}
                  className="px-4 py-2 rounded-lg bg-[#1b1430] border border-purple-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-400/50 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pageIndex < 3) {
                      pageNum = i + 1;
                    } else if (pageIndex >= totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pageIndex - 1 + i;
                    }
                    
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPageIndex(pageNum - 1)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          pageNum === pageIndex + 1
                            ? 'bg-purple-600 text-white'
                            : 'bg-[#1b1430] border border-purple-600/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && pageIndex < totalPages - 3 && (
                    <>
                      {pageIndex < totalPages - 4 && <span className="text-purple-400">...</span>}
                      <button
                        onClick={() => setPageIndex(totalPages - 1)}
                        className="w-10 h-10 rounded-lg bg-[#1b1430] border border-purple-600/30 text-purple-300 hover:bg-purple-600/20 hover:border-purple-400/50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                  disabled={pageIndex === totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-[#1b1430] border border-purple-600/30 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600/20 hover:border-purple-400/50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          // Contest Leaderboard View
          <>
            {selectedContest ? (
              <>

                {/* Controls Row for Contest View */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  {/* View Toggle Buttons */}
                  <div className="bg-[#1b1430] rounded-lg p-1 border border-purple-600/30">
                    <button
                      onClick={() => setCurrentView('dashboard')}
                      className="px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-600/20 hover:shadow-md"
                    >
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => setCurrentView('contest')}
                      className="px-3 py-2 rounded-md font-medium transition-all duration-200 text-xs bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:shadow-xl"
                    >
                      🏆 Contest
                    </button>
                  </div>





                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, section, or roll"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64 pr-8 pl-3 py-2 rounded-md bg-[#1b1430] border border-purple-500/40 text-white placeholder-purple-300/70 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/20 transition-all duration-200 text-sm"
                    />
                    <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ maxWidth: '16px', maxHeight: '16px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Eligibility Toggle Buttons */}
                  <div className="bg-[#1b1430] rounded-lg p-1 border border-purple-600/30">
                    <button
                      onClick={() => setEligibilityFilter('all')}
                      className={`px-2 py-2 rounded-md font-medium transition-all duration-200 text-xs hover:shadow-md ${
                        eligibilityFilter === 'all'
                          ? 'bg-orange-200 text-black hover:bg-orange-300'
                          : 'bg-[#28203F] text-white hover:bg-[#3a2f5a]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setEligibilityFilter('only-eligible')}
                      className={`px-2 py-2 rounded-md font-medium transition-all duration-200 text-xs hover:shadow-md ${
                        eligibilityFilter === 'only-eligible'
                          ? 'bg-orange-200 text-black hover:bg-orange-300'
                          : 'bg-[#28203F] text-white hover:bg-[#3a2f5a]'
                      }`}
                    >
                      Only Eligible
                    </button>
                  </div>

                  {/* Attendance Toggle Buttons */}
                  <div className="bg-[#1b1430] rounded-lg p-1 border border-purple-600/30">
                    <button
                      onClick={() => setAttendanceFilter('attended')}
                      className={`px-2 py-2 rounded-md font-medium transition-all duration-200 text-xs hover:shadow-md ${
                        attendanceFilter === 'attended'
                          ? 'bg-orange-200 text-black hover:bg-orange-300'
                          : 'bg-[#28203F] text-white hover:bg-[#3a2f5a]'
                      }`}
                    >
                      Attended ({attendanceCounts.attended})
                    </button>
                    <button
                      onClick={() => setAttendanceFilter('not-attended')}
                      className={`px-2 py-2 rounded-md font-medium transition-all duration-200 text-xs hover:shadow-md ${
                        attendanceFilter === 'not-attended'
                          ? 'bg-orange-200 text-black hover:bg-orange-300'
                          : 'bg-[#28203F] text-white hover:bg-[#3a2f5a]'
                      }`}
                    >
                      Not Attended ({attendanceCounts.notAttended})
                    </button>
                  </div>
                </div>

                {/* Contest Leaderboard Header */}
                <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 items-center 
                  px-6 py-4 mb-4
                  bg-gradient-to-br from-[#3d2a6b] via-[#3d2a6b] to-[#3d2a6b] 
                  rounded-lg shadow-md border border-purple-400">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8"></div>
                    <div className="cursor-pointer hover:text-purple-200 transition-colors font-bold text-sm text-white">Name</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Section</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Old Rating</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">New Rating</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Rating Change</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Trend</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Total Problems</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Problems Solved</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white">
                    <div className="text-white font-bold">Eligible</div>
                  </div>
                  <div className="text-center cursor-pointer hover:text-purple-200 transition-colors font-bold text-xs text-white"></div>
                </div>

                {/* Search Results Info for Contest View */}
                {searchQuery.trim() && (
                  <div className="text-center mb-4">
                    <p className="text-purple-200 text-sm">
                      Found <span className="font-semibold text-purple-300">{filteredContestParticipants.length}</span> participant{filteredContestParticipants.length !== 1 ? 's' : ''} 
                      {filteredContestParticipants.length !== contestParticipants.length && (
                        <span> out of <span className="font-semibold text-purple-300">{contestParticipants.length}</span> total</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Contest Participants */}
                {filteredContestParticipants.length > 0 ? (
                  <div className="space-y-8">
                    {filteredContestParticipants.map((student: any, index: number) => (
                      <div key={student.id} className="hidden md:grid md:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-6 items-center 
                        px-10 py-2
                        bg-gradient-to-br from-[#1b1430] via-[#1b1430] to-[#1b1430] 
                        rounded-lg shadow-md border border-purple-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.01] hover:bg-gradient-to-br hover:from-[#2a1f4a] hover:via-[#2a1f4a] hover:to-[#2a1f4a]">
                        
                        {/* Name and Icon */}
                        <div className="flex items-center gap-3 group cursor-pointer">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-200">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <div className="font-semibold text-white text-base group-hover:text-purple-200 transition-colors duration-200">{student.name}</div>
                            <div className="text-purple-300 text-sm group-hover:text-purple-200 transition-colors duration-200">{student.rollNumber || 'N/A'}</div>
                          </div>
                        </div>

                        {/* Section */}
                        <div className="text-center group cursor-pointer">
                          <div className="text-gray-300 text-base font-medium group-hover:text-gray-100 transition-colors duration-200">{student.section}</div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Section</div>
                        </div>

                        {/* Old Rating */}
                        <div className="text-center group cursor-pointer">
                          <div className="text-gray-300 text-base font-medium group-hover:text-gray-100 transition-colors duration-200">
                            {student.contestData?.userPerformance?.oldRating || 'N/A'}
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Old Rating</div>
                        </div>

                        {/* New Rating */}
                        <div className="text-center group cursor-pointer">
                          <div className="text-white text-base font-medium group-hover:text-purple-200 transition-colors duration-200">
                            {student.contestData?.userPerformance?.newRating || 'N/A'}
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">New Rating</div>
                        </div>

                        {/* Rating Change */}
                        <div className="text-center group cursor-pointer">
                          <div className={`text-base font-medium transition-colors duration-200 ${
                            (student.contestData?.userPerformance?.ratingChange || 0) > 0 
                              ? 'text-green-400 group-hover:text-green-300' 
                              : (student.contestData?.userPerformance?.ratingChange || 0) < 0 
                                ? 'text-red-400 group-hover:text-red-300' 
                                : 'text-gray-400 group-hover:text-gray-300'
                          }`}>
                            {(student.contestData?.userPerformance?.ratingChange || 0) > 0 ? '+' : ''}
                            {student.contestData?.userPerformance?.ratingChange || 0}
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Rating Change</div>
                        </div>

                        {/* Trend */}
                        <div className="text-center group cursor-pointer">
                          <div className={`text-base font-medium transition-colors duration-200 ${
                            (student.contestData?.userPerformance?.ratingChange || 0) > 0 
                              ? 'text-green-400 group-hover:text-green-300' 
                              : (student.contestData?.userPerformance?.ratingChange || 0) < 0 
                                ? 'text-red-400 group-hover:text-red-300' 
                                : 'text-gray-400 group-hover:text-gray-300'
                          }`}>
                            {(student.contestData?.userPerformance?.ratingChange || 0) > 0 
                              ? '↗ Up' 
                              : (student.contestData?.userPerformance?.ratingChange || 0) < 0 
                                ? '↘ Down' 
                                : '→ No Change'}
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Trend</div>
                        </div>

                        {/* Total Problems */}
                        <div className="text-center group cursor-pointer">
                          <div className="text-blue-400 text-base font-medium group-hover:text-blue-300 transition-colors duration-200">
                            {/* {student.contestData?.userPerformance?.totalProblems || 0} */}
                            --
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Total Problems</div>
                        </div>

                        {/* Problems Solved */}
                        <div className="text-center group cursor-pointer">
                          <div className="text-blue-400 text-base font-medium group-hover:text-blue-300 transition-colors duration-200">
                            {/* {student.contestData?.userPerformance?.solvedCount || 0} */}
                            --
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200 whitespace-nowrap">Problems Solved</div>
                        </div>

                        {/* Was Eligible */}
                        <div className="text-center group cursor-pointer">
                          <div className={`text-base font-medium transition-colors duration-200 ${
                            student.contestData?.userPerformance?.wasEligible 
                              ? 'text-green-400 group-hover:text-green-300' 
                              : 'text-red-400 group-hover:text-red-300'
                          }`}>
                            {student.contestData?.userPerformance?.wasEligible ? 'Yes' : 'No'}
                          </div>
                          <div className="text-purple-200 text-xs mt-1 group-hover:text-purple-100 transition-colors duration-200">Eligible</div>
                        </div>
                        
                        {/* Empty columns to match dashboard layout */}
                        <div className="text-center"></div>
                        <div className="text-center"></div>
                        <div className="text-center"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {searchQuery.trim() ? (
                      <>
                        <div className="text-purple-300 text-lg">No Search Results Found</div>
                        <div className="text-purple-400 text-sm mt-2">Try adjusting your search query</div>
                      </>
                    ) : (
                      <>
                        <div className="text-purple-300 text-lg">No Contest Participants Found</div>
                        <div className="text-purple-400 text-sm mt-2">No students participated in selected contest</div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-purple-300 text-lg">No Contest Data Available</div>
                <div className="text-purple-400 text-sm mt-2">No CodeForces contest data available for the selected contest</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
