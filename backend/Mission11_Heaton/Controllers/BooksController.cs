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
        [FromQuery] string sortOrder = "asc",
        [FromQuery] string? category = null)
    {
        var query = _context.Books.AsQueryable();

        if (!string.IsNullOrEmpty(category))
            query = query.Where(b => b.Category == category);

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

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Books
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    // CREATE
    [HttpPost]
    public async Task<IActionResult> AddBook([FromBody] Book book)
    {
        _context.Books.Add(book);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBooks), new { id = book.BookId }, book);
    }

    // UPDATE
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
    {
        if (id != book.BookId)
            return BadRequest("ID mismatch");

        _context.Entry(book).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Books.Any(b => b.BookId == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FindAsync(id);
        if (book == null)
            return NotFound();

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}