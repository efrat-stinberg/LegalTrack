using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;

namespace TaxManagerServer.Core.Services
{
    public interface IAuthService
    {
        string GenerateJwtToken(User user);
    }
}
