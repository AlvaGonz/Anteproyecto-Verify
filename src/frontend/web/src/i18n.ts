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
