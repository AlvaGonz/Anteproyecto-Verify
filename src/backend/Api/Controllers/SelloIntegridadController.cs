namespace Api.Controllers;

using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Application.Features.Sello.Commands.EmitirSello;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/proyectos/{proyectoId:guid}/sello-integridad")]
[Authorize]
public class SelloIntegridadController : ControllerBase
{
    private readonly EmitirSelloCommandHandler _emitirSelloHandler;
    private readonly ISelloIntegridadRepository _selloRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SelloIntegridadController(
        EmitirSelloCommandHandler emitirSelloHandler,
        ISelloIntegridadRepository selloRepository,
        IUnitOfWork unitOfWork)
    {
        _emitirSelloHandler = emitirSelloHandler;
        _selloRepository = selloRepository;
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<IActionResult> ObtenerSello(Guid proyectoId, CancellationToken ct)
    {
        var sello = await _selloRepository.GetByProyectoIdAsync(proyectoId, ct);
        if (sello == null)
        {
            return Ok(null);
        }

        sello.VerificarVigencia();
        if (sello.Estado != Domain.Enums.EstadoSello.Emitido)
        {
            return Ok(new
            {
                sello.Id,
                sello.ProyectoId,
                sello.CodigoSello,
                sello.Nombre,
                sello.Nivel,
                sello.UrlQr,
                sello.QrToken,
                sello.ContadorAccesos,
                sello.FechaEmisionUtc,
                sello.FechaExpiracionUtc,
                Estado = sello.Estado.ToString(),
                Vigente = false
            });
        }

        return Ok(new
        {
            sello.Id,
            sello.ProyectoId,
            sello.CodigoSello,
            sello.Nombre,
            sello.Nivel,
            sello.UrlQr,
            sello.QrToken,
            sello.ContadorAccesos,
            sello.FechaEmisionUtc,
            sello.FechaExpiracionUtc,
            Estado = sello.Estado.ToString(),
            Vigente = true
        });
    }

    [HttpPost]
    public async Task<IActionResult> EmitirSello(Guid proyectoId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? Guid.Empty.ToString());
        var command = new EmitirSelloCommand { ProyectoId = proyectoId, UsuarioId = userId };
        
        var result = await _emitirSelloHandler.Handle(command, ct);
        
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete]
    public async Task<IActionResult> RevocarSello(Guid proyectoId, CancellationToken ct)
    {
        var sello = await _selloRepository.GetByProyectoIdAsync(proyectoId, ct);
        if (sello == null)
        {
            return NotFound(new { Mensaje = "No existe un sello para este proyecto." });
        }

        if (sello.Estado == Domain.Enums.EstadoSello.Revocado)
        {
            return BadRequest(new { Mensaje = "El sello ya está revocado." });
        }

        sello.Revocar();
        _selloRepository.Update(sello);
        await _unitOfWork.SaveChangesAsync(ct);

        return Ok(new { Mensaje = "Sello revocado exitosamente.", CodigoSello = sello.CodigoSello });
    }
}
