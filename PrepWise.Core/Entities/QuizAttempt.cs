using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class QuizAttempt
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    public int QuizId { get; set; }
    
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? CompletedAt { get; set; }
    
    public int Score { get; set; }
    
    public int TotalQuestions { get; set; }
    
    public int CorrectAnswers { get; set; }
    
    public int WrongAnswers { get; set; }
    
    public int UnansweredQuestions { get; set; }
    
    public QuizAttemptStatus Status { get; set; }
    
    public TimeSpan? TimeTaken { get; set; }
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Quiz Quiz { get; set; } = null!;
    public virtual ICollection<QuizAnswer> Answers { get; set; } = new List<QuizAnswer>();
}

public enum QuizAttemptStatus
{
    InProgress = 1,
    Completed = 2,
    Abandoned = 3,
    TimeExpired = 4
} 