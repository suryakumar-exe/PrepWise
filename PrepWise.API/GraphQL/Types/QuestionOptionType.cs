using HotChocolate.Types;
using PrepWise.Core.Entities;

namespace PrepWise.API.GraphQL.Types;

public class QuestionOptionType : ObjectType<QuestionOption>
{
    protected override void Configure(IObjectTypeDescriptor<QuestionOption> descriptor)
    {
        descriptor.Field(o => o.Id).Type<NonNullType<IntType>>();
        descriptor.Field(o => o.OptionText).Type<NonNullType<StringType>>();
        descriptor.Field(o => o.OptionTextTamil).Type<StringType>();
        descriptor.Field(o => o.IsCorrect).Type<NonNullType<BooleanType>>();
        descriptor.Field(o => o.QuestionId).Type<NonNullType<IntType>>();
        descriptor.Field(o => o.OrderIndex).Type<NonNullType<IntType>>();
    }
} 