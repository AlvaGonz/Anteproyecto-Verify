namespace Api.Controllers;

using System.Threading;
using System.Threading.Tasks;
using Application.Features.Auth.Commands.RegisterUser;
using Application.Features.Auth.Commands.LoginUser;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly RegisterUserCommandHandler _registerHandler;
    private readonly LoginUserCommandHandler _loginHandler;

    public AuthController(
        RegisterUserCommandHandler registerHandler,
        LoginUserCommandHandler loginHandler)
    {
        _registerHandler = registerHandler;
        _loginHandler = loginHandler;
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _loginHandler.Handle(command, cancellationToken);
        
        if (!result.IsSuccess)
        {
            return Unauthorized(new { Message = result.ErrorMessage });
        }

        return Ok(result.Data);
    }
}
