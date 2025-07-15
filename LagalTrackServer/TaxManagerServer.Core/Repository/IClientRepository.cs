using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IClientRepository : IRepository<Client>
    {
        Task<List<Client>> GetAllAsync();
        Task<Client?> GetByIdAsync(int id);
    }
}
