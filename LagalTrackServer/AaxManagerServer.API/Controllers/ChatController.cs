using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxManager.Core.Services;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Services;

namespace TaxManagerServer.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : OfficeControllerBase
    {
        private readonly IChatService _chatService;
        private readonly IFolderService _folderService;
        private readonly IMapper _mapper;

        public ChatController(IChatService chatService, IFolderService folderService, IMapper mapper)
        {
            _chatService = chatService;
            _folderService = folderService;
            _mapper = mapper;
        }

        private async Task<bool> IsOwnFolderAsync(int folderId)
        {
            var folder = await _folderService.GetByIdAsync(folderId);
            return folder != null && await IsInMyOfficeAsync(folder.GroupId);
        }

        [HttpGet("{folderId}")]
        public async Task<IActionResult> GetHistory(int folderId)
        {
            if (!await IsOwnFolderAsync(folderId))
                return NotFound();

            var messages = await _chatService.GetChatHistoryAsync(folderId);
            return Ok(messages.Select(m => _mapper.Map<ChatMessageResponseDto>(m)));
        }

        [HttpPost("{folderId}")]
        public async Task<IActionResult> AskQuestion(int folderId, [FromBody] ChatMessageDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto?.Question))
                return BadRequest("Question is required.");

            if (!await IsOwnFolderAsync(folderId))
                return NotFound();

            try
            {
                var message = await _chatService.AskQuestionAsync(folderId, dto.Question.Trim());
                return Ok(_mapper.Map<ChatMessageResponseDto>(message));
            }
            catch (ChatUnavailableException ex)
            {
                Console.WriteLine($"Chat failed: {ex.Message}");
                return StatusCode(StatusCodes.Status503ServiceUnavailable, ex.Message);
            }
            catch (Exception ex)
            {
                // Returned from here, not left to crash: an unhandled 500 loses the CORS headers and the
                // browser only reports "blocked by CORS". The inner exception holds the database's reason.
                Console.WriteLine($"Chat failed: {ex}");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"Processing the answer failed: {ex.GetBaseException().Message}");
            }
        }
    }
}
