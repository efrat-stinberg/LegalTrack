using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IClientService
    {
        Task<List<Client>> GetAllAsync();
        Task<List<Client>> GetAllByGroupAsync(int groupId);
        Task<Client?> GetByIdAsync(int id);
        Task<bool> HasFoldersAsync(int clientId);
        Task AddAsync(Client client);
        Task UpdateAsync(Client client);
        Task DeleteAsync(int id);
    }
}
