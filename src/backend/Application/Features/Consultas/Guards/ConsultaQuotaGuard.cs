namespace Application.Features.Consultas.Guards;

using System;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using Domain.Entities;
using Domain.Policies;
using Application.Common.Exceptions;

public class ConsultaQuotaGuard
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ConsultaQuotaGuard(IUsuarioRepository usuarioRepository, IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task AssertAndIncrementAsync(Guid userId)
    {
        var user = await _usuarioRepository.GetByIdWithPlanAsync(userId);
        if (user == null)
            throw new UnauthorizedAccessException("User not found.");

        if (!SubscriptionTierPolicy.CanConsult(user))
            throw new QuotaExceededException(user.Plan?.NombrePlan ?? "None", "Consultas", "Consultas quota exceeded");

        await _usuarioRepository.IncrementarConsultaAsync(user.Id);
    }
}
