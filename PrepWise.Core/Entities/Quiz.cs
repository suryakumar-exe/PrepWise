using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class Quiz
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    public int SubjectId { get; set; }
    
    public int QuestionCount { get; set; }
    
    public int TimeLimitMinutes { get; set; }
    
    public QuizType Type { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Subject Subject { get; set; } = null!;
    public virtual ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
}

public enum QuizType
{
    Practice = 1,
    MockTest = 2,
    WeeklyTest = 3
} 