using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core.Services
{
    public interface IChatService
    {
        Task<List<ChatMessage>> GetChatHistoryAsync(int folderId);
        Task<ChatMessage> AskQuestionAsync(int folderId, string question);
    }

}
