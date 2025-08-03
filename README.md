# PrepWise - TNPSC Group 4 Exam Preparation Backend

A comprehensive .NET GraphQL backend for TNPSC Group 4 exam preparation with AI-powered dynamic question generation, skill tracking, and multi-provider AI support.

## Features

### Core Features
- **User Authentication**: JWT-based authentication with email/password
- **Multi-language Support**: Questions in English and Tamil
- **AI-Powered Questions**: Dynamic question generation using multiple AI providers
- **Skill Score Tracking**: Adaptive difficulty based on performance
- **Quiz System**: Practice quizzes with timers and detailed analytics
- **Mock Tests**: 100-question mixed-subject tests with configurable time limits
- **AI Chatbot**: Interactive assistance for exam preparation with enhanced error handling
- **Global Leaderboard**: Performance rankings with rounded score display
- **Analytics**: Performance insights and trending topics
- **Multi-AI Provider Support**: OpenAI, Gemini, and Groq with automatic fallback

### Quiz Subjects
1. **Tamil Subject Quiz** (Standard 6th to 10th)
2. **Tamil Grammar** (Grammar, Literature, Comprehension, Vocabulary)
3. **Simplification** (Mathematical)
4. **Percentage** (Calculations)
5. **HCF and LCM** (Highest Common Factor and Least Common Multiple)
6. **Ratio and Proportion**
7. **Area and Volume** (Calculations)
8. **General Science** (Physics, Chemistry, Biology)
9. **Current Events** (Current Affairs)
10. **Geography** (Indian and World)
11. **History and Culture** (Indian)
12. **Indian Polity** (Constitution and Politics)

## Technology Stack

- **.NET 8**: Core framework
- **GraphQL**: API with HotChocolate
- **Entity Framework Core**: ORM with SQL Server
- **JWT Authentication**: Secure token-based auth
- **Multi-AI Providers**: OpenAI, Google Gemini, and Groq
- **BCrypt**: Password hashing
- **SQL Server LocalDB**: Development database

## Project Structure

```
PrepWise Backend/
├── PrepWise.API/                 # Main API project
│   ├── GraphQL/                  # GraphQL types and resolvers
│   │   ├── Types/               # GraphQL type definitions
│   │   ├── Queries/             # GraphQL queries
│   │   └── Mutations/           # GraphQL mutations
│   ├── Program.cs               # Application configuration
│   └── appsettings.json        # Configuration settings
├── PrepWise.Core/               # Domain entities and interfaces
│   ├── Entities/                # Domain models
│   └── Services/                # Service interfaces
└── PrepWise.Infrastructure/     # Data access and external services
    ├── Data/                    # Entity Framework context
    └── Services/                # Service implementations
```

## Setup Instructions

### Prerequisites
- .NET 8 SDK
- SQL Server (LocalDB or full instance)
- AI Provider API keys (OpenAI, Gemini, or Groq)

### 1. Clone and Build
```bash
git clone <repository-url>
cd PrepWise Backend
dotnet restore
dotnet build
```

