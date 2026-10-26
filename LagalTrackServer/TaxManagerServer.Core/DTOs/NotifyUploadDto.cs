using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.DTOs
{
    public class NotifyUploadDto
    {
        public int FolderId { get; set; }
        public string ObjectKey { get; set; }
        public string? ContentType { get; set; }
        // Original file name as the user picked it; when missing it is taken from the key
        public string? FileName { get; set; }
    }
}
