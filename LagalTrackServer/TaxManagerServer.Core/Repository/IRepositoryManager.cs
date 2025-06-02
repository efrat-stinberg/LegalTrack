using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models.TaxManager.Core.Models;
using TaxManager.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IRepositoryManager
    {
        public IUserRepository Users { get; }
        IDocumentRepository Documents { get; }
        IFolderRepository Folders { get; }
        IRepository<ChatMessage> ChatMessages { get; }
        IGroupRepository Group { get; }

        Task SaveAsync();

    }
}
