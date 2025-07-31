using Microsoft.Extensions.Configuration;
using PrepWise.Core.Entities;
using PrepWise.Core.Services;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace PrepWise.Infrastructure.Services;

public class AIQuestionService : IAIQuestionService
{
    private readonly IEnumerable<IAIProvider> _providers;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AIQuestionService> _logger;
    private readonly string _primaryProvider;
    private readonly List<string> _fallbackProviders;

    public AIQuestionService(
        IEnumerable<IAIProvider> providers, 
        IConfiguration configuration,
        ILogger<AIQuestionService> logger)
    {
        _providers = providers;
        _configuration = configuration;
        _logger = logger;
        _primaryProvider = configuration["AIProviders:Primary"] ?? "Gemini";
        _fallbackProviders = configuration.GetSection("AIProviders:Fallback").Get<List<string>>() ?? new List<string>();
    }

    public async Task<List<Question>> GenerateQuestionsAsync(int subjectId, int questionCount, QuestionDifficulty difficulty, QuestionLanguage language)
    {
        var questions = new List<Question>();
        
        // Get subject details for prompt
        var subjectPrompt = GetSubjectPrompt(subjectId);
        var difficultyText = difficulty.ToString();
        var languageText = language == QuestionLanguage.Both ? "both English and Tamil" : language.ToString();

        var prompt = $@"Generate {questionCount} multiple choice questions for TNPSC Group 4 exam preparation.
Subject: {subjectPrompt}
Difficulty: {difficultyText}
Language: {languageText}

For each question, provide:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer (A, B, C, or D)
4. If language is both, provide Tamil translation

IMPORTANT: Return ONLY a valid JSON array with NO additional text, markdown, or code blocks.

Format the response as JSON array with this EXACT structure:
[
  {{
    ""questionText"": ""Question in English"",
    ""questionTextTamil"": ""Question in Tamil (if applicable)"",
    ""options"": [
      {{ ""text"": ""Option A"", ""textTamil"": ""Option A in Tamil"", ""isCorrect"": false }},
      {{ ""text"": ""Option B"", ""textTamil"": ""Option B in Tamil"", ""isCorrect"": true }},
      {{ ""text"": ""Option C"", ""textTamil"": ""Option C in Tamil"", ""isCorrect"": false }},
      {{ ""text"": ""Option D"", ""textTamil"": ""Option D in Tamil"", ""isCorrect"": false }}
    ]
  }}
]

Return ONLY the JSON array, no explanations or formatting.";

        try
        {
            var aiContent = await GenerateTextWithFallbackAsync(prompt, 2000);
            
            // Parse JSON response with robust handling
            var questionData = ParseQuestionDataFromAIResponse(aiContent);
            
            if (questionData != null && questionData.Any())
            {
                foreach (var qData in questionData)
                {
                    var question = new Question
                    {
                        QuestionText = qData.QuestionText,
                        QuestionTextTamil = qData.QuestionTextTamil,
                        Difficulty = difficulty,
                        Language = language,
                        SubjectId = subjectId,
                        IsAIGenerated = true,
                        Options = qData.Options.Select((opt, index) => new QuestionOption
                        {
                            OptionText = opt.Text,
                            OptionTextTamil = opt.TextTamil,
                            IsCorrect = opt.IsCorrect,
                            OrderIndex = index
                        }).ToList()
                    };
                    
                    questions.Add(question);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating questions with all providers");
        }

        return questions;
    }

    public async Task<string> GetChatResponseAsync(string userMessage, int userId)
    {
        var prompt = $@"You are an AI assistant for TNPSC Group 4 exam preparation. 
Provide helpful, accurate, and encouraging responses to help students prepare for the exam.
User message: {userMessage}

Respond in a helpful and educational manner.";

        try
        {
            return await GenerateTextWithFallbackAsync(prompt, 500);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting chat response with all providers");
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
    }

    private async Task<string> GenerateTextWithFallbackAsync(string prompt, int maxTokens)
    {
        // Try primary provider first
        var primaryProvider = _providers.FirstOrDefault(p => p.Name == _primaryProvider && p.IsAvailable);
        if (primaryProvider != null)
        {
            try
            {
                _logger.LogInformation($"Trying primary provider: {primaryProvider.Name}");
                return await primaryProvider.GenerateTextAsync(prompt, maxTokens);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Primary provider {primaryProvider.Name} failed, trying fallbacks");
            }
        }

        // Try fallback providers
        foreach (var fallbackName in _fallbackProviders)
        {
            var fallbackProvider = _providers.FirstOrDefault(p => p.Name == fallbackName && p.IsAvailable);
            if (fallbackProvider != null)
            {
                try
                {
                    _logger.LogInformation($"Trying fallback provider: {fallbackProvider.Name}");
                    return await fallbackProvider.GenerateTextAsync(prompt, maxTokens);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Fallback provider {fallbackProvider.Name} failed");
                }
            }
        }

        // If all providers failed, try any available provider
        foreach (var provider in _providers.Where(p => p.IsAvailable))
        {
            try
            {
                _logger.LogInformation($"Trying any available provider: {provider.Name}");
                return await provider.GenerateTextAsync(prompt, maxTokens);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, $"Provider {provider.Name} failed");
            }
        }

        throw new InvalidOperationException("All AI providers failed or are unavailable");
    }

    private string GetSubjectPrompt(int subjectId)
    {
        return subjectId switch
        {
            1 => "Tamil Subject Quiz (Standard 6th to 10th)",
            2 => "Tamil Grammar, Literature, Comprehension and Vocabulary",
            3 => "Mathematical Simplification",
            4 => "Percentage Calculations",
            5 => "HCF and LCM (Highest Common Factor and Least Common Multiple)",
            6 => "Ratio and Proportion",
            7 => "Area and Volume Calculations",
            8 => "General Science (Physics, Chemistry, Biology)",
            9 => "Current Events and Affairs",
            10 => "Geography (Indian and World)",
            11 => "History and Culture (Indian)",
            12 => "Indian Polity and Constitution",
            _ => "General Knowledge"
        };
    }

    private List<QuestionData>? ParseQuestionDataFromAIResponse(string aiResponse)
    {
        try
        {
            _logger.LogInformation($"Raw AI Response length: {aiResponse?.Length}");
            _logger.LogDebug($"Raw AI Response: {aiResponse}");

            if (string.IsNullOrWhiteSpace(aiResponse))
            {
                _logger.LogWarning("AI response is null or empty");
                return null;
            }

            // Strategy 1: Try to extract JSON from markdown code blocks
            var jsonContent = ExtractJsonFromMarkdown(aiResponse);
            
            // Strategy 2: If no markdown, try to find JSON array in the response
            if (string.IsNullOrEmpty(jsonContent))
            {
                jsonContent = ExtractJsonArray(aiResponse);
            }

            // Strategy 3: Use the original response if nothing else worked
            if (string.IsNullOrEmpty(jsonContent))
            {
                jsonContent = aiResponse.Trim();
            }

            _logger.LogDebug($"Extracted JSON content: {jsonContent}");

            // Try to deserialize with different options
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true,
                ReadCommentHandling = JsonCommentHandling.Skip
            };

            var questionData = JsonSerializer.Deserialize<List<QuestionData>>(jsonContent, options);
            
            if (questionData == null || !questionData.Any())
            {
                _logger.LogWarning("Deserialized question data is null or empty");
                return null;
            }

            _logger.LogInformation($"Successfully parsed {questionData.Count} questions from AI response");
            return questionData;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, $"JSON parsing failed. Response content: {aiResponse}");
            
            // Try fallback parsing strategies
            return TryFallbackParsing(aiResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error parsing AI response");
            return null;
        }
    }

    private string ExtractJsonFromMarkdown(string content)
    {
        // Look for JSON in markdown code blocks
        var patterns = new[]
        {
            @"```json\s*([\s\S]*?)\s*```",  // ```json ... ```
            @"```\s*([\s\S]*?)\s*```",      // ``` ... ```
            @"`([^`]*)`"                     // single backticks
        };

        foreach (var pattern in patterns)
        {
            var match = System.Text.RegularExpressions.Regex.Match(content, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (match.Success)
            {
                var extracted = match.Groups[1].Value.Trim();
                if (IsLikelyJson(extracted))
                {
                    return extracted;
                }
            }
        }

        return string.Empty;
    }

    private string ExtractJsonArray(string content)
    {
        // Find the first '[' and last ']' to extract JSON array
        var startIndex = content.IndexOf('[');
        var lastIndex = content.LastIndexOf(']');

        if (startIndex >= 0 && lastIndex > startIndex)
        {
            return content.Substring(startIndex, lastIndex - startIndex + 1).Trim();
        }

        return string.Empty;
    }

    private bool IsLikelyJson(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return false;

        content = content.Trim();
        return (content.StartsWith("[") && content.EndsWith("]")) ||
               (content.StartsWith("{") && content.EndsWith("}"));
    }

    private List<QuestionData>? TryFallbackParsing(string aiResponse)
    {
        try
        {
            _logger.LogInformation("Attempting fallback parsing strategies");

            // Fallback 1: Try to clean up common issues
            var cleaned = aiResponse
                .Replace("'", "\"")  // Replace single quotes with double quotes
                .Replace("True", "true")
                .Replace("False", "false")
                .Trim();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                AllowTrailingCommas = true
            };

            return JsonSerializer.Deserialize<List<QuestionData>>(cleaned, options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "All fallback parsing strategies failed");
            
            // Return empty list instead of null to prevent crashes
            return new List<QuestionData>();
        }
    }

    private class QuestionData
    {
        public string QuestionText { get; set; } = string.Empty;
        public string? QuestionTextTamil { get; set; }
        public List<OptionData> Options { get; set; } = new();
    }

    private class OptionData
    {
        public string Text { get; set; } = string.Empty;
        public string? TextTamil { get; set; }
        public bool IsCorrect { get; set; }
    }
} 