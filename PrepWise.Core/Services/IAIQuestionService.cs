using PrepWise.Core.Entities;

namespace PrepWise.Core.Services;

public interface IAIQuestionService
{
    Task<List<Question>> GenerateQuestionsAsync(int subjectId, int questionCount, QuestionDifficulty difficulty, QuestionLanguage language);
    Task<string> GetChatResponseAsync(string userMessage, int userId);
}

public interface IAIProvider
{
    string Name { get; }
    Task<string> GenerateTextAsync(string prompt, int maxTokens = 2000);
    bool IsAvailable { get; }
}

public class AIProviderConfig
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int MaxTokens { get; set; } = 2000;
    public int RateLimitPerMinute { get; set; } = 60;
} 