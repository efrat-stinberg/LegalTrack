using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Models;
using TaxManagerServer.Core.Repository;

namespace TaxManagerServer.API.Controllers
{
    // Base for controllers whose data belongs to an office (group).
    // The user and office are read from the database, not trusted from token claims,
    // so changes (e.g. a removed user) take effect immediately.
    public abstract class OfficeControllerBase : ControllerBase
    {
        private User? _currentUser;
        private bool _loaded;

        protected async Task<User?> GetCurrentUserAsync()
        {
            if (_loaded)
                return _currentUser;

            _loaded = true;
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(idClaim, out var userId))
                return null;

            var users = HttpContext.RequestServices.GetRequiredService<IUserRepository>();
            _currentUser = await users.GetByIdAsync(userId);
            return _currentUser;
        }

        protected async Task<int?> GetCurrentGroupIdAsync() => (await GetCurrentUserAsync())?.GroupId;

        protected async Task<bool> IsInMyOfficeAsync(int? groupId)
        {
            var myGroupId = await GetCurrentGroupIdAsync();
            return myGroupId != null && groupId == myGroupId;
        }
    }
}
