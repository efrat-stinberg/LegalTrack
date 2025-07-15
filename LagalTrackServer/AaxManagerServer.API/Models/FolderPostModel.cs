using System.Collections.ObjectModel;

namespace TaxManagerServer.API.Models
{
    public class FolderPostModel
    {
        public string FolderName { get; set; }
        public int GroupId { get; set; }

        public int ClientId { get; set; }
    }
}
