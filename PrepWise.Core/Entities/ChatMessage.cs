using System.ComponentModel.DataAnnotations;

namespace PrepWise.Core.Entities;

public class ChatMessage
{
    public int Id { get; set; }
    
    public int UserId { get; set; }
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    public string? Response { get; set; }
    
    public ChatMessageType Type { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsAIGenerated { get; set; } = false;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
}

public enum ChatMessageType
{
    UserMessage = 1,
    AIResponse = 2,
    SystemMessage = 3
} 