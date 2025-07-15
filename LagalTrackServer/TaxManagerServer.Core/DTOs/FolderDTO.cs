using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;

namespace TaxManagerServer.Core.DTOs
{
    public class FolderDTO
    {
        public int FolderId { get; set; }
        public string FolderName { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = null!;

        public Collection<DocumentDTO> Documents { get; set; }
    }
}
