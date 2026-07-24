namespace Domain.Entities;

using System;
using Domain.Common;

public class ProyectoInteresado : EntityBase
{
    public Guid ProjectId { get; private set; }
    public Proyecto Project { get; private set; } = null!;

    public Guid CreatorId { get; private set; }
    public Usuario Creator { get; private set; } = null!;

    public Guid InterestedUserId { get; private set; }
    public Usuario InterestedUser { get; private set; } = null!;

    protected ProyectoInteresado() { } // For EF Core

    public ProyectoInteresado(Guid projectId, Guid creatorId, Guid interestedUserId)
    {
        ProjectId = projectId;
        CreatorId = creatorId;
        InterestedUserId = interestedUserId;
        CreatedAtUtc = DateTime.UtcNow;
    }
}
