using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Data;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.Data.Repositories
{
    public class DocumentRepository: Repository<Document>, IDocumentRepository
    {
        private readonly DataContext _context;

        public DocumentRepository(DataContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Document> GetByFilePathAsync(string filePath)
        {
            var normalizedPath = filePath.TrimStart('/');
            return await _context.Documents
                                 .FirstOrDefaultAsync(d => d.FilePath == normalizedPath);

        }


    }
}
