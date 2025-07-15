using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Services
{
    public interface IInviteService
    {
        Task<Invite> CreateInviteAsync(string email, int groupId);

        Task<Invite?> GetInviteByTokenAsync(string token);

        Task<bool> IsTokenValidAsync(string token);


    }
}
