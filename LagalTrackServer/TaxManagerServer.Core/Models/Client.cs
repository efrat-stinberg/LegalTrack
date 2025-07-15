using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.Models
{
    public class Client
    {
        public int Id { get; set; } 
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public ICollection<Folder> Folders { get; set; } = new List<Folder>();
    }
}
