using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using TaxManager.Core.Models;
using TaxManagerServer.Core.DTOs;
using TaxManagerServer.Core.Models;

namespace TaxManagerServer.Core
{
    public class Mapping : Profile
    {
        public Mapping() { 

            CreateMap<User, UserDTO>().ReverseMap(); ;

            CreateMap<Document, DocumentDTO>().ReverseMap(); ;

            CreateMap<Folder, FolderDTO>()
                .ForMember(d => d.ClientName, o => o.MapFrom(f => f.Client != null ? f.Client.FullName : null))
                .ReverseMap();

            CreateMap<ChatMessage, ChatMessageResponseDto>().ReverseMap(); 

            CreateMap<Group, GroupDto>().ReverseMap();

        }
    }
}
