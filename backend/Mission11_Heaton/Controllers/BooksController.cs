using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Mission11_Heaton.Data;

namespace Mission11.Server.Controllers;

[ApiController]
[Route("[controller]")]
public class BooksController : ControllerBase
{
    private BookstoreContext _context;

    public BooksController(BookstoreContext temp)
    {
        _context = temp;
    }

    [HttpGet]
    public async Task<IActionResult> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortOrder = "asc")
    {
        var query = _context.Books.AsQueryable();

        // Sort by title
        query = sortOrder == "desc"
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var totalCount = await query.CountAsync();

        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            books,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }
}