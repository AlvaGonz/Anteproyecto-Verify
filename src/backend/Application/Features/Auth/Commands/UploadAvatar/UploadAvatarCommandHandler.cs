namespace Application.Features.Auth.Commands.UploadAvatar;

using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Abstractions.Persistence;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;

public class UploadAvatarCommandHandler
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UploadAvatarCommandHandler(IUsuarioRepository usuarioRepository, IUnitOfWork unitOfWork)
    {
        _usuarioRepository = usuarioRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UploadAvatarResultDto> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await _usuarioRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null)
        {
            return new UploadAvatarResultDto(false, "Usuario no encontrado", null);
        }

        // Validate format (PNG, JPG, JPEG)
        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg" };
        var extension = Path.GetExtension(request.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return new UploadAvatarResultDto(false, "Formato de imagen no permitido. Use PNG, JPG o JPEG.", null);
        }

        // Generate unique name
        var uniqueFileName = $"{user.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
        
        // Ensure directory exists
        var avatarsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "storage", "avatars");
        if (!Directory.Exists(avatarsDirectory))
        {
            Directory.CreateDirectory(avatarsDirectory);
        }

        var filePath = Path.Combine(avatarsDirectory, uniqueFileName);

        // Resize the image to 300x300 px (maximum side) while maintaining aspect ratio
        using (var image = await Image.LoadAsync(request.FileStream, cancellationToken))
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(300, 300),
                Mode = ResizeMode.Max
            }));

            await image.SaveAsync(filePath, cancellationToken);
        }

        var publicUrl = $"/avatars/{uniqueFileName}"; // In a real app, this would be a configured URL prefix

        // Delete old avatar if it existed (and it's a local file)
        if (!string.IsNullOrEmpty(user.AvatarUrl) && user.AvatarUrl.StartsWith("/avatars/"))
        {
            var oldFileName = Path.GetFileName(user.AvatarUrl);
            var oldFilePath = Path.Combine(avatarsDirectory, oldFileName);
            if (File.Exists(oldFilePath))
            {
                File.Delete(oldFilePath);
            }
        }

        user.UpdateAvatarUrl(publicUrl);
        _usuarioRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UploadAvatarResultDto(true, null, publicUrl);
    }
}
