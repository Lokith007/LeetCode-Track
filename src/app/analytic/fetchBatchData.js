import { gql } from "@apollo/client";

const GET_STUDENTS = gql`
  query Students($batch: String!) {
    students(batch: $batch) {
      id
      name
      rollNumber
      section
      totalSolved
      easySolved
      mediumSolved
      hardSolved
      rating
      globalRanking
      topPercentage
      attendedContestsCount
      latestContests {
        title
        data {
          score
          attempted
          copied
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

// 🔹 Helper to fetch all students from batches
async function fetchAllStudents(batches, client) {
    const results = await Promise.all(
        batches.map((batch) =>
            client.query({ query: GET_STUDENTS, variables: { batch } })
        )
    );

    const studentsByBatch = {};
    let allStudents = [];

    batches.forEach((batch, i) => {
        const students = results[i].data.students || [];
        studentsByBatch[batch] = students;
        allStudents = allStudents.concat(students);
    });

    return { studentsByBatch, allStudents };
}

// 🔹 Fetch stats (with global topBySolved)
// 🔹 Fetch stats (with global topBySolved)
export async function fetchBatchData(batches, client) {
    const { studentsByBatch, allStudents } = await fetchAllStudents(
        batches,
        client
    );

    // ✅ Attach batch info to every student in allStudents
    const studentsWithBatch = allStudents.map((s) => ({
        ...s,
        batch: s.batch ?? Object.keys(studentsByBatch).find((b) =>
            studentsByBatch[b].some((st) => st.id === s.id)
        ),
    }));

    // ✅ Top 5 by totalSolved across ALL batches
    const topBySolved = [...studentsWithBatch]
        .sort((a, b) => b.totalSolved - a.totalSolved)
        .slice(0, 5);

    const results = {};

    for (const batch of batches) {
        // Add batch field when mapping students
        const students = studentsByBatch[batch].map((s) => ({
            ...s,
            batch,
        }));

        // Solved Count Groups
        const solvedGroups = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        students.forEach((s) => {
            const solvedCount = s.latestContests?.[0]?.data?.solvedCount ?? 0;
            const bucket = solvedCount > 5 ? 5 : solvedCount;
            solvedGroups[bucket] += 1;
        });

        // Top 5 by new_rating (per batch)
        const topByRating = [...students]
            .sort((a, b) => {
                const newA = a.latestContests?.[0]?.data?.new_rating ?? 0;
                const newB = b.latestContests?.[0]?.data?.new_rating ?? 0;
                return newB - newA;
            })
            .slice(0, 5);

        results[batch] = { solvedGroups, topByRating };
    }

    return { results, topBySolved }; // 🔹 return global topBySolved separately
}


// 🔹 Contest stats per batch
export async function fetchContestStats(batches, client) {
    const { studentsByBatch } = await fetchAllStudents(batches, client);

    return batches.map((batch) => {
        const students = studentsByBatch[batch];
        const total = students.length;

        const contestRanks = students.map(
            (s) => s.latestContests?.[0]?.data?.rank ?? null
        );

        const presentRanks = contestRanks.filter(
            (r) => r !== null && r !== undefined
        );

        const present = presentRanks.length;
        const absent = total - present;
        const bestRank = presentRanks.length > 0 ? Math.min(...presentRanks) : "-";
        const avgRank =
            presentRanks.length > 0
                ? (presentRanks.reduce((sum, r) => sum + r, 0) / presentRanks.length).toFixed(2)
                : "-";

        return { department: batch, total, present, absent, bestRank, avgRank };
    });
}

// 🔹 Solved group stats per batch
export async function fetchSolvedGroupStats(batches, client) {
    const { studentsByBatch } = await fetchAllStudents(batches, client);

    return batches.map((batch) => {
        const students = studentsByBatch[batch];
        const solvedGroups = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

        students.forEach((s) => {
            const solvedCount = s.latestContests?.[0]?.data?.solvedCount ?? 0;
            const bucket = solvedCount > 4 ? 4 : solvedCount; // group 4+ into 4
            solvedGroups[bucket] += 1;
        });

        const totalNonZero =
            solvedGroups[1] + solvedGroups[2] + solvedGroups[3] + solvedGroups[4];

        return { department: batch, ...solvedGroups, totalNonZero };
    });
}

// 🔹 Fetch global top 5 students by new_rating
export async function fetchTopByRatingGlobal(batches, client) {
    const { studentsByBatch, allStudents } = await fetchAllStudents(batches, client);

    // ✅ Attach batch info
    const studentsWithBatch = allStudents.map((s) => ({
        ...s,
        batch: s.batch ?? Object.keys(studentsByBatch).find((b) =>
            studentsByBatch[b].some((st) => st.id === s.id)
        ),
    }));

    // ✅ Get top 5 by new_rating (from latest contest)
    const topByNewRating = [...studentsWithBatch]
        .sort((a, b) => {
            const newA = a.latestContests?.[0]?.data?.new_rating ?? 0;
            const newB = b.latestContests?.[0]?.data?.new_rating ?? 0;
            return newB - newA;
        })
        .slice(0, 5);

    return topByNewRating;
}
