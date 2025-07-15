using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.Models
{
    public class Invite
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string Token { get; set; }
        public int GroupId { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
