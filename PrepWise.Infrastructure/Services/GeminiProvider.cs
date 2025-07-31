using PrepWise.Core.Services;
using System.Text.Json;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace PrepWise.Infrastructure.Services;

public class GeminiProvider : IAIProvider
{
    private readonly HttpClient _httpClient;
    private readonly AIProviderConfig _config;
    private readonly ILogger<GeminiProvider> _logger;

    public string Name => "Gemini";

    public bool IsAvailable => !string.IsNullOrEmpty(_config.ApiKey);

    public GeminiProvider(IConfiguration configuration, ILogger<GeminiProvider> logger)
    {
        _logger = logger;
        _config = new AIProviderConfig();
        configuration.GetSection("AIProviders:Gemini").Bind(_config);
        
        _httpClient = new HttpClient();
    }

    public async Task<string> GenerateTextAsync(string prompt, int maxTokens = 2000)
    {
        if (!IsAvailable)
        {
            throw new InvalidOperationException("Gemini provider is not available - API key not configured");
        }

        try
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                generationConfig = new
                {
                    maxOutputTokens = Math.Min(maxTokens, _config.MaxTokens),
                    temperature = 0.7
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"{_config.BaseUrl}/models/{_config.Model}:generateContent?key={_config.ApiKey}";
            var response = await _httpClient.PostAsync(url, content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"Gemini API error: {response.StatusCode} - {responseContent}");
                throw new HttpRequestException($"Gemini API error: {response.StatusCode}");
            }

            var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseContent);
            return geminiResponse?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text ?? 
                   throw new InvalidOperationException("Invalid response from Gemini");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Gemini API");
            throw;
        }
    }

    private class GeminiResponse
    {
        public List<GeminiCandidate>? candidates { get; set; }
    }

    private class GeminiCandidate
    {
        public GeminiContent? content { get; set; }
    }

    private class GeminiContent
    {
        public List<GeminiPart>? parts { get; set; }
    }

    private class GeminiPart
    {
        public string? text { get; set; }
    }
} 