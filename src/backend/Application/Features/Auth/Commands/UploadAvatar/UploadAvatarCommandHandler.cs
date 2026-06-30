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

    public UploadAvatarCommandHandler(
        IUsuarioRepository usuarioRepository, 
        IUnitOfWork unitOfWork)
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
        
        string base64Avatar;

        // Resize the image to 300x300 px (maximum side) while maintaining aspect ratio
        using (var image = await Image.LoadAsync(request.FileStream, cancellationToken))
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(300, 300),
                Mode = ResizeMode.Max
            }));

            using var memoryStream = new MemoryStream();
            
            if (extension == ".png")
                await image.SaveAsync(memoryStream, new SixLabors.ImageSharp.Formats.Png.PngEncoder(), cancellationToken);
            else
                await image.SaveAsync(memoryStream, new SixLabors.ImageSharp.Formats.Jpeg.JpegEncoder(), cancellationToken);
            
            var bytes = memoryStream.ToArray();
            var base64String = Convert.ToBase64String(bytes);
            var contentType = extension == ".png" ? "image/png" : "image/jpeg";
            base64Avatar = $"data:{contentType};base64,{base64String}";
        }

        user.UpdateAvatarUrl(base64Avatar);
        _usuarioRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new UploadAvatarResultDto(true, null, base64Avatar);
    }
}
