using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class Question
{
    public int Id { get; set; }
    
    [Required]
    public string QuestionText { get; set; } = string.Empty;
    
    public string? QuestionTextTamil { get; set; }
    
    public QuestionDifficulty Difficulty { get; set; }
    
    public QuestionLanguage Language { get; set; }
    
    public int SubjectId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    public bool IsAIGenerated { get; set; } = false;
    
    // Navigation properties
    public virtual Subject Subject { get; set; } = null!;
    public virtual ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
    public virtual ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
}

public enum QuestionDifficulty
{
    Easy = 1,
    Medium = 2,
    Hard = 3
}

public enum QuestionLanguage
{
    English = 1,
    Tamil = 2,
    Both = 3
} 