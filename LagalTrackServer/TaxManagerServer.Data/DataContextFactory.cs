using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
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
        public DataContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<DataContext>();
            optionsBuilder.UseMySql(
                 "server=localhost;database=legal_db;user=root;password=e0583290906",
                 new MySqlServerVersion(new Version(8, 0, 41))
            );

            return new DataContext(optionsBuilder.Options);
        }
    }
}
