namespace Infrastructure.Email;

public static class EmailTemplates
{
    private static string BuildEmailWrapper(string title, string contentHtml)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #F4F6F9;
            margin: 0;
            padding: 0;
            color: #333333;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background: #FFFFFF;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }}
        .header {{
            background-color: #1E3A5F; /* Azul Principal */
            padding: 30px 20px;
            text-align: center;
            border-bottom: 4px solid #E87B2B; /* Naranja Acento */
        }}
        .header h1 {{
            color: #FFFFFF;
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }}
        .content {{
            padding: 40px 30px;
            line-height: 1.6;
        }}
        .footer {{
            background-color: #F8FAFC;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748B;
            border-top: 1px solid #E2E8F0;
        }}
        .btn {{
            display: inline-block;
            background-color: #E87B2B; /* Naranja */
            color: #FFFFFF !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
            box-shadow: 0 2px 5px rgba(232, 123, 43, 0.3);
        }}
        .btn:hover {{
            background-color: #D36C22;
        }}
        .info-box {{
            background-color: #F8FAFC;
            border-left: 4px solid #1E3A5F;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }}
        .badge-verified {{
            display: inline-block;
            background-color: #DCFCE7;
            color: #15803D;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 13px;
        }}
        .badge-rejected {{
            display: inline-block;
            background-color: #FEE2E2;
            color: #B91C1C;
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 13px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>VeriFinca</h1>
        </div>
        <div class=""content"">
            {contentHtml}
        </div>
        <div class=""footer"">
            <p>Este es un correo automático enviado por VeriFinca. Por favor no respondas a este mensaje.</p>
            <p>&copy; {System.DateTime.Now.Year} VeriFinca. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>";
    }

    public static string GetAccountVerificationEmail(string userName, string verificationToken)
    {
        // For testing we will hardcode localhost URL
        string verificationUrl = $"http://localhost:5000/api/auth/verify?token={verificationToken}";
        
        string contentHtml = $@"
            <h2>¡Hola, {userName}!</h2>
            <p>Gracias por registrarte en <strong>VeriFinca</strong>, la plataforma líder de verificación de expedientes e inmuebles.</p>
            <p>Para completar tu registro y activar tu cuenta, por favor confirma tu dirección de correo electrónico haciendo clic en el botón de abajo:</p>
            
            <div style=""text-align: center;"">
                <a href=""{verificationUrl}"" class=""btn"">Verificar Mi Cuenta</a>
            </div>

            <p style=""margin-top: 30px; font-size: 13px; color: #64748B;"">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                <a href=""{verificationUrl}"" style=""color: #E87B2B;"">{verificationUrl}</a>
            </p>
        ";

        return BuildEmailWrapper("Verificación de Cuenta - VeriFinca", contentHtml);
    }

    public static string GetDocumentUploadConfirmationEmail(string userName, string projectName, string documentType)
    {
        string contentHtml = $@"
            <h2>Confirmación de Recepción de Documento</h2>
            <p>Estimado/a <strong>{userName}</strong>,</p>
            <p>Le confirmamos que hemos recibido satisfactoriamente un nuevo documento adjunto a su proyecto:</p>
            
            <div class=""info-box"">
                <strong>Proyecto:</strong> {projectName}<br>
                <strong>Tipo de Documento:</strong> {documentType}<br>
                <strong>Fecha de Recepción:</strong> {System.DateTime.Now:dd/MM/yyyy HH:mm}
            </div>

            <p>Nuestro equipo y motores automatizados comenzarán el análisis de integridad de manera inmediata. Se le notificará a través de esta vía una vez cambie el estatus del documento.</p>
            
            <p>Atentamente,<br>El Equipo de VeriFinca</p>
        ";

        return BuildEmailWrapper("Documento Recibido - VeriFinca", contentHtml);
    }

    public static string GetDocumentStatusUpdateEmail(string userName, string projectName, string documentType, string status, string? rejectionReason)
    {
        bool isVerified = status.Equals("verificado", System.StringComparison.OrdinalIgnoreCase);
        string statusBadge = isVerified 
            ? @"<span class=""badge-verified"">Verificado / Aprobado</span>" 
            : @"<span class=""badge-rejected"">Rechazado / Requiere Atención</span>";

        string statusDetails = isVerified 
            ? @"<p>Su documento cumple con todos los estándares y requerimientos reglamentarios para este anteproyecto.</p>"
            : $@"<p>Lamentablemente, el documento no pudo ser validado exitosamente debido a los siguientes motivos:</p>
                 <div class=""info-box"" style=""border-left-color: #B91C1C; background-color: #FEF2F2;"">
                     <strong>Motivo de Rechazo:</strong><br>
                     {rejectionReason}
                 </div>
                 <p>Por favor, acceda a la plataforma, cargue una versión corregida para continuar con la validación de su proyecto.</p>";

        string contentHtml = $@"
            <h2>Actualización de Estatus de Documento</h2>
            <p>Estimado/a <strong>{userName}</strong>,</p>
            <p>Se ha completado el análisis del documento en su proyecto:</p>
            
            <div class=""info-box"">
                <strong>Proyecto:</strong> {projectName}<br>
                <strong>Tipo de Documento:</strong> {documentType}<br>
                <strong>Nuevo Estatus:</strong> {statusBadge}
            </div>

            {statusDetails}

            <div style=""text-align: center; margin-top: 30px;"">
                <a href=""http://localhost:5173/dashboard"" class=""btn"">Ir al Panel de Control</a>
            </div>
        ";

        return BuildEmailWrapper("Estatus de Documento Actualizado - VeriFinca", contentHtml);
    }

    public static string GetProjectCreatedEmail(string ownerName, string projectName, string projectId)
    {
        string projectUrl = $"http://localhost:5173/projects/{projectId}";
        
        string contentHtml = $@"
            <h2>¡Tu Proyecto ha sido Creado!</h2>
            <p>Estimado/a <strong>{ownerName}</strong>,</p>
            <p>Nos complace informarte que tu proyecto ha sido registrado con éxito en VeriFinca y está listo para comenzar el proceso de certificación.</p>
            
            <div class=""info-box"">
                <strong>Nombre del Proyecto:</strong> {projectName}<br>
                <strong>ID Único:</strong> {projectId}<br>
                <strong>Fecha de Creación:</strong> {System.DateTime.Now:dd/MM/yyyy}
            </div>

            <p>El siguiente paso es cargar los documentos obligatorios requeridos para que nuestros validadores verifiquen la autenticidad geográfica y legal de la propiedad.</p>

            <div style=""text-align: center;"">
                <a href=""{projectUrl}"" class=""btn"">Ver Proyecto e Iniciar Carga</a>
            </div>
        ";

        return BuildEmailWrapper("Proyecto Creado - VeriFinca", contentHtml);
    }
}
