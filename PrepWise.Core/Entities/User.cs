using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    
    [Required]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    public string LastName { get; set; } = string.Empty;
    
    public string? PhoneNumber { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastLoginAt { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<SkillScore> SkillScores { get; set; } = new List<SkillScore>();
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();
    public virtual ICollection<MockTestAttempt> MockTestAttempts { get; set; } = new List<MockTestAttempt>();
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
} 