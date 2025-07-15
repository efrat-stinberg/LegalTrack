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
    public class InviteRepository : Repository<Invite>, IInviteRepository
    {
        private readonly DataContext _context;

        public InviteRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Invite> GetByTokenAsync(string token)
        {
            return await _context.Invites
                .FirstOrDefaultAsync(i => i.Token.ToLower() == token.ToLower());
        }

        public void Remove(Invite invite)
        {
            _context.Invites.Remove(invite);
        }

    }
}
