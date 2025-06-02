using TaxManager.Core.Models.TaxManager.Core.Models;
using TaxManager.Data;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;

public class RepositoryManager : IRepositoryManager
{
    private readonly DataContext _context;

    public IUserRepository Users { get; }
    public IDocumentRepository Documents { get; }
    public IFolderRepository Folders { get; }
    public IRepository<ChatMessage> ChatMessages { get; }
    public IGroupRepository Group { get; }

    public RepositoryManager(
        DataContext context,
        IUserRepository userRepository,
        IDocumentRepository documentRepository,
        IFolderRepository folderRepository,
        IRepository<ChatMessage> chatMessageRepository,
        IGroupRepository groupRepository) // ← חדש
    {
        _context = context;
        Users = userRepository;
        Documents = documentRepository;
        Folders = folderRepository;
        ChatMessages = chatMessageRepository;
        Group = groupRepository; // ← חדש
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}
