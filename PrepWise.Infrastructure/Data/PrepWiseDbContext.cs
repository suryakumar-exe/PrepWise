using Microsoft.EntityFrameworkCore;
using PrepWise.Core.Entities;

namespace PrepWise.Infrastructure.Data;

public class PrepWiseDbContext : DbContext
{
    public PrepWiseDbContext(DbContextOptions<PrepWiseDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuestionOption> QuestionOptions { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<QuizQuestion> QuizQuestions { get; set; }
    public DbSet<QuizAttempt> QuizAttempts { get; set; }
    public DbSet<QuizAnswer> QuizAnswers { get; set; }
    public DbSet<SkillScore> SkillScores { get; set; }
    public DbSet<MockTestAttempt> MockTestAttempts { get; set; }
    public DbSet<MockTestAnswer> MockTestAnswers { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
        });

        // Subject configuration
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Category).HasConversion<int>();
        });

        // Question configuration
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionText).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.QuestionTextTamil).HasMaxLength(1000);
            entity.Property(e => e.Difficulty).HasConversion<int>();
            entity.Property(e => e.Language).HasConversion<int>();
            entity.HasOne(e => e.Subject).WithMany(e => e.Questions).HasForeignKey(e => e.SubjectId);
        });

        // QuestionOption configuration
        modelBuilder.Entity<QuestionOption>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OptionText).IsRequired().HasMaxLength(500);
            entity.Property(e => e.OptionTextTamil).HasMaxLength(500);
            entity.HasOne(e => e.Question).WithMany(e => e.Options).HasForeignKey(e => e.QuestionId);
        });

        // Quiz configuration
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Type).HasConversion<int>();
            entity.HasOne(e => e.Subject).WithMany().HasForeignKey(e => e.SubjectId);
        });

        // QuizQuestion configuration
        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Quiz).WithMany(e => e.QuizQuestions).HasForeignKey(e => e.QuizId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Question).WithMany(e => e.QuizQuestions).HasForeignKey(e => e.QuestionId).OnDelete(DeleteBehavior.Restrict);
        });

        // QuizAttempt configuration
        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.HasOne(e => e.User).WithMany(e => e.QuizAttempts).HasForeignKey(e => e.UserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Quiz).WithMany(e => e.QuizAttempts).HasForeignKey(e => e.QuizId).OnDelete(DeleteBehavior.Restrict);
        });

        // QuizAnswer configuration
        modelBuilder.Entity<QuizAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.QuizAttempt).WithMany(e => e.Answers).HasForeignKey(e => e.QuizAttemptId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Question).WithMany().HasForeignKey(e => e.QuestionId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.SelectedOption).WithMany().HasForeignKey(e => e.SelectedOptionId).OnDelete(DeleteBehavior.Restrict);
        });

        // SkillScore configuration
        modelBuilder.Entity<SkillScore>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AverageDifficulty).HasConversion<int>();
            entity.HasOne(e => e.User).WithMany(e => e.SkillScores).HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Subject).WithMany(e => e.SkillScores).HasForeignKey(e => e.SubjectId);
        });

        // MockTestAttempt configuration
        modelBuilder.Entity<MockTestAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.HasOne(e => e.User).WithMany(e => e.MockTestAttempts).HasForeignKey(e => e.UserId);
        });

        // MockTestAnswer configuration
        modelBuilder.Entity<MockTestAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.MockTestAttempt).WithMany(e => e.Answers).HasForeignKey(e => e.MockTestAttemptId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.Question).WithMany().HasForeignKey(e => e.QuestionId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.SelectedOption).WithMany().HasForeignKey(e => e.SelectedOptionId).OnDelete(DeleteBehavior.Restrict);
        });

        // ChatMessage configuration
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Response).HasMaxLength(2000);
            entity.Property(e => e.Type).HasConversion<int>();
            entity.HasOne(e => e.User).WithMany(e => e.ChatMessages).HasForeignKey(e => e.UserId);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed Subjects
        modelBuilder.Entity<Subject>().HasData(
            new Subject { Id = 1, Name = "Tamil Subject Quiz", Description = "Standard 6th to 10th Tamil", Category = SubjectCategory.Tamil },
            new Subject { Id = 2, Name = "Tamil Grammar", Description = "Tamil Grammar, Literature, Comprehension and Vocabulary", Category = SubjectCategory.Tamil },
            new Subject { Id = 3, Name = "Simplification", Description = "Mathematical Simplification", Category = SubjectCategory.Aptitude },
            new Subject { Id = 4, Name = "Percentage", Description = "Percentage Calculations", Category = SubjectCategory.Aptitude },
            new Subject { Id = 5, Name = "HCF and LCM", Description = "Highest Common Factor and Least Common Multiple", Category = SubjectCategory.Aptitude },
            new Subject { Id = 6, Name = "Ratio and Proportion", Description = "Ratio and Proportion Problems", Category = SubjectCategory.Aptitude },
            new Subject { Id = 7, Name = "Area and Volume", Description = "Area and Volume Calculations", Category = SubjectCategory.Aptitude },
            new Subject { Id = 8, Name = "General Science", Description = "Physics, Chemistry, Biology", Category = SubjectCategory.GeneralStudies },
            new Subject { Id = 9, Name = "Current Events", Description = "Current Affairs and Events", Category = SubjectCategory.GeneralStudies },
            new Subject { Id = 10, Name = "Geography", Description = "Indian and World Geography", Category = SubjectCategory.GeneralStudies },
            new Subject { Id = 11, Name = "History and Culture", Description = "Indian History and Culture", Category = SubjectCategory.GeneralStudies },
            new Subject { Id = 12, Name = "Indian Polity", Description = "Indian Constitution and Politics", Category = SubjectCategory.GeneralStudies }
        );
    }
} 