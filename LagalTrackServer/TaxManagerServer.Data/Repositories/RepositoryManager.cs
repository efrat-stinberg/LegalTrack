using TaxManager.Data;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Data.Repositories;

public class RepositoryManager : IRepositoryManager
{
    private readonly DataContext _context;

    public IUserRepository Users { get; }
    public IDocumentRepository Documents { get; }
    public IFolderRepository Folders { get; }
    public IRepository<ChatMessage> ChatMessages { get; }
    public IGroupRepository GroupRepository { get; }
    public IInviteRepository Invite { get; }
    public IClientRepository Client { get; }
    public IRepository<DocumentText> DocumentTexts { get; }
    public IRepository<DocumentChunk> DocumentChunks { get; }



    public RepositoryManager(
        DataContext context,
        IUserRepository userRepository,
        IDocumentRepository documentRepository,
        IFolderRepository folderRepository,
        IRepository<ChatMessage> chatMessageRepository,
        IGroupRepository groupRepository,
        IInviteRepository inviteReository,
        IClientRepository client,
        IRepository<DocumentText> documentTexts,
        IRepository<DocumentChunk> documentChunks)
    {
        _context = context;
        Users = userRepository;
        Documents = documentRepository;
        Folders = folderRepository;
        ChatMessages = chatMessageRepository;
        GroupRepository = groupRepository;
        Invite = inviteReository;
        Client = client;
        DocumentTexts = documentTexts;
        DocumentChunks = documentChunks;
    }


    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
}
