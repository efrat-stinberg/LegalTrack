using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TaxManagerServer.Core.Services
{
    public interface IPdfTextExtractor
    {
        Task<string> ExtractTextAsync(Stream pdfStream);

    }
}
