using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PrepWise.API.GraphQL.Mutations;
using PrepWise.API.GraphQL.Queries;
using PrepWise.Core.Services;
using PrepWise.Infrastructure.Data;
using PrepWise.Infrastructure.Services;
using System;
using System.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework
//builder.Services.AddDbContext<PrepWiseDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddDbContext<PrepWiseDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("PrepWise.Infrastructure") 
    )
);

// Add GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType<QuizQueries>()
    .AddMutationType<Mutation>()         // base mutation class
    .AddType<QuizMutations>()            // extension for Quiz
    .AddType<AuthMutations>()
    .AddType<PrepWise.API.GraphQL.Types.UserType>()
    .AddType<PrepWise.API.GraphQL.Types.SubjectType>()
    .AddType<PrepWise.API.GraphQL.Types.QuestionType>()
    .AddType<PrepWise.API.GraphQL.Types.QuestionOptionType>()
    .AddFiltering()
    .AddSorting()
    .AddProjections();

// Add JWT Authentication
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
                System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "9f84a12c8f83b467a19f2a3fbb09172a7e7cfda4ae2c4fcaa84ad91d7e1a7c6f"))
        };
    });

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register services
builder.Services.AddScoped<IAIQuestionService, AIQuestionService>();
builder.Services.AddScoped<IJwtService, JwtService>();

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map GraphQL endpoint
app.MapGraphQL();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PrepWiseDbContext>();
    
    // Drop and recreate database to handle schema changes
    //context.Database.EnsureDeleted();
    //context.Database.Migrate(); // Apply migrations if any
    context.Database.EnsureCreated();
}

app.Run();
