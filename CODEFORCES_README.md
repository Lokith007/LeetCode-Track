# CodeForces Integration

## Overview
This document describes the CodeForces integration added to the Competitive Programming Tracker application.

## Features

### CodeForces Page Component
- **Location**: `src/app/components/LeaderBoard/CodeForcesPage.tsx`
- **Theme**: Blue color scheme to differentiate from LeetCode (orange) and CodeChef (purple/gray)
- **Features**:
  - Overview tab with leaderboard
  - Performance and Analytics tabs (placeholder for future development)
  - Search and filtering capabilities
  - SDE/Non-SDE section filtering
  - Pagination support

### Data Structure
The CodeForces integration expects the following data structure from the GraphQL API:

```typescript
interface CodeforcesData {
  handle: string;           // CodeForces username
  rating: number;           // Current rating
  maxRating: number;        // Highest rating achieved
  rank: string;             // Current rank (e.g., "Expert", "Master")
  maxRank: string;          // Highest rank achieved
  contribution: number;      // Contribution points
  friendOfCount: number;    // Number of friends
  titlePhoto: string;       // Profile title photo URL
  avatar: string;           // Profile avatar URL
  registrationTime: string; // Account registration date
  lastOnlineTime: string;   // Last online timestamp
  organization: string;     // Organization/University
  country: string;          // Country
  city: string;             // City
  solvedProblems: number;   // Total problems solved
  participatedContests: number; // Contests participated in
}
```

### Rating Color Coding
The component automatically applies color coding based on CodeForces rating standards:
- **2400+**: Red (International Grandmaster)
- **2100+**: Red (International Master)
- **1900+**: Orange (Master)
- **1600+**: Purple (Expert)
- **1400+**: Blue (Specialist)
- **1200+**: Green (Pupil)
- **1000+**: Gray (Newbie)

### Platform Integration
- **Platform Selection**: Added to the platform selection page at `/platform/[batch]/[section]`
- **Routing**: Handled in the leaderboard page at `/leaderboard/[batch]/[section]/[platform]`
- **Navigation**: Users can now select between LeetCode, CodeChef, and CodeForces

## Usage

1. Navigate to a batch and section
2. Select "CodeForces" from the platform selection page
3. View the CodeForces leaderboard with the blue theme
4. Use search and filters to find specific students
5. Navigate between Overview, Performance, and Analytics tabs

## Styling
- **Primary Colors**: Blue (#3B82F6) and Cyan (#06B6D4)
- **Background**: Dark slate with blue gradient accents
- **Cards**: Semi-transparent with blue hover effects
- **Consistent**: Follows the same design patterns as other platform pages

## Future Enhancements
- Performance analytics with charts and graphs
- Contest-specific leaderboards
- Rating history tracking
- Problem-solving statistics
- Integration with CodeForces API for real-time data

## Dependencies
- Apollo Client for GraphQL queries
- React hooks for state management
- Tailwind CSS for styling
- Lucide React for icons (if needed)

## Notes
- The component gracefully handles missing data by showing "—" for unavailable fields
- Pagination is implemented for large datasets
- Search and filtering work across all student data
- The component is responsive and works on mobile devices
