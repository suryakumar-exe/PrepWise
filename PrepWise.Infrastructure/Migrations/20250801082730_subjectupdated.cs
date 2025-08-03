using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PrepWise.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class subjectupdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Name" },
                values: new object[] { new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2276), "Tamil 6 Subject Quiz" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Description", "Name" },
                values: new object[] { new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2892), "Standard 6th to 10th Tamil", "Tamil 7 Subject Quiz" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 1, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2894), "Standard 6th to 10th Tamil", "Tamil 8 Subject Quiz" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 1, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2895), "Standard 6th to 10th Tamil", "Tamil 9 Subject Quiz" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 1, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2896), "Standard 6th to 10th Tamil", "Tamil 10 Subject Quiz" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 3, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2897), "Indian Constitution and Politics", "Indian Polity" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 1, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2898), "Tamil Grammar, Literature, Comprehension and Vocabulary", "Tamil Grammar" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2899), "Mathematical Simplification", "Simplification" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2900), "Percentage Calculations", "Percentage" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2901), "Highest Common Factor and Least Common Multiple", "HCF and LCM" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2901), "Ratio and Proportion Problems", "Ratio and Proportion" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2902), "Area and Volume Calculations", "Area and Volume" });

            migrationBuilder.InsertData(
                table: "Subjects",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "IsActive", "Name" },
                values: new object[,]
                {
                    { 13, 3, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2903), "Physics, Chemistry, Biology", true, "General Science" },
                    { 14, 3, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2904), "Current Affairs and Events", true, "Current Events" },
                    { 15, 3, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2905), "Indian and World Geography", true, "Geography" },
                    { 16, 3, new DateTime(2025, 8, 1, 8, 27, 29, 649, DateTimeKind.Utc).AddTicks(2906), "Indian History and Culture", true, "History and Culture" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "Name" },
                values: new object[] { new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(4917), "Tamil Subject Quiz" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "Description", "Name" },
                values: new object[] { new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5518), "Tamil Grammar, Literature, Comprehension and Vocabulary", "Tamil Grammar" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5520), "Mathematical Simplification", "Simplification" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5521), "Percentage Calculations", "Percentage" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 5,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5522), "Highest Common Factor and Least Common Multiple", "HCF and LCM" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5523), "Ratio and Proportion Problems", "Ratio and Proportion" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 2, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5524), "Area and Volume Calculations", "Area and Volume" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 3, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5525), "Physics, Chemistry, Biology", "General Science" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 3, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5526), "Current Affairs and Events", "Current Events" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 3, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5526), "Indian and World Geography", "Geography" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 3, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5527), "Indian History and Culture", "History and Culture" });

            migrationBuilder.UpdateData(
                table: "Subjects",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Category", "CreatedAt", "Description", "Name" },
                values: new object[] { 3, new DateTime(2025, 7, 31, 2, 2, 58, 219, DateTimeKind.Utc).AddTicks(5528), "Indian Constitution and Politics", "Indian Polity" });
        }
    }
}
