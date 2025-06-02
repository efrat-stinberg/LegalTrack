using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaxManager.Core.Models;
using TaxManager.Core.Services;
using TaxManagerServer.Core.Repository;
using Org.BouncyCastle.Crypto.Generators;

namespace TaxManager.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRepositoryManager _repositoryManager;

        public UserService(IUserRepository userRepository, IRepositoryManager repositoryManager)
        {
            _userRepository = userRepository;
            _repositoryManager = repositoryManager;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _userRepository.GetByEmailAsync(email);
        }

        public async Task UpdateAsync(int id, User updatedUser)
        {
            var existingUser = await _userRepository.GetByIdAsync(id);
            if (existingUser != null)
            {
                existingUser.UserName = updatedUser.UserName;
                existingUser.Email = updatedUser.Email;
                await _userRepository.UpdateAsync(existingUser);
                await _repositoryManager.SaveAsync();
            }
        }

        public async Task AddAsync(User newUser)
        {
            var existingUser = await _userRepository.GetByEmailAsync(newUser.Email);
            if (existingUser != null)
            {
                throw new Exception("User with this email already exists.");
            }

            await _userRepository.AddAsync(newUser);
            await _repositoryManager.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user != null)
            {
                await _userRepository.DeleteAsync(user);
                await _repositoryManager.SaveAsync();
            }
        }

        public bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        public bool IsValidPassword(string password)
        {
            return password.Length >= 5 &&
                   password.Any(char.IsLetter) &&
                   password.Any(char.IsDigit);
        }

        //public string HashPassword(string password) => BCrypt.Net.BCrypt.HashPassword(password)
    }
}
