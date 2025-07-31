using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class QuestionOption
{
    public int Id { get; set; }
    
    [Required]
    public string OptionText { get; set; } = string.Empty;
    
    public string? OptionTextTamil { get; set; }
    
    public bool IsCorrect { get; set; }
    
    public int QuestionId { get; set; }
    
    public int OrderIndex { get; set; }
    
    // Navigation properties
    public virtual Question Question { get; set; } = null!;
} 