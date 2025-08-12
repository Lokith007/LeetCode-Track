# Competitive Programming Leaderboard API Documentation

This repository contains the Swagger/OpenAPI specification for the Competitive Programming Leaderboard API, which provides comprehensive endpoints for managing and retrieving student data, CodeChef profiles, **LeetCode profiles**, leaderboards, and analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Examples](#examples)
- [Development](#development)

## 🚀 Overview

The Competitive Programming Leaderboard API is designed to provide a robust interface for:
- Retrieving student information with pagination
- Accessing **CodeChef profile data**
- Accessing **LeetCode profile data** (problems solved, ratings, contest performance)
- Getting platform-specific leaderboards (LeetCode, CodeChef)
- Generating analytics and reports
- Managing contest data and results

## 🛠️ Getting Started

### Prerequisites

- [Swagger UI](https://swagger.io/tools/swagger-ui/) or [Swagger Editor](https://editor.swagger.io/)
- API client (Postman, Insomnia, or similar)
- Valid API credentials

### Quick Start

1. **View the API Documentation:**
   - Open `swagger.yaml` in Swagger UI
   - Or use the online Swagger Editor: https://editor.swagger.io/

2. **Set up your environment:**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd competitive-leaderboard-api
   
   # View the API spec
   open swagger.yaml
   ```

3. **Test the API:**
   ```bash
   # Example: Get students from a specific batch
   curl -X GET "https://api.competitive-leaderboard.com/v1/students?batch=batch24-28&section=CSE-O" \
        -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 🔗 API Endpoints

### Students
- `GET /students` - Get paginated students with filtering
- `GET /students/{studentId}` - Get specific student details

### Leaderboards
- `GET /leaderboards/{batch}/{section}/{platform}` - Get platform-specific leaderboard
- `GET /contests` - Get all contests for a batch

### CodeChef
- `GET /codechef/profiles` - Get CodeChef profile data with filtering

### **LeetCode** 🆕
- `GET /leetcode/profiles` - Get LeetCode profile data with filtering
- `GET /leetcode/contests/{contestId}/results` - Get contest results
- `GET /leetcode/contests/{contestId}/leaderboard` - Get contest leaderboard

### Analytics
- `GET /analytics/{batch}/overview` - Get batch analytics overview
- `GET /analytics/{batch}/platform/{platform}` - Get platform-specific analytics

## 📊 Data Models

### Student
```json
{
  "id": "1",
  "name": "NATASHA PATNAIK",
  "rollNumber": "24CS0583",
  "section": "CSE-O",
  "codechefData": {
    "countryFlag": "🇮🇳",
    "countryName": "India",
    "countryRank": 51348,
    "currentRating": 1328,
    "globalRank": 55531,
    "highestRating": 1328,
    "name": "natasha_patnaik",
    "profile": "https://codechef.com/users/natasha_patnaik",
    "stars": "1★"
  },
  "leetcodeData": {
    "username": "natasha_patnaik",
    "totalSolved": 775,
    "easySolved": 471,
    "mediumSolved": 271,
    "hardSolved": 33,
    "rating": 1801.43,
    "globalRanking": 53706,
    "topPercentage": 7.53,
    "attendedContestsCount": 15
  }
}
```

### **LeetCode Data** 🆕
```json
{
  "username": "natasha_patnaik",
  "totalSolved": 775,
  "easySolved": 471,
  "mediumSolved": 271,
  "hardSolved": 33,
  "rating": 1801.43,
  "globalRanking": 53706,
  "topPercentage": 7.53,
  "attendedContestsCount": 15,
  "latestContests": [
    {
      "title": "weekly-contest-462",
      "data": {
        "score": 18,
        "attempted": true,
        "copied": false,
        "rank": 1250,
        "solvedCount": 3,
        "easySolved": 1,
        "mediumSolved": 2,
        "hardSolved": 0,
        "old_rating": 1785.67,
        "new_rating": 1801.43
      }
    }
  ]
}
```

### CodeChef Data
```json
{
  "countryFlag": "🇮🇳",
  "countryName": "India",
  "countryRank": 51348,
  "currentRating": 1328,
  "globalRank": 55531,
  "highestRating": 1328,
  "name": "natasha_patnaik",
  "profile": "https://codechef.com/users/natasha_patnaik",
  "stars": "1★"
}
```

## 🔐 Authentication

The API supports two authentication methods:

### JWT Bearer Token
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.competitive-leaderboard.com/v1/students
```

### API Key
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
     https://api.competitive-leaderboard.com/v1/students
```

## 💡 Examples

### Get Students with Pagination
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/students?batch=batch24-28&section=CSE-O&limit=10" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get CodeChef Leaderboard
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/leaderboards/batch24-28/CSE-O/codechef" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get LeetCode Leaderboard** 🆕
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/leaderboards/batch24-28/CSE-O/leetcode" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get LeetCode Contest Results** 🆕
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/leetcode/contests/weekly-contest-462/results?batch=batch24-28&section=CSE-O" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get LeetCode Profiles with Filtering** 🆕
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/leetcode/profiles?batch=batch24-28&rating_min=1500&total_solved_min=500" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Analytics Overview
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/analytics/batch24-28/overview" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Get Platform-Specific Analytics** 🆕
```bash
curl -X GET "https://api.competitive-leaderboard.com/v1/analytics/batch24-28/platform/leetcode" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Development

### Local Development
```bash
# Start local server (if you have one)
npm run dev

# The API will be available at:
# http://localhost:4000/v1
```

### Testing with Swagger UI
1. Open `swagger.yaml` in Swagger UI
2. Click "Try it out" on any endpoint
3. Fill in the required parameters
4. Execute the request

### Code Generation
You can generate client libraries from the Swagger spec:

```bash
# Using OpenAPI Generator
openapi-generator-cli generate -i swagger.yaml -g typescript-axios -o ./generated/typescript

# Using Swagger Codegen
swagger-codegen generate -i swagger.yaml -l typescript-axios -o ./generated/typescript
```

## 📝 Response Examples

### Successful Pagination Response
```json
{
  "paginatedStudents": {
    "students": [
      {
        "id": "1",
        "name": "NATASHA PATNAIK",
        "rollNumber": "24CS0583",
        "section": "CSE-O",
        "codechefData": {
          "currentRating": 1328,
          "globalRank": 55531,
          "stars": "1★"
        },
        "leetcodeData": {
          "totalSolved": 775,
          "rating": 1801.43,
          "globalRanking": 53706
        }
      }
    ],
    "nextCursor": "eyJpZCI6IjIxIn0="
  }
}
```

### **LeetCode Contest Results Response** 🆕
```json
{
  "contestId": "weekly-contest-462",
  "batch": "batch24-28",
  "section": "CSE-O",
  "results": [
    {
      "studentId": "1",
      "name": "NATASHA PATNAIK",
      "rollNumber": "24CS0583",
      "score": 18,
      "rank": 1250,
      "solvedCount": 3,
      "oldRating": 1785.67,
      "newRating": 1801.43,
      "copied": false
    }
  ]
}
```

### Error Response
```json
{
  "error": "Invalid batch parameter",
  "code": "INVALID_PARAMETER",
  "details": {
    "parameter": "batch",
    "value": "invalid-batch"
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# API Configuration
API_BASE_URL=https://api.competitive-leaderboard.com/v1
API_VERSION=v1
JWT_SECRET=your-secret-key
API_KEY_SECRET=your-api-key-secret

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS Configuration
```javascript
// Example CORS configuration
const corsOptions = {
  origin: ['https://yourdomain.com', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
```

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [REST API Best Practices](https://restfulapi.net/)
- [GraphQL vs REST](https://graphql.org/learn/comparison/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Update the Swagger specification
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@competitive-leaderboard.com
- Documentation: https://docs.competitive-leaderboard.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Note:** This API specification is designed to work with the existing Competitive Programming Leaderboard frontend application. The API now includes comprehensive support for both **CodeChef** and **LeetCode** platforms, with detailed contest tracking, performance analytics, and cross-platform comparisons. Make sure to implement the backend endpoints according to this specification for full compatibility.
