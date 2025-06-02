using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using TaxManager.Data;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.Data.Repositories
{
    public class GroupRepository : Repository<Group>, IGroupRepository
    {
        private readonly DataContext _context;

        public GroupRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Group> GetByNameAsync(string name)
        {
            return await _context.Groups.FirstOrDefaultAsync(g => g.Name == name);
        }
    }
}
