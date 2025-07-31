using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class SkillScore
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    public int SubjectId { get; set; }
    
    public double Score { get; set; }
    
    public int TotalAttempts { get; set; }
    
    public int CorrectAnswers { get; set; }
    
    public int TotalQuestions { get; set; }
    
    public QuestionDifficulty AverageDifficulty { get; set; }
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Subject Subject { get; set; } = null!;
} 