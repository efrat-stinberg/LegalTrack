using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using TaxManager.Data;

namespace TaxManagerServer.Data
{
    // Used only by the EF command-line tools (dotnet ef migrations / database update).
    // The tools need a parameterless constructor, so the connection string comes from the
    // ConnectionStrings__DefaultConnection environment variable.
    public class DataContextFactory : IDesignTimeDbContextFactory<DataContext>
    {
        public DataContext CreateDbContext(string[] args)
        {
            var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
                ?? "server=localhost;port=3306;database=legaltrack;user=root;password=";

            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            optionsBuilder.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 41)));

            return new DataContext(optionsBuilder.Options);
        }
    }
}
