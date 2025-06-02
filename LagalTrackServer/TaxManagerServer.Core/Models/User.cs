using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using TaxManager.Core.Models.TaxManager.Core.Models;
using TaxManagerServer.Core.Models;

namespace TaxManager.Core.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public ICollection<Folder> Folders { get; set; } = new List<Folder>();
        public int? GroupId { get; set; }
        public Group Group { get; set; }
        public bool IsAdmin { get; set; } = false;

        public User(){}
        
        public void UpdateUserDetails(string userName, string email)
        {
            UserName = userName;
            Email = email;
        }

        public bool ValidatePassword(string password)
        {
            return Password == password; 
        }
    }
}
