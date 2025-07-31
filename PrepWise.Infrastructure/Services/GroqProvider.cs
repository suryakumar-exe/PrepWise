using PrepWise.Core.Services;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PrepWise.Infrastructure.Services;

public class GroqProvider : IAIProvider
{
    private readonly HttpClient _httpClient;
    private readonly AIProviderConfig _config;
    private readonly ILogger<GroqProvider> _logger;

    public string Name => "Groq";

    public bool IsAvailable => !string.IsNullOrEmpty(_config.ApiKey);

    public GroqProvider(IConfiguration configuration, ILogger<GroqProvider> logger)
    {
        _logger = logger;
        _config = new AIProviderConfig();
        configuration.GetSection("AIProviders:Groq").Bind(_config);
        
        _httpClient = new HttpClient();
        if (IsAvailable)
        {
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config.ApiKey}");
        }
    }

    public async Task<string> GenerateTextAsync(string prompt, int maxTokens = 2000)
    {
        if (!IsAvailable)
        {
            throw new InvalidOperationException("Groq provider is not available - API key not configured");
        }

        try
        {
            var requestBody = new
            {
                model = _config.Model,
                messages = new[]
                {
                    new { role = "system", content = "You are an expert TNPSC Group 4 exam question generator. Generate high-quality, relevant questions." },
                    new { role = "user", content = prompt }
                },
                max_tokens = Math.Min(maxTokens, _config.MaxTokens),
                temperature = 0.7,
                stream = false
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_config.BaseUrl}/chat/completions", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Groq API error: {response.StatusCode} - {responseContent}");
                throw new HttpRequestException($"Groq API error: {response.StatusCode}");
            }

            var groqResponse = JsonSerializer.Deserialize<GroqResponse>(responseContent);
            return groqResponse?.choices?.FirstOrDefault()?.message?.content ?? 
                   throw new InvalidOperationException("Invalid response from Groq");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Groq API");
            throw;
        }
    }

    private class GroqResponse
    {
        public List<GroqChoice>? choices { get; set; }
    }

    private class GroqChoice
    {
        public GroqMessage? message { get; set; }
    }

    private class GroqMessage
    {
        public string? content { get; set; }
    }
} 