using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class Subject
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    public SubjectCategory Category { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    public virtual ICollection<SkillScore> SkillScores { get; set; } = new List<SkillScore>();
}

public enum SubjectCategory
{
    Tamil = 1,
    Aptitude = 2,
    GeneralStudies = 3
} 