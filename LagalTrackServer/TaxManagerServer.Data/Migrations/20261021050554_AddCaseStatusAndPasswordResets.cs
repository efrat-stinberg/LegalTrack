using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxManagerServer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCaseStatusAndPasswordResets : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SchemaUpgrader may already have made these changes at startup, so each step only runs when needed.
            // MySQL has no "ADD COLUMN IF NOT EXISTS", hence the temporary procedure.
            AddColumnIfMissing(migrationBuilder, "Folders", "Status", SchemaUpgrader.FolderStatusColumn);
            AddColumnIfMissing(migrationBuilder, "Folders", "NextDeadline", SchemaUpgrader.FolderNextDeadlineColumn);
            AddColumnIfMissing(migrationBuilder, "Folders", "NextDeadlineNote", SchemaUpgrader.FolderNextDeadlineNoteColumn);
            migrationBuilder.Sql(SchemaUpgrader.CreatePasswordResetsSql);
        }

        private static void AddColumnIfMissing(MigrationBuilder migrationBuilder, string table, string column, string definition)
        {
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `__AddColumnIfMissing`;");
            migrationBuilder.Sql($@"
CREATE PROCEDURE `__AddColumnIfMissing`()
BEGIN
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}') THEN
        ALTER TABLE `{table}` ADD COLUMN `{column}` {definition};
    END IF;
END;");
            migrationBuilder.Sql("CALL `__AddColumnIfMissing`();");
            migrationBuilder.Sql("DROP PROCEDURE `__AddColumnIfMissing`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PasswordResets");

            migrationBuilder.DropColumn(
                name: "NextDeadline",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "NextDeadlineNote",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Folders");
        }
    }
}
