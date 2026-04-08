import React from "react";
import { FolderKanban, FileCheck, AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  // Mock data for the dashboard
  const stats = [
    {
      name: "Total Proyectos",
      stat: "12",
      icon: FolderKanban,
      change: "+2",
      changeType: "increase",
    },
    {
      name: "En Revisión",
      stat: "4",
      icon: FileCheck,
      change: "0",
      changeType: "neutral",
    },
    {
      name: "Observados",
      stat: "2",
      icon: AlertCircle,
      change: "-1",
      changeType: "decrease",
    },
    {
      name: "Certificados",
      stat: "6",
      icon: TrendingUp,
      change: "+1",
      changeType: "increase",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Proyecto "Residencial Las Palmas" creado',
      time: "Hace 2 horas",
      user: "Admin",
    },
    {
      id: 2,
      action: 'Documento "Planos Estructurales" subido a "Torre Azul"',
      time: "Hace 4 horas",
      user: "Admin",
    },
    {
      id: 3,
      action: 'Validación completada para "Condominio El Bosque"',
      time: "Ayer",
      user: "Sistema",
    },
    {
      id: 4,
      action: 'Proyecto "Plaza Central" marcado como Observado',
      time: "Ayer",
      user: "Admin",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Dashboard Operativo
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden border border-gray-100"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">
                {item.stat}
              </p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === "increase"
                    ? "text-green-600"
                    : item.changeType === "decrease"
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Actividad Reciente
            </h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <li
                key={activity.id}
                className="px-4 py-4 sm:px-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {activity.action}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {activity.user}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200 rounded-b-lg">
            <div className="text-sm">
              <Link
                to="/admin/audit"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Ver todo el historial <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Acciones Rápidas
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/projects/new"
              className="flex items-center justify-center px-4 py-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FolderKanban className="mr-2 h-5 w-5 text-gray-400" />
              Nuevo Proyecto
            </Link>
            <Link
              to="/admin/projects"
              className="flex items-center justify-center px-4 py-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <FileCheck className="mr-2 h-5 w-5 text-gray-400" />
              Revisar Expedientes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
