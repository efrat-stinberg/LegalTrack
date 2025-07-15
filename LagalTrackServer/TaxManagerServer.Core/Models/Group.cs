using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;

namespace TaxManagerServer.Core.Models
{
    public class Group
    {
     
        public int Id { get; set; }
        public string Name { get; set; }

        public int CreatedByUserId { get; set; }
        public User CreatedByUser { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
