using HotChocolate.Types;
using PrepWise.Core.Entities;

namespace PrepWise.API.GraphQL.Types;

public class QuestionType : ObjectType<Question>
{
    protected override void Configure(IObjectTypeDescriptor<Question> descriptor)
    {
        descriptor.Field(q => q.Id).Type<NonNullType<IntType>>();
        descriptor.Field(q => q.QuestionText).Type<NonNullType<StringType>>();
        descriptor.Field(q => q.QuestionTextTamil).Type<StringType>();
        descriptor.Field(q => q.Difficulty).Type<NonNullType<EnumType<QuestionDifficulty>>>();
        descriptor.Field(q => q.Language).Type<NonNullType<EnumType<QuestionLanguage>>>();
        descriptor.Field(q => q.SubjectId).Type<NonNullType<IntType>>();
        descriptor.Field(q => q.CreatedAt).Type<NonNullType<DateTimeType>>();
        descriptor.Field(q => q.IsActive).Type<NonNullType<BooleanType>>();
        descriptor.Field(q => q.IsAIGenerated).Type<NonNullType<BooleanType>>();
        
        descriptor.Field(q => q.Subject).ResolveWith<QuestionResolvers>(r => r.GetSubject(default!, default!));
        descriptor.Field(q => q.Options).ResolveWith<QuestionResolvers>(r => r.GetOptions(default!, default!));
    }
}

public class QuestionResolvers
{
    public Subject GetSubject(Question question, [Service] PrepWise.Infrastructure.Data.PrepWiseDbContext context)
    {
        return context.Subjects.First(s => s.Id == question.SubjectId);
    }

    public IQueryable<QuestionOption> GetOptions(Question question, [Service] PrepWise.Infrastructure.Data.PrepWiseDbContext context)
    {
        return context.QuestionOptions.Where(o => o.QuestionId == question.Id).OrderBy(o => o.OrderIndex);
    }
} 