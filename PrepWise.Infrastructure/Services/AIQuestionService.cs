using Microsoft.Extensions.Configuration;
using PrepWise.Core.Entities;
using PrepWise.Core.Services;
using System.Text.Json;
using System.Net.Http;
using System.Text;

namespace PrepWise.Infrastructure.Services;

public class AIQuestionService : IAIQuestionService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public AIQuestionService(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_configuration["OpenAI:ApiKey"]}");
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

Format the response as JSON array with structure:
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
]";

        try
        {
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are an expert TNPSC Group 4 exam question generator. Generate high-quality, relevant questions." },
                    new { role = "user", content = prompt }
                },
                max_tokens = 2000
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"OpenAI API error: {responseContent}");
                return questions;
            }

            var openAiResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);
            var aiContent = openAiResponse?.choices?.FirstOrDefault()?.message?.content;
            
            // Parse JSON response
            var questionData = JsonSerializer.Deserialize<List<QuestionData>>(aiContent);
            
            if (questionData != null)
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
            // Log error and return empty list
            Console.WriteLine($"Error generating questions: {ex.Message}");
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
            var requestBody = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "system", content = "You are a helpful TNPSC Group 4 exam preparation assistant." },
                    new { role = "user", content = prompt }
                },
                max_tokens = 500
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
            }

            var openAiResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);
            return openAiResponse?.choices?.FirstOrDefault()?.message?.content ?? "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
        catch (Exception ex)
        {
            return "I apologize, but I'm having trouble processing your request right now. Please try again later.";
        }
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

    private class OpenAIResponse
    {
        public List<OpenAIChoice>? choices { get; set; }
    }

    private class OpenAIChoice
    {
        public OpenAIMessage? message { get; set; }
    }

    private class OpenAIMessage
    {
        public string? content { get; set; }
    }
} 