using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace TaxManager.Core.Models
{
    public class Document
    {
        public int DocumentId { get; set; } 
        public string DocumentName { get; set; }
        public string FilePath { get; set; } 
        public DateTime UploadDate { get; set; } 
        public int FolderId { get; set; } 

        public Document() { }

        // קונסטרקטור
        public Document(int documentId,string filePath)
        {
            DocumentId = documentId; // יצירת מזהה ייחודי למסמך
            FilePath = filePath;
            UploadDate = DateTime.UtcNow; // תאריך העלאה
        }

        public string GetDocumentDetails()
        {
            return $"Document ID: {DocumentId}, Uploaded on: {UploadDate}";
        }


        public string GetFilePath()
        {
            return FilePath;
        }

        public bool IsValid()
        {
            return !string.IsNullOrEmpty(FilePath);
        }
    }
}