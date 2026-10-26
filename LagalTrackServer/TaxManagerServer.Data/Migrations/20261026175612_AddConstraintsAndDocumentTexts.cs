using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxManagerServer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddConstraintsAndDocumentTexts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SchemaUpgrader may already have made these changes at startup, so each step only runs when needed.
            // MySQL has no "IF NOT EXISTS" for indexes and foreign keys, hence the temporary procedure.
            RunIf(migrationBuilder, SchemaUpgrader.UniqueUserEmail);
            foreach (var step in SchemaUpgrader.ForeignKeys)
                RunIf(migrationBuilder, step);
            migrationBuilder.Sql(SchemaUpgrader.CreateDocumentTextsSql);
        }

        private static void RunIf(MigrationBuilder migrationBuilder, SchemaUpgrader.ConditionalStep step)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `__RunIf`;");
            migrationBuilder.Sql($@"
CREATE PROCEDURE `__RunIf`()
BEGIN
    IF {step.Condition} THEN
        {string.Join(";\n        ", step.Statements)};
    END IF;
END;");
            migrationBuilder.Sql("CALL `__RunIf`();");
            migrationBuilder.Sql("DROP PROCEDURE `__RunIf`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ChatMessages_Folders_FolderId",
                table: "ChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_Clients_Groups_GroupId",
                table: "Clients");

            migrationBuilder.DropForeignKey(
                name: "FK_Invites_Groups_GroupId",
                table: "Invites");

            migrationBuilder.DropForeignKey(
                name: "FK_PasswordResets_Users_UserId",
                table: "PasswordResets");

            migrationBuilder.DropTable(
                name: "DocumentTexts");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_PasswordResets_UserId",
                table: "PasswordResets");

            migrationBuilder.DropIndex(
                name: "IX_Invites_GroupId",
                table: "Invites");

            migrationBuilder.DropIndex(
                name: "IX_Clients_GroupId",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_ChatMessages_FolderId",
                table: "ChatMessages");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldMaxLength: 255)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
