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
        public string ContentType { get; set; }
    }
}
