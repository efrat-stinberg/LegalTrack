using System.Collections.Generic;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.Core.Repository;

namespace TaxManager.Service
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;
        private readonly IRepositoryManager _repositoryManager;

        public DocumentService(IDocumentRepository documentRepository, IRepositoryManager repositoryManager)
        {
            _documentRepository = documentRepository;
            _repositoryManager = repositoryManager;
        }

        public async Task AddAsync(Document document)
        {
            await _documentRepository.AddAsync(document); // Use AddAsync
            await _repositoryManager.SaveAsync();
        }

        public async Task DeleteAsync(int documentId)
        {
            var document = await _documentRepository.GetByIdAsync(documentId); // Get the document first
            if (document != null)
            {
                await _documentRepository.DeleteAsync(document); // Use DeleteAsync
                await _repositoryManager.SaveAsync();
            }
        }

        public async Task<Document?> GetByIdAsync(int documentId)
        {
            return await _documentRepository.GetByIdAsync(documentId); // Use GetByIdAsync
        }

        public async Task<IEnumerable<Document>> GetAllAsync()
        {
            return await _documentRepository.GetAllAsync(); // Use GetAllAsync
        }

        public async Task<Document> GetByFilePathAsync(string filePath)
        {
            return await _documentRepository.GetByFilePathAsync(filePath);
        }

        public async Task UpdateAsync(Document document)
        {
            await _documentRepository.UpdateAsync(document); // Use UpdateAsync
            await _repositoryManager.SaveAsync();
        }

    }
}
