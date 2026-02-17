import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared function to classify batches into departments
export const classifyBatchIntoDepartment = (batchName: string): string => {
  // Special case for CSE batches
  if (batchName.startsWith('batch') || batchName.startsWith('citar')) return 'CSE';
  
  // For all other batches, extract department from before the first '-'
  const dashIndex = batchName.indexOf('-');
  if (dashIndex > 0) {
    return batchName.substring(0, dashIndex); // Returns everything before '-'
  }
  
  return batchName; // If no dash, return the whole name
};
