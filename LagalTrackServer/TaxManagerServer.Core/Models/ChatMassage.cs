using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.Models
{
    public class ChatMessage
    {
        public int Id { get; set; }
        public int FolderId { get; set; } // Foreign key
        public string Question { get; set; }
        public string Answer { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }


}
