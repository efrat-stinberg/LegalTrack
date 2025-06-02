using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

namespace TaxManagerServer.Core.Middlewares
{
    public class TokenMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers["Authorization"].ToString()?.Split(" ").Last();

            if (token != null)
            {
                var userId = GetUserIdFromToken(token);
                if (userId != null)
                {
                    // הוספת ה-ID לאובייקט הבקשה
                    context.Items["UserId"] = userId;
                }
            }

            await _next(context); // המשך ל-next middleware
        }

        private string GetUserIdFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("your-secret-key")), // החלף עם המפתח הסודי שלך
                ValidateIssuer = false,
                ValidateAudience = false
            };

            try
            {
                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return principal.FindFirst(ClaimTypes.NameIdentifier)?.Value; // הנח שה-ID נמצא ב-Claim
            }
            catch
            {
                return null; // טוקן לא חוקי
            }
        }
    }
}
