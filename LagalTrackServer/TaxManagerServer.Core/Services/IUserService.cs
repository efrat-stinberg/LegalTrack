using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaxManager.Core.Models;

namespace TaxManager.Core.Services
{
    public interface IUserService
    {
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> GetByIdAsync(int id);
        Task<User> GetByEmailAsync(string email);
        Task UpdateAsync(int id, User updatedUser);
        Task AddAsync(User newUser);
        Task DeleteAsync(int id);
        bool IsValidEmail(string email);
        bool IsValidPassword(string password);

    }
}
