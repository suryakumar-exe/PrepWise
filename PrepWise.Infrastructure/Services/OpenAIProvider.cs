using PrepWise.Core.Services;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PrepWise.Infrastructure.Services;

public class OpenAIProvider : IAIProvider
{
    private readonly HttpClient _httpClient;
    private readonly AIProviderConfig _config;
    private readonly ILogger<OpenAIProvider> _logger;
    private DateTime _lastRequestTime = DateTime.MinValue;
    private readonly SemaphoreSlim _rateLimitSemaphore = new(1, 1);

    public string Name => "OpenAI";

    public bool IsAvailable => !string.IsNullOrEmpty(_config.ApiKey);

    public OpenAIProvider(IConfiguration configuration, ILogger<OpenAIProvider> logger)
    {
        _logger = logger;
        _config = new AIProviderConfig();
        configuration.GetSection("AIProviders:OpenAI").Bind(_config);
        
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
            throw new InvalidOperationException("OpenAI provider is not available - API key not configured");
        }

        await _rateLimitSemaphore.WaitAsync();
        try
        {
            // Rate limiting
            var timeSinceLastRequest = DateTime.UtcNow - _lastRequestTime;
            var minInterval = TimeSpan.FromMinutes(1.0 / _config.RateLimitPerMinute);
            
            if (timeSinceLastRequest < minInterval)
            {
                var delay = minInterval - timeSinceLastRequest;
                _logger.LogInformation($"Rate limiting: waiting {delay.TotalSeconds:F1} seconds");
                await Task.Delay(delay);
            }

            _lastRequestTime = DateTime.UtcNow;

            var requestBody = new
            {
                model = _config.Model,
                messages = new[]
                {
                    new { role = "system", content = "You are an expert TNPSC Group 4 exam question generator. Generate high-quality, relevant questions." },
                    new { role = "user", content = prompt }
                },
                max_tokens = Math.Min(maxTokens, _config.MaxTokens)
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_config.BaseUrl}/chat/completions", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"OpenAI API error: {response.StatusCode} - {responseContent}");
                throw new HttpRequestException($"OpenAI API error: {response.StatusCode}");
            }

            var openAiResponse = JsonSerializer.Deserialize<OpenAIResponse>(responseContent);
            return openAiResponse?.choices?.FirstOrDefault()?.message?.content ?? 
                   throw new InvalidOperationException("Invalid response from OpenAI");
        }
        finally
        {
            _rateLimitSemaphore.Release();
        }
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