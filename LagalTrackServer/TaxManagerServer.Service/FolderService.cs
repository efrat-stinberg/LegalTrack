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
        private readonly IPdfTextExtractor _pdfTextExtractor;

        public FolderService(
    IFolderRepository folderRepository,
    IRepositoryManager repositoryManager,
    IS3Service s3Service,
    IPdfTextExtractor pdfTextExtractor
)
        {
            _folderRepository = folderRepository;
            _repositoryManager = repositoryManager;
            _s3Service = s3Service;
            _pdfTextExtractor = pdfTextExtractor;
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
            var folder = await _folderRepository.GetByIdAsync(folderId); // Use GetByIdAsync
            if (folder == null)
            {
                throw new KeyNotFoundException("Folder not found.");
            }
            return folder;
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

            foreach (var doc in folder.Documents)
            {
                try
                {
                    var (stream, contentType) = await _s3Service.DownloadFileAsync(doc.FilePath);
                    using (stream)
                    {
                        string extension = Path.GetExtension(doc.DocumentName).ToLowerInvariant();
                        string content;

                        if (extension == ".pdf")
                        {
                            content = await _pdfTextExtractor.ExtractTextAsync(stream);
                        }
                        else
                        {
                            content = $"[Unsupported file: {doc.DocumentName}]";
                        }

                        sb.AppendLine($"--- {doc.DocumentName} ---");
                        sb.AppendLine(content);
                        sb.AppendLine();
                    }
                }
                catch (Exception ex)
                {
                    sb.AppendLine($"[Error processing {doc.DocumentName}: {ex.Message}]");
                }

            }

            return sb.ToString();
        }

       
    }
}