### 2. Configure Database
Update the connection string in `PrepWise.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PrepWiseDb;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

### 3. Configure AI Providers
Add your AI provider API keys in `PrepWise.API/appsettings.json`:
```json
{
  "AIProviders": {
    "Primary": "Gemini",
    "Fallback": ["Groq", "OpenAI"],
    "OpenAI": {
      "ApiKey": "your-openai-api-key",
      "BaseUrl": "https://api.openai.com/v1",
      "Model": "gpt-3.5-turbo",
      "MaxTokens": 2000,
      "RateLimitPerMinute": 3
    },
    "Gemini": {
      "ApiKey": "your-gemini-api-key",
      "BaseUrl": "https://generativelanguage.googleapis.com/v1beta",
      "Model": "gemini-1.5-flash",
      "MaxTokens": 2000
    },
    "Groq": {
      "ApiKey": "your-groq-api-key",
      "BaseUrl": "https://api.groq.com/openai/v1",
      "Model": "llama3-8b-8192",
      "MaxTokens": 2000
    }
  }
}
```

### 4. Run Database Migrations
```bash
cd PrepWise.API
dotnet ef database update
```

### 5. Run the Application
```bash
dotnet run
```

The API will be available at:
- **GraphQL Playground**: https://localhost:7001/graphql
- **Swagger UI**: https://localhost:7001/swagger

## GraphQL API Documentation

### Authentication Mutations

#### Register User
```graphql
mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!, $phoneNumber: String) {
  register(email: $email, password: $password, firstName: $firstName, lastName: $lastName, phoneNumber: $phoneNumber) {
    success
    message
    token
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

#### Login User
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    success
    message
    token
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

### Quiz Queries

#### Get All Subjects
```graphql
query GetSubjects {
  subjects {
    id
    name
    description
    category
  }
}
```

#### Get Questions by Subject
```graphql
query GetQuestionsBySubject($subjectId: Int!, $difficulty: QuestionDifficulty, $language: QuestionLanguage) {
  questionsBySubject(subjectId: $subjectId, difficulty: $difficulty, language: $language) {
    id
    questionText
    questionTextTamil
    difficulty
    language
    options {
      id
      optionText
      optionTextTamil
      isCorrect
    }
  }
}
```

#### Generate AI Questions
```graphql
mutation GenerateAIQuestions($subjectId: Int!, $questionCount: Int!, $difficulty: QuestionDifficulty!, $language: QuestionLanguage!) {
  generateAIQuestions(subjectId: $subjectId, questionCount: $questionCount, difficulty: $difficulty, language: $language) {
    id
    questionText
    questionTextTamil
    difficulty
    language
    options {
      id
      optionText
      optionTextTamil
      isCorrect
    }
  }
}
```

### Quiz Mutations

#### Start Quiz Attempt
```graphql
mutation StartQuizAttempt($userId: Int!, $subjectId: Int!, $questionCount: Int!, $timeLimitMinutes: Int!) {
  startQuizAttempt(userId: $userId, subjectId: $subjectId, questionCount: $questionCount, timeLimitMinutes: $timeLimitMinutes) {
    success
    message
    quizAttempt {
      id
      startedAt
      totalQuestions
    }
    questions {
      id
      questionText
      questionTextTamil
      options {
        id
        optionText
        optionTextTamil
        isCorrect
      }
    }
  }
}
```

#### Submit Quiz Answers
```graphql
mutation SubmitQuizAnswers($quizAttemptId: Int!, $answers: [QuizAnswerInput!]!) {
  submitQuizAnswers(quizAttemptId: $quizAttemptId, answers: $answers) {
    success
    message
    score
    correctAnswers
    wrongAnswers
    unansweredQuestions
  }
}
```

### Mock Test Mutations

#### Start Mock Test
```graphql
mutation StartMockTest($userId: Int!, $title: String!, $timeLimitMinutes: Int) {
  startMockTest(userId: $userId, title: $title, timeLimitMinutes: $timeLimitMinutes) {
    success
    message
    mockTestAttempt {
      id
      title
      startedAt
      totalQuestions
      timeLimitMinutes
    }
    questions {
      id
      questionText
      questionTextTamil
      options {
        id
        optionText
        optionTextTamil
        isCorrect
      }
    }
  }
}
```

#### Submit Mock Test Answers
```graphql
mutation SubmitMockTestAnswers($mockTestAttemptId: Int!, $answers: [MockTestAnswerInput!]!) {
  submitMockTestAnswers(mockTestAttemptId: $mockTestAttemptId, answers: $answers) {
    success
    message
    score
    correctAnswers
    wrongAnswers
    unansweredQuestions
  }
}
```

### Analytics Queries

#### Get User Skill Scores
```graphql
query GetUserSkillScores($userId: Int!) {
  userSkillScores(userId: $userId) {
    id
    score
    totalAttempts
    correctAnswers
    totalQuestions
    subject {
      id
      name
    }
  }
}
```

#### Get Leaderboard
```graphql
query GetLeaderboard($subjectId: Int) {
  leaderboard(subjectId: $subjectId) {
    id
    score
    user {
      id
      firstName
      lastName
    }
    subject {
      id
      name
    }
  }
}
```

### Chat Mutations

#### Test Database Connection
```graphql
mutation TestDatabaseConnection {
  testDatabaseConnection {
    success
    message
    response
  }
}
```

#### Send Chat Message
```graphql
mutation SendChatMessage($userId: Int!, $message: String!) {
  sendChatMessage(userId: $userId, message: $message) {
    success
    message
    response
  }
}
```

#### Get User Chat Messages
```graphql
query GetUserChatMessages($userId: Int!, $limit: Int = 50) {
  userChatMessages(userId: $userId, limit: $limit) {
    id
    message
    response
    type
    createdAt
    isAIGenerated
  }
}
```

## AI Providers Setup

### Supported Providers
1. **OpenAI**: GPT-3.5-turbo and GPT-4 models
2. **Google Gemini**: Gemini-1.5-flash model
3. **Groq**: Llama3-8b-8192 model

### Configuration
- **Primary Provider**: Set in `appsettings.json` under `AIProviders.Primary`
- **Fallback Providers**: Configured in `AIProviders.Fallback` array
- **Automatic Fallback**: If primary provider fails, system automatically tries fallback providers
- **Rate Limiting**: Configurable per provider
- **Error Handling**: Comprehensive error handling with detailed logging

### Usage
The system automatically selects the best available AI provider based on:
- API key availability
- Rate limits
- Response quality
- Error rates

## Environment Variables

For production deployment, set these environment variables:

```bash
# Database
ConnectionStrings__DefaultConnection="Server=your-server;Database=PrepWiseDb;User Id=your-user;Password=your-password;"

# JWT
Jwt__Key="your-super-secret-jwt-key"
Jwt__Issuer="PrepWise"
Jwt__Audience="PrepWiseUsers"

# AI Providers
AIProviders__OpenAI__ApiKey="your-openai-api-key"
AIProviders__Gemini__ApiKey="your-gemini-api-key"
AIProviders__Groq__ApiKey="your-groq-api-key"
```

## Recent Improvements

### Enhanced Error Handling
- **Database Error Logging**: Detailed logging for database operations
- **AI Service Fallback**: Automatic fallback when primary AI provider fails
- **Input Validation**: Comprehensive validation for all inputs
- **User-Friendly Messages**: Clear error messages for debugging

### Mock Test System
- **Configurable Time Limits**: Custom time limits for mock tests
- **Enhanced UI**: Improved question display and navigation
- **Session Storage**: Reliable data passing between components
- **Loading States**: Professional loading spinners and overlays

### Chat System
- **Multi-Provider Support**: OpenAI, Gemini, and Groq integration
- **Enhanced Error Handling**: Detailed error logging and fallback responses
- **Database Diagnostics**: Test methods for database connectivity
- **Message History**: Persistent chat message storage

### Leaderboard Improvements
- **Score Rounding**: Automatic rounding of percentage scores
- **Performance Optimization**: Efficient queries and caching
- **Visual Enhancements**: Better score display and color coding

## Development

### Adding New Features
1. Create entities in `PrepWise.Core/Entities/`
2. Add GraphQL types in `PrepWise.API/GraphQL/Types/`
3. Create queries/mutations in `PrepWise.API/GraphQL/Queries/` or `Mutations/`
4. Update DbContext in `PrepWise.Infrastructure/Data/`
5. Add comprehensive error handling and logging

### Database Migrations
```bash
# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove migration (if needed)
dotnet ef migrations remove
```

### Testing
- **Database Connection**: Use `testDatabaseConnection` mutation
- **AI Providers**: Test with `generateAIQuestions` mutation
- **Chat System**: Test with `sendChatMessage` mutation
- **Mock Tests**: Test complete flow from start to result

## Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed using BCrypt
- CORS is configured for development (configure properly for production)
- AI API calls are rate-limited and error-handled
- Input validation on all endpoints
- SQL injection protection through Entity Framework
- XSS protection through proper input sanitization

## Troubleshooting

### Common Issues

**Database Connection Issues:**
- Ensure SQL Server LocalDB is running
- Check connection string in `appsettings.json`
- Run `dotnet ef database update` to apply migrations

**AI Provider Issues:**
- Verify API keys are correctly configured
- Check rate limits for each provider
- Review console logs for detailed error messages

**Chat Message Errors:**
- Use `testDatabaseConnection` to verify database setup
- Check if user exists and is active
- Review detailed error logs in console

### Debug Mode
Enable detailed logging by setting log level to "Debug" in `appsettings.Development.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add comprehensive error handling and logging
5. Add tests if applicable
6. Submit a pull request

## License

This project is licensed under the MIT License. 