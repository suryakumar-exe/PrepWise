# PrepWise - TNPSC Group 4 Exam Preparation Backend

A comprehensive .NET GraphQL backend for TNPSC Group 4 exam preparation with AI-powered dynamic question generation and skill tracking.

## Features

### Core Features
- **User Authentication**: JWT-based authentication with email/password
- **Multi-language Support**: Questions in English and Tamil
- **AI-Powered Questions**: Dynamic question generation using OpenAI
- **Skill Score Tracking**: Adaptive difficulty based on performance
- **Quiz System**: Practice quizzes with timers
- **Mock Tests**: 100-question mixed-subject tests (2-hour duration)
- **AI Chatbot**: Interactive assistance for exam preparation
- **Global Leaderboard**: Performance rankings
- **Analytics**: Performance insights and trending topics

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
- **OpenAI API**: AI question generation
- **BCrypt**: Password hashing

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
- OpenAI API key

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
    "DefaultConnection": "Server=your-server;Database=PrepWiseDb;Trusted_Connection=true;"
  }
}
```

### 3. Configure OpenAI
Add your OpenAI API key in `PrepWise.API/appsettings.json`:
```json
{
  "OpenAI": {
    "ApiKey": "your-openai-api-key-here"
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
      options {
        id
        optionText
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
    }
    questions {
      id
      questionText
      options {
        id
        optionText
      }
    }
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

## Environment Variables

For production deployment, set these environment variables:

```bash
# Database
ConnectionStrings__DefaultConnection="Server=your-server;Database=PrepWiseDb;User Id=your-user;Password=your-password;"

# JWT
Jwt__Key="your-super-secret-jwt-key"
Jwt__Issuer="PrepWise"
Jwt__Audience="PrepWiseUsers"

# OpenAI
OpenAI__ApiKey="your-openai-api-key"
```

## Development

### Adding New Features
1. Create entities in `PrepWise.Core/Entities/`
2. Add GraphQL types in `PrepWise.API/GraphQL/Types/`
3. Create queries/mutations in `PrepWise.API/GraphQL/Queries/` or `Mutations/`
4. Update DbContext in `PrepWise.Infrastructure/Data/`

### Database Migrations
```bash
# Create migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

## Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed using BCrypt
- CORS is configured for development (configure properly for production)
- OpenAI API calls are rate-limited and error-handled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 