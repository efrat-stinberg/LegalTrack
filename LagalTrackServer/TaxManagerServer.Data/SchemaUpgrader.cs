using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
        public const string CreateDocumentTextsSql = @"
CREATE TABLE IF NOT EXISTS `DocumentTexts` (
    `DocumentId` int NOT NULL,
    `FilePath` varchar(1024) CHARACTER SET utf8mb4 NOT NULL,
    `Extractor` varchar(40) CHARACTER SET utf8mb4 NOT NULL,
    `Text` longtext CHARACTER SET utf8mb4 NOT NULL,
    `ExtractedAt` datetime(6) NOT NULL,
    CONSTRAINT `PK_DocumentTexts` PRIMARY KEY (`DocumentId`),
    CONSTRAINT `FK_DocumentTexts_Documents_DocumentId` FOREIGN KEY (`DocumentId`) REFERENCES `Documents` (`DocumentId`) ON DELETE CASCADE
) CHARACTER SET=utf8mb4";

        // A change that runs only while Condition (a SQL expression) is true. Shared with the
        // AddConstraintsAndDocumentTexts migration so both paths make exactly the same change.
        public record ConditionalStep(string Condition, string[] Statements);

        // Users.Email becomes varchar(255) with a unique index: one account per email
        public const string DuplicateEmailsSql =
            "SELECT COUNT(*) FROM (SELECT `Email` FROM `Users` GROUP BY `Email` HAVING COUNT(*) > 1) d";
        public static readonly ConditionalStep UniqueUserEmail = new(
            "NOT EXISTS (SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() " +
            "AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'Email' AND NON_UNIQUE = 0)",
            new[]
            {
                "ALTER TABLE `Users` MODIFY `Email` varchar(255) CHARACTER SET utf8mb4 NOT NULL",
                "CREATE UNIQUE INDEX `IX_Users_Email` ON `Users` (`Email`)"
            });

        // Foreign keys for tables that only stored the id. Rows pointing at something that no longer
        // exists would block the constraint, so they are removed (or unlinked) first.
        public static readonly ConditionalStep[] ForeignKeys = new[]
        {
            ForeignKey("ChatMessages", "FolderId", "Folders", "FolderId", "CASCADE",
                "DELETE m FROM `ChatMessages` m LEFT JOIN `Folders` f ON f.`FolderId` = m.`FolderId` WHERE f.`FolderId` IS NULL"),
            ForeignKey("Invites", "GroupId", "Groups", "Id", "CASCADE",
                "DELETE i FROM `Invites` i LEFT JOIN `Groups` g ON g.`Id` = i.`GroupId` WHERE g.`Id` IS NULL"),
            ForeignKey("Clients", "GroupId", "Groups", "Id", "RESTRICT",
                "UPDATE `Clients` c LEFT JOIN `Groups` g ON g.`Id` = c.`GroupId` SET c.`GroupId` = NULL WHERE c.`GroupId` IS NOT NULL AND g.`Id` IS NULL"),
            ForeignKey("PasswordResets", "UserId", "Users", "UserId", "CASCADE",
                "DELETE r FROM `PasswordResets` r LEFT JOIN `Users` u ON u.`UserId` = r.`UserId` WHERE u.`UserId` IS NULL"),
        }.SelectMany(steps => steps).ToArray();

        // Two steps: the index (it may outlive a dropped constraint), then the constraint itself
        private static ConditionalStep[] ForeignKey(string table, string column, string principal, string principalColumn, string onDelete, string orphansSql) => new[]
        {
            new ConditionalStep(
                "NOT EXISTS (SELECT * FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() " +
                $"AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}' AND SEQ_IN_INDEX = 1)",
                new[] { $"CREATE INDEX `IX_{table}_{column}` ON `{table}` (`{column}`)" }),
            new ConditionalStep(
                "NOT EXISTS (SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() " +
                $"AND TABLE_NAME = '{table}' AND COLUMN_NAME = '{column}' AND REFERENCED_TABLE_NAME = '{principal}')",
                new[]
                {
                    orphansSql,
                    $"ALTER TABLE `{table}` ADD CONSTRAINT `FK_{table}_{principal}_{column}` FOREIGN KEY (`{column}`) " +
                    $"REFERENCES `{principal}` (`{principalColumn}`) ON DELETE {onDelete}"
                }),
        };

        public static async Task UpgradeAsync(DataContext context, ILogger? logger = null)
        {
            await EnsureClientGroupIdAsync(context);
            await EnsureCaseStatusColumnsAsync(context);
            await context.Database.ExecuteSqlRawAsync(CreatePasswordResetsSql);
            await context.Database.ExecuteSqlRawAsync(CreateDocumentTextsSql);
            await EnsureConstraintsAsync(context, logger);
        }

        private static async Task EnsureConstraintsAsync(DataContext context, ILogger? logger)
        {
            if (await ScalarAsync(context, $"SELECT {UniqueUserEmail.Condition}") > 0)
            {
                // Two accounts with the same email can't be merged automatically; leave the column as it is
                var duplicates = await ScalarAsync(context, DuplicateEmailsSql);
                if (duplicates > 0)
                    logger?.LogWarning("Users.Email was not made unique: {Count} email(s) belong to more than one user", duplicates);
                else
                    await RunAsync(context, UniqueUserEmail);
            }

            foreach (var step in ForeignKeys)
            {
                if (await ScalarAsync(context, $"SELECT {step.Condition}") > 0)
                    await RunAsync(context, step);
            }
        }

        private static async Task RunAsync(DataContext context, ConditionalStep step)
        {
            foreach (var statement in step.Statements)
                await context.Database.ExecuteSqlRawAsync(statement);
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

        private static async Task<long> ScalarAsync(DataContext context, string sql)
        {
            var connection = context.Database.GetDbConnection();
            var wasClosed = connection.State != ConnectionState.Open;
            if (wasClosed)
                await connection.OpenAsync();
            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = sql;
                return Convert.ToInt64(await command.ExecuteScalarAsync());
            }
            finally
            {
                if (wasClosed)
                    await connection.CloseAsync();
            }
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
