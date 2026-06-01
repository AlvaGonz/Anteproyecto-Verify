namespace Infrastructure.Persistence.Repositories;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.CorreoElectronico == email, cancellationToken);
    }

    public async Task AddAsync(Usuario usuario, CancellationToken cancellationToken = default)
    {
        await _context.Usuarios.AddAsync(usuario, cancellationToken);
    }

    public void Update(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
    }

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AnyAsync(u => u.CorreoElectronico.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<bool> ExistsByCedulaAsync(string cedula, CancellationToken cancellationToken = default)
    {
        var cleanCedula = cedula.Replace("-", "");
        return await _context.Usuarios
            .AnyAsync(u => u.Cedula != null && u.Cedula.Replace("-", "") == cleanCedula, cancellationToken);
    }
}
