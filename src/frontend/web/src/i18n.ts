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
            feature2: "10 proyectos registrables",
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
        draft: "Creado",
        edited: "Editado",
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
        draft: "Created",
        edited: "Edited",
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
