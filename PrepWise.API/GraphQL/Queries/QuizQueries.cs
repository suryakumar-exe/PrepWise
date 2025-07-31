using HotChocolate;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using PrepWise.Core.Entities;
using PrepWise.Core.Services;
using PrepWise.Infrastructure.Data;

namespace PrepWise.API.GraphQL.Queries;

public class QuizQueries
{
    [GraphQLDescription("Get all subjects")]
    public async Task<IQueryable<Subject>> GetSubjects([Service] PrepWiseDbContext context)
    {
        return context.Subjects.Where(s => s.IsActive);
    }

    [GraphQLDescription("Get subject by ID")]
    public async Task<Subject?> GetSubject(int id, [Service] PrepWiseDbContext context)
    {
        return await context.Subjects.FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
    }

    [GraphQLDescription("Get questions by subject")]
    public async Task<IQueryable<Question>> GetQuestionsBySubject(
        int subjectId, 
        [Service] PrepWiseDbContext context,
        QuestionDifficulty? difficulty = null,
        QuestionLanguage? language = null)
    {
        var query = context.Questions
            .Include(q => q.Options)
            .Where(q => q.SubjectId == subjectId && q.IsActive);

        if (difficulty.HasValue)
            query = query.Where(q => q.Difficulty == difficulty.Value);

        if (language.HasValue)
            query = query.Where(q => q.Language == language.Value);

        return query;
    }

    [GraphQLDescription("Generate AI questions")]
    public async Task<List<Question>> GenerateAIQuestions(
        int subjectId,
        int questionCount,
        QuestionDifficulty difficulty,
        QuestionLanguage language,
        [Service] IAIQuestionService aiService,
        [Service] PrepWiseDbContext context)
    {
        var questions = await aiService.GenerateQuestionsAsync(subjectId, questionCount, difficulty, language);
        
        // Save generated questions to database
        foreach (var question in questions)
        {
            context.Questions.Add(question);
        }
        await context.SaveChangesAsync();

        // Reload questions from database with options included for GraphQL resolution
        var questionIds = questions.Select(q => q.Id).ToList();
        var savedQuestions = await context.Questions
            .Include(q => q.Options.OrderBy(o => o.OrderIndex))
            .Include(q => q.Subject)
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync();

        return savedQuestions;
    }

    [GraphQLDescription("Get user skill scores")]
    public async Task<IQueryable<SkillScore>> GetUserSkillScores(
        int userId,
        [Service] PrepWiseDbContext context)
    {
        return context.SkillScores
            .Include(s => s.Subject)
            .Where(s => s.UserId == userId)
            .AsQueryable();
    }

    [GraphQLDescription("Get quiz attempts by user")]
    public async Task<IQueryable<QuizAttempt>> GetUserQuizAttempts(
        int userId,
        [Service] PrepWiseDbContext context)
    {
        return context.QuizAttempts
            .Include(qa => qa.Quiz)
            .ThenInclude(q => q.Subject)
            .Where(qa => qa.UserId == userId)
            .OrderByDescending(qa => qa.StartedAt)
            .AsQueryable();
    }

    [GraphQLDescription("Get mock test attempts by user")]
    public async Task<IQueryable<MockTestAttempt>> GetUserMockTestAttempts(
        int userId,
        [Service] PrepWiseDbContext context)
    {
        return context.MockTestAttempts
            .Where(mta => mta.UserId == userId)
            .OrderByDescending(mta => mta.StartedAt)
            .AsQueryable();
    }

    [GraphQLDescription("Get global leaderboard")]
    public async Task<IQueryable<SkillScore>> GetLeaderboard(
        [Service] PrepWiseDbContext context,
        int? subjectId = null)
    {
        IQueryable<SkillScore> query = context.SkillScores
            .Include(s => s.User)
            .Include(s => s.Subject);

        if (subjectId.HasValue)
            query = query.Where(s => s.SubjectId == subjectId.Value);

        return query
            .OrderByDescending(s => s.Score)
            .Take(100)
            .AsQueryable(); // Top 100
    }

    [GraphQLDescription("Get chat messages by user")]
    public async Task<IQueryable<ChatMessage>> GetUserChatMessages(
        int userId,
        [Service] PrepWiseDbContext context)
    {
        return context.ChatMessages
            .Where(cm => cm.UserId == userId)
            .OrderByDescending(cm => cm.CreatedAt)
            .Take(50)
            .AsQueryable(); // Last 50 messages
    }
} 