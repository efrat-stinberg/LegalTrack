using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxManagerServer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddClientGroupId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SchemaUpgrader may already have added this column at startup, so only add it when missing.
            // MySQL has no "ADD COLUMN IF NOT EXISTS", hence the temporary procedure.
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS `__AddClientGroupId`;");
            migrationBuilder.Sql(@"
CREATE PROCEDURE `__AddClientGroupId`()
BEGIN
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Clients' AND COLUMN_NAME = 'GroupId') THEN
        ALTER TABLE `Clients` ADD COLUMN `GroupId` int NULL;
    END IF;
END;");
            migrationBuilder.Sql("CALL `__AddClientGroupId`();");
            migrationBuilder.Sql("DROP PROCEDURE `__AddClientGroupId`;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "Clients");
        }
    }
}
