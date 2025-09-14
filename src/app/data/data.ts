// Mapping between database batch names and display names
export const batchDisplayNames: Record<string, string> = {
  'batch24-28': 'CSE-II',
  'batch23-27': 'CSE-III', 
  'batch22-26': 'CSE-IV',
  'citarIII': 'CSE-CITAR III'
};

// Function to get display name for a batch
export function getBatchDisplayName(batchName: string): string {
  return batchDisplayNames[batchName] || batchName;
}
  