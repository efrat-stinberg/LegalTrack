using System.Data;
using Microsoft.EntityFrameworkCore;
using TaxManager.Data;

namespace TaxManagerServer.Data
{
    // Small, idempotent schema changes applied at startup.
    // The deployed database's migration history can't be inspected from here, so instead of
    // Database.Migrate() each patch checks the live schema and only changes what is missing.
    // Every step is safe to run on every start.
    public static class SchemaUpgrader
    {
        // Shared with the AddCaseStatusAndPasswordResets migration so both make exactly the same change
        public const string FolderStatusColumn = "varchar(20) CHARACTER SET utf8mb4 NOT NULL DEFAULT 'open'";
        public const string FolderNextDeadlineColumn = "datetime(6) NULL";
        public const string FolderNextDeadlineNoteColumn = "varchar(200) CHARACTER SET utf8mb4 NULL";
        public const string CreatePasswordResetsSql = @"
CREATE TABLE IF NOT EXISTS `PasswordResets` (
    `Id` int NOT NULL AUTO_INCREMENT,
    `UserId` int NOT NULL,
    `TokenHash` varchar(64) CHARACTER SET utf8mb4 NOT NULL,
    `CreatedAt` datetime(6) NOT NULL,
    `ExpiresAt` datetime(6) NOT NULL,
    `UsedAt` datetime(6) NULL,
    CONSTRAINT `PK_PasswordResets` PRIMARY KEY (`Id`),
    UNIQUE INDEX `IX_PasswordResets_TokenHash` (`TokenHash`)
) CHARACTER SET=utf8mb4";

        public static async Task UpgradeAsync(DataContext context)
        {
            await EnsureClientGroupIdAsync(context);
            await EnsureCaseStatusColumnsAsync(context);
            await context.Database.ExecuteSqlRawAsync(CreatePasswordResetsSql);
        }

        // Folders.Status / NextDeadline / NextDeadlineNote. Existing cases become "open" through the column default.
        private static async Task EnsureCaseStatusColumnsAsync(DataContext context)
        {
            await AddColumnIfMissingAsync(context, "Folders", "Status", FolderStatusColumn);
            await AddColumnIfMissingAsync(context, "Folders", "NextDeadline", FolderNextDeadlineColumn);
            await AddColumnIfMissingAsync(context, "Folders", "NextDeadlineNote", FolderNextDeadlineNoteColumn);
        }

        private static async Task AddColumnIfMissingAsync(DataContext context, string table, string column, string definition)
        {
            if (!await ColumnExistsAsync(context, table, column))
                await context.Database.ExecuteSqlRawAsync($"ALTER TABLE `{table}` ADD COLUMN `{column}` {definition}");
        }

        // Clients.GroupId ties each client to an office. Existing clients get the office of their cases.
        private static async Task EnsureClientGroupIdAsync(DataContext context)
        {
            // Same change as the AddClientGroupId migration, for databases that are not migrated with dotnet ef
            if (!await ColumnExistsAsync(context, "Clients", "GroupId"))
                await context.Database.ExecuteSqlRawAsync("ALTER TABLE `Clients` ADD COLUMN `GroupId` int NULL");

            await context.Database.ExecuteSqlRawAsync(@"
UPDATE `Clients` c
JOIN (SELECT `ClientId`, MIN(`GroupId`) AS `GroupId` FROM `Folders` GROUP BY `ClientId`) f ON f.`ClientId` = c.`Id`
SET c.`GroupId` = f.`GroupId`
WHERE c.`GroupId` IS NULL");
        }

        private static async Task<bool> ColumnExistsAsync(DataContext context, string table, string column)
        {
            var connection = context.Database.GetDbConnection();
            var wasClosed = connection.State != ConnectionState.Open;
            if (wasClosed)
                await connection.OpenAsync();
            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = @"SELECT COUNT(*) FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = @table AND COLUMN_NAME = @column";
                var tableParam = command.CreateParameter();
                tableParam.ParameterName = "@table";
                tableParam.Value = table;
                command.Parameters.Add(tableParam);
                var columnParam = command.CreateParameter();
                columnParam.ParameterName = "@column";
                columnParam.Value = column;
                command.Parameters.Add(columnParam);
                return Convert.ToInt64(await command.ExecuteScalarAsync()) > 0;
            }
            finally
            {
                if (wasClosed)
                    await connection.CloseAsync();
            }
        }
    }
}
