using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Data;



namespace TaxManagerServer.Data
{
    public class DataContextFactory : IDesignTimeDbContextFactory<DataContext>
    {
        private readonly IConfiguration _configuration;

        public DataContextFactory(IConfiguration configuration) {
            _configuration = configuration;
        }
        public DataContext CreateDbContext(string[] args)
        {
            var connectionString = _configuration.GetValue<string>("ConnectionStrings:DefaultConnection");

            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            optionsBuilder.UseMySql(
               connectionString,
                 new MySqlServerVersion(new Version(8, 0, 41))
            );

            return new DataContext(optionsBuilder.Options);
        }
    }
}
