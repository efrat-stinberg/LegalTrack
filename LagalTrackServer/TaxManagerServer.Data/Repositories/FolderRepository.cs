using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Data;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.Data.Repositories
{
    public class FolderRepository : Repository<Folder>, IFolderRepository
    {
        private readonly DataContext _context;

        public FolderRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        // Override specific GetByIdAsync with Includes
        public async new Task<Folder?> GetByIdAsync(int id)
        {
            return await _context.Folders
                .Include(f => f.Documents)
                .FirstOrDefaultAsync(f => f.FolderId == id);
        }

        public async Task<IEnumerable<Folder>> GetAllByGroupAsync(int groupId)
        {
            return await _context.Folders
                .Where(folder => folder.GroupId == groupId)
                .Include(folder => folder.Documents)
                .ToListAsync();
        }

        public async Task<List<Folder>> GetAllByClientAsync(int clientId)
        {
            return await _context.Folders
                .Where(f => f.ClientId == clientId)
                .Include(f => f.Documents)
                .ToListAsync();
        }

    }
}
