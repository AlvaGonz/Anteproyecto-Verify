namespace Api.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.RegisterUser;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RegisterUserCommandHandler _registerHandler;

    public AuthController(RegisterUserCommandHandler registerHandler)
    {
        _registerHandler = registerHandler;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _registerHandler.Handle(command, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return BadRequest(new { Message = result.ErrorMessage });
        }

        return Ok(new 
        { 
            Message = "Usuario registrado exitosamente.", 
            UsuarioId = result.UsuarioId 
        });
    }
}
