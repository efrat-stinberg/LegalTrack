using Microsoft.Extensions.Caching.Memory;

namespace TaxManagerServer.API.Security
{
    // Blocks password guessing: after too many failed logins for one email, or from one IP address,
    // further attempts are refused for a while. Counts are kept in memory (one API instance), so a
    // restart clears them.
    public class LoginAttemptLimiter
    {
        private readonly IMemoryCache _cache;
        private readonly int _maxPerEmail;
        private readonly int _maxPerIp;
        private readonly TimeSpan _window;

        private sealed class Counter
        {
            public int Failures;
            public DateTimeOffset WindowEnds;
        }

        public LoginAttemptLimiter(IMemoryCache cache, IConfiguration configuration)
        {
            _cache = cache;
            _maxPerEmail = configuration.GetValue("Login:MaxFailedAttemptsPerEmail", 5);
            _maxPerIp = configuration.GetValue("Login:MaxFailedAttemptsPerIp", 20);
            _window = TimeSpan.FromMinutes(configuration.GetValue("Login:LockoutMinutes", 15));
        }

        // How long until this email / IP may try again, or null when it may try now
        public TimeSpan? GetRetryAfter(string email, string? ip)
        {
            var now = DateTimeOffset.UtcNow;
            TimeSpan? wait = null;
            foreach (var (key, max) in Keys(email, ip))
            {
                if (_cache.TryGetValue(key, out Counter? counter) && counter != null)
                {
                    lock (counter)
                    {
                        if (counter.Failures >= max && counter.WindowEnds > now)
                        {
                            var left = counter.WindowEnds - now;
                            if (wait == null || left > wait)
                                wait = left;
                        }
                    }
                }
            }
            return wait;
        }

        public void RecordFailure(string email, string? ip)
        {
            var now = DateTimeOffset.UtcNow;
            foreach (var (key, _) in Keys(email, ip))
            {
                var counter = _cache.GetOrCreate(key, entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = _window;
                    return new Counter { WindowEnds = now + _window };
                })!;
                lock (counter)
                {
                    // The window starts at the first failure; a later failure inside it does not extend it
                    if (counter.WindowEnds <= now)
                    {
                        counter.Failures = 0;
                        counter.WindowEnds = now + _window;
                    }
                    counter.Failures++;
                }
            }
        }

        // A successful login clears the email's count; the IP count stays, so one known password
        // can't be used to reset guessing on other accounts
        public void RecordSuccess(string email) => _cache.Remove(EmailKey(email));

        private IEnumerable<(string Key, int Max)> Keys(string email, string? ip)
        {
            yield return (EmailKey(email), _maxPerEmail);
            yield return ($"login-ip:{ip ?? "unknown"}", _maxPerIp);
        }

        private static string EmailKey(string email) => $"login-email:{email.Trim().ToLowerInvariant()}";
    }
}
