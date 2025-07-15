using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IFolderRepository : IRepository<Folder>
    {
        Task<IEnumerable<Folder>> GetAllByGroupAsync(int groupId);
        Task<List<Folder>> GetAllByClientAsync(int clientId);


    }
}
