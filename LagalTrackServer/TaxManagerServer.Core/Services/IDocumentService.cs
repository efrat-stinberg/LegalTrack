using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;

namespace TaxManager.Core.Services
{
    public interface IDocumentService
    {
        Task AddAsync(Document document);
        Task<Document> GetByIdAsync(int documentId);
        Task<Document> GetByFilePathAsync(string filePath);
        Task<IEnumerable<Document>> GetAllAsync();
        Task UpdateAsync(Document document);
        Task DeleteAsync(int documentId);


    }
}
