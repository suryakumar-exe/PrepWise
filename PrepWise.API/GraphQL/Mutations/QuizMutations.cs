using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PrepWise.Core.Entities;
using PrepWise.Core.Services;
using PrepWise.Infrastructure.Data;
using PrepWise.API.GraphQL.Types;

namespace PrepWise.API.GraphQL.Mutations;

[ExtendObjectType(typeof(Mutation))]
public class QuizMutations
{
    [GraphQLDescription("Start a quiz attempt")]
    public async Task<QuizAttemptResult> StartQuizAttempt(
        int userId,
        int subjectId,
        int questionCount,
        int timeLimitMinutes,
        [Service] PrepWiseDbContext context)
    {
        // Get questions for the subject
        var questions = await context.Questions
            .Include(q => q.Options)
            .Where(q => q.SubjectId == subjectId && q.IsActive)
            .OrderBy(r => Guid.NewGuid()) // Random order
            .Take(questionCount)
            .ToListAsync();

        if (!questions.Any())
        {
            return new QuizAttemptResult
            {
                Success = false,
                Message = "No questions available for this subject"
            };
        }

        // Create quiz
        var quiz = new Quiz
        {
            Title = $"Quiz - {DateTime.UtcNow:yyyy-MM-dd HH:mm}",
            SubjectId = subjectId,
            QuestionCount = questionCount,
            TimeLimitMinutes = timeLimitMinutes,
            Type = QuizType.Practice,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Quizzes.Add(quiz);
        await context.SaveChangesAsync();

        // Add questions to quiz
        for (int i = 0; i < questions.Count; i++)
        {
            var quizQuestion = new QuizQuestion
            {
                QuizId = quiz.Id,
                QuestionId = questions[i].Id,
                OrderIndex = i
            };
            context.QuizQuestions.Add(quizQuestion);
        }

        // Create quiz attempt
        var quizAttempt = new QuizAttempt
        {
            UserId = userId,
            QuizId = quiz.Id,
            StartedAt = DateTime.UtcNow,
            TotalQuestions = questionCount,
            Status = QuizAttemptStatus.InProgress
        };

        context.QuizAttempts.Add(quizAttempt);
        await context.SaveChangesAsync();

        return new QuizAttemptResult
        {
            Success = true,
            Message = "Quiz started successfully",
            QuizAttempt = quizAttempt,
            Questions = questions
        };
    }

    [GraphQLDescription("Submit quiz answers")]
    public async Task<QuizResult> SubmitQuizAnswers(
        int quizAttemptId,
        List<QuizAnswerInput> answers,
        [Service] PrepWiseDbContext context)
    {
        var quizAttempt = await context.QuizAttempts
            .Include(qa => qa.Quiz)
            .FirstOrDefaultAsync(qa => qa.Id == quizAttemptId);

        if (quizAttempt == null)
        {
            return new QuizResult
            {
                Success = false,
                Message = "Quiz attempt not found"
            };
        }

        if (quizAttempt.Status != QuizAttemptStatus.InProgress)
        {
            return new QuizResult
            {
                Success = false,
                Message = "Quiz attempt is not in progress"
            };
        }

        int correctAnswers = 0;
        int wrongAnswers = 0;
        int unansweredQuestions = 0;

        foreach (var answerInput in answers)
        {
            var question = await context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == answerInput.QuestionId);

            if (question == null) continue;

            bool isCorrect = false;
            if (answerInput.SelectedOptionId.HasValue)
            {
                var selectedOption = question.Options.FirstOrDefault(o => o.Id == answerInput.SelectedOptionId.Value);
                isCorrect = selectedOption?.IsCorrect ?? false;

                if (isCorrect)
                    correctAnswers++;
                else
                    wrongAnswers++;
            }
            else
            {
                unansweredQuestions++;
            }

            var quizAnswer = new QuizAnswer
            {
                QuizAttemptId = quizAttemptId,
                QuestionId = answerInput.QuestionId,
                SelectedOptionId = answerInput.SelectedOptionId,
                IsCorrect = isCorrect,
                AnsweredAt = DateTime.UtcNow
            };

            context.QuizAnswers.Add(quizAnswer);
        }

        // Calculate score
        int totalQuestions = answers.Count;
        int score = (int)((double)correctAnswers / totalQuestions * 100);

        // Update quiz attempt
        quizAttempt.CompletedAt = DateTime.UtcNow;
        quizAttempt.Score = score;
        quizAttempt.CorrectAnswers = correctAnswers;
        quizAttempt.WrongAnswers = wrongAnswers;
        quizAttempt.UnansweredQuestions = unansweredQuestions;
        quizAttempt.Status = QuizAttemptStatus.Completed;
        quizAttempt.TimeTaken = quizAttempt.CompletedAt - quizAttempt.StartedAt;

        // Update skill score
        await UpdateSkillScore(quizAttempt.UserId, quizAttempt.Quiz.SubjectId, correctAnswers, totalQuestions, context);

        await context.SaveChangesAsync();

        return new QuizResult
        {
            Success = true,
            Message = "Quiz submitted successfully",
            Score = score,
            CorrectAnswers = correctAnswers,
            WrongAnswers = wrongAnswers,
            UnansweredQuestions = unansweredQuestions
        };
    }

