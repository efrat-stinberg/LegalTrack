using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.Services
{
    public interface IEmailService
    {
        Task SendInviteEmailAsync(string email, string token);

    }
}
