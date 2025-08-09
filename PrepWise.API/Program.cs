using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PrepWise.API.GraphQL.Mutations;
using PrepWise.API.GraphQL.Queries;
using PrepWise.Core.Services;
using PrepWise.Infrastructure.Data;
using PrepWise.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 🔹 Secure configuration loading
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddUserSecrets<Program>(optional: true) // Only loads in Development
    .AddEnvironmentVariables();

// Optional: Access keys if needed directly
var jwtKey = builder.Configuration["Jwt:Key"];
var openAiKey = builder.Configuration["AIProviders:OpenAI:ApiKey"];

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<PrepWiseDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("PrepWise.Infrastructure")
    );

    options.ConfigureWarnings(w =>
        w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

// GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType<QuizQueries>()
    .AddMutationType<Mutation>()
    .AddType<QuizMutations>()
    .AddType<AuthMutations>()
    .AddType<PrepWise.API.GraphQL.Types.UserType>()
    .AddType<PrepWise.API.GraphQL.Types.SubjectType>()
    .AddType<PrepWise.API.GraphQL.Types.QuestionType>()
    .AddType<PrepWise.API.GraphQL.Types.QuestionOptionType>()
    .AddFiltering()
    .AddSorting()
    .AddProjections();

// JWT Authentication
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtKey ?? "fallback-key"))
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// AI Providers
builder.Services.AddScoped<IAIProvider, OpenAIProvider>();
builder.Services.AddScoped<IAIProvider, GeminiProvider>();
builder.Services.AddScoped<IAIProvider, GroqProvider>();

// App Services
builder.Services.AddScoped<IAIQuestionService, AIQuestionService>();
builder.Services.AddScoped<IJwtService, JwtService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGraphQL();

// Database initialization
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PrepWiseDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
