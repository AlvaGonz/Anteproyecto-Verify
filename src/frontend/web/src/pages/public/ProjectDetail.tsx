import React from 'react';
import { HeroHeader } from '../../features/projects/components/detail/HeroHeader';
import { ProjectInfo } from '../../features/projects/components/detail/ProjectInfo';
import { DocumentList } from '../../features/projects/components/detail/DocumentList';
import { IntegrityCard } from '../../features/projects/components/detail/IntegrityCard';
import { Timeline } from '../../features/projects/components/detail/Timeline';
import { OfficialSeal } from '../../features/projects/components/detail/OfficialSeal';
import { ValidationProjectData as ProjectData } from '../../features/projects/types';

const MOCK_PROJECT: ProjectData = {
  id: 'VF-RD-77290',
  name: 'Torre Piantini',
  location: 'Santo Domingo, DN',
  status: 'approved',
  integrityScore: 98,
  riskLevel: 'minimo',
  metadata: {
    developer: 'Inmobiliaria del Caribe S.A.',
    completionYear: 2024,
    registrationNumber: 'REG-7882-PIANTINI',
    propertyType: 'Residencial Premium',
  },
  documents: [
    { id: '1', name: 'Título de Propiedad Deslindado', status: 'verified' },
    { id: '2', name: 'Permiso de Construcción Municipal', status: 'verified' },
    { id: '3', name: 'Certificación de Cargas y Gravámenes', status: 'verified' },
    { id: '4', name: 'Declaratoria de Condominio', status: 'verified' },
  ],
  timeline: [
    { id: 's1', date: '12 Sep 2024', title: 'Emisión de Sello Institucional', description: 'Certificación oficial otorgada al desarrollador.', status: 'completed' },
    { id: 's2', date: '28 Ago 2024', title: 'Auditoría Técnica en Sitio', description: 'Inspección estructural y avance de obra.', status: 'completed' },
    { id: 's3', date: '05 Ago 2024', title: 'Validación de Documentación', description: 'Revisión de títulos y permisos legales.', status: 'completed' },
  ],
};

export const ProjectDetail: React.FC = () => {
  const project = MOCK_PROJECT;

  return (
    <div className="min-h-screen bg-[#fff8f3] text-[#111144] antialiased overflow-x-hidden pt-32 pb-24 font-['Inter']">
      {/* Top Nav Placeholder (since the requirement was to port only the detail vista) */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-[#223382] shadow-2xl shadow-[#111144]/10 font-['Manrope']">
        <div className="text-2xl font-extrabold text-[#F4F1EC]">VeriFinca</div>
        <div className="hidden md:flex gap-8">
          <button className="text-[#F4F1EC]/80 hover:text-white transition-colors font-bold bg-transparent border-none cursor-pointer">Servicios</button>
          <button className="text-white border-b-4 border-[#F98513] pb-1 font-bold bg-transparent border-none cursor-pointer">Propiedades</button>
          <button className="text-[#F4F1EC]/80 hover:text-white transition-colors font-bold bg-transparent border-none cursor-pointer">Empresa</button>
        </div>
        <button className="bg-[#F98513] text-[#111144] px-6 py-2 rounded-full font-bold active:scale-95 duration-200 transition-all border-none cursor-pointer">
          Acceso Profesional
        </button>
      </nav>

      <main className="px-6 md:px-12 max-w-7xl mx-auto">
        <HeroHeader
          name={project.name}
          location={project.location}
          projectId={project.id}
          status={project.status}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-12">
            <ProjectInfo metadata={project.metadata} />
            <DocumentList documents={project.documents} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-12">
            <IntegrityCard score={project.integrityScore} riskLevel={project.riskLevel} />
            <Timeline events={project.timeline} />
          </div>
        </div>

        <OfficialSeal />
      </main>

      <footer className="w-full py-12 px-8 mt-24 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#111144] text-[#F4F1EC]/60">
        <div className="text-lg font-bold text-[#F4F1EC]">VeriFinca</div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="hover:text-[#F4F1EC] transition-colors" href="#">Términos Legales</a>
          <a className="hover:text-[#F4F1EC] transition-colors" href="#">Privacidad</a>
          <a className="hover:text-[#F4F1EC] transition-colors" href="#">Soporte</a>
        </div>
        <div className="text-xs text-[#F4F1EC]/40 text-center md:text-right">
          © 2024 VeriFinca. Institutional Authority in Real Estate.
        </div>
      </footer>
    </div>
  );
};
