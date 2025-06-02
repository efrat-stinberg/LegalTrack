using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;

namespace TaxManagerServer.Core.Repository
{
    public interface IDocumentRepository : IRepository<Document>
    {
        Task<Document> GetByFilePathAsync(string filePath);

    }
}