    [GraphQLDescription("Start mock test")]
    public async Task<MockTestResult> StartMockTest(
        int userId,
        string title,
        [Service] PrepWiseDbContext context,
        int timeLimitMinutes = 120)
    {
        // Get 100 questions from all subjects
        var questions = await context.Questions
            .Include(q => q.Options)
            .Where(q => q.IsActive)
            .OrderBy(r => Guid.NewGuid())
            .Take(100)
            .ToListAsync();

        if (questions.Count < 100)
        {
            return new MockTestResult
            {
                Success = false,
                Message = "Not enough questions available for mock test"
            };
        }

        var mockTestAttempt = new MockTestAttempt
        {
            UserId = userId,
            Title = title,
            StartedAt = DateTime.UtcNow,
            TotalQuestions = 100,
            TimeLimitMinutes = timeLimitMinutes,
            Status = MockTestStatus.InProgress
        };

        context.MockTestAttempts.Add(mockTestAttempt);
        await context.SaveChangesAsync();

        return new MockTestResult
        {
            Success = true,
            Message = "Mock test started successfully",
            MockTestAttempt = mockTestAttempt,
            Questions = questions
        };
    }

    [GraphQLDescription("Submit mock test answers")]
    public async Task<MockTestResult> SubmitMockTestAnswers(
        int mockTestAttemptId,
        List<MockTestAnswerInput> answers,
        [Service] PrepWiseDbContext context)
    {
        var mockTestAttempt = await context.MockTestAttempts
            .FirstOrDefaultAsync(mta => mta.Id == mockTestAttemptId);

        if (mockTestAttempt == null)
        {
            return new MockTestResult
            {
                Success = false,
                Message = "Mock test attempt not found"
            };
        }

        int correctAnswers = 0;
        int wrongAnswers = 0;
        int unansweredQuestions = 0;

        foreach (var answerInput in answers)
        {
            var question = await context.Questions
                .Include(q => q.Options)
                .FirstOrDefaultAsync(q => q.Id == answerInput.QuestionId);

            if (question == null) continue;

            bool isCorrect = false;
            if (answerInput.SelectedOptionId.HasValue)
            {
                var selectedOption = question.Options.FirstOrDefault(o => o.Id == answerInput.SelectedOptionId.Value);
                isCorrect = selectedOption?.IsCorrect ?? false;

                if (isCorrect)
                    correctAnswers++;
                else
                    wrongAnswers++;
            }
            else
            {
                unansweredQuestions++;
            }

            var mockTestAnswer = new MockTestAnswer
            {
                MockTestAttemptId = mockTestAttemptId,
                QuestionId = answerInput.QuestionId,
                SelectedOptionId = answerInput.SelectedOptionId,
                IsCorrect = isCorrect,
                AnsweredAt = DateTime.UtcNow
            };

            context.MockTestAnswers.Add(mockTestAnswer);
        }

        // Calculate score
        int totalQuestions = answers.Count;
        int score = (int)((double)correctAnswers / totalQuestions * 100);

        // Update mock test attempt
        mockTestAttempt.CompletedAt = DateTime.UtcNow;
        mockTestAttempt.Score = score;
        mockTestAttempt.CorrectAnswers = correctAnswers;
        mockTestAttempt.WrongAnswers = wrongAnswers;
        mockTestAttempt.UnansweredQuestions = unansweredQuestions;
        mockTestAttempt.Status = MockTestStatus.Completed;
        mockTestAttempt.TimeTaken = mockTestAttempt.CompletedAt - mockTestAttempt.StartedAt;

        await context.SaveChangesAsync();

        return new MockTestResult
        {
            Success = true,
            Message = "Mock test submitted successfully",
            Score = score,
            CorrectAnswers = correctAnswers,
            WrongAnswers = wrongAnswers,
            UnansweredQuestions = unansweredQuestions
        };
    }

