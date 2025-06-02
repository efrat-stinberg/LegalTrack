using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IGroupRepository : IRepository<Group>
    {
        Task<Group> GetByNameAsync(string name);

    }
}
