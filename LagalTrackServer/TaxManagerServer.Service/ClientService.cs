using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.Service
{

    public class ClientService : IClientService
    {
        private readonly IRepositoryManager _repositoryManager;

        public ClientService(IRepositoryManager repositoryManager)
        {
            _repositoryManager = repositoryManager;
        }

        public async Task<List<Client>> GetAllAsync()
        {
            return await _repositoryManager.Client.GetAllAsync();
        }

        public async Task<List<Client>> GetAllByGroupAsync(int groupId)
        {
            return await _repositoryManager.Client.GetAllByGroupAsync(groupId);
        }

        public async Task<bool> HasFoldersAsync(int clientId)
        {
            return await _repositoryManager.Client.HasFoldersAsync(clientId);
        }

        public async Task<Client?> GetByIdAsync(int id)
        {
            return await _repositoryManager.Client.GetByIdAsync(id);
        }

        public async Task AddAsync(Client client)
        {
            await _repositoryManager.Client.AddAsync(client);
            await _repositoryManager.SaveAsync();
        }

        public async Task UpdateAsync(Client client)
        {
            await _repositoryManager.Client.UpdateAsync(client);
            await _repositoryManager.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var client = await _repositoryManager.Client.GetByIdAsync(id);
            if (client != null)
            {
                await _repositoryManager.Client.DeleteAsync(client);
                await _repositoryManager.SaveAsync();
            }
        }
    }
}