    [GraphQLDescription("Test database connection")]
    public async Task<ChatResult> TestDatabaseConnection([Service] PrepWiseDbContext context)
    {
        try
        {
            var canConnect = await context.Database.CanConnectAsync();
            var userCount = await context.Users.CountAsync();
            var chatMessageCount = await context.ChatMessages.CountAsync();

            // If no users exist, create a test user
            if (userCount == 0)
            {
                var testUser = new User
                {
                    Email = "test@prepwise.com",
                    PasswordHash = "test_hash",
                    FirstName = "Test",
                    LastName = "User",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.Add(testUser);
                await context.SaveChangesAsync();

                return new ChatResult
                {
                    Success = true,
                    Message = $"Database connection: {canConnect}, Created test user with ID: {testUser.Id}, ChatMessages: {chatMessageCount}",
                    Response = "Database test completed and test user created"
                };
            }

            return new ChatResult
            {
                Success = true,
                Message = $"Database connection: {canConnect}, Users: {userCount}, ChatMessages: {chatMessageCount}",
                Response = "Database test completed"
            };
        }
        catch (Exception ex)
        {
            return new ChatResult
            {
                Success = false,
                Message = $"Database test failed: {ex.Message}",
                Response = null
            };
        }
    }

    [GraphQLDescription("Send chat message")]
    public async Task<ChatResult> SendChatMessage(
        int userId,
        string message,
        [Service] PrepWiseDbContext context,
        [Service] IAIQuestionService aiService)
    {
        try
        {
            // Validate input
            if (string.IsNullOrWhiteSpace(message))
            {
                return new ChatResult
                {
                    Success = false,
                    Message = "Message cannot be empty",
                    Response = null
                };
            }

            // Validate user exists
            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return new ChatResult
                {
                    Success = false,
                    Message = $"User with ID {userId} not found",
                    Response = null
                };
            }

            if (!user.IsActive)
            {
                return new ChatResult
                {
                    Success = false,
                    Message = "User is inactive",
                    Response = null
                };
            }

            Console.WriteLine($"Found user: {user.FirstName} {user.LastName} (ID: {user.Id})");

            // Test database connection and table existence
            try
            {
                var tableExists = await context.Database.CanConnectAsync();
                Console.WriteLine($"Database connection test: {tableExists}");

                // Try to get count of existing chat messages
                var existingCount = await context.ChatMessages.CountAsync();
                Console.WriteLine($"Existing chat messages count: {existingCount}");
            }
            catch (Exception dbTestEx)
            {
                Console.WriteLine($"Database test error: {dbTestEx.Message}");
                return new ChatResult
                {
                    Success = false,
                    Message = $"Database connection issue: {dbTestEx.Message}",
                    Response = null
                };
            }

            // Get AI response first
            string aiResponse;
            try
            {
                aiResponse = await aiService.GetChatResponseAsync(message, userId);
                if (string.IsNullOrEmpty(aiResponse))
                {
                    aiResponse = "I apologize, but I couldn't generate a response at this time. Please try again.";
                }
            }
            catch (Exception aiEx)
            {
                Console.WriteLine($"AI service error: {aiEx.Message}");
                aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again later.";
            }

            // Create single chat message with both user message and AI response
            var chatMessage = new ChatMessage
            {
                UserId = userId,
                Message = message ?? string.Empty,    // User's message (ensure not null)
                Response = aiResponse,                // AI's response
                Type = ChatMessageType.UserMessage,  // This is a user-initiated conversation
                IsAIGenerated = false,              // The message itself is from user
                CreatedAt = DateTime.UtcNow
            };

            Console.WriteLine($"Created chat message: UserId={chatMessage.UserId}, Message={chatMessage.Message?.Substring(0, Math.Min(50, chatMessage.Message?.Length ?? 0))}...");

            try
            {
                context.ChatMessages.Add(chatMessage);
                Console.WriteLine("Added chat message to context");

                await context.SaveChangesAsync();
                Console.WriteLine("Successfully saved changes to database");
            }
            catch (DbUpdateException dbEx)
            {
                // Log the detailed database error
                Console.WriteLine($"Database error: {dbEx.Message}");
                if (dbEx.InnerException != null)
                {
                    Console.WriteLine($"Inner exception: {dbEx.InnerException.Message}");
                }

                return new ChatResult
                {
                    Success = false,
                    Message = $"Database error: {dbEx.InnerException?.Message ?? dbEx.Message}",
                    Response = null
                };
            }

            return new ChatResult
            {
                Success = true,
                Message = "Message sent successfully",
                Response = aiResponse
            };
        }
        catch (Exception ex)
        {
            // Log the full exception details
            Console.WriteLine($"Chat message error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");

            return new ChatResult
            {
                Success = false,
                Message = $"Error processing message: {ex.Message}",
                Response = null
            };
        }
    }

