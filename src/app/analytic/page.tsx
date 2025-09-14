'use client'
import React, { useEffect, useState, useRef } from "react";
import { useApolloClient, gql } from "@apollo/client";
import {
  fetchBatchData,
  fetchContestStats,
  fetchSolvedGroupStats,
  fetchTopByRatingGlobal,
} from "./fetchBatchData";
import { gsap } from "gsap";
import QuickNavButtons from "@/app/components/QuickNavButtons";
import { getBatchDisplayName } from "../data/data";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

export default function BatchTables() {
  const client = useApolloClient();
  const [topBySolved, setTopBySolved] = useState<any[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<any[]>([]);
  const [contestStats, setContestStats] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [exportingDepartment, setExportingDepartment] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const batches = React.useMemo(() => ['AIDS-CITAR-III', 'AIDS-II', 'AIDS-III', 'AIML-II', 'AIML-III', 'CSBS-II', 'CSBS-III', 'CYBER-II', 'CYBER-III', 'batch23-27', 'batch24-28', 'citarIII'], []);

  const GET_STUDENTS_BY_BATCH = gql`
    query Students($batch: String!) {
      students(batch: $batch) {
        name
        rollNumber
        section
        rating
        latestContests {
          title
          data {
            attempted
            available
            score
            rank
            old_rating
            new_rating
            solvedCount
            easySolved
            mediumSolved
            hardSolved
          }
        }
      }
    }
  `;

  // Department configuration with batch mappings
  const DEPARTMENTS = {
    CSE: {
      batches: ['batch24-28', 'batch23-27', 'citarIII'],
      displayName: 'CSE'
    },
    AIML: {
      batches: ['AIML-II', 'AIML-III'],
      displayName: 'AIML'
    },
    AIDS: {
      batches: ['AIDS-II', 'AIDS-III', 'AIDS-CITAR-III'],
      displayName: 'AIDS'
    },
    CYBER: {
      batches: ['CYBER-II', 'CYBER-III'],
      displayName: 'CS'
    },
    CSBS: {
      batches: ['CSBS-II', 'CSBS-III'],
      displayName: 'CSBS'
    }
  };

  useEffect(() => {
    (async () => {
      const batchData = await fetchBatchData(batches, client);
      setTopBySolved(batchData.topBySolved);
      setSolvedGroups(await fetchSolvedGroupStats(batches, client));
      setContestStats(await fetchContestStats(batches, client));
    })();
  }, [client]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchTopByRatingGlobal(batches, client);
      setTopStudents(data);
    }
    loadData();
  }, [batches, client]);

  // Function to export department data to Excel
  const exportDepartmentData = async (department: keyof typeof DEPARTMENTS) => {
    try {
      setExportingDepartment(department);
      const departmentConfig = DEPARTMENTS[department];
      let allRows: any[] = [];

      // Starting export process

      // Fetch students for all batches in the department
      let contestName = '';
      
      for (const batch of departmentConfig.batches) {
        try {
          const { data: batchData } = await client.query({
            query: GET_STUDENTS_BY_BATCH,
            variables: { batch },
            fetchPolicy: 'network-only',
            errorPolicy: 'all'
          });

          if (batchData?.students && Array.isArray(batchData.students)) {
            batchData.students.forEach((student: any) => {
              const contests = student.latestContests || [];
              
              contests.forEach((contest: any) => {
                // Capture the contest name for filename
                if (contest.title && !contestName) {
                  contestName = contest.title;
                }
                
                allRows.push({
                  Name: student.name,
                  RollNumber: student.rollNumber,
                  Section: student.section || 'Unknown',
                  Batch: getBatchDisplayName(batch),
                  Contest: contest.title || 'Unknown Contest',
                  Attended: contest.data?.attempted || contest.data?.available ? 'Yes' : 'No',
                  Score: contest.data?.score ?? '',
                  Rank: contest.data?.rank ?? '',
                  OldRating: contest.data?.old_rating ?? '',
                  NewRating: contest.data?.new_rating ?? '',
                  Solved: contest.data?.solvedCount ?? '',
                  EasySolved: contest.data?.easySolved ?? '',
                  MediumSolved: contest.data?.mediumSolved ?? '',
                  HardSolved: contest.data?.hardSolved ?? '',
                });
              });
            });
                  } else {
          // No students data found for this batch
        }
        } catch (batchError) {
          // Continue with other batches instead of failing completely
        }
      }

      // Total rows collected

      if (allRows.length === 0) {
        setExportStatus({ type: 'error', message: `No data found for ${departmentConfig.displayName}. Please check the console for details.` });
        return;
      }

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(allRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, department);

      // Save the file
      const fileName = `${department}_${contestName || 'contest'}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      setExportStatus({ type: 'success', message: `Successfully exported ${allRows.length} rows to ${fileName}` });
      
    } catch (error: any) {
      console.error('Export error:', error);
      
      // More specific error messages
      if (error.message?.includes('Failed to fetch')) {
        setExportStatus({ type: 'error', message: 'Network error: Unable to connect to the server. Please check your internet connection and try again.' });
      } else if (error.message?.includes('Network request failed')) {
        setExportStatus({ type: 'error', message: 'Network error: The server is not responding. Please try again later.' });
      } else {
        setExportStatus({ type: 'error', message: `Error exporting data: ${error.message || 'Unknown error'}. Please check the console for details.` });
      }
    } finally {
      setExportingDepartment(null);
      // Clear status after 5 seconds
      setTimeout(() => setExportStatus({ type: null, message: '' }), 5000);
    }
  };

  // Animate sections on mount
  useEffect(() => {
    gsap.fromTo(
      sectionRefs.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );
  }, []);

  const sectionClass =
    "bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] rounded-2xl shadow-xl p-6 border border-gray-700";
  const tableClass =
    "w-full border-collapse rounded-lg overflow-hidden text-gray-200";
  const thClass =
    "px-4 py-2 text-left font-semibold bg-gradient-to-r from-[#2a2a2a] to-[#1f1f1f] text-gray-100 border-b border-gray-700";
  const tdClass =
    "px-4 py-2 border-t border-gray-700 group-hover:bg-[#2a2a2a]/60 transition-colors";

  const headerClass = "text-2xl font-bold mb-6 text-orange-200";

  return (
    <div className="p-6 space-y-12 bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] min-h-screen text-gray-100">
      {/* Quick Navigation - Top Left */}
      <div className="mb-6 flex justify-start">
        <QuickNavButtons />
      </div>

      {/* Table 1 */}
      <div
        ref={(el) => { sectionRefs.current[0] = el; }}
        className={sectionClass}
      >
        <h2 className={headerClass}>🌍 Global Top 5 by Total Solved</h2>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Roll No</th>
              <th className={thClass}>Batch</th>
              <th className={thClass}>Total Solved</th>
              <th className={thClass}>Easy</th>
              <th className={thClass}>Medium</th>
              <th className={thClass}>Hard</th>
              <th className={thClass}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topBySolved.map((s) => (
              <tr key={s.id} className="group hover:bg-[#2a2a2a]/40">
                <td className={tdClass}>{s.name}</td>
                <td className={tdClass}>{s.rollNumber}</td>
                <td className={tdClass}>{s.batch}</td>
                <td className={tdClass + " text-orange-200 font-semibold"}>
                  {s.totalSolved}
                </td>
                <td className={tdClass}>{s.easySolved}</td>
                <td className={tdClass}>{s.mediumSolved}</td>
                <td className={tdClass}>{s.hardSolved}</td>
                <td className={tdClass}>{Number(s.rating).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table 2 */}
      <div
        ref={(el) => { sectionRefs.current[1] = el; }}
        className={sectionClass}
      >
        <h2 className={headerClass}>📊 Solved Distribution per Batch</h2>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Batch</th>
              <th className={thClass}>0</th>
              <th className={thClass}>1</th>
              <th className={thClass}>2</th>
              <th className={thClass}>3</th>
              <th className={thClass}>4+</th>
              <th className={thClass}>Total ≥1</th>
            </tr>
          </thead>
          <tbody>
            {solvedGroups.map((row) => (
              <tr key={row.department} className="group hover:bg-[#2a2a2a]/40">
                <td className={tdClass}>{row.department}</td>
                <td className={tdClass}>{row[0]}</td>
                <td className={tdClass}>{row[1]}</td>
                <td className={tdClass}>{row[2]}</td>
                <td className={tdClass}>{row[3]}</td>
                <td className={tdClass}>{row[4]}</td>
                <td className={tdClass + " text-orange-200 font-semibold"}>
                  {row.totalNonZero}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table 3 */}
      <div
        ref={(el) => { sectionRefs.current[2] = el; }}
        className={sectionClass}
      >
        <h3 className={headerClass}>🏆 Top Performers - Current Contest</h3>
        <div className="overflow-x-auto">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Rank</th>
                <th className={thClass}>Student Name</th>
                <th className={thClass}>Department/Year</th>
                <th className={thClass}>Roll Number</th>
                <th className={thClass}>Problems Solved</th>
                <th className={thClass}>Global Ranking</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((student, idx) => (
                <tr key={student.id} className="group hover:bg-[#2a2a2a]/40">
                  <td className={tdClass + " text-orange-200 font-bold"}>
                    {idx + 1}
                  </td>
                  <td className={tdClass}>{student.name}</td>
                  <td className={tdClass}>{student.batch}</td>
                  <td className={tdClass}>{student.rollNumber}</td>
                  <td className={tdClass}>
                    {student.latestContests?.[0]?.data?.solvedCount ?? "-"}
                  </td>
                  <td className={tdClass}>
                    {student.globalRanking ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 4 */}
      <div
        ref={(el) => { sectionRefs.current[3] = el; }}
        className={sectionClass}
      >
        <h2 className={headerClass}>📈 Contest Participation per Batch</h2>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Batch</th>
              <th className={thClass}>Total</th>
              <th className={thClass}>Present</th>
              <th className={thClass}>Absent</th>
              <th className={thClass}>Best Rank</th>
              <th className={thClass}>Avg. Rank</th>
            </tr>
          </thead>
          <tbody>
            {contestStats.map((row) => (
              <tr key={row.department} className="group hover:bg-[#2a2a2a]/40">
                <td className={tdClass}>{row.department}</td>
                <td className={tdClass}>{row.total}</td>
                <td className={tdClass}>{row.present}</td>
                <td className={tdClass}>{row.absent}</td>
                <td className={tdClass + " text-orange-200 font-semibold"}>
                  {row.bestRank}
                </td>
                <td className={tdClass}>{row.avgRank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Department Export Section */}
      <div className="bg-gradient-to-br from-[#1f1f1f] via-[#242424] to-[#2a2a2a] rounded-2xl shadow-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-green-200 flex items-center gap-2">
          <Download className="h-6 w-6" />
          Export Department Data to Excel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {Object.entries(DEPARTMENTS).map(([deptKey, deptConfig]) => {
            const isExporting = exportingDepartment === deptKey;
            return (
              <button
                key={deptKey}
                onClick={() => exportDepartmentData(deptKey as keyof typeof DEPARTMENTS)}
                disabled={isExporting}
                className={`px-2 py-1.5 rounded font-medium transition-colors flex items-center gap-1 justify-center text-xs ${
                  isExporting 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3" />
                    {deptConfig.displayName}
                  </>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Status Messages */}
        {exportStatus.type && (
          <div className={`mt-4 p-3 rounded-lg border ${
            exportStatus.type === 'success' 
              ? 'bg-green-900/20 border-green-500/30 text-green-300' 
              : 'bg-red-900/20 border-red-500/30 text-red-300'
          }`}>
            <p className="text-sm font-medium">
              {exportStatus.type === 'success' ? '✅ ' : '❌ '}
              {exportStatus.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
