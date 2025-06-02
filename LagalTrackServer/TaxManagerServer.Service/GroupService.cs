using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Repository;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.Service
{
    public class GroupService : IGroupService
    {
        private readonly IGroupRepository _groupRepository;
        private readonly IRepositoryManager _repositoryManager;

        public GroupService(IGroupRepository groupRepository, IRepositoryManager repositoryManager)
        {
            _groupRepository = groupRepository;
            _repositoryManager = repositoryManager;
        }

        public async Task<IEnumerable<Group>> GetAllGroupsAsync()
            => (IEnumerable<Group>)await _groupRepository.GetAllAsync();

        public async Task<Group> GetGroupByIdAsync(int id)
            => await _groupRepository.GetByIdAsync(id);

        public async Task<Group> CreateGroupAsync(Group group)
        {
            await _groupRepository.AddAsync(group);
            await _repositoryManager.SaveAsync();
            return group;
        }
    }
}

