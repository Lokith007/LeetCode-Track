// Mapping between database batch names and display names
export const batchDisplayNames: Record<string, string> = {
  'batch24-28': 'CSE-II',
  'batch23-27': 'CSE-III', 
  'batch22-26': 'CSE-IV',
  'citarIII': 'CSE-CITAR III'
};

// Priority system for sorting (lower number = higher priority)
export const batchPriorities: Record<string, number> = {
  'batch24-28': 1,    // CSE-II - highest priority
  'batch23-27': 2,    // CSE-III - second priority
  'citarIII': 3,      // CSE-CITAR III - third priority
  'AIML-II': 1,       // AIML-II - highest priority
  'AIML-III': 2,      // AIML-III - second priority
  'AIDS-II': 1,       // AIDS-II - highest priority
  'AIDS-III': 2,      // AIDS-III - second priority
  'CYBER-II': 1,      // CYBER-II - highest priority
  'CYBER-III': 2,     // CYBER-III - second priority
  'CSBS-II': 1,       // CSBS-II - highest priority
  'CSBS-III': 2,      // CSBS-III - second priority
};

// Function to get display name for a batch
export function getBatchDisplayName(batchName: string): string {
  return batchDisplayNames[batchName] || batchName;
}

// Function to get priority for sorting
export function getBatchPriority(batchName: string): number {
  return batchPriorities[batchName] || 999; // Default to low priority
}
  