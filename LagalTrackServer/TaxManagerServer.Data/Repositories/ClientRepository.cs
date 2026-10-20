using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Data;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.Data.Repositories
{
    public class ClientRepository : Repository<Client>, IClientRepository
    {
        private readonly DataContext _context;

        public ClientRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<Client>> GetAllAsync()
        {
            return await _context.Clients.ToListAsync();
        }

        public async Task<List<Client>> GetAllByGroupAsync(int groupId)
        {
            return await _context.Clients.Where(c => c.GroupId == groupId).ToListAsync();
        }

        public async Task<bool> HasFoldersAsync(int clientId)
        {
            return await _context.Folders.AnyAsync(f => f.ClientId == clientId);
        }

        public async Task<Client?> GetByIdAsync(int id)
        {
            return await _context.Clients.FirstOrDefaultAsync(c => c.Id == id);
        }
    }
}
