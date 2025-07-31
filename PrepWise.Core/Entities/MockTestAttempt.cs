using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class MockTestAttempt
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    public string Title { get; set; } = string.Empty;
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public int Score { get; set; }
    
    public int TotalQuestions { get; set; }
    
    public int CorrectAnswers { get; set; }
    
    public int WrongAnswers { get; set; }
    
    public int UnansweredQuestions { get; set; }
    
    public MockTestStatus Status { get; set; }
    
    public TimeSpan? TimeTaken { get; set; }
    
    public int TimeLimitMinutes { get; set; } = 120; // 2 hours default
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<MockTestAnswer> Answers { get; set; } = new List<MockTestAnswer>();
}

public enum MockTestStatus
{
    InProgress = 1,
    Completed = 2,
    Abandoned = 3,
    TimeExpired = 4
} 