'use client'
import React, { useEffect, useState, useRef } from "react";
import { useApolloClient } from "@apollo/client";
import {
  fetchBatchData,
  fetchContestStats,
  fetchSolvedGroupStats,
  fetchTopByRatingGlobal,
} from "./fetchBatchData";
import { gsap } from "gsap";

export default function BatchTables() {
  const client = useApolloClient();
  const [topBySolved, setTopBySolved] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [contestStats, setContestStats] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  const sectionRefs = useRef([]);

  const batches =['AIDS-CITAR-III', 'AIDS-II', 'AIDS-III', 'AIML-II', 'AIML-III', 'CSBS-II', 'CSBS-III', 'CYBER-II', 'CYBER-III', 'batch23-27', 'batch24-28', 'citarIII'];

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
      {/* Table 1 */}
      <div
        ref={(el) => (sectionRefs.current[0] = el)}
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
                <td className={tdClass}>{s.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table 2 */}
      <div
        ref={(el) => (sectionRefs.current[1] = el)}
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
        ref={(el) => (sectionRefs.current[2] = el)}
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
                <th className={thClass}>LeetCode ID</th>
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
        ref={(el) => (sectionRefs.current[3] = el)}
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
    </div>
  );
}
