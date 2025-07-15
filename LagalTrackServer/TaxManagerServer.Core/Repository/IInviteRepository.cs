using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IInviteRepository : IRepository<Invite>
    {
        Task<Invite?> GetByTokenAsync(string token);
        void Remove(Invite invite);


    }
}
