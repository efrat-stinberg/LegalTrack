using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManager.Service
{
    public class FolderService : IFolderService
    {
        private readonly IFolderRepository _folderRepository;
        private readonly IRepositoryManager _repositoryManager;
        private readonly IS3Service _s3Service;
        private readonly IDocumentTextExtractor _textExtractor;

        public FolderService(
    IFolderRepository folderRepository,
    IRepositoryManager repositoryManager,
    IS3Service s3Service,
    IDocumentTextExtractor textExtractor
)
        {
            _folderRepository = folderRepository;
            _repositoryManager = repositoryManager;
            _s3Service = s3Service;
            _textExtractor = textExtractor;
        }

        public async Task AddAsync(Folder folder)
        {
            if (folder == null)
            {
                throw new ArgumentNullException(nameof(folder));
            }
            await _folderRepository.AddAsync(folder); // Use AddAsync
            await _repositoryManager.SaveAsync();
        }

        public async Task DeleteAsync(int folderId)
        {
            var folder = await _folderRepository.GetByIdAsync(folderId); // Use GetByIdAsync
            if (folder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }
            // Remove the case's files from S3; a failure here shouldn't block deleting the case itself
            foreach (var doc in folder.Documents)
            {
                try
                {
                    await _s3Service.DeleteFileAsync(doc.FilePath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Could not delete S3 object {doc.FilePath}: {ex.Message}");
                }
            }

            // Chat messages have no FK to Folders, so they are not cascaded by the database
            var chatMessages = await _repositoryManager.ChatMessages.FindAsync(m => m.FolderId == folderId);
            foreach (var message in chatMessages)
            {
                await _repositoryManager.ChatMessages.DeleteAsync(message);
            }

            await _folderRepository.DeleteAsync(folder); // Use DeleteAsync
            await _repositoryManager.SaveAsync();
        }

        //public async Task<IEnumerable<Folder>> GetAllByGroupAsync(int groupId)
        //{
        //    return await _folderRepository.GetAllAsync(groupId);
        //}

         async Task<List<Folder>> IFolderService.GetAllByGroupAsync(int groupId)
        {
            return (List<Folder>)await _folderRepository.GetAllByGroupAsync(groupId);
        }

        public async Task<Folder?> GetByIdAsync(int folderId)
        {
            // Returns null when not found so controllers can answer 404
            return await _folderRepository.GetByIdAsync(folderId);
        }

        public async Task UpdateAsync(Folder folder)
        {
            if (folder == null)
            {
                throw new ArgumentNullException(nameof(folder));
            }
            var existingFolder = await _folderRepository.GetByIdAsync(folder.FolderId); // Use GetByIdAsync
            if (existingFolder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }
            await _folderRepository.UpdateAsync(folder); // Use UpdateAsync
            await _repositoryManager.SaveAsync();
        }
        public async Task<List<Folder>> GetAllByClientAsync(int clientId)
        {
            return await _folderRepository.GetAllByClientAsync(clientId);
        }


        public async Task AddDocumentAsync(int folderId, Document document)
        {
            if (document == null)
            {
                throw new ArgumentNullException(nameof(document));
            }

            var folder = await _folderRepository.GetByIdAsync(folderId);
            if (folder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }

            // Assuming you have a method to create a Document object from DocumentModel
            var newDocument = new Document
            {
                DocumentName = document.DocumentName,
                // Set other properties as needed
            };

            folder.Documents.Add(newDocument); // Add the document to the folder's document collection
            await _folderRepository.UpdateAsync(folder); // Update the folder to save the new document
            await _repositoryManager.SaveAsync(); // Save changes
        }

        public async Task RemoveDocumentAsync(int folderId, int documentId)
        {
            var folder = await _folderRepository.GetByIdAsync(folderId);
            if (folder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }

            var documentToRemove = folder.Documents.FirstOrDefault(d => d.DocumentId == documentId);
            if (documentToRemove == null)
            {
                throw new KeyNotFoundException("Document not found in the folder.");
            }

            folder.Documents.Remove(documentToRemove); // Remove the document from the folder's document collection
            await _folderRepository.UpdateAsync(folder); // Update the folder to reflect the removal
            await _repositoryManager.SaveAsync(); // Save changes
        }

        public async Task<List<Document>> GetDocumentsByFolderIdAsync(int folderId)
        {
            var folder = await _folderRepository.GetByIdAsync(folderId);
            if (folder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }

            return folder.Documents.ToList();
        }

        public async Task<string> GetExtractedTextFromFolderAsync(int folderId)
        {
            var folder = await _folderRepository.GetByIdAsync(folderId);
            if (folder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }

            var sb = new System.Text.StringBuilder();
            var documentIds = folder.Documents.Select(d => d.DocumentId).ToList();
            var cachedTexts = (await _repositoryManager.DocumentTexts.FindAsync(t => documentIds.Contains(t.DocumentId)))
                .ToDictionary(t => t.DocumentId);

            foreach (var doc in folder.Documents)
            {
                var fileName = SourceFileName(doc);
                var extractor = _textExtractor.GetExtractor(fileName);
                if (extractor == null)
                {
                    sb.AppendLine($"[Unsupported file: {doc.DocumentName}]");
                    continue;
                }

                try
                {
                    cachedTexts.TryGetValue(doc.DocumentId, out var cached);
                    string content;
                    if (cached != null && cached.FilePath == doc.FilePath && cached.Extractor == extractor)
                    {
                        content = cached.Text;
                    }
                    else
                    {
                        var (stream, _) = await _s3Service.DownloadFileAsync(doc.FilePath);
                        using (stream)
                            content = await _textExtractor.ExtractTextAsync(stream, fileName);
                        await SaveExtractedTextAsync(cached, doc, extractor, content);
                    }

                    sb.AppendLine($"--- {doc.DocumentName} ---");
                    sb.AppendLine(content);
                    sb.AppendLine();
                }
                catch (Exception ex)
                {
                    sb.AppendLine($"[Error processing {doc.DocumentName}: {ex.Message}]");
                }

            }

            return sb.ToString();
        }

        // The type comes from the stored key ("<guid>_<escaped original name>"), so renaming a document
        // to a name without an extension doesn't stop it from being read
        private static string SourceFileName(Document doc)
        {
            var parts = (doc.FilePath ?? "").Split('_', 2);
            var stored = parts.Length == 2 ? Uri.UnescapeDataString(parts[1]) : doc.FilePath ?? "";
            return Path.HasExtension(stored) ? stored : doc.DocumentName;
        }

        // Keeps the text for the next question. Failing to cache must not fail the question itself.
        private async Task SaveExtractedTextAsync(DocumentText? cached, Document doc, string extractor, string text)
        {
            var row = cached ?? new DocumentText { DocumentId = doc.DocumentId };
            row.FilePath = doc.FilePath;
            row.Extractor = extractor;
            row.Text = text;
            row.ExtractedAt = DateTime.UtcNow;
            if (cached == null)
                await _repositoryManager.DocumentTexts.AddAsync(row);

            try
            {
                await _repositoryManager.SaveAsync();
            }
            catch (Exception ex)
            {
                // e.g. another question cached the same document at the same moment.
                // Stop tracking the row so the chat's own save is not retried with it.
                Console.WriteLine($"Could not cache the text of document {doc.DocumentId}: {ex.Message}");
                if (cached == null)
                    await _repositoryManager.DocumentTexts.DeleteAsync(row);
            }
        }

       
    }
}