    private async Task UpdateSkillScore(int userId, int subjectId, int correctAnswers, int totalQuestions, PrepWiseDbContext context)
    {
        var skillScore = await context.SkillScores
            .FirstOrDefaultAsync(ss => ss.UserId == userId && ss.SubjectId == subjectId);

        if (skillScore == null)
        {
            skillScore = new SkillScore
            {
                UserId = userId,
                SubjectId = subjectId,
                Score = 0,
                TotalAttempts = 0,
                CorrectAnswers = 0,
                TotalQuestions = 0,
                AverageDifficulty = QuestionDifficulty.Easy,
                LastUpdated = DateTime.UtcNow
            };
            context.SkillScores.Add(skillScore);
        }

        // Update skill score
        skillScore.TotalAttempts++;
        skillScore.CorrectAnswers += correctAnswers;
        skillScore.TotalQuestions += totalQuestions;
        skillScore.Score = (double)skillScore.CorrectAnswers / skillScore.TotalQuestions * 100;
        skillScore.LastUpdated = DateTime.UtcNow;
    }
}

public class QuizAnswerInput
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
}

public class MockTestAnswerInput
{
    public int QuestionId { get; set; }
    public int? SelectedOptionId { get; set; }
}

public class QuizAttemptResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public QuizAttempt? QuizAttempt { get; set; }
    public List<Question>? Questions { get; set; }
}

public class QuizResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
}

public class MockTestResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public MockTestAttempt? MockTestAttempt { get; set; }
    public List<Question>? Questions { get; set; }
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
}