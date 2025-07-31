namespace PrepWise.Core.Entities;

public class QuizAnswer
{
    public int Id { get; set; }
    
    public int QuizAttemptId { get; set; }
    
    public int QuestionId { get; set; }
    
    public int? SelectedOptionId { get; set; }
    
    public bool IsCorrect { get; set; }
    
    public TimeSpan? TimeSpent { get; set; }
    
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual QuizAttempt QuizAttempt { get; set; } = null!;
    public virtual Question Question { get; set; } = null!;
    public virtual QuestionOption? SelectedOption { get; set; }
} 