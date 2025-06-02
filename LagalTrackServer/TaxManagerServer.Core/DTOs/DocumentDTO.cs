using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.DTOs
{
    public class DocumentDTO
    {
        public int DocumentId { get; set; }
        public string DocumentName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadDate { get; set; }
        public int FolderId { get; set; }
    }
}
