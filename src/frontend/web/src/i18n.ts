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
        complianceCenter: "Compliance Center",
        complianceVersion: "v2.4 (RD Compliant)",
        nav: {
          terms: "Términos de Uso",
          privacy: "Política de Privacidad",
          ley172: "Ley 172-13",
          dataTreatment: "Tratamiento de Datos",
          cookies: "Uso de Cookies",
          disclaimer: "Descargos",
          downloadPdf: "Download PDF"
        },
        header: {
          tag: "MARCO LEGAL",
          title: "Términos, Privacidad y Cumplimiento",
          subtitle: "Operamos bajo el marco legal de la República Dominicana, asegurando la transparencia y la protección de sus datos personales en cada transacción.",
          lastUpdate: "Última actualización: Mayo 2026"
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
            feature2: "Reportes detallados PDF",
            feature3: "Alertas de gravámenes",
            feature4: "Soporte prioritario email",
            button: "Elegir Profesional"
          },
          empresa: {
            title: "Empresa",
            desc: "Volumen alto para inmobiliarias y equipos de analistas.",
            feature1: "100 consultas /mes",
            feature2: "Multiusuario (hasta 5)",
            feature3: "API básica",
            feature4: "Integración CRM",
            button: "Elegir Empresa"
          },
          enterprise: {
            title: "Enterprise",
            desc: "Soluciones a medida para bancos, desarrolladoras y gobierno.",
            feature1: "Consultas ilimitadas",
            feature2: "API Full Access",
            feature3: "Validaciones en lote",
            feature4: "SLA garantizado 99.9%",
            button: "Contactar Ventas"
          }
        },
        comparison: {
          title: "Comparativa detallada",
          charHeader: "Características",
          capHeader: "Capacidad de Búsqueda",
          limit: "Límite mensual",
          unlimited: "Ilimitado",
          history: "Histórico de títulos",
          intHeader: "Integración & Datos",
          pdf: "Exportación PDF",
          api: "Acceso API",
          basic: "Básico",
          complete: "Completo",
          supportHeader: "Soporte",
          supportLevel: "Nivel de asistencia",
          community: "Comunidad",
          email: "Email (24h)",
          priority: "Prioritario",
          manager: "Account Manager 24/7"
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
        complianceCenter: "Compliance Center",
        complianceVersion: "v2.4 (RD Compliant)",
        nav: {
          terms: "Terms of Use",
          privacy: "Privacy Policy",
          ley172: "Law 172-13",
          dataTreatment: "Data Treatment",
          cookies: "Cookie Policy",
          disclaimer: "Disclaimers",
          downloadPdf: "Download PDF"
        },
        header: {
          tag: "LEGAL FRAMEWORK",
          title: "Terms, Privacy, and Compliance",
          subtitle: "We operate under the legal framework of the Dominican Republic, ensuring transparency and protection of your personal data in every transaction.",
          lastUpdate: "Last updated: May 2026"
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
            feature4: "Priority email support",
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
          enterprise: {
            title: "Enterprise",
            desc: "Custom solutions for banks, developers, and government.",
            feature1: "Unlimited queries",
            feature2: "Full Access API",
            feature3: "Bulk validations",
            feature4: "Guaranteed 99.9% SLA",
            button: "Contact Sales"
          }
        },
        comparison: {
          title: "Detailed comparison",
          charHeader: "Features",
          capHeader: "Search Capacity",
          limit: "Monthly limit",
          unlimited: "Unlimited",
          history: "Title history",
          intHeader: "Integration & Data",
          pdf: "PDF export",
          api: "API Access",
          basic: "Basic",
          complete: "Complete",
          supportHeader: "Support",
          supportLevel: "Support level",
          community: "Community",
          email: "Email (24h)",
          priority: "Priority",
          manager: "24/7 Account Manager"
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
