using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Core.Models.TaxManager.Core.Models;
using TaxManager.Data;
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

        public async Task<Folder?> GetByIdAsync(int id)
        {
            return await _context.Folders
             .Include(f => f.Documents)
             .FirstOrDefaultAsync(f => f.FolderId == id);
        }

        public async Task<IEnumerable<Folder>> GetAllAsync(int userId)
        {
            return await _context.Folders
                .Where(folder => folder.UserId == userId)
                .Include(folder => folder.Documents) 
                .ToListAsync();
        }

    }
}
