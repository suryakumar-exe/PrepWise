using HotChocolate.Types;
using PrepWise.Core.Entities;

namespace PrepWise.API.GraphQL.Types;

public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Id).Type<NonNullType<IntType>>();
        descriptor.Field(u => u.Email).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.FirstName).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.LastName).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.PhoneNumber).Type<StringType>();
        descriptor.Field(u => u.CreatedAt).Type<NonNullType<DateTimeType>>();
        descriptor.Field(u => u.LastLoginAt).Type<DateTimeType>();
        descriptor.Field(u => u.IsActive).Type<NonNullType<BooleanType>>();
        
        // Exclude password hash from GraphQL
        descriptor.Ignore(u => u.PasswordHash);
    }
} 