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
        Task<Folder?> GetByIdAsync(int folderId);
        Task<List<Folder>> GetAllByGroupAsync(int groupId);
        Task<List<Folder>> GetAllByClientAsync(int clientId);
        Task UpdateAsync(Folder folder);
        Task DeleteAsync(int folderId);
        Task AddDocumentAsync(int folderId, Document document); 
        Task RemoveDocumentAsync(int folderId, int documentId);
        Task<string> GetExtractedTextFromFolderAsync(int folderId);
        // The text of each document of the case, from the cache or extracted now
        Task<List<CaseDocumentText>> GetDocumentTextsAsync(int folderId);
    }

    // Text is null when the file could not be read, and Note says why. Extractor names the reader
    // (e.g. "pdf-3"); PDF text separates its pages with PageBreak.
    public record CaseDocumentText(Document Document, string? Extractor, string? Text, string? Note)
    {
        public const char PageBreak = '\f';
    }
}
