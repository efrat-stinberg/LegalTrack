using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxManagerServer.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentChunksAndChatSources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // SchemaUpgrader may already have made these changes at startup, so each step only runs when needed
            AddCaseStatusAndPasswordResets.AddColumnIfMissing(migrationBuilder, "ChatMessages", "Sources", SchemaUpgrader.ChatMessageSourcesColumn);
            migrationBuilder.Sql(SchemaUpgrader.CreateDocumentChunksSql);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentChunks");

            migrationBuilder.DropColumn(
                name: "Sources",
                table: "ChatMessages");
        }
    }
}
