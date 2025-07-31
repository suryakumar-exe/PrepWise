using PrepWise.Core.Entities;

namespace PrepWise.API.GraphQL.Types;

public class ChatResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Response { get; set; }
}

public class QuizAttemptResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public QuizAttempt? QuizAttempt { get; set; }
}

public class QuizResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
    public TimeSpan? TimeTaken { get; set; }
}

public class MockTestResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int Score { get; set; }
    public int CorrectAnswers { get; set; }
    public int WrongAnswers { get; set; }
    public int UnansweredQuestions { get; set; }
}

public class AuthResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Token { get; set; }
    public User? User { get; set; }
} 