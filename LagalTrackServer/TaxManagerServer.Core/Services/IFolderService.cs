using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManagerServer.Core.Models;

namespace TaxManager.Core.Services
{
    public interface IFolderService
    {
        
        Task AddAsync(Folder folder);
        Task<Folder> GetByIdAsync(int folderId);
        Task<List<Folder>> GetAllByGroupAsync(int groupId);
        Task<List<Folder>> GetAllByClientAsync(int clientId);
        Task UpdateAsync(Folder folder);
        Task DeleteAsync(int folderId);
        Task AddDocumentAsync(int folderId, Document document); 
        Task RemoveDocumentAsync(int folderId, int documentId);
        Task<string> GetExtractedTextFromFolderAsync(int folderId);


    }
}
