namespace Infrastructure.Email;

public static class EmailTemplates
{
    // ── Brand tokens ────────────────────────────────────────────────────────
    private const string Navy       = "#1E3A5F";
    private const string NavyDark   = "#152D4A";
    private const string Orange     = "#E87B2B";
    private const string OrangeDark = "#D36C22";
    private const string BgPage     = "#F0F4F8";
    private const string BgCard     = "#FFFFFF";
    private const string BgMuted    = "#F8FAFC";
    private const string TextBody   = "#2D3748";
    private const string TextMuted  = "#64748B";
    private const string BorderLine = "#E2E8F0";

    // ── Logo Image (ISOTIPO.png) ────────────────────────────────────────────────
    // Nota: Cambiar http://localhost:3000 por el dominio de producción cuando se despliegue.
    private const string LogoImg = @"
        <img src=""http://localhost:3000/brand/isotipo/ISOTIPO.png"" width=""36"" height=""36"" alt=""VeriFinca Logo"" style=""display:inline-block;vertical-align:middle;border-radius:8px;background-color:#FFFFFF;padding:4px;box-sizing:border-box;"" />";

    // ── Wrapper ──────────────────────────────────────────────────────────────
    private static string BuildEmailWrapper(string title, string preHeader, string contentHtml)
    {
        return $@"<!DOCTYPE html>
<html lang=""es"" xmlns=""http://www.w3.org/1999/xhtml"" xmlns:v=""urn:schemas-microsoft-com:vml"" xmlns:o=""urn:schemas-microsoft-com:office:office"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <meta http-equiv=""X-UA-Compatible"" content=""IE=edge"">
  <meta name=""x-apple-disable-message-reformatting"">
  <title>{title}</title>
  <!--[if !mso]><!-->
  <link href=""https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700;800&display=swap"" rel=""stylesheet"">
  <!--<![endif]-->
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type=""text/css"">
    body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
    table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }}
    img {{ -ms-interpolation-mode: bicubic; border: 0; line-height: 100%; outline: none; text-decoration: none; }}
    body {{ margin: 0 !important; padding: 0 !important; background-color: {BgPage}; }}
    a[x-apple-data-detectors] {{ color: inherit !important; text-decoration: none !important; }}
    @media only screen and (max-width: 620px) {{
      .email-container {{ width: 100% !important; margin: 0 auto !important; }}
      .fluid {{ max-width: 100% !important; height: auto !important; }}
      .stack-column, .stack-column-center {{ display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }}
      .btn-mobile {{ width: 100% !important; text-align: center !important; }}
      .pd-mobile {{ padding-left: 20px !important; padding-right: 20px !important; }}
    }}
  </style>
</head>
<body style=""margin:0;padding:0;background-color:{BgPage};"">

<!-- Pre-header (invisible preview text) -->
<div style=""display:none;font-size:1px;color:{BgPage};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;"">
  {preHeader}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</div>

<table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"" style=""background-color:{BgPage};"">
<tr><td style=""padding:32px 16px;"">

  <!-- Email card -->
  <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""600"" class=""email-container"" style=""margin:0 auto;background:{BgCard};border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(30,58,95,0.10);"">

    <!-- Header -->
    <tr>
      <td style=""background-color:{Navy};padding:0;"">
        <!-- Top accent bar -->
        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
          <tr>
            <td style=""background-color:{Orange};height:4px;font-size:0;line-height:0;"">&nbsp;</td>
          </tr>
        </table>
        <!-- Logo row -->
        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
          <tr>
            <td style=""padding:28px 32px 24px 32px;"">
              <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"">
                <tr>
                  <td style=""padding-right:12px;vertical-align:middle;"">
                    {LogoImg}
                  </td>
                  <td style=""vertical-align:middle;"">
                    <span style=""font-family:'Manrope',Arial,sans-serif;font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:1px;line-height:1;"">Veri<span style=""color:{Orange};"">Finca</span></span>
                    <div style=""font-family:'Inter',Arial,sans-serif;font-size:11px;color:rgba(255,255,255,0.55);letter-spacing:2px;text-transform:uppercase;margin-top:3px;"">Plataforma de Certificación</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Content area -->
    <tr>
      <td class=""pd-mobile"" style=""padding:40px 40px 32px 40px;font-family:'Inter',Arial,sans-serif;font-size:15px;line-height:1.7;color:{TextBody};"">
        {contentHtml}
      </td>
    </tr>

    <!-- Divider -->
    <tr>
      <td style=""padding:0 40px;"">
        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
          <tr><td style=""border-top:1px solid {BorderLine};font-size:0;height:0;"">&nbsp;</td></tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style=""padding:24px 40px 28px 40px;background-color:{BgMuted};border-radius:0 0 12px 12px;"">
        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
          <tr>
            <td style=""font-family:'Inter',Arial,sans-serif;font-size:12px;color:{TextMuted};text-align:center;line-height:1.6;"">
              <p style=""margin:0 0 6px 0;"">Este es un correo automático de <strong>VeriFinca</strong>. Por favor no respondas a este mensaje.</p>
              <p style=""margin:0;"">
                <span style=""color:{BorderLine};"">|</span>
                &copy; {System.DateTime.Now.Year} VeriFinca &mdash; Todos los derechos reservados
                <span style=""color:{BorderLine};"">|</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  <!-- /Email card -->

</td></tr>
</table>

</body>
</html>";
    }

    // ── Shared component: info card ──────────────────────────────────────────
    private static string InfoCard(string innerHtml, string? accentColor = null)
    {
        string accent = accentColor ?? Navy;
        return $@"
        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"" style=""margin:24px 0;"">
          <tr>
            <td style=""background-color:{BgMuted};border:1px solid {BorderLine};border-radius:8px;padding:20px 24px;font-family:'Inter',Arial,sans-serif;font-size:14px;line-height:1.7;color:{TextBody};"">
              <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" width=""100%"">
                <tr>
                  <td width=""4"" style=""background-color:{accent};border-radius:4px;font-size:0;"">&nbsp;</td>
                  <td style=""padding-left:16px;"">{innerHtml}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>";
    }

    // ── Shared component: CTA button ─────────────────────────────────────────
    private static string CtaButton(string href, string label)
    {
        return $@"
        <table role=""presentation"" cellspacing=""0"" cellpadding=""0"" border=""0"" style=""margin:32px auto 8px auto;"">
          <tr>
            <td style=""border-radius:6px;background-color:{Orange};"">
              <!--[if mso]><i style=""mso-font-width:40px;mso-text-raise:12px;"" hidden>&nbsp; </i><![endif]-->
              <a href=""{href}"" target=""_blank"" style=""display:inline-block;padding:14px 36px;font-family:'Inter',Arial,sans-serif;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:6px;letter-spacing:0.3px;"">{label}</a>
              <!--[if mso]><i style=""mso-font-width:40px;"" hidden>&nbsp; </i><![endif]-->
            </td>
          </tr>
        </table>";
    }

    // ── Shared component: badge ──────────────────────────────────────────────
    private static string Badge(bool isPositive, string label)
    {
        string bg    = isPositive ? "#DCFCE7" : "#FEE2E2";
        string color = isPositive ? "#15803D" : "#B91C1C";
        string dot   = isPositive ? "●" : "●";
        string className = isPositive ? "badge-verified" : "badge-rejected";
        return $@"<span class=""{className}"" style=""display:inline-block;background-color:{bg};color:{color};padding:4px 12px;border-radius:20px;font-family:'Inter',Arial,sans-serif;font-weight:700;font-size:13px;letter-spacing:0.2px;"">{dot}&nbsp; {label}</span>";
    }

    // ════════════════════════════════════════════════════════════════════════
    // 1. Account Verification
    // ════════════════════════════════════════════════════════════════════════
    public static string GetAccountVerificationEmail(string userName, string verificationToken, string? returnUrl = null)
    {
        string verificationUrl = $"http://localhost:3000/#/verify-email?token={verificationToken}";
        if (!string.IsNullOrEmpty(returnUrl))
        {
            verificationUrl += $"&returnUrl={System.Uri.EscapeDataString(returnUrl)}";
        }

        string content = $@"
            <h2 style=""margin:0 0 8px 0;font-family:'Manrope',Arial,sans-serif;font-size:22px;font-weight:700;color:{Navy};"">¡Hola, {userName}! 👋</h2>
            <p style=""margin:0 0 16px 0;font-size:15px;color:{TextMuted};"">Un paso más para activar tu cuenta</p>

            <p style=""margin:0 0 16px 0;"">Gracias por registrarte en <strong>VeriFinca</strong>, la plataforma de verificación de expedientes e inmuebles de la República Dominicana. Para activar tu cuenta confirma tu correo electrónico:</p>

            <div style=""text-align:center;"">
                {CtaButton(verificationUrl, "Verificar Mi Cuenta")}
            </div>

            <p style=""margin:28px 0 8px 0;font-size:13px;color:{TextMuted};"">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style=""margin:0;font-size:12px;word-break:break-all;""><a href=""{verificationUrl}"" style=""color:{Orange};text-decoration:none;"">{verificationUrl}</a></p>

            <p style=""margin:28px 0 0 0;font-size:13px;color:{TextMuted};"">Si no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>";

        return BuildEmailWrapper(
            "Verifica tu cuenta — VeriFinca",
            "Confirma tu dirección de correo para activar tu cuenta en VeriFinca.",
            content);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 2. Document Upload Confirmation
    // ════════════════════════════════════════════════════════════════════════
    public static string GetDocumentUploadConfirmationEmail(string userName, string projectName, string documentType)
    {
        string infoInner = $@"
            <strong style=""color:{Navy};"">Proyecto</strong><br>
            <span style=""color:{TextBody};"">{projectName}</span><br><br>
            <strong style=""color:{Navy};"">Tipo de Documento</strong><br>
            <span style=""color:{TextBody};""> {documentType}</span><br><br>
            <strong style=""color:{Navy};"">Fecha de Recepción</strong><br>
            <span style=""color:{TextMuted};""> {System.DateTime.Now:dd/MM/yyyy HH:mm}</span>";

        string content = $@"
            <h2 style=""margin:0 0 4px 0;font-family:'Manrope',Arial,sans-serif;font-size:22px;font-weight:700;color:{Navy};"">Documento Recibido</h2>
            <p style=""margin:0 0 24px 0;font-size:15px;color:{TextMuted};"">Confirmación de recepción</p>

            <p style=""margin:0 0 16px 0;"">Estimado/a <strong>{userName}</strong>,</p>
            <p style=""margin:0 0 16px 0;"">Hemos recibido satisfactoriamente el documento adjunto a su proyecto en VeriFinca:</p>

            {InfoCard(infoInner)}

            <p style=""margin:0 0 0 0;"">Nuestros motores de análisis comenzarán la validación de inmediato. Recibirá una notificación en cuanto cambie el estatus del documento.</p>

            <p style=""margin:28px 0 0 0;"">Atentamente,<br><strong>El Equipo de VeriFinca</strong></p>";

        return BuildEmailWrapper(
            "Documento Recibido — VeriFinca",
            $"Recibimos el documento '{documentType}' para el proyecto {projectName}.",
            content);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 3. Document Status Update
    // ════════════════════════════════════════════════════════════════════════
    public static string GetDocumentStatusUpdateEmail(string userName, string projectName, string documentType, string status, string? rejectionReason)
    {
        bool isVerified   = status.Equals("verificado", System.StringComparison.OrdinalIgnoreCase);
        string badgeHtml  = isVerified
            ? Badge(true,  "Verificado / Aprobado")
            : Badge(false, "Rechazado / Requiere Atención");

        string infoInner = $@"
            <strong style=""color:{Navy};"">Proyecto</strong><br>
            <span style=""color:{TextBody};"">{projectName}</span><br><br>
            <strong style=""color:{Navy};"">Tipo de Documento</strong><br>
            <span style=""color:{TextBody};""> {documentType}</span><br><br>
            <strong style=""color:{Navy};"">Nuevo Estatus</strong><br>
            {badgeHtml}";

        string statusSection = isVerified
            ? $@"<p style=""margin:16px 0 0 0;"">Su documento cumple con todos los estándares y requerimientos reglamentarios para este anteproyecto. Puede continuar con las siguientes etapas del proceso.</p>"
            : $@"<p style=""margin:16px 0 8px 0;"">Lamentablemente, el documento no pudo ser validado por los siguientes motivos:</p>
                 {InfoCard($"<strong>Motivo de Rechazo:</strong><br>{rejectionReason}", "#B91C1C")}
                 <p style=""margin:0;"">Por favor acceda a la plataforma y cargue una versión corregida para continuar con la validación.</p>";

        string content = $@"
            <h2 style=""margin:0 0 4px 0;font-family:'Manrope',Arial,sans-serif;font-size:22px;font-weight:700;color:{Navy};"">Actualización de Estatus</h2>
            <p style=""margin:0 0 24px 0;font-size:15px;color:{TextMuted};"">Resultado del análisis de documento</p>

            <p style=""margin:0 0 16px 0;"">Estimado/a <strong>{userName}</strong>,</p>
            <p style=""margin:0 0 16px 0;"">Se ha completado el análisis de su documento:</p>

            {InfoCard(infoInner)}

            {statusSection}

            <div style=""text-align:center;"">
                {CtaButton("http://localhost:3000/dashboard", "Ir al Panel de Control")}
            </div>";

        return BuildEmailWrapper(
            "Estatus de Documento Actualizado — VeriFinca",
            isVerified
                ? $"Tu documento '{documentType}' ha sido aprobado."
                : $"Tu documento '{documentType}' requiere atención.",
            content);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 4. Project Created
    // ════════════════════════════════════════════════════════════════════════
    public static string GetProjectCreatedEmail(string ownerName, string projectName, string projectId)
    {
        string projectUrl = $"http://localhost:3000/projects/{projectId}";

        string infoInner = $@"
            <strong style=""color:{Navy};"">Nombre del Proyecto</strong><br>
            <span style=""color:{TextBody};"">{projectName}</span><br><br>
            <strong style=""color:{Navy};"">ID Único</strong><br>
            <span style=""font-family:'Courier New',Courier,monospace;font-size:13px;color:{TextMuted};background:#EEF2F7;padding:2px 6px;border-radius:4px;"">{projectId}</span><br><br>
            <strong style=""color:{Navy};"">Fecha de Creación</strong><br>
            <span style=""color:{TextMuted};""> {System.DateTime.Now:dd/MM/yyyy}</span>";

        string content = $@"
            <h2 style=""margin:0 0 4px 0;font-family:'Manrope',Arial,sans-serif;font-size:22px;font-weight:700;color:{Navy};"">¡Proyecto Creado!</h2>
            <p style=""margin:0 0 24px 0;font-size:15px;color:{TextMuted};"">Todo listo para comenzar la certificación</p>

            <p style=""margin:0 0 16px 0;"">Estimado/a <strong>{ownerName}</strong>,</p>
            <p style=""margin:0 0 16px 0;"">Tu proyecto ha sido registrado con éxito en VeriFinca y está listo para iniciar el proceso de certificación.</p>

            {InfoCard(infoInner)}

            <p style=""margin:0 0 24px 0;"">El siguiente paso es cargar los <strong>documentos obligatorios</strong> para que nuestros validadores verifiquen la autenticidad geográfica y legal de la propiedad.</p>

            <div style=""text-align:center;"">
                {CtaButton(projectUrl, "Ver Proyecto e Iniciar Carga")}
            </div>";

        return BuildEmailWrapper(
            "Proyecto Creado — VeriFinca",
            $"Tu proyecto '{projectName}' fue registrado exitosamente en VeriFinca.",
            content);
    }

    // ════════════════════════════════════════════════════════════════════════
    // 5. Subscription Activated
    // ════════════════════════════════════════════════════════════════════════
    public static string GetSubscriptionActivatedEmail(string userName, string planName, decimal planPrice)
    {
        string billingUrl = $"http://localhost:3000/#/settings/subscription";

        string infoInner = $@"
            <strong style=""color:{Navy};"">Plan Contratado</strong><br>
            <span style=""color:{TextBody};"">{planName}</span><br><br>
            <strong style=""color:{Navy};"">Precio</strong><br>
            <span style=""color:{TextBody};"">${planPrice:0.00}</span><br><br>
            <strong style=""color:{Navy};"">Fecha de Activación</strong><br>
            <span style=""color:{TextMuted};""> {System.DateTime.Now:dd/MM/yyyy}</span>";

        string content = $@"
            <h2 style=""margin:0 0 4px 0;font-family:'Manrope',Arial,sans-serif;font-size:22px;font-weight:700;color:{Navy};"">¡Suscripción Activada!</h2>
            <p style=""margin:0 0 24px 0;font-size:15px;color:{TextMuted};"">Bienvenido a tu nuevo plan</p>

            <p style=""margin:0 0 16px 0;"">Estimado/a <strong>{userName}</strong>,</p>
            <p style=""margin:0 0 16px 0;"">¡Felicidades! Has contratado exitosamente tu nuevo nivel de suscripción en VeriFinca.</p>

            {InfoCard(infoInner)}

            <p style=""margin:0 0 24px 0;"">Ya puedes disfrutar de todos los beneficios y herramientas de tu nuevo plan. Puedes gestionar tu suscripción y ver tus recibos en la sección de facturación.</p>

            <div style=""text-align:center;"">
                {CtaButton(billingUrl, "Ir a Facturación")}
            </div>";

        return BuildEmailWrapper(
            "Suscripción Activada — VeriFinca",
            $"Tu plan '{planName}' ha sido activado exitosamente.",
            content);
    }
}


