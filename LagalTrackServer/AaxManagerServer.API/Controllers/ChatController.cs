using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http;
using System.Text.Json;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Models;
using TaxManagerServer.Core.Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IMapper _mapper;

        public ChatController(IChatService chatService, IMapper mapper)
        {
            _chatService = chatService;
            _mapper = mapper;
        }

        [HttpGet("{folderId}")]
        public async Task<IActionResult> GetHistory(int folderId)
        {
            var messages = await _chatService.GetChatHistoryAsync(folderId);
            var result = messages.Select(m => _mapper.Map<ChatMessageResponseDto>(m));
            return Ok(result);
        }

        [HttpPost("{folderId}")]
        public async Task<IActionResult> AskQuestion(int folderId, [FromBody] ChatMessageDto dto)
        {
            var message = await _chatService.AskQuestionAsync(folderId, dto.Question);
            var result = _mapper.Map<ChatMessageResponseDto>(message);
            return Ok(result);
        }
    }

}
