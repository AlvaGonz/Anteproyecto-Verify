import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      documentList: {
        title: 'Documentación Legal',
        updatedAt: 'Actualizado: Sep 2024',
      },
      projectsList: {
        heroSub: 'Portal de Transparencia VeriFinca',
        heroTitleHighlight: 'Inversión Inmobiliaria',
        dirTitle: 'Directorio de Proyectos',
        dirDesc: 'Explore proyectos que han pasado por nuestro riguroso proceso de validación.',
        filterAll: 'TODOS LOS ESTATUS',
        filterCertified: 'CERTIFICADOS',
        filterProcessing: 'EN PROCESO',
        integrityValidated: 'Integridad Validada',
        emptyTitle: 'No se encontraron proyectos',
        emptyDesc: 'No hay registros que coincidan con su búsqueda o filtros actuales.',
        ctaDiligence: 'Debida Diligencia Integral',
        ctaBlockchain: 'Sellado Blockchain Inmutable',
        ctaMonitoring: 'Monitoreo 24/7 de Estatus',
      },
      documentUpload: {
        uploadFile: 'Subir archivo',
        selectCertificate: 'Seleccionar Certificado',
        dragDropPrompt: 'Arrastre su archivo PDF aquí, o haga clic para buscar',
        onlyOfficialPdf: 'Solo se admiten documentos PDF oficiales firmados',
        fileReady: 'Archivo Listo',
        changeFile: 'Cambiar archivo',
        metadata: 'Metadatos del Documento',
        category: 'Categoría de Validación',
        jurisdiction: 'Jurisdicción de Origen',
        issueDate: 'Fecha de Emisión',
        keyObservations: 'Observaciones Clave',
        additionalDetails: 'Detalles adicionales...',
        processing: 'Procesando...',
        sealBtn: 'Sellar con VeriFinca',
      },
      hero: {
        titlePrefix: 'Seguridad técnica y ',
        titleHighlight: 'jurídica',
        titleSuffix: ' en un clic',
        desc: 'La plataforma líder en validación de proyectos inmobiliarios en RD. Conectamos datos institucionales en tiempo real para inversores y desarrolladores.',
        placeholder: 'Nombre del proyecto o código de radicación...',
        searchBtn: 'Consultar Ahora',
        valExpress: 'Validación Express',
        connNotarial: 'Conexión Notarial',
        dataProcuraduria: 'Data Procuraduría',
      },
      legal: {
        complianceCenter: "Compliance Center", complianceVersion: "v2.4 (RD Compliant)",
        nav: {
          terms: "Términos de Uso",
          privacy: "Política de Privacidad",
          ley172: "Ley 172-13",
          dataTreatment: "Tratamiento de Datos",
          cookies: "Uso de Cookies",
          disclaimer: "Descargos",
          billing: "Facturación",
          refunds: "Reembolsos",
          stripeProcessor: "Procesador de Pagos",
          paymentData: "Datos de Pago",
          acceptableUse: "Uso Aceptable",
          downloadPdf: "Download PDF"
        },
        header: {
          tag: "MARCO LEGAL",
          title: "Términos, Privacidad y Cumplimiento",
          subtitle: "Operamos bajo el marco legal de la República Dominicana, asegurando la transparencia y la protección de sus datos personales en cada transacción.",
          lastUpdate: "Última actualización: Junio 2026"
        },
        terms: {
          title: "Términos de Uso",
          scopeTitle: "Alcance del servicio",
          scopeDesc: "VeriFinca proporciona herramientas para la verificación y gestión de propiedades inmobiliarias. El uso de esta plataforma constituye la aceptación de estos términos en su totalidad. Los servicios ofrecidos están diseñados para facilitar la debida diligencia, pero no reemplazan el asesoramiento legal profesional.",
          restrictTitle: "Restricciones de uso",
          restrictList: {
            scraping: "Prohibida la extracción automatizada de datos (scraping) sin autorización expresa.",
            illegal: "No se permite el uso de la plataforma para fines ilícitos o fraudulentos.",
            accounts: "Las cuentas son personales e intransferibles; compartir credenciales resultará en suspensión inmediata."
          }
        },
        privacy: {
          title: "Política de Privacidad",
          collectTitle: "Datos que recopilamos",
          collectDesc: "Recopilamos información personal necesaria para la prestación del servicio, incluyendo: nombre completo, cédula de identidad, información de contacto y datos relacionados con las propiedades consultadas. Esta información se almacena de forma encriptada y segura.",
          retentionTitle: "Retención de datos",
          retentionDesc: "De conformidad con la Ley 172-13 sobre Protección de Datos de Carácter Personal, los datos crediticios o de historial generados a través de consultas a burós de crédito (ej. TransUnion) se retienen únicamente por el período establecido por la ley y se purgan automáticamente una vez expirado dicho plazo o cuando se revoca el consentimiento del titular."
        },
        ley172: {
          title: "Cumplimiento Ley 172-13",
          statusTitle: "Estado de Cumplimiento",
          statusSubtitle: "Métricas de alineación con el marco normativo dominicano.",
          consent: "Consentimiento",
          consentDesc: "Captura explícita requerida.",
          purpose: "Propósito",
          purposeDesc: "Uso limitado al fin declarado.",
          access: "Acceso",
          accessDesc: "Derecho de consulta garantizado.",
          purge: "Purga",
          purgeDesc: "Eliminación tras período legal.",
          footer: "* Plataforma registrada y certificada ante el Instituto Nacional de Protección de los Derechos del Consumidor (Pro Consumidor) y alineada con las normativas del INPD."
        },
        dataTreatment: {
          title: "Tratamiento de Datos",
          legalBaseTitle: "Base legal",
          legalBaseDesc: "El tratamiento de sus datos se basa en el consentimiento libre, previo, expreso e informado, así como en la necesidad contractual para la prestación de los servicios solicitados a VeriFinca.",
          rightsTitle: "Derechos del titular",
          accessDesc: "Conocer qué datos suyos reposan en nuestras bases de datos.",
          rectifyTitle: "Rectificación",
          rectifyDesc: "Actualizar o corregir información inexacta o desactualizada.",
          cancelTitle: "Cancelación",
          cancelDesc: "Solicitar la eliminación de sus datos cuando proceda legalmente.",
          button: "Ejercer mis derechos"
        },
        cookies: {
          title: "Uso de Cookies",
          desc: "Utilizamos cookies estrictamente necesarias para el funcionamiento seguro de la plataforma, así como cookies analíticas para mejorar la experiencia del usuario. A continuación, detallamos las cookies principales utilizadas:",
          table: {
            name: "Nombre",
            purpose: "Propósito",
            duration: "Duración",
            session: "Sesión",
            sessionTokenDesc: "Mantiene la sesión de usuario activa y segura.",
            csrfTokenDesc: "Previene ataques de falsificación de peticiones en sitios cruzados.",
            gaDesc: "Analítica de uso de la plataforma (Google Analytics).",
            gaDuration: "2 años",
            consentRecordDesc: "Almacena las preferencias de privacidad del usuario.",
            consentRecordDuration: "1 año"
          }
        },
        disclaimer: {
          title: "Descargo de Responsabilidad",
          warrantyTitle: "Limitación de Garantía Inmobiliaria",
          warrantyDesc: "La información proporcionada por VeriFinca sobre estados jurídicos de propiedades, cargas, gravámenes o historiales de propietarios se basa en registros públicos y bases de datos de terceros. Aunque nos esforzamos por mantener la precisión, VeriFinca no garantiza la exactitud absoluta de estos datos ni asume responsabilidad por decisiones financieras, legales o inmobiliarias tomadas exclusivamente basándose en los reportes de la plataforma. Se recomienda siempre la verificación oficial ante la Jurisdicción Inmobiliaria y la consulta con un abogado especializado."
        },
        billing: {
          title: "Facturación y Suscripciones",
          cycleTitle: "Ciclo de Facturación",
          cycleDesc: "El cargo se realiza el mismo día de cada ciclo (mensual o anual) en la moneda seleccionada (DOP o USD) mediante tarjeta de crédito/débito procesada por Stripe.",
          autoDebitTitle: "Autorización de Débito Automático",
          autoDebitDesc: "Al suscribirte, autorizas a VeriFinca a cargar tu método de pago seleccionado automáticamente en cada ciclo de facturación hasta que canceles. Puedes revocar esta autorización en cualquier momento desde tu panel de usuario.",
          priceChangeTitle: "Cambios de Precio",
          priceChangeDesc: "Cualquier modificación en los precios será notificada con un mínimo de 30 días de anticipación por correo electrónico. Si no cancelas antes de la fecha de vigencia, el nuevo precio se aplicará en el siguiente ciclo.",
          prorationTitle: "Cambio de Plan (Prorratio)",
          prorationDesc: "Si cambias de plan durante el ciclo activo, el ajuste se calcula de forma proporcional (prorratio) sobre los días restantes. Los créditos se aplican automáticamente en la siguiente factura.",
          trialTitle: "Período de Prueba",
          trialDesc: "Si aplica un período de prueba gratuito, su duración se indica al momento de la suscripción. Al vencer, inicia automáticamente el cobro del plan seleccionado. No se requiere acción adicional.",
        },
        refunds: {
          title: "Política de Reembolsos y Cancelaciones",
          finalTitle: "Pagos Finales",
          finalDesc: "Los pagos procesados son finales salvo error demostrable de facturación. VeriFinca no está obligado a emitir reembolsos por períodos ya facturados y consumidos.",
          windowTitle: "Ventana de Reembolso",
          windowDesc: "Se podrá solicitar reembolso total dentro de las primeras 48 horas de la suscripción inicial, si no se ha realizado ninguna consulta durante ese período. Solicitar a soporte@verifinca.do.",
          cancelTitle: "Cancelación",
          cancelDesc: "Puedes cancelar tu suscripción en cualquier momento desde Configuración → Suscripción → Cancelar. No se aplican penalizaciones ni cargos adicionales por cancelación.",
          postCancelTitle: "Acceso Post-Cancelación",
          postCancelDesc: "El servicio permanece activo hasta el fin del período ya pagado. Al vencer, el acceso se revierte automáticamente al plan gratuito.",
          annualPenaltyTitle: "Penalización por Cancelación Anticipada — Plan Anual",
          annualPenaltyDesc: "Si cancelas un plan de suscripción anual antes de completar los 12 meses del período contratado, se aplicará una penalización equivalente al 20% del valor total anual del plan. Este monto será deducido del reembolso proporcional correspondiente a los meses no consumidos, o cobrado al método de pago registrado si no hay saldo a favor.",
          annualPenaltyExample: "Ejemplo: si el plan anual cuesta $1,200 USD y cancelas tras 4 meses, el reembolso proporcional de los 8 meses restantes ($800 USD) se reduce en un 20% ($240 USD), resultando en un reembolso neto de $560 USD.",
          annualPenaltyExceptionTitle: "Excepciones",
          annualPenaltyExceptionDesc: "La penalización no aplica si la cancelación se debe a un error de facturación comprobable por parte de VeriFinca, o si el servicio ha presentado una interrupción acumulada superior al 5% del tiempo mensual dentro del período afectado (ver SLA).",
          monthlyNoPenaltyTitle: "Planes Mensuales",
          monthlyNoPenaltyDesc: "Los planes de suscripción mensual pueden cancelarse en cualquier momento sin penalización. El acceso continúa hasta el fin del período ya pagado.",
        },
        stripeProcessor: {
          title: "Procesador de Pagos",
          desc: "Los pagos en VeriFinca son procesados por Stripe, Inc. (stripe.com), un procesador de pagos de terceros certificado PCI-DSS Nivel 1. VeriFinca no almacena, procesa ni tiene acceso a los datos completos de tu tarjeta de crédito/débito.",
          acceptTitle: "Aceptación de Términos de Stripe",
          acceptDesc: "Al realizar un pago, aceptas adicionalmente los Términos de Servicio de Stripe y su Política de Privacidad.",
          cookiesTitle: "Cookies de Stripe",
          cookiesDesc: "Stripe puede utilizar cookies propias (stripe_mid, stripe_sid) en tu navegador con el único propósito de prevención de fraude y seguridad en los pagos.",
          linkTerms: "https://stripe.com/legal/ssa",
          linkPrivacy: "https://stripe.com/privacy",
        },
        financialLiability: {
          title: "Limitación de Responsabilidad Financiera",
          unauthorizedTitle: "Cargos No Autorizados",
          unauthorizedDesc: "VeriFinca no se hace responsable por cargos no autorizados que el usuario no reporte dentro de los 30 días calendario siguientes al cobro. Transcurrido ese plazo, el cargo se considerará aceptado.",
          availabilityTitle: "Disponibilidad del Servicio de Pago",
          availabilityDesc: "No se garantiza disponibilidad ininterrumpida del servicio de pago, ya que este depende de la infraestructura de Stripe, Inc. y puede estar sujeto a mantenimientos planificados o interrupciones no previstas.",
          capTitle: "Tope de Responsabilidad",
          capDesc: "La responsabilidad máxima de VeriFinca ante el usuario por cualquier causa relacionada con pagos se limita al total de las tarifas pagadas por el usuario durante los 12 meses anteriores al evento que origina el reclamo.",
        },
        paymentData: {
          title: "Datos de Pago y Seguridad",
          tokenTitle: "Tokenización",
          tokenDesc: "Los datos de tarjeta son tokenizados por Stripe. VeriFinca únicamente recibe un token de referencia y los últimos 4 dígitos de la tarjeta; nunca el número completo ni el CVV.",
          retentionTitle: "Retención de Registros de Facturación",
          retentionDesc: "VeriFinca retiene los registros de transacciones (monto, fecha, plan) durante 5 años en cumplimiento de la legislación fiscal de la República Dominicana.",
          historyTitle: "Historial de Transacciones",
          historyDesc: "El usuario puede solicitar su historial completo de transacciones enviando un correo a soporte@verifinca.do. El plazo de respuesta es de hasta 5 días hábiles.",
          breachTitle: "Notificación de Brechas",
          breachDesc: "En caso de brecha de seguridad que afecte datos de pago, VeriFinca notificará al usuario dentro de las 72 horas siguientes a tomar conocimiento del incidente, conforme a la Ley 172-13 y el Stripe SSA §4.3.",
        },
        acceptableUse: {
          title: "Uso Aceptable de la Suscripción",
          nontransferTitle: "Intransferibilidad",
          nontransferDesc: "El plan contratado es personal e intransferible. Está expresamente prohibido compartir credenciales entre múltiples usuarios o dispositivos con el objetivo de evadir los límites del plan.",
          scrapingTitle: "Prohibición de Scraping",
          scrapingDesc: "El uso de la plataforma para extracción automatizada masiva de datos registrales está prohibido y puede resultar en suspensión inmediata de la cuenta sin reembolso.",
          suspensionTitle: "Suspensión por Uso Anómalo",
          suspensionDesc: "VeriFinca se reserva el derecho de suspender el acceso de forma inmediata si detecta patrones de uso que indiquen abuso, fraude o violación de estos términos, previa notificación cuando sea técnicamente posible.",
        },
        consent: {
          label: "He leído y acepto los Términos de Servicio, la Política de Privacidad y la Política de Facturación de VeriFinca. Autorizo el cobro automático de {{planAmount}} cada {{billingCycle}}.",
          required: "Debes aceptar los términos para continuar.",
          linkTerms: "Términos de Servicio",
          linkPrivacy: "Política de Privacidad",
          linkBilling: "Política de Facturación",
          annualPenaltyWarning: "Los planes anuales tienen una penalización del 20% del total anual en caso de cancelación anticipada."
        },
        cta: {
          title: "¿Tienes preguntas legales?",
          subtitle: "Nuestro equipo de cumplimiento está disponible para aclarar cualquier duda.",
          button: "Enviar consulta legal"
        }
      },
      pricing: {
        header: {
          tag: "PLANES Y PRECIOS",
          title: "Elige el plan ideal para tu operación",
          desc: "Escala tus validaciones inmobiliarias con planes diseñados para profesionales y empresas en la República Dominicana.",
          monthly: "Mensual",
          yearly: "Anual"
        },
        cards: {
          popular: "MÁS POPULAR",
          period: "/mes",
          free: {
            title: "Consultor",
            desc: "Para usuarios ocasionales que necesitan consultas básicas de inmuebles.",
            feature1: "1 consultas /mes",
            feature2: "Datos públicos básicos",
            feature3: "Presentación pública de sus proyectos",
            button: "Comenzar gratis"
          },
          pro: {
            title: "Profesional",
            desc: "Herramientas completas para agentes independientes y pequeñas agencias.",
            feature1: "25 consultas /mes",
            feature2: "5 proyectos registrables",
            feature3: "Consultas de proyectos por QR",
            button: "Elegir Profesional"
          },
          empresa: {
            title: "Empresa",
            desc: "Volumen alto para inmobiliarias y equipos de analistas.",
            feature1: "100 consultas /mes",
            feature2: "30 proyectos registrables",
            feature3: "Multiusuario (hasta 5)",
            feature4: "Consultas de proyectos por QR",
            button: "Elegir Empresa"
          },
          corporativo: {
            title: "Corporativo",
            desc: "Soluciones a medida para bancos, desarrolladoras y gobierno.",
            feature1: "Consultas ilimitadas",
            feature2: "50 proyectos registrables",
            feature3: "Multiusuario (hasta 30)",
            feature4: "Consultas de proyectos por QR",
            button: "Elegir Corporativo"
          }
        },
        comparison: {
          title: "Comparativa detallada",
          charHeader: "Características",
          limit: "Límite mensual",
          unlimited: "Ilimitado",
          projects: "Proyectos registrables",
          qrProjects: "Consultas de proyectos por QR"
        },
        trust: {
          encrypted: "Datos encriptados",
          compliance: "Cumplimiento Ley 172-13",
          dgii: "Integración DGII"
        },
        cta: {
          title: "¿Necesitas una solución corporativa a gran escala?",
          desc: "Construimos infraestructuras de validación dedicadas para instituciones financieras y grandes firmas de abogados.",
          sales: "Hablar con ventas",
          docs: "Ver documentación"
        }
      },
      status: {
        draft: "Borrador",
        published: "Publicado",
        inReview: "En Revisión",
        observed: "Con Observaciones",
        validated: "Validado",
        rejected: "Rechazado",
        unknown: "Desconocido"
      },
    },
  },
  en: {
    translation: {
      documentList: {
        title: 'Legal Documentation',
        updatedAt: 'Updated: Sep 2024',
      },
      projectsList: {
        heroSub: 'VeriFinca Transparency Portal',
        heroTitleHighlight: 'Real Estate Investment',
        dirTitle: 'Projects Directory',
        dirDesc: 'Explore projects that have passed our rigorous validation process.',
        filterAll: 'ALL STATUSES',
        filterCertified: 'CERTIFIED',
        filterProcessing: 'IN PROCESS',
        integrityValidated: 'Validated Integrity',
        emptyTitle: 'No projects found',
        emptyDesc: 'There are no records matching your search or current filters.',
        ctaDiligence: 'Comprehensive Due Diligence',
        ctaBlockchain: 'Immutable Blockchain Sealing',
        ctaMonitoring: '24/7 Status Monitoring',
      },
      documentUpload: {
        uploadFile: 'Upload file',
        selectCertificate: 'Select Certificate',
        dragDropPrompt: 'Drag and drop your PDF file here, or click to browse',
        onlyOfficialPdf: 'Only official signed PDF documents are supported',
        fileReady: 'File Ready',
        changeFile: 'Change file',
        metadata: 'Document Metadata',
        category: 'Validation Category',
        jurisdiction: 'Jurisdiction of Origin',
        issueDate: 'Issue Date',
        keyObservations: 'Key Observations',
        additionalDetails: 'Additional details...',
        processing: 'Processing...',
        sealBtn: 'Seal with VeriFinca',
      },
      hero: {
        titlePrefix: 'Technical and ',
        titleHighlight: 'legal',
        titleSuffix: ' security in one click',
        desc: 'The leading platform for real estate project validation in the Dominican Republic. Connecting real-time institutional data for investors and developers.',
        placeholder: 'Project name or filing code...',
        searchBtn: 'Consult Now',
        valExpress: 'Express Validation',
        connNotarial: 'Notarial Connection',
        dataProcuraduria: 'Attorney General Data',
      },
      legal: {
        complianceVersion: "v2.4 (RD Compliant)",
        nav: {
          terms: "Terms of Use",
          privacy: "Privacy Policy",
          ley172: "Law 172-13",
          dataTreatment: "Data Treatment",
          cookies: "Cookie Policy",
          disclaimer: "Disclaimers",
          billing: "Billing",
          refunds: "Refunds",
          stripeProcessor: "Payment Processor",
          paymentData: "Payment Data",
          acceptableUse: "Acceptable Use",
          downloadPdf: "Download PDF"
        },
        header: {
          tag: "LEGAL FRAMEWORK",
          title: "Terms, Privacy, and Compliance",
          subtitle: "We operate under the legal framework of the Dominican Republic, ensuring transparency and protection of your personal data in every transaction.",
          lastUpdate: "Last updated: June 2026"
        },
        terms: {
          title: "Terms of Use",
          scopeTitle: "Scope of Service",
          scopeDesc: "VeriFinca provides tools for the verification and management of real estate properties. The use of this platform constitutes full acceptance of these terms. The services offered are designed to facilitate due diligence, but do not replace professional legal advice.",
          restrictTitle: "Use Restrictions",
          restrictList: {
            scraping: "Automated data extraction (scraping) without express authorization is prohibited.",
            illegal: "Use of the platform for illegal or fraudulent purposes is not permitted.",
            accounts: "Accounts are personal and non-transferable; sharing credentials will result in immediate suspension."
          }
        },
        privacy: {
          title: "Privacy Policy",
          collectTitle: "Data We Collect",
          collectDesc: "We collect personal information necessary for providing the service, including: full name, identity card (cédula), contact info, and data related to queried properties. This information is stored in an encrypted and secure manner.",
          retentionTitle: "Data Retention",
          retentionDesc: "In accordance with Law 172-13 on the Protection of Personal Data, credit or history data generated through queries to credit bureaus (e.g. TransUnion) is retained only for the period established by law and is automatically purged upon expiration of that term or when the owner's consent is revoked."
        },
        ley172: {
          title: "Law 172-13 Compliance",
          statusTitle: "Compliance Status",
          statusSubtitle: "Alignment metrics with the Dominican regulatory framework.",
          consent: "Consent",
          consentDesc: "Explicit capture required.",
          purpose: "Purpose",
          purposeDesc: "Use limited to declared purpose.",
          access: "Access",
          accessDesc: "Guaranteed query right.",
          purge: "Purge",
          purgeDesc: "Deletion after legal period.",
          footer: "* Platform registered and certified before the National Institute for the Protection of Consumer Rights (Pro Consumidor) and aligned with INPD regulations."
        },
        dataTreatment: {
          title: "Data Treatment",
          legalBaseTitle: "Legal Basis",
          legalBaseDesc: "The treatment of your data is based on free, prior, express, and informed consent, as well as contractual necessity for providing the services requested from VeriFinca.",
          rightsTitle: "Owner Rights",
          accessDesc: "Know what data of yours rests in our databases.",
          rectifyTitle: "Rectification",
          rectifyDesc: "Update or correct inaccurate or outdated information.",
          cancelTitle: "Cancellation",
          cancelDesc: "Request data deletion when legally appropriate.",
          button: "Exercise my rights"
        },
        cookies: {
          title: "Use of Cookies",
          desc: "We use strictly necessary cookies for the secure operation of the platform, as well as analytical cookies to improve user experience. Below we detail the main cookies used:",
          table: {
            name: "Name",
            purpose: "Purpose",
            duration: "Duration",
            session: "Session",
            sessionTokenDesc: "Keeps user session active and secure.",
            csrfTokenDesc: "Prevents cross-site request forgery attacks.",
            gaDesc: "Platform usage analytics (Google Analytics).",
            gaDuration: "2 years",
            consentRecordDesc: "Stores user privacy preferences.",
            consentRecordDuration: "1 year"
          }
        },
        disclaimer: {
          title: "Disclaimer",
          warrantyTitle: "Real Estate Warranty Limitation",
          warrantyDesc: "The information provided by VeriFinca on legal states of properties, encumbrances, liens, or owner histories is based on public records and third-party databases. Although we strive for accuracy, VeriFinca does not guarantee absolute correctness of this data nor assumes responsibility for financial, legal, or real estate decisions made exclusively based on platform reports. Official verification before the Real Estate Jurisdiction and consultation with a specialized lawyer is always recommended."
        },
        billing: {
          title: "Billing & Subscriptions",
          cycleTitle: "Billing Cycle",
          cycleDesc: "Charges are processed on the same day of each cycle (monthly or annually) in the selected currency (DOP or USD) via credit/debit card processed by Stripe.",
          autoDebitTitle: "Automatic Debit Authorization",
          autoDebitDesc: "By subscribing, you authorize VeriFinca to automatically charge your selected payment method each billing cycle until you cancel. You may revoke this authorization at any time from your user dashboard.",
          priceChangeTitle: "Price Changes",
          priceChangeDesc: "Any modifications to pricing will be notified at least 30 days in advance via email. If you do not cancel before the effective date, the new price will apply to the next cycle.",
          prorationTitle: "Plan Changes (Proration)",
          prorationDesc: "If you change your plan during the active cycle, the adjustment is calculated proportionally (prorated) over the remaining days. Credits are applied automatically to the next invoice.",
          trialTitle: "Trial Period",
          trialDesc: "If a free trial applies, its duration is indicated at subscription. Upon expiration, billing for the selected plan begins automatically. No additional action is required.",
        },
        refunds: {
          title: "Refund & Cancellation Policy",
          finalTitle: "Final Payments",
          finalDesc: "Processed payments are final barring demonstrable billing error. VeriFinca is not obligated to issue refunds for already billed and consumed periods.",
          windowTitle: "Refund Window",
          windowDesc: "A full refund may be requested within the first 48 hours of the initial subscription, provided no queries were made during that period. Request via soporte@verifinca.do.",
          cancelTitle: "Cancellation",
          cancelDesc: "You can cancel your subscription at any time from Settings → Subscription → Cancel. No penalties or additional charges apply for cancellation.",
          postCancelTitle: "Post-Cancellation Access",
          postCancelDesc: "The service remains active until the end of the already paid period. Upon expiration, access reverts automatically to the free plan.",
          annualPenaltyTitle: "Early Cancellation Penalty — Annual Plan",
          annualPenaltyDesc: "If you cancel an annual subscription plan before completing the 12-month contracted period, a penalty equal to 20% of the total annual plan value will apply. This amount will be deducted from the proportional refund for the unconsumed months, or charged to the registered payment method if no balance is owed.",
          annualPenaltyExample: "Example: if the annual plan costs USD $360 and you cancel after 4 months, the proportional refund for the remaining 8 months (USD $240) is reduced by 20% (USD $48), resulting in a net refund of USD $192.",
          annualPenaltyExceptionTitle: "Exceptions",
          annualPenaltyExceptionDesc: "The penalty does not apply if the cancellation is due to a verifiable billing error by VeriFinca, or if the service has experienced cumulative downtime exceeding 5% of monthly uptime within the affected period (see SLA).",
          monthlyNoPenaltyTitle: "Monthly Plans",
          monthlyNoPenaltyDesc: "Monthly subscription plans can be cancelled at any time without penalty. Access continues until the end of the already-paid period.",
        },
        stripeProcessor: {
          title: "Payment Processor",
          desc: "Payments in VeriFinca are processed by Stripe, Inc. (stripe.com), a Level 1 PCI-DSS certified third-party payment processor. VeriFinca does not store, process, or have access to your full credit/debit card data.",
          acceptTitle: "Acceptance of Stripe Terms",
          acceptDesc: "By making a payment, you additionally accept Stripe's Terms of Service and Privacy Policy.",
          cookiesTitle: "Stripe Cookies",
          cookiesDesc: "Stripe may use its own cookies (stripe_mid, stripe_sid) in your browser for the sole purpose of fraud prevention and payment security.",
          linkTerms: "https://stripe.com/legal/ssa",
          linkPrivacy: "https://stripe.com/privacy",
        },
        financialLiability: {
          title: "Financial Liability Limitation",
          unauthorizedTitle: "Unauthorized Charges",
          unauthorizedDesc: "VeriFinca is not responsible for unauthorized charges not reported by the user within 30 calendar days following the charge. After this period, the charge is considered accepted.",
          availabilityTitle: "Payment Service Availability",
          availabilityDesc: "Uninterrupted availability of the payment service is not guaranteed, as it relies on Stripe, Inc.'s infrastructure and may be subject to scheduled maintenance or unforeseen outages.",
          capTitle: "Liability Cap",
          capDesc: "VeriFinca's maximum liability to the user for any cause related to payments is limited to the total fees paid by the user during the 12 months prior to the event causing the claim.",
        },
        paymentData: {
          title: "Payment Data & Security",
          tokenTitle: "Tokenization",
          tokenDesc: "Card data is tokenized by Stripe. VeriFinca only receives a reference token and the last 4 digits of the card; never the full number or CVV.",
          retentionTitle: "Billing Records Retention",
          retentionDesc: "VeriFinca retains transaction records (amount, date, plan) for 5 years in compliance with Dominican Republic tax legislation.",
          historyTitle: "Transaction History",
          historyDesc: "The user may request their full transaction history by emailing soporte@verifinca.do. The response time is up to 5 business days.",
          breachTitle: "Breach Notification",
          breachDesc: "In the event of a security breach affecting payment data, VeriFinca will notify the user within 72 hours of becoming aware of the incident, pursuant to Law 172-13 and Stripe SSA §4.3.",
        },
        acceptableUse: {
          title: "Acceptable Use of Subscription",
          nontransferTitle: "Non-transferability",
          nontransferDesc: "The contracted plan is personal and non-transferable. It is expressly prohibited to share credentials among multiple users or devices in order to evade plan limits.",
          scrapingTitle: "Scraping Prohibition",
          scrapingDesc: "Using the platform for massive automated extraction of registry data is prohibited and may result in immediate account suspension without refund.",
          suspensionTitle: "Suspension for Anomalous Use",
          suspensionDesc: "VeriFinca reserves the right to immediately suspend access if it detects usage patterns indicating abuse, fraud, or violation of these terms, with prior notice when technically possible.",
        },
        consent: {
          label: "I have read and accept the Terms of Service, Privacy Policy, and Billing Policy of VeriFinca. I authorize the automatic charge of {{planAmount}} every {{billingCycle}}.",
          required: "You must accept the terms to continue.",
          linkTerms: "Terms of Service",
          linkPrivacy: "Privacy Policy",
          linkBilling: "Billing Policy",
          annualPenaltyWarning: "Annual plans carry a 20% penalty of the total annual value upon early cancellation."
        },
        cta: {
          title: "Have legal questions?",
          subtitle: "Our compliance team is available to clarify any doubts.",
          button: "Send legal query"
        }
      },
      pricing: {
        header: {
          tag: "PLANS & PRICING",
          title: "Choose the perfect plan for your business",
          desc: "Scale your real estate validations with plans designed for professionals and companies in the Dominican Republic.",
          monthly: "Monthly",
          yearly: "Annually"
        },
        cards: {
          popular: "MOST POPULAR",
          period: "/mo",
          free: {
            title: "Query",
            desc: "For occasional users who need basic property queries.",
            feature1: "1 query /month",
            feature2: "Basic public data",
            feature3: "Identity validation",
            button: "Get started for free"
          },
          pro: {
            title: "Professional",
            desc: "Complete tools for independent agents and small agencies.",
            feature1: "25 queries /month",
            feature2: "Detailed PDF reports",
            feature3: "Liens & encumbrances alerts",
            button: "Choose Professional"
          },
          empresa: {
            title: "Company",
            desc: "High volume for real estate agencies and analyst teams.",
            feature1: "100 queries /month",
            feature2: "Multi-user (up to 5)",
            feature3: "Basic API",
            feature4: "CRM integration",
            button: "Choose Company"
          },
          corporativo: {
            title: "Corporativo",
            desc: "Custom solutions for banks, developers, and government.",
            feature1: "Unlimited queries",
            feature2: "Full Access API",
            feature3: "Bulk validations",
            feature4: "Guaranteed 99.9% SLA",
            button: "Choose Corporativo"
          }
        },
        comparison: {
          title: "Detailed comparison",
          charHeader: "Features",
          limit: "Monthly limit",
          unlimited: "Unlimited",
          projects: "Registerable projects",
          qrProjects: "QR project queries"
        },
        trust: {
          encrypted: "Encrypted data",
          compliance: "Law 172-13 Compliance",
          dgii: "DGII Integration"
        },
        cta: {
          title: "Need a large-scale corporate solution?",
          desc: "We build dedicated validation infrastructures for financial institutions and large law firms.",
          sales: "Talk to sales",
          docs: "View documentation"
        }
      },
      status: {
        draft: "Draft",
        published: "Published",
        inReview: "In Review",
        observed: "With Observations",
        validated: "Validated",
        rejected: "Rejected",
        unknown: "Unknown"
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // default language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
