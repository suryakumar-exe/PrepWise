using HotChocolate.Types;
using PrepWise.Core.Entities;
using PrepWise.Infrastructure.Data;

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
        
        // Use automatic navigation properties - HotChocolate will handle these automatically
        descriptor.Field(q => q.Subject);
        descriptor.Field(q => q.Options);
    }
} 