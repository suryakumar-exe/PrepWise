using PrepWise.Core.Entities;

namespace PrepWise.Core.Services;

public interface IAIQuestionService
{
    Task<List<Question>> GenerateQuestionsAsync(int subjectId, int questionCount, QuestionDifficulty difficulty, QuestionLanguage language);
    Task<string> GetChatResponseAsync(string userMessage, int userId);
} 