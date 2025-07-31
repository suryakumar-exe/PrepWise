using HotChocolate.Types;
using PrepWise.Core.Entities;

namespace PrepWise.API.GraphQL.Types;

public class SubjectType : ObjectType<Subject>
{
    protected override void Configure(IObjectTypeDescriptor<Subject> descriptor)
    {
        descriptor.Field(s => s.Id).Type<NonNullType<IntType>>();
        descriptor.Field(s => s.Name).Type<NonNullType<StringType>>();
        descriptor.Field(s => s.Description).Type<NonNullType<StringType>>();
        descriptor.Field(s => s.Category).Type<NonNullType<EnumType<SubjectCategory>>>();
        descriptor.Field(s => s.IsActive).Type<NonNullType<BooleanType>>();
        descriptor.Field(s => s.CreatedAt).Type<NonNullType<DateTimeType>>();
    }
} 